import type { Metadata } from "next";
import Link from "next/link";
import { employmentTypes, formatDate, getLiveJobs, labelOf, workModes } from "@/lib/jobs";

export const metadata: Metadata = {
  title: "Jobs",
  description: "Open roles at startups in the HunBAN network. Apply directly on each startup's own page.",
};

// Rebuild at most every 5 minutes, so expired listings drop off and new ones
// appear without a redeploy. Dashboard changes also refresh this page at once.
export const revalidate = 300;

export default async function JobsPage() {
  const result = await getLiveJobs();

  return (
    <>
      <section className="on-brand bg-surface-brand text-on-brand">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-8 sm:py-20">
          <h1 className="text-balance text-3xl font-bold tracking-[-0.01em] sm:text-5xl sm:leading-[52px]">
            Join a startup in the HunBAN <span className="text-yellow">network</span>
          </h1>
          <p className="mt-4 max-w-2xl text-on-brand-muted">
            Open roles at startups we know and work with. Each listing links to the startup&apos;s own page,
            so you apply to them directly.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-14">
        {result.status !== "ok" ? (
          <p className="text-ink-muted">Jobs can&apos;t be loaded right now. Please try again a little later.</p>
        ) : result.startups.length === 0 ? (
          <p className="text-ink-muted">There are no open roles right now. Check back soon.</p>
        ) : (
          <div className="grid gap-12">
            {result.startups.map((s) => (
              <section key={s.id} aria-labelledby={`startup-${s.id}`}>
                <h2 id={`startup-${s.id}`} className="text-2xl font-bold tracking-[-0.01em]">
                  {s.name}
                </h2>
                <ul className="mt-4 grid gap-4">
                  {s.listings.map((l) => (
                    <li
                      key={l.id}
                      className="flex flex-col gap-4 rounded-md bg-surface-alt p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                    >
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold leading-snug sm:text-xl">{l.position}</h3>
                        <p className="mt-2 text-[13px] font-medium leading-[18px] text-ink-muted">
                          {labelOf(employmentTypes, l.employment_type)}, {labelOf(workModes, l.work_mode)}
                          {l.city && <>, {l.city}</>}
                        </p>
                        {l.description && <p className="mt-2 text-sm">{l.description}</p>}
                        <p className="mt-2 text-[12px] text-ink-muted">Posted {formatDate(l.refreshed_at)}</p>
                      </div>
                      <a
                        href={l.apply_url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="shrink-0 self-start rounded-sm bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent hover:brightness-95 sm:self-center"
                      >
                        Apply <span aria-hidden="true">↗</span>
                        <span className="sr-only"> for {l.position} at {s.name} (opens the startup&apos;s site)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        <p className="mt-14 text-sm text-ink-muted">
          Hiring at a startup in the HunBAN network?{" "}
          <Link href="/jobs/dashboard" className="font-semibold text-ink underline underline-offset-4">
            Post or manage your roles
          </Link>
          . No access yet? If your startup has raised from HunBAN members, angels or VCs,{" "}
          <a href="mailto:info@hunban.eu" className="font-semibold text-ink underline underline-offset-4">
            write to us
          </a>
          .
        </p>
      </section>
    </>
  );
}
