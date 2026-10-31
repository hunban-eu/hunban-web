import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
import ContactCard from "@/components/ContactCard";

export const metadata: Metadata = {
  title: "For investors",
  description:
    "Join the early-stage investors who give back. Support founders, meet remarkable people and invest in companies worth believing in, with HunBAN.",
};

// The investor interest form in ClickUp; submissions land in the Member Funnel.
const INTEREST_FORM = "https://forms.clickup.com/90121663928/f/2kxupxdr-1252/OM03231ZWT3CZEDO7D";

// The story runs heart first, head second, then the ask:
// calling → belief → what you get back → the yearly rhythm → two ways in → membership → conversation.

const getBack = [
  {
    title: "For the heart",
    items: [
      "Meet interesting people from every corner of the ecosystem",
      "Help young founders grow, with your time and experience",
      "Be part of a success story from day one",
      "Back a grassroots initiative built and shaped by its members",
    ],
  },
  {
    title: "For the head",
    items: [
      "Curated deal flow from startups we've already screened",
      "Personal warm intros, based on detailed investor and founder profiles",
      "Learning from the best of the ecosystem",
      "A community of like-minded investors",
      "And, hopefully, good returns",
    ],
  },
];

const rhythm = [
  {
    when: "Every month",
    title: "Startup Arena",
    text: "Founders pitch, investors listen, and the best conversations carry on after the event.",
  },
  {
    when: "In between",
    title: "Warm intros",
    text: "We connect investors and founders based on detailed profiles, so every intro makes sense for both sides.",
  },
  {
    when: "Every quarter",
    title: "The club",
    text: "Professional sessions for the whole network, and informal club evenings for association members.",
  },
];

const ways = [
  {
    tag: "Get a taste",
    title: "The network",
    items: [
      "Startup Arena pitch events",
      "A founder intro now and then, when we see a fit",
      "Events across the ecosystem",
    ],
    links: [
      { label: "See upcoming events", href: "/events" },
      { label: "Follow our Luma calendar ↗", href: "https://luma.com/hunban", external: true },
    ],
  },
  {
    tag: "Step inside",
    title: "Association members",
    items: [
      "Full involvement with the startups we work with, before and after every pitch",
      "Club events and internal meetings",
      "International trips with fellow members",
      "A personal connection with our team, board and fellow members",
    ],
    links: [{ label: "See membership", href: "#membership" }],
  },
];

// Who joins the association. No prices on the site on purpose: membership isn't a
// purchase, and fees are talked through in person (most members join after we reach out).
const tiers = [
  { name: "Community members", for: "Angels who aren\u2019t investing right now, but want to be part of it." },
  { name: "Professional members", for: "Angels who are actively investing." },
  { name: "Institutional members", for: "VCs, CVCs, incubators and accelerators." },
];

const steps = [
  { title: "Get in touch", text: "Fill in the form below, reach out to Adam, or ask any HunBAN member to introduce you." },
  { title: "Meet us", text: "Over a call or a coffee, we get to know you and check that our values and vision match." },
  { title: "Board approval", text: "Our board reviews every application and decides at one of its regular meetings." },
  { title: "Welcome on board", text: "Once your membership fee arrives, you're in for 12 months, then renew or step out." },
];

const h2 = "text-[28px] font-semibold leading-9";
const linkStyle = "text-ink underline underline-offset-4";

