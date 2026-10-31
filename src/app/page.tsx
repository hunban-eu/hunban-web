import Link from "next/link";
import { getUpcomingEvents } from "@/lib/events";
import { getMapData } from "@/lib/organisations";
import { getTestimonials, type Testimonial } from "@/lib/testimonials";
import { legal, social } from "@/lib/site";

// The homepage doesn't sell, it routes. Like a hotel lobby, it tells visitors
// where they are, shows the place is alive, and points them to the right door.
// Story: claim + two doors → how we work → voices → what's on now → closing.
// Events, map count and quotes are read live from Supabase, so the page
// updates itself when Adam edits the data.

export const revalidate = 300;

const doors = [
  {
    href: "/founders",
    tag: "I'm a founder",
    title: "Pitch to our angels",
    text: "Get in front of investors who back early-stage founders, and the people who can help you grow.",
  },
  {
    href: "/investors",
    tag: "I'm an investor",
    title: "Back the next success stories",
    text: "Join a circle of angels who give back, with curated deal flow and warm intros.",
  },
];

const howWeWork = [
  {
    title: "A trusted circle",
    text: "At the centre are the members of the HunBAN Association, private and institutional investors who back our mission and each other.",
  },
  {
    title: "A curated network",
    text: "Around it are founders, investors and enablers from across Hungary and the Hungarian diaspora. You can take part before you commit to anything.",
  },
  {
    title: "We give first",
    text: "We connect founders to the right people, through monthly pitch events and warm intros, and help build success stories, not just funding rounds.",
  },
];

const TZ = "Europe/Budapest";
const day = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, day: "numeric" });
const month = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, month: "short" });
const weekday = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, weekday: "long" });
const time = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });

const h2 = "text-[28px] font-semibold leading-9";
const eyebrow = "text-[11px] font-semibold uppercase tracking-[0.08em]";
const textLink = "font-semibold text-ink underline underline-offset-4";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter((w) => /^\p{Lu}/u.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
}

function Quote({ t }: { t: Testimonial }) {
  const who = [t.role, t.company].filter(Boolean).join(", ");
  return (
    <figure className="flex h-full flex-col rounded-md bg-surface p-6">
      <p className={`${eyebrow} text-ink-muted`}>{t.audience === "founder" ? "Founder" : "Investor"}</p>
      <blockquote className="mt-3 flex-1 text-lg leading-7">
        <p>&ldquo;{t.quote}&rdquo;</p>
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        {t.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={t.photo_url} alt="" width={48} height={48} className="h-12 w-12 shrink-0 rounded-full object-cover" />
        ) : (
          <span
            aria-hidden
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-alt font-semibold text-ink-muted"
          >
            {initials(t.person_name)}
          </span>
        )}
        <span>
          <span className="block font-semibold leading-6">{t.person_name}</span>
          {who && <span className="block text-sm text-ink-muted">{who}</span>}
        </span>
      </figcaption>
    </figure>
  );
}

