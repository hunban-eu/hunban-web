import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
import ContactCard from "@/components/ContactCard";

export const metadata: Metadata = {
  title: "For investors",
  description:
    "Join HunBAN, the association of Hungary's angel investors. Back the next generation of founders: membership tiers, contributions and how joining works.",
};

// The investor membership form in ClickUp; submissions land in the Member Funnel.
const MEMBERSHIP_FORM = "https://forms.clickup.com/90121663928/f/2kxupxdr-1252/OM03231ZWT3CZEDO7D";

const access = [
  {
    title: "The open network",
    tag: "Get a taste",
    links: [
      { label: "Express your interest", href: "#apply" },
      { label: "See upcoming events", href: "/events" },
    ],
    items: [
      "Startup Arena pitch events",
      "A founder intro now and then, when we see a fit",
      "Community events across the ecosystem",
    ],
  },
  {
    title: "Association members",
    tag: "Step inside",
    links: [{ label: "Express your interest", href: "#apply" }],
    items: [
      "Full involvement with the startups we work with, before and after every pitch",
      "Club events and internal meetings",
      "International trips with the network",
      "A personal connection with our team, board and fellow angels",
    ],
  },
];

// Big numbers are the level our plans are built on, in thousand HUF per year.
// The fee is 100k for everyone; the rest is a suggested, voluntary contribution.
const tiers = [
  { name: "Community member", amount: 100, for: "For angels not investing right now." },
  { name: "Professional member", amount: 200, for: "For angels who are actively investing." },
  { name: "Institutional member", amount: 400, for: "For VCs, incubators and accelerators." },
];

const steps = [
  {
    title: "Get in touch",
    text: "Express your interest with the form below, or tell any HunBAN member, board member or our team.",
  },
  {
    title: "Meet us",
    text: "A call or a coffee with our team. We get to know each other and check that our values, vision and community fit you.",
  },
  { title: "Board approval", text: "Our board reviews and approves new members." },
  {
    title: "Welcome on board",
    text: "Once your membership fee and contribution arrive, you're in. Membership runs for 12 months, then you renew or step out.",
  },
];

