"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Map as MLMap, GeoJSONSource, MapGeoJSONFeature, ExpressionSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { MapLabel, MapOrganisation } from "@/lib/organisations";

// Free vector map tiles from OpenFreeMap: no account, no key, no cookies.
const MAP_STYLE = "https://tiles.openfreemap.org/styles/positron";

// Brand colours (HunBAN design system): navy pins, yellow for highlighted entries.
const NAVY = "#2f414f";
const YELLOW = "#fbcf00";
const WHITE = "#ffffff";

// Hungary, roughly. The map opens on this box and can't drift far from it.
const HUNGARY: [[number, number], [number, number]] = [
  [16.11, 45.74],
  [22.9, 48.59],
];
const MAX_BOUNDS: [[number, number], [number, number]] = [
  [13.5, 44.5],
  [25.5, 49.8],
];

type Props = { organisations: MapOrganisation[]; labels: MapLabel[] };

// Organisations with exactly the same coordinates share an address (e.g. a coworking
// space or office). The map works with these "places": one pin per address.
const placeKey = (o: MapOrganisation) => `${o.latitude},${o.longitude}`;

function groupByPlace(orgs: MapOrganisation[]): Map<string, MapOrganisation[]> {
  const places = new Map<string, MapOrganisation[]>();
  for (const o of orgs) {
    const k = placeKey(o);
    places.set(k, [...(places.get(k) ?? []), o]);
  }
  return places;
}

function toGeoJSON(places: Map<string, MapOrganisation[]>): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: "FeatureCollection",
    features: [...places.entries()].map(([key, orgs]) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [orgs[0].longitude, orgs[0].latitude] },
      properties: { key, count: orgs.length, highlighted: orgs.some((o) => o.is_highlighted) },
    })),
  };
}

// The host of a shared address: the entry labelled "Coworking / office", if any.
const HOST_SLUG = "coworking-space";
const hostOf = (orgs: MapOrganisation[]) => orgs.find((o) => o.labels.some((l) => l.slug === HOST_SLUG));

// An organisation's name; HunBAN's gets the yellow highlighter strip (navy on yellow).
function nameNode(o: MapOrganisation): Node {
  if (!o.is_highlighted) return document.createTextNode(o.name);
  const span = document.createElement("span");
  span.className = "hb-hl";
  span.textContent = o.name;
  return span;
}

// Popup content is built with DOM methods (textContent), never raw HTML,
// so text from the database can't inject anything into the page.
function popupContent(o: MapOrganisation, back?: { label: string; onClick: () => void }): HTMLElement {
  const root = document.createElement("div");
  root.className = "hb-popup";

  // When opened from a "several here" list, offer a way back to that list.
  if (back) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "hb-popup-back";
    b.textContent = `← ${back.label}`;
    b.addEventListener("click", back.onClick);
    root.appendChild(b);
  }

  const types = document.createElement("p");
  types.className = "hb-popup-types";
  types.textContent = o.labels.map((l) => l.name).join(" · ");
  root.appendChild(types);

  const name = document.createElement("p");
  name.className = "hb-popup-name";
  name.appendChild(nameNode(o));
  root.appendChild(name);

  if (o.description) {
    const d = document.createElement("p");
    d.className = "hb-popup-desc";
    d.textContent = o.description;
    root.appendChild(d);
  }
  // No city here: the map itself already shows where the pin is.

  const links = document.createElement("p");
  links.className = "hb-popup-links";
  for (const [label, href] of [
    ["Website", o.website_url],
    ["LinkedIn", o.linkedin_url],
  ] as const) {
    if (!href) continue;
    const a = document.createElement("a");
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = `${label} ↗`;
    links.appendChild(a);
  }
  if (links.childElementCount) root.appendChild(links);
  return root;
}