export default function InvestorsPage() {
  return (
    <>
      {/* 1. The calling */}
      <section className="on-brand bg-surface-brand text-on-brand">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-8 sm:py-20">
          <h1 className="text-balance text-3xl font-bold tracking-[-0.01em] sm:text-5xl sm:leading-[52px]">
            Help build Hungary&apos;s next <span className="text-yellow">success stories</span>
          </h1>
          <p className="mt-4 max-w-2xl text-on-brand-muted">
            Join the early-stage investors who give back: support founders, meet remarkable people, and invest in
            companies worth believing in.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#apply" className="inline-block rounded-sm bg-accent px-5 py-3 font-semibold text-on-accent">
              Start a conversation
            </a>
            <a
              href="#rhythm"
              className="inline-block rounded-sm border border-on-brand-muted px-5 py-3 font-semibold text-on-brand"
            >
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* 2. The belief */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
        <div className="max-w-3xl">
          <h2 className={h2}>What we believe</h2>
          <p className="mt-4 text-xl leading-8 text-ink">
            We believe every successful business leader and entrepreneur should invest their time, effort and capital
            in the next generation of founders.
          </p>
          <p className="mt-4 text-ink-muted">
            HunBAN is building the environment where that feels natural, for Hungarians at home, for foreigners living
            in Hungary, and for Hungarians abroad. We&apos;re turning angel investing from a rare exception into a habit
            for Hungary&apos;s business community.
          </p>
        </div>
      </section>

      {/* 3. What you get back */}
      <section className="bg-surface-alt">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
          <h2 className={h2}>What you get back</h2>
          <p className="mt-2 max-w-2xl text-ink-muted">Giving comes first. But it gives back too.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {getBack.map((g) => (
              <div key={g.title} className="rounded-md bg-surface p-6">
                <p className="text-xl font-semibold leading-7">{g.title}</p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-ink-muted marker:text-ink-muted">
                  {g.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. The rhythm */}
      <section id="rhythm" className="scroll-mt-4 mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
        <h2 className={h2}>A year with HunBAN</h2>
        <ol className="mt-6 grid gap-6 md:grid-cols-3">
          {rhythm.map((r) => (
            <li key={r.title} className="border-t-2 border-yellow pt-4">
              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-ink-muted">{r.when}</p>
              <p className="mt-1 text-xl font-semibold leading-7">{r.title}</p>
              <p className="mt-2 text-ink-muted">{r.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 max-w-3xl text-ink">
          It doesn&apos;t stop at funding. We help founders find the people they need to build a real success story, and
          our investors are part of that from the start.
        </p>
      </section>

      {/* 5. Two ways in */}
      <section className="bg-surface-alt">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
          <h2 className={h2}>Start in the network and step inside when you&apos;re ready</h2>
          <p className="mt-2 max-w-2xl text-ink-muted">No pressure, no deadline.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {ways.map((w) => (
              <div key={w.title} className="flex flex-col rounded-md bg-surface p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.08em] text-ink-muted">{w.tag}</p>
                <p className="mt-1 text-xl font-semibold leading-7">{w.title}</p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-ink-muted marker:text-ink-muted">
                  {w.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className="mt-auto flex flex-wrap gap-x-5 gap-y-1 pt-4 text-sm font-semibold">
                  {w.links.map((l) =>
                    l.href.startsWith("/") ? (
                      <Link key={l.label} href={l.href} className={linkStyle}>
                        {l.label}
                      </Link>
                    ) : (
                      <a
                        key={l.label}
                        href={l.href}
                        {...("external" in l && l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className={linkStyle}
                      >
                        {l.label}
                      </a>
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Membership */}
      <section id="membership" className="scroll-mt-4 mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
        <h2 className={h2}>Membership</h2>
        <p className="mt-4 max-w-3xl text-xl leading-8 text-ink">
          Membership is what keeps HunBAN running. We&apos;re a grassroots initiative creating value for the whole
          ecosystem, funded by the people who believe in it.
        </p>
        <p className="mt-4 max-w-2xl text-ink-muted">
          We invite angels and investors connected to Hungary to back our vision by joining the association. Members
          are the core of the community and the main focus of our work: they put in the most, and they&apos;re closest
          to the action.
        </p>

        <h3 className="mt-12 text-xl font-semibold leading-7">Who joins</h3>
        <ul className="mt-4 grid gap-4 md:grid-cols-3">
          {tiers.map((t) => (
            <li key={t.name} className="rounded-md border border-line-subtle p-6">
              <p className="text-xl font-semibold leading-7">{t.name}</p>
              <p className="mt-2 text-ink-muted">{t.for}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 max-w-3xl text-sm text-ink-muted">
          Membership has an annual fee. On top of that, members can choose to give a voluntary contribution.
          We&apos;ll walk you through it when we talk.
        </p>

        <h3 className="mt-12 text-xl font-semibold leading-7">How joining works</h3>
        <ol className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.title}>
              <p className="font-display text-5xl leading-none tracking-[0.04em] text-ink-muted">{i + 1}</p>
              <p className="mt-2 text-lg font-semibold leading-7">{s.title}</p>
              <p className="mt-1 text-ink-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 7. The conversation: the form, with Adam beside it */}
      <section id="apply" className="scroll-mt-4 bg-surface-alt">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
          <h2 className={h2}>Start with a conversation</h2>
          <p className="mt-2 max-w-3xl text-ink-muted">
            Every journey with HunBAN starts the same way: getting to know each other. Tell us about yourself, and
            we&apos;ll take it from there. Prefer a full page?{" "}
            <a href={INTEREST_FORM} target="_blank" rel="noopener noreferrer" className={`font-semibold ${linkStyle}`}>
              Open the form in a new tab ↗
            </a>
          </p>
          {/* On phones Adam's card comes first, then the form; on desktop the card sits to the right. */}
          <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_360px]">
            {/* ClickUp's embed: the iframe plus ClickUp's script that sizes it to the form's height. */}
            <iframe
              title="HunBAN investor interest form"
              src={INTEREST_FORM}
              className="clickup-embed clickup-dynamic-height w-full rounded-md border border-line-subtle bg-white"
              style={{ minHeight: 900 }}
              loading="lazy"
            />
            <div className="order-first lg:sticky lg:top-28 lg:order-none">
              <ContactCard
                id="contact"
                intro="Not a form person? Reach out to me directly. I'm happy to tell you what we do and who's in the network, over a coffee or a call."
              />
            </div>
          </div>
          <Script src="https://app-cdn.clickup.com/assets/js/forms-embed/v1.js" strategy="lazyOnload" />
        </div>
      </section>
    </>
  );
}