export default async function Home() {
  const [eventsResult, mapResult, quotes] = await Promise.all([
    getUpcomingEvents(),
    getMapData(),
    getTestimonials({ featured: true }),
  ]);

  const nextEvents = eventsResult.status === "ok" ? eventsResult.events.slice(0, 3) : [];
  const mapCount = mapResult.status === "ok" ? mapResult.organisations.length : null;
  // Show founders and investors side by side: founder, investor, founder, investor.
  const founders = quotes.filter((q) => q.audience === "founder");
  const investors = quotes.filter((q) => q.audience === "investor");
  const voices = Array.from({ length: Math.max(founders.length, investors.length) })
    .flatMap((_, i) => [founders[i], investors[i]])
    .filter((q): q is Testimonial => Boolean(q))
    .slice(0, 4);
  const luma = social.find((s) => s.label === "Luma calendar")?.href;

  return (
    <>
      {/* 1. The claim and two doors */}
      <section className="on-brand bg-surface-brand text-on-brand">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-8 sm:py-24">
          <h1 className="max-w-3xl text-balance text-4xl font-bold leading-tight tracking-[-0.01em] sm:text-5xl sm:leading-[56px]">
            The home of angel investing in <span className="text-yellow">Hungary</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-on-brand-muted">
            A trusted circle of angels at the centre, a curated network of founders, investors and enablers around it. We
            connect founders to the right people and help build success stories, not just funding rounds.
          </p>

          <ul className="mt-10 grid gap-4 md:grid-cols-2">
            {doors.map((d) => (
              <li key={d.href}>
                <Link
                  href={d.href}
                  className="group flex h-full flex-col rounded-md bg-navy-deep p-6 ring-1 ring-on-brand-muted/30 transition hover:ring-yellow sm:p-7"
                >
                  <span className={`${eyebrow} text-yellow`}>{d.tag}</span>
                  <span className="mt-2 text-2xl font-semibold leading-8">{d.title}</span>
                  <span className="mt-2 text-on-brand-muted">{d.text}</span>
                  <span className="mt-5 font-semibold underline-offset-4 group-hover:underline">
                    Find out more <span aria-hidden="true">→</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 2. How we work */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
        <h2 className={h2}>How HunBAN works</h2>
        <ul className="mt-8 grid gap-8 md:grid-cols-3">
          {howWeWork.map((item) => (
            <li key={item.title} className="border-t-4 border-yellow pt-5">
              <h3 className="text-xl font-semibold leading-7">{item.title}</h3>
              <p className="mt-2 text-ink-muted">{item.text}</p>
            </li>
          ))}
        </ul>
        <p className="mt-8">
          <Link href="/about" className={textLink}>
            More about us
          </Link>
        </p>
      </section>

      {/* 3. Voices: hidden until there is at least one published, consented quote */}
      {voices.length > 0 && (
        <section className="bg-surface-alt">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
            <h2 className={h2}>In their words</h2>
            <ul className="mt-8 grid gap-4 md:grid-cols-2">
              {voices.map((t) => (
                <li key={t.id}>
                  <Quote t={t} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 4. What's on now: next events and the map */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[3fr_2fr]">
          <div>
            <h2 className={h2}>Coming up</h2>
            {nextEvents.length === 0 ? (
              <p className="mt-6 text-ink-muted">No upcoming events right now. Check back soon.</p>
            ) : (
              <ul className="mt-6 grid gap-3">
                {nextEvents.map((e) => {
                  const start = new Date(e.starts_at);
                  const Card = e.registration_url ? "a" : "div";
                  return (
                    <li key={e.id}>
                      <Card
                        {...(e.registration_url
                          ? { href: e.registration_url, target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        className={`flex items-center gap-4 rounded-md bg-surface-alt p-4 ${
                          e.registration_url ? "hover:ring-2 hover:ring-line" : ""
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`flex w-14 shrink-0 flex-col items-center rounded-sm py-1.5 ${
                            e.is_hunban ? "bg-surface-brand text-on-brand" : "bg-surface text-ink"
                          }`}
                        >
                          <span className="font-display text-3xl leading-none tracking-[0.04em]">{day.format(start)}</span>
                          <span className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.08em]">
                            {month.format(start)}
                          </span>
                        </span>
                        <span className="min-w-0">
                          {e.is_hunban && (
                            <span className="inline-block rounded-sm bg-accent px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-on-accent">
                              HunBAN event
                            </span>
                          )}
                          <span className="mt-1 block font-semibold leading-snug">{e.title}</span>
                          <span className="mt-1 block text-[13px] leading-[18px] text-ink-muted">
                            {weekday.format(start)}, {time.format(start)}
                            {e.venue && <>, {e.venue}</>}
                          </span>
                        </span>
                      </Card>
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="mt-6">
              <Link href="/events" className={textLink}>
                See all events
              </Link>
            </p>
          </div>

          <Link
            href="/map"
            className="on-brand group flex flex-col justify-between rounded-md bg-surface-brand p-6 text-on-brand sm:p-8"
          >
            <span>
              <span className={`${eyebrow} text-on-brand-muted`}>Ecosystem map</span>
              <span className="mt-3 block text-2xl font-semibold leading-8">
                The players that make the ecosystem work, on one map.
              </span>
              <span className="mt-3 block text-on-brand-muted">
                VCs, incubators, coworking spaces, scaleups and more, filterable by type.
              </span>
            </span>
            <span className="mt-8 flex items-end justify-between gap-4">
              {mapCount !== null && mapCount > 0 && (
                <span>
                  <span className="block font-display text-6xl leading-none tracking-[0.04em] text-yellow">
                    {mapCount}
                  </span>
                  <span className="text-sm text-on-brand-muted">organisations so far</span>
                </span>
              )}
              <span className="font-semibold underline-offset-4 group-hover:underline">
                Explore the map <span aria-hidden="true">→</span>
              </span>
            </span>
          </Link>
        </div>
      </section>

      {/* 5. Closing: the lowest step on the ladder */}
      <section className="bg-surface-alt">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
          <h2 className={h2}>Not sure where you fit?</h2>
          <p className="mt-4 max-w-2xl text-ink-muted">
            Come to a Startup Arena, or get to know our team and the people in our network.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            {luma && (
              <a
                href={luma}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-sm bg-accent px-5 py-3 font-semibold text-on-accent"
              >
                Follow our Luma calendar <span aria-hidden="true">↗</span>
              </a>
            )}
            <a href={`mailto:${legal.email}`} className={textLink}>
              Or write to us at {legal.email}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
