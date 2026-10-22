"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Map as MLMap, GeoJSONSource, MapMouseEvent, MapGeoJSONFeature } from "maplibre-gl";
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

function toGeoJSON(orgs: MapOrganisation[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: "FeatureCollection",
    features: orgs.map((o) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [o.longitude, o.latitude] },
      properties: { id: o.id, highlighted: o.is_highlighted },
    })),
  };
}

// Popup content is built with DOM methods (textContent), never raw HTML,
// so text from the database can't inject anything into the page.
function popupContent(o: MapOrganisation): HTMLElement {
  const root = document.createElement("div");
  root.className = "hb-popup";

  const types = document.createElement("p");
  types.className = "hb-popup-types";
  types.textContent = o.labels.map((l) => l.name).join(" · ");
  root.appendChild(types);

  const name = document.createElement("p");
  name.className = "hb-popup-name";
  name.textContent = o.name;
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

export default function EcosystemMap({ organisations, labels }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
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
        cooperativeGestures: true, // page scrolls normally; two fingers / Ctrl+scroll moves the map
        attributionControl: { compact: true },
      });
      mapRef.current = map;
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

      // closeOnClick is off: MapLibre's built-in "close on map click" fires right after
      // a pin click and would close the card we just moved to the new pin. We close it
      // ourselves below, only when the click lands on empty map.
      const popup = new maplibregl.Popup({ closeButton: true, closeOnClick: false, maxWidth: "280px", offset: 12 });

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
          data: toGeoJSON([]),
          cluster: true,
          clusterRadius: 25, // pins (~20px) merge only when about to touch
          clusterMaxZoom: 14,
        });

        m.addLayer({
          id: "clusters",
          type: "circle",
          source: "orgs",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": NAVY,
            "circle-radius": ["step", ["get", "point_count"], 16, 10, 20, 50, 26],
            "circle-stroke-color": WHITE,
            "circle-stroke-width": 2,
          },
        });
        m.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "orgs",
          filter: ["has", "point_count"],
          layout: {
            "text-field": ["get", "point_count_abbreviated"],
            "text-font": ["Noto Sans Bold"],
            "text-size": 13,
            "text-allow-overlap": true,
          },
          paint: { "text-color": WHITE },
        });
        m.addLayer({
          id: "points",
          type: "circle",
          source: "orgs",
          filter: ["!", ["has", "point_count"]],
          layout: { "circle-sort-key": ["case", ["get", "highlighted"], 1, 0] }, // HunBAN on top of nearby pins
          paint: {
            "circle-color": ["case", ["get", "highlighted"], YELLOW, NAVY],
            "circle-radius": ["case", ["get", "highlighted"], 10, 8],
            "circle-stroke-color": ["case", ["get", "highlighted"], NAVY, WHITE],
            "circle-stroke-width": 2,
          },
        });

        const openPopup = (e: MapMouseEvent & { features?: MapGeoJSONFeature[] }) => {
          // A click on a cluster zooms in; don't also open the pin hidden beneath it.
          if (m.queryRenderedFeatures(e.point, { layers: ["clusters"] }).length) return;
          const f = e.features?.[0];
          const o = f && byId.get(String(f.properties?.id));
          if (!f || !o) return;
          const [lng, lat] = (f.geometry as GeoJSON.Point).coordinates as [number, number];
          popup.setLngLat([lng, lat]).setDOMContent(popupContent(o)).addTo(m);
        };
        m.on("click", "points", openPopup);

        // A click on empty map (no pin, no cluster) closes the card.
        m.on("click", (e) => {
          const hit = m.queryRenderedFeatures(e.point, { layers: ["points", "clusters"] });
          if (!hit.length) popup.remove();
        });

        // Clicking a cluster zooms in until it splits apart.
        m.on("click", "clusters", async (e) => {
          const f = e.features?.[0];
          if (!f) return;
          const source = m.getSource("orgs") as GeoJSONSource;
          const zoom = await source.getClusterExpansionZoom(f.properties?.cluster_id as number);
          m.easeTo({ center: (f.geometry as GeoJSON.Point).coordinates as [number, number], zoom });
        });

        for (const layer of ["points", "clusters"]) {
          m.on("mouseenter", layer, () => (m.getCanvas().style.cursor = "pointer"));
          m.on("mouseleave", layer, () => (m.getCanvas().style.cursor = ""));
        }

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
    (map.getSource("orgs") as GeoJSONSource | undefined)?.setData(toGeoJSON(visible));
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
        Showing {visible.length} of {organisations.length} {organisations.length === 1 ? "entry" : "entries"}.
        <span className="ml-3 inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="inline-block h-3 w-3 rounded-full border-2 border-navy bg-yellow" /> HunBAN
        </span>
      </p>

      <div className="relative mt-4 overflow-hidden rounded-md bg-surface-alt">
        <div ref={containerRef} className="h-[65vh] min-h-[420px] w-full" aria-label="Map of the Hungarian startup ecosystem" role="region" />
        {failed && (
          <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-ink-muted">
            The map can&apos;t be shown right now. The full list is below.
          </p>
        )}
      </div>

      <h2 className="mt-12 text-xl font-semibold">All entries</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {visible.map((o) => (
          <li key={o.id} className="rounded-md bg-surface-alt p-5">
            <p className="flex flex-wrap items-center gap-x-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
              <span>{o.labels.map((l) => l.name).join(" · ")}</span>
              {o.city && (
                <>
                  <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
                  <span>{o.city}</span>
                </>
              )}
            </p>
            <p className="mt-1 font-semibold">{o.name}</p>
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
        ))}
      </ul>
    </div>
  );
}
