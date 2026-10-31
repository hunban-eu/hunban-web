import type { Metadata } from "next";
import Script from "next/script";
import { getBackedFounders, type BackedFounder } from "@/lib/backed";

export const metadata: Metadata = {
  title: "For founders",
  description:
    "Apply to pitch to HunBAN's angel investors. Introductions, feedback and a network that lasts beyond the round.",
};

// The startup application form in ClickUp; submissions land in the Startup Funnel.
const APPLICATION_FORM = "https://forms.clickup.com/90121663928/f/2kxupxdr-952/KW7OT40CTTULCZ20H2";

const helps = [
  {
    title: "Warm introductions",
    text: "If we see a fit, we introduce you personally to investors, mentors and experts who back what you're building.",
  },
  {
    title: "A room of the right people",
    text: "Selected startups pitch at Startup Arena to HunBAN's angels and investors, alongside founders and partners from the network.",
  },
  {
    title: "Honest feedback",
    text: "After your pitch, investors share their interest and their questions. You learn what worked and what to sharpen.",
  },
  {
    title: "A network that stays",
    text: "Once you're in, you're in. We keep you in mind when the right investor, mentor or partner turns up.",
  },
];

const steps = [
  { title: "Apply", text: "Tell us about your startup in the form below." },
  { title: "We review", text: "We review every eligible application and reply to each one." },
  { title: "Pitch", text: "Selected startups pitch at Startup Arena to our angels and investors." },
  {
    title: "Follow-up",
    text: "Investors receive your pitch recording, share feedback and interest, and we make the introductions that make sense.",
  },
];

const faq: { q: string; a: string; list?: string[]; after?: string }[] = [
  {
    q: "Does HunBAN invest in startups?",
    a: "HunBAN is not a fund. Our members are private and institutional investors who decide and invest individually. We bring you together.",
  },
  {
    q: "What is Startup Arena?",
    a: "Startup Arena is HunBAN’s monthly pitch event, held throughout the year with breaks in summer and over Christmas. It’s held in English, at rotating partner venues in Budapest. Each edition opens with a fireside chat, then selected startups give a 5-minute pitch, with room for questions afterwards, in front of our angels, investors and an open audience from across our network. Pitching is free for founders: we select the startups from the applications we receive. Investor members who couldn’t be there receive the pitch recordings, so your pitch reaches beyond the room.",
  },
  {
    q: "Who can apply?",
    a: "Early-stage startups with a real link to Hungary, for example:",
    list: [
      "A fully Hungarian founding team, in Hungary or abroad",
      "At least one Hungarian co-founder, wherever you're building",
      "Foreign founders building in Hungary",
      "A Hungarian advisor on the team",
      "A team or office in Hungary",
      "A Hungarian investor on your cap table or in your current round",
      "An active presence in the Hungarian market",
      "A base close enough to meet investors in Budapest, like Vienna, Bratislava or Belgrade",
    ],
  },
  {
    q: "What if I'm not selected to pitch?",
    a: "Not being selected is often a matter of timing, not quality. If there's a fit, we'll stay in touch and, where we can, connect you with mentors, founders or angels who can help. You're welcome to reapply to Startup Arena after a year, or sooner if you've made a major pivot.",
  },
  {
    q: "What makes a strong application?",
    a: "Every eligible application gets a reply. Eligible means:",
    list: [
      "Written in English",
      "Every field filled in, with your deck and materials attached",
      "A clear connection to Hungary",
      "Early stage",
      "A real company, not just an idea",
    ],
  },
];

// Backed founders and their counter come from the database; refresh at most every 5 minutes.
export const revalidate = 300;

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter((w) => /^\p{Lu}/u.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
}

type StartupGroup = { key: string; startup: string; year: number | null; founders: BackedFounder[] };

// Founders grouped by startup, keeping the database order (newest first).
function groupByStartup(founders: BackedFounder[]): StartupGroup[] {
  const groups = new Map<string, StartupGroup>();
  for (const f of founders) {
    const key = f.startup_name.trim().toLowerCase();
    const g = groups.get(key) ?? { key, startup: f.startup_name.trim(), year: f.year, founders: [] };
    if (f.year && (!g.year || f.year > g.year)) g.year = f.year;
    g.founders.push(f);
    groups.set(key, g);
  }
  return [...groups.values()];
}

