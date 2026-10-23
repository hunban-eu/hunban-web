import type { Metadata } from "next";
import EcosystemMap from "@/components/EcosystemMap";
import { getMapData } from "@/lib/organisations";

export const metadata: Metadata = {
  title: "Ecosystem map",
  description:
    "VCs, incubators, accelerators, coworking spaces, scaleups and the other players of the Hungarian startup ecosystem, on one map.",
};

// Refresh from the database at most every 5 minutes, like the events page.
export const revalidate = 300;

export default async function MapPage() {
  const result = await getMapData();

  return (
    <>
      <section className="on-brand bg-surface-brand text-on-brand">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-8 sm:py-20">
          <h1 className="text-3xl font-bold tracking-[-0.01em] sm:text-5xl">
            The Hungarian startup ecosystem, <span className="text-yellow">mapped</span>
          </h1>
          <p className="mt-4 max-w-2xl text-on-brand-muted">
            The players that make Hungary&apos;s startup ecosystem work, on one map. Curated by HunBAN.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-14">
        {result.status === "ok" ? (
          <EcosystemMap organisations={result.organisations} labels={result.labels} />
        ) : (
          <p className="text-ink-muted">The map can&apos;t be loaded right now. Please try again a little later.</p>
        )}
      </section>
    </>
  );
}