export default function InvestorsPage() {
  return (
    <>
      <section className="on-brand bg-surface-brand text-on-brand">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-8 sm:py-20">
          <h1 className="max-w-3xl text-3xl font-bold tracking-[-0.01em] sm:text-5xl sm:leading-[52px]">
            Back the next generation of <span className="text-yellow">founders</span>
          </h1>
          <p className="mt-4 max-w-2xl text-on-brand-muted">
            HunBAN brings together angel investors in Hungary and across the diaspora, to back early-stage founders
            with time, experience and capital.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#apply" className="inline-block rounded-sm bg-accent px-5 py-3 font-semibold text-on-accent">
              Express your interest
            </a>
            <a
              href="#first"
              className="inline-block rounded-sm border border-on-brand-muted px-5 py-3 font-semibold text-on-brand"
            >
              Get to know us first
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-[28px] font-semibold leading-9">Why we exist</h2>
            <p className="mt-4 text-ink-muted">
              We believe every successful business leader and entrepreneur should invest their time, effort and
              capital in the next generation of founders.
            </p>
            <p className="mt-4 text-ink-muted">
              HunBAN exists to enable that for Hungarians at home, for foreigners living in Hungary, and for Hungarians
              abroad. We&apos;re turning angel investing from a rare exception into a habit for Hungary&apos;s business
              community.
            </p>
          </div>
          <div>
            <h2 className="text-[28px] font-semibold leading-9">What it actually looks like</h2>
            <p className="mt-4 text-ink-muted">
              Every month, founders pitch at Startup Arena and investors ask the hard questions, and the best
              conversations carry on long after the event. In between, we make warm intros based on detailed founder
              and investor profiles, so every connection makes sense for both sides. Once a quarter, we bring the
              network together for professional sessions and informal club evenings.
            </p>
            <p className="mt-4 text-ink-muted">
              We don&apos;t stop at funding. We help founders find the people they need to turn a promising start into
              a real success story, and our investors get to be part of that journey from the very beginning. All of
              this is open to the network, and our members are the ones who make it possible.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-surface-alt">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
          <h2 className="text-[28px] font-semibold leading-9">The network and the inner circle</h2>
          <p className="mt-2 max-w-2xl text-ink-muted">
            Anyone can get a taste of HunBAN. Association members are the core of the community and the main focus of
            our work: they put in the most, and they are closest to the action.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {access.map((a) => (
              <div key={a.title} className="rounded-md bg-surface p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.08em] text-ink-muted">{a.tag}</p>
                <p className="mt-1 text-xl font-semibold leading-7">{a.title}</p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-ink-muted marker:text-ink-muted">
                  {a.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm font-semibold">
                  {a.links.map((l) =>
                    l.href.startsWith("/") ? (
                      <Link key={l.label} href={l.href} className="text-ink underline underline-offset-4">
                        {l.label}
                      </Link>
                    ) : (
                      <a key={l.label} href={l.href} className="text-ink underline underline-offset-4">
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

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
        <h2 className="text-[28px] font-semibold leading-9">Membership</h2>
        <p className="mt-2 max-w-2xl text-ink-muted">Three ways to join.</p>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {tiers.map((t) => (
            <li key={t.name} className="flex flex-col rounded-md border border-line-subtle p-6">
              <p className="text-xl font-semibold leading-7">{t.name}</p>
              <p className="mt-2 text-ink-muted">{t.for}</p>
              <p className="mt-6 font-display text-6xl leading-none tracking-[0.02em]">{t.amount}</p>
              <p className="mt-1 text-sm text-ink-muted">thousand HUF per year</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 max-w-3xl text-sm text-ink-muted">
          Every tier includes the 100,000 HUF annual membership fee. Above that, 100,000 HUF for Professional and
          300,000 HUF for Institutional members is our suggested, voluntary contribution: the level our plans are built
          on, and the level we ask committed members to give.
        </p>
      </section>

      <section className="bg-surface-alt">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
          <h2 className="text-[28px] font-semibold leading-9">How joining works</h2>
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

      <section id="first" className="scroll-mt-4 mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_400px]">
          <div>
            <h2 className="text-[28px] font-semibold leading-9">Not ready yet? Get to know us first</h2>
            <p className="mt-4 max-w-2xl text-ink-muted">
              There&apos;s no rush, and no form needed. Come to our events, meet the founders and angels in the
              network, and find a mentor in the community. Take your time to see whether angel investing, the HunBAN
              way, is for you. When you see the value we create, we&apos;d love you to back it.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-semibold">
              <Link href="/events" className="text-ink underline underline-offset-4">
                See upcoming events
              </Link>
              <a
                href="https://luma.com/hunban"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink underline underline-offset-4"
              >
                Follow our Luma calendar ↗
              </a>
            </div>
          </div>
          {/* The human way in: Adam's face and direct contacts, so HunBAN reads as people who answer. */}
          <ContactCard
            id="contact"
            intro="Curious, but not ready for a form? Reach out to me directly. I'm happy to tell you what we do and who's in the network, over a coffee or a call."
          />
        </div>
      </section>

      <section id="apply" className="scroll-mt-4 bg-surface-alt">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
          <h2 className="text-[28px] font-semibold leading-9">Express your interest</h2>
          <p className="mt-2 max-w-3xl text-ink-muted">
            Whether you want to join the association or just get to know the network, start here. We&apos;ll get in
            touch and figure out the right fit together. Prefer a full page?{" "}
            <a
              href={MEMBERSHIP_FORM}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-ink underline underline-offset-4"
            >
              Open the form in a new tab ↗
            </a>
          </p>
          {/* ClickUp's embed: the iframe plus ClickUp's script that sizes it to the form's height. */}
          <iframe
            title="HunBAN investor interest form"
            src={MEMBERSHIP_FORM}
            className="clickup-embed clickup-dynamic-height mt-6 w-full rounded-md border border-line-subtle bg-white"
            style={{ minHeight: 900 }}
            loading="lazy"
          />
          <Script src="https://app-cdn.clickup.com/assets/js/forms-embed/v1.js" strategy="lazyOnload" />
        </div>
      </section>
    </>
  );
}