export default async function FoundersPage() {
  const { founders: backed, startups } = await getBackedFounders();
  const groups = groupByStartup(backed);
  const showBacked = backed.length > 0 || (startups ?? 0) > 0;

  return (
    <>
      <section className="on-brand bg-surface-brand text-on-brand">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-8 sm:py-20">
          <h1 className="text-balance text-3xl font-bold tracking-[-0.01em] sm:text-5xl sm:leading-[52px]">
            Meet the angels who can <span className="text-yellow">back you</span>
          </h1>
          <p className="mt-4 max-w-2xl text-on-brand-muted">
            HunBAN connects early-stage founders with Hungary&apos;s private and institutional investors. Introductions,
            feedback and a network that lasts beyond the round.
          </p>
          <a href="#apply" className="mt-8 inline-block rounded-sm bg-accent px-5 py-3 font-semibold text-on-accent">
            Apply to pitch
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
        <h2 className="text-[28px] font-semibold leading-9">What selected startups get</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {helps.map((h) => (
            <li key={h.title} className="rounded-md bg-surface-alt p-6">
              <p className="text-xl font-semibold leading-7">{h.title}</p>
              <p className="mt-2 text-ink-muted">{h.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-surface-alt">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
          <h2 className="text-[28px] font-semibold leading-9">How it works</h2>
          <ol className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <li key={s.title}>
                <p className="font-display text-5xl leading-none tracking-[0.04em] text-ink-muted">{i + 1}</p>
                <p className="mt-2 text-xl font-semibold leading-7">{s.title}</p>
                <p className="mt-1 text-ink-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
        <h2 className="text-[28px] font-semibold leading-9">Questions founders ask</h2>
        <dl className="mt-6 max-w-3xl divide-y divide-line-subtle">
          {faq.map((f) => (
            <div key={f.q} className="py-5">
              <dt className="text-xl font-semibold leading-7">{f.q}</dt>
              <dd className="mt-2 text-ink-muted">
                <p>{f.a}</p>
                {f.list && (
                  <ul className="mt-2 list-disc space-y-1 pl-5 marker:text-ink-muted">
                    {f.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="apply" className="scroll-mt-4 bg-surface-alt">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
          <h2 className="text-[28px] font-semibold leading-9">Apply to pitch</h2>
          <p className="mt-2 max-w-2xl text-ink-muted">
            Tell us what you are building. Prefer a full page?{" "}
            <a href={APPLICATION_FORM} target="_blank" rel="noopener noreferrer" className="font-semibold text-ink underline underline-offset-4">
              Open the form in a new tab ↗
            </a>
          </p>
          {/* ClickUp's embed: the iframe plus ClickUp's script that sizes it to the form's height. */}
          <iframe
            title="HunBAN startup application form"
            src={APPLICATION_FORM}
            className="clickup-embed clickup-dynamic-height mt-6 w-full rounded-md border border-line-subtle bg-white"
            style={{ minHeight: 900 }}
            loading="lazy"
          />
          <Script src="https://app-cdn.clickup.com/assets/js/forms-embed/v1.js" strategy="lazyOnload" />
        </div>
      </section>

      {/* Proof after the form. Hidden until there is something to show. */}
      {showBacked && (
        <section>
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
            <h2 className="text-[28px] font-semibold leading-9">Backed by HunBAN members</h2>
            {startups !== null && startups > 0 && (
              <p className="mt-6">
                <span className="block font-display text-6xl leading-none tracking-[0.02em]">{startups}</span>
                <span className="mt-1 block text-sm text-ink-muted">
                  {startups === 1 ? "startup" : "startups"} backed by our members so far
                </span>
              </p>
            )}
            {groups.length > 0 && (
              // One block per startup, its founders stacked inside. Blocks flow into
              // balanced columns (masonry), so a startup with four founders and one with
              // a single founder sit together without gaps, whatever the mix.
              <ul className="mt-10 columns-1 gap-x-6 sm:columns-2 lg:columns-3">
                {groups.map((g) => (
                  <li key={g.key} className="mb-10 break-inside-avoid">
                    <div className="border-t border-line-subtle pt-4">
                      <h3 className="text-lg font-semibold leading-7">{g.startup}</h3>
                      {g.year && <p className="text-sm text-ink-muted">Backed in {g.year}</p>}
                    </div>
                    <ul className="mt-5 grid gap-5">
                      {g.founders.map((f) => (
                        <li key={f.id} className="flex items-center gap-4">
                          {f.photo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={f.photo_url}
                              alt={f.full_name}
                              width={72}
                              height={72}
                              className="h-[72px] w-[72px] shrink-0 rounded-full object-cover"
                            />
                          ) : (
                            <span
                              aria-hidden
                              className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-surface-alt text-lg font-semibold text-ink-muted"
                            >
                              {initials(f.full_name)}
                            </span>
                          )}
                          <div>
                            <p className="font-semibold leading-6">{f.full_name}</p>
                            {f.position && <p className="text-sm text-ink-muted">{f.position}</p>}
                            {f.linkedin_url && (
                              <a
                                href={f.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link-reveal mt-1 inline-block pb-0.5 text-sm text-ink-muted hover:text-ink"
                              >
                                LinkedIn ↗
                              </a>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}
    </>
  );
}