// Card for an address with several organisations: a short list of names;
// clicking one shows its details.
function listContent(orgs: MapOrganisation[], header: string, onPick: (o: MapOrganisation) => void): HTMLElement {
  const root = document.createElement("div");
  root.className = "hb-popup";

  const head = document.createElement("p");
  head.className = "hb-popup-types";
  head.textContent = header;
  root.appendChild(head);

  const ul = document.createElement("ul");
  ul.className = "hb-popup-list";
  for (const o of orgs) {
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.type = "button";
    const name = document.createElement("span");
    name.className = "hb-list-name";
    name.appendChild(nameNode(o));
    const types = document.createElement("span");
    types.className = "hb-list-types";
    types.textContent = o.labels.map((l) => l.name).join(" · ");
    b.append(name, types);
    b.addEventListener("click", () => onPick(o));
    li.appendChild(b);
    ul.appendChild(li);
  }
  root.appendChild(ul);
  return root;
}

// Deepest zoom. Clustering runs all the way down, so nearby places never stack
// on top of each other unclickably.
const MAX_ZOOM = 19;

export default function EcosystemMap({ organisations, labels }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const placesRef = useRef<Map<string, MapOrganisation[]>>(new Map());
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const byId = useMemo(() => new Map(organisations.map((o) => [o.id, o])), [organisations]);

  // No type selected = show everything. Several selected = show entries with ANY of them.
  const visible = useMemo(
    () =>
      selected.size === 0
        ? organisations
        : organisations.filter((o) => o.labels.some((l) => selected.has(l.slug))),
    [organisations, selected],
  );

  // The list under the map, grouped by type: sections in the database's sort_order
  // (only types with entries; with a filter on, only the selected types), names A-Z
  // by Hungarian rules. An entry with two types appears in both sections.
  const sections = useMemo(() => {
    const byName = (a: MapOrganisation, b: MapOrganisation) => a.name.localeCompare(b.name, "hu");
    const shown = selected.size === 0 ? labels : labels.filter((l) => selected.has(l.slug));
    const out = shown
      .map((l) => ({
        key: l.slug,
        title: l.name,
        orgs: visible.filter((o) => o.labels.some((x) => x.slug === l.slug)).sort(byName),
      }))
      .filter((sec) => sec.orgs.length > 0);
    const unlabelled = visible.filter((o) => o.labels.length === 0).sort(byName);
    if (selected.size === 0 && unlabelled.length) out.push({ key: "other", title: "Other", orgs: unlabelled });
    return out;
  }, [labels, visible, selected]);

  // Create the map once.
  useEffect(() => {
    let cancelled = false;
    let map: MLMap | null = null;

    (async () => {
      const mod = await import("maplibre-gl");
      const maplibregl = ("default" in mod ? mod.default : mod) as typeof import("maplibre-gl");
      if (cancelled || !containerRef.current) return;

      // Worker files are copied into public/maplibre at build time (scripts/copy-map-worker.mjs).
      maplibregl.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

      map = new maplibregl.Map({
        container: containerRef.current,
        style: MAP_STYLE,
        bounds: HUNGARY,
        fitBoundsOptions: { padding: 24 },
        maxBounds: MAX_BOUNDS,
        maxZoom: MAX_ZOOM,
        fadeDuration: 0, // cluster numbers switch instantly instead of fading
        cooperativeGestures: true, // page scrolls normally; two fingers / Ctrl+scroll moves the map
        attributionControl: { compact: true },
      });
      mapRef.current = map;
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

      // closeOnClick is off: MapLibre's built-in "close on map click" fires right after
      // a pin click and would close the card we just moved to the new pin. We close it
      // ourselves below, only when the click lands on empty map.
      const popup = new maplibregl.Popup({ closeButton: true, closeOnClick: false, maxWidth: "280px", offset: 12 });

      // On a phone the map is barely wider than a card, so for a pin right or left of
      // centre the card fits on neither side and MapLibre lets it hang off the edge.
      // After a card opens or changes, nudge the map just enough to bring the whole
      // card inside the map, with a small margin. Twice at most: moving the map can
      // flip the card to the pin's other side, and the second pass corrects that.
      let checkQueued = false; // several calls in one moment run one check, not several pans
      const keepPopupInView = (attempt = 0) => {
        const m = mapRef.current;
        if (!m || !popup.isOpen() || attempt > 1 || checkQueued) return;
        checkQueued = true;
        requestAnimationFrame(() => {
          checkQueued = false;
          const el = popup.getElement();
          if (!el || !popup.isOpen()) return;
          const box = m.getContainer().getBoundingClientRect();
          const card = el.getBoundingClientRect();
          const margin = 12;
          let dx = 0;
          let dy = 0;
          if (card.left < box.left + margin) dx = card.left - (box.left + margin);
          else if (card.right > box.right - margin) dx = card.right - (box.right - margin);
          if (card.top < box.top + margin) dy = card.top - (box.top + margin);
          else if (card.bottom > box.bottom - margin) dy = card.bottom - (box.bottom - margin);
          if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
          m.once("moveend", () => keepPopupInView(attempt + 1));
          m.panBy([dx, dy], { duration: 250 });
        });
      };

      // Single tile or font errors are normal and harmless. Only if the map
      // hasn't loaded at all after 15 seconds (tile service down) do we say so.
      const giveUp = window.setTimeout(() => setFailed(true), 15000);
      map.on("error", (e) => console.warn("Map:", e.error?.message));

      map.on("load", () => {
        if (!map) return;
        const m = map;
        window.clearTimeout(giveUp);
        setFailed(false);
        m.resize(); // re-measure the box in case the layout settled after creation

        // All entries share one source, so HunBAN merges into clusters like the rest.
        // Inside a cluster it is just part of the navy count; alone it shows in yellow.
        m.addSource("orgs", {
          type: "geojson",
          data: toGeoJSON(new Map()),
          cluster: true,
          clusterRadius: 14, // pins (~16px) merge only when about to touch
          clusterMaxZoom: MAX_ZOOM,
          // Each cluster remembers whether HunBAN is inside it, for the yellow ring.
          // and how many organisations (not places) it holds, for its number.
          clusterProperties: {
            hasHighlight: ["any", ["get", "highlighted"]],
            orgCount: ["+", ["get", "count"]],
          },
        });

        // Numbered circles: clusters of nearby places, and single addresses with
        // several organisations. Both look the same; a click zooms or lists.
        const isGroup: ExpressionSpecification = ["any", ["has", "point_count"], [">", ["get", "count"], 1]];
        const groupSize: ExpressionSpecification = ["coalesce", ["get", "orgCount"], ["get", "count"]];
        const groupHasHighlight: ExpressionSpecification = ["coalesce", ["get", "hasHighlight"], ["get", "highlighted"]];
        m.addLayer({
          id: "clusters",
          type: "circle",
          source: "orgs",
          filter: isGroup,
          paint: {
            "circle-color": NAVY,
            // Visible size of numbered circles. If you change these numbers, also update
            // the matching tap zone in "clusters-hit" below (keep each one about 4 larger).
            "circle-radius": ["step", groupSize, 12, 10, 15, 50, 19],
            // Yellow ring = HunBAN is in this group; white ring otherwise.
            "circle-stroke-color": ["case", groupHasHighlight, YELLOW, WHITE],
            "circle-stroke-width": ["case", groupHasHighlight, 3, 2],
          },
        });
        m.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "orgs",
          filter: isGroup,
          layout: {
            "text-field": ["to-string", groupSize],
            "text-font": ["Noto Sans Bold"],
            "text-size": 11,
            "text-allow-overlap": true,
          },
          paint: { "text-color": WHITE },
        });
        m.addLayer({
          id: "points",
          type: "circle",
          source: "orgs",
          filter: ["all", ["!", ["has", "point_count"]], ["==", ["get", "count"], 1]],
          layout: { "circle-sort-key": ["case", ["get", "highlighted"], 1, 0] }, // HunBAN on top of nearby pins
          paint: {
            "circle-color": ["case", ["get", "highlighted"], YELLOW, NAVY],
            // Visible size of single pins (HunBAN, everyone else). If you change these, check
            // the tap zone in "points-hit" below stays clearly larger (now 16).
            "circle-radius": ["case", ["get", "highlighted"], 8, 6],
            "circle-stroke-color": ["case", ["get", "highlighted"], NAVY, WHITE],
            "circle-stroke-width": 2,
          },
        });

        // Invisible tap zones, drawn on top of the visible pins: a fingertip is much
        // bigger than a 16px pin. Single pins get a 32px zone; numbered circles a zone
        // 8px wider than the circle. All clicks and the pointer cursor use these zones.
        // These sizes do NOT follow the visible sizes above automatically: when you
        // change a pin or circle size, update the matching radius here too.
        m.addLayer({
          id: "points-hit",
          type: "circle",
          source: "orgs",
          filter: ["all", ["!", ["has", "point_count"]], ["==", ["get", "count"], 1]],
          paint: { "circle-radius": 16, "circle-opacity": 0 },
        });
        m.addLayer({
          id: "clusters-hit",
          type: "circle",
          source: "orgs",
          filter: isGroup,
          paint: { "circle-radius": ["step", groupSize, 16, 10, 19, 50, 23], "circle-opacity": 0 },
        });
        const HIT_LAYERS = ["points-hit", "clusters-hit"];

        // Where tap zones overlap, take the pin or circle whose centre is closest to the tap.
        const nearestHit = (point: { x: number; y: number }): MapGeoJSONFeature | undefined => {
          let best: MapGeoJSONFeature | undefined;
          let bestDist = Infinity;
          for (const f of m.queryRenderedFeatures([point.x, point.y], { layers: HIT_LAYERS })) {
            const c = m.project((f.geometry as GeoJSON.Point).coordinates as [number, number]);
            const d = (c.x - point.x) ** 2 + (c.y - point.y) ** 2;
            if (d < bestDist) {
              bestDist = d;
              best = f;
            }
          }
          return best;
        };

        // Show a list card for the given organisations at `center`.
        const openList = (orgs: MapOrganisation[], center: [number, number], sameAddress: boolean) => {
          const byName = (a: MapOrganisation, b: MapOrganisation) => a.name.localeCompare(b.name, "hu");
          const host = sameAddress ? hostOf(orgs) : undefined;
          // The host (coworking / office) first, then everyone else A-Z.
          const sorted = host ? [host, ...orgs.filter((o) => o !== host).sort(byName)] : [...orgs].sort(byName);
          const header = host
            ? `At ${host.name}`
            : sameAddress
              ? `${orgs.length} organisations at this address`
              : `${orgs.length} organisations close together`;
          const back = host ? `All at ${host.name}` : `All ${orgs.length} here`;

          const showList = () => {
            popup.setDOMContent(listContent(sorted, header, showOne));
            keepPopupInView();
          };
          const showOne = (o: MapOrganisation) => {
            popup.setDOMContent(popupContent(o, { label: back, onClick: showList }));
            keepPopupInView();
          };

          popup.setLngLat(center);
          showList();
          popup.addTo(m);
          keepPopupInView();
        };

        // One click handler for the whole map.
        m.on("click", async (e) => {
          const f = nearestHit(e.point);
          // Empty map: close any open card.
          if (!f) {
            popup.remove();
            return;
          }
          const center = (f.geometry as GeoJSON.Point).coordinates as [number, number];
          const place = placesRef.current.get(String(f.properties?.key));

          // A single pin: its card.
          if (f.layer.id === "points-hit") {
            if (place?.[0]) {
              popup.setLngLat(center).setDOMContent(popupContent(place[0])).addTo(m);
              keepPopupInView();
            }
            return;
          }

          // One address with several organisations: always the list.
          if (!f.properties?.cluster) {
            openList(place ?? [], center, true);
            return;
          }

          // A cluster of different places: zoom in until they split...
          const source = m.getSource("orgs") as GeoJSONSource;
          const clusterId = f.properties?.cluster_id as number;
          const zoom = await source.getClusterExpansionZoom(clusterId);
          if (zoom <= MAX_ZOOM) {
            m.easeTo({ center, zoom });
            return;
          }
          // ...unless they are so close they can't split even at maximum zoom
          // (e.g. slightly different coordinates for one building): then list them.
          const leaves = await source.getClusterLeaves(clusterId, 1000, 0);
          const orgs = leaves.flatMap((l) => placesRef.current.get(String(l.properties?.key)) ?? []);
          openList(orgs, center, false);
        });

        // Pointer cursor anywhere inside a tap zone.
        m.on("mousemove", (e) => {
          m.getCanvas().style.cursor = nearestHit(e.point) ? "pointer" : "";
        });

        setLoaded(true);
      });
    })();

    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
    };
    // byId only changes when the page's data changes, which remounts the page anyway.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push the filtered entries into the map whenever the filter changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded) return;
    const places = groupByPlace(visible);
    placesRef.current = places;
    (map.getSource("orgs") as GeoJSONSource | undefined)?.setData(toGeoJSON(places));
  }, [visible, loaded]);

  const toggle = (slug: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });

  const chip = (active: boolean) =>
    `rounded-sm border px-3 py-1.5 text-sm font-medium ${
      active
        ? "border-surface-brand bg-surface-brand text-on-brand"
        : "border-line text-ink-muted hover:text-ink"
    }`;

  return (
    <div>
      <div role="group" aria-label="Filter by type" className="flex flex-wrap gap-2">
        <button type="button" aria-pressed={selected.size === 0} onClick={() => setSelected(new Set())} className={chip(selected.size === 0)}>
          All types
        </button>
        {labels.map((l) => (
          <button key={l.slug} type="button" aria-pressed={selected.has(l.slug)} onClick={() => toggle(l.slug)} className={chip(selected.has(l.slug))}>
            {l.name}
          </button>
        ))}
      </div>

      <p className="mt-3 text-[13px] leading-[18px] text-ink-muted" aria-live="polite">
        Showing {visible.length} of {organisations.length} {organisations.length === 1 ? "entry" : "entries"}.      </p>

      <div className="relative mt-4 overflow-hidden rounded-md bg-surface-alt">
        <div ref={containerRef} className="h-[65vh] min-h-[420px] w-full" aria-label="Map of the Hungarian startup ecosystem" role="region" />
        {failed && (
          <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-ink-muted">
            The map can&apos;t be shown right now. The full list is below.
          </p>
        )}
      </div>

      <p className="mt-3 text-sm text-ink-muted">
        Missing someone? Tell us at{" "}
        <a href="mailto:info@hunban.eu" className="font-semibold text-ink underline underline-offset-4">
          info@hunban.eu
        </a>
        .
      </p>

      <h2 className="mt-14 text-[28px] font-semibold leading-9">All entries</h2>
      {sections.map((sec) => (
        <section key={sec.key} className="mt-8" aria-labelledby={`sec-${sec.key}`}>
          <h3 id={`sec-${sec.key}`} className="text-xl font-semibold leading-7">
            {sec.title} <span className="font-normal text-ink-muted">({sec.orgs.length})</span>
          </h3>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {sec.orgs.map((o) => (
              <OrgCard key={o.id} o={o} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

// One organisation card in the list under the map.
function OrgCard({ o }: { o: MapOrganisation }) {
  return (
    <li className="rounded-md bg-surface-alt p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
        {[...o.labels.map((l) => l.name), ...(o.city ? [o.city] : [])].join(" · ")}
      </p>
      <p className="mt-1 font-semibold">
        {o.name}
      </p>
      {o.description && <p className="mt-1 text-sm text-ink-muted">{o.description}</p>}
      <p className="mt-2 flex flex-wrap gap-x-4 text-[13px] font-medium">
        {o.website_url && (
          <a href={o.website_url} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
            Website ↗
          </a>
        )}
        {o.linkedin_url && (
          <a href={o.linkedin_url} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
            LinkedIn ↗
          </a>
        )}
      </p>
    </li>
  );
}
