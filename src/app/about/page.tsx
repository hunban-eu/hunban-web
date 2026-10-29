import type { Metadata } from "next";
import Link from "next/link";
import { getNetwork, tierLabel } from "@/lib/network";

export const metadata: Metadata = {
  title: "About",
  description:
    "HunBAN, the Hungarian Business Angel Network: a nonprofit association of angel investors, founded in 2017 and relaunched in 2026. Our story, our board and our members.",
};

// Members and counts come from the database; refresh at most every 5 minutes.
export const revalidate = 300;

const IMG = "https://cnxdwkqgydlivbrokoim.supabase.co/storage/v1/object/public/images";

const board = [
  {
    name: "Péter Csillag",
    role: "President of the Board",
    photo: `${IMG}/Peter_Csillag_portrait.jpg`,
    linkedin: "https://www.linkedin.com/in/csillagpeter/",
  },
  {
    name: "Péter Langmár",
    role: "Board member",
    photo: `${IMG}/Peter_Langmar_portrait.jpeg`,
    linkedin: "https://www.linkedin.com/in/peterlangmar/",
  },
  {
    name: "Dániel Prekopcsák",
    role: "Board member",
    photo: `${IMG}/Daniel_Prekopcsak_portrait.jpeg`,
    linkedin: "https://www.linkedin.com/in/daniel-prekopcsak/",
  },
];

const team = [
  {
    name: "Ádám Brándisz",
    role: "Community & Operations Manager",
    photo: `${IMG}/Adam_Brandisz_portrait.jpeg`,
    linkedin: "https://www.linkedin.com/in/adam-brandisz",
  },
];

// Who's in the HunBAN Network. It's by invitation: people can reach out,
// and we invite them in once we've got to know each other.
const networkGroups = [
  {
    title: "Partners",
    text: "Companies, organisations, experts and service providers we work with and have invited in.",
  },
  {
    title: "Founders we've helped",
    text: "Founders who pitched at Startup Arena, whose story we shared with our investors, or whom we connected to the right people.",
  },
  {
    title: "Investors we've got to know",
    text: "Angels and institutional investors we've met and trust, many of them on their way to joining the association.",
  },
];

const h2 = "text-[28px] font-semibold leading-9";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter((w) => /^\p{Lu}/u.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
}

function Person({
  name,
  tier,
  role,
  photo,
  linkedin,
}: {
  name: string;
  tier?: string | null;
  role: string | null;
  photo: string | null;
  linkedin: string | null;
}) {
  return (
    <li className="flex items-center gap-4">
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt={name} width={72} height={72} className="h-[72px] w-[72px] shrink-0 rounded-full object-cover" />
      ) : (
        <span
          aria-hidden
          className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-surface-alt text-lg font-semibold text-ink-muted"
        >
          {initials(name)}
        </span>
      )}
      <div>
        <p className="font-semibold leading-6">{name}</p>
        {tier && <p className="text-sm text-ink-muted">{tier}</p>}
        {role && <p className="text-sm text-ink-muted">{role}</p>}
        {linkedin && (
          <a
            href={linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="link-reveal mt-1 inline-block pb-0.5 text-sm text-ink-muted hover:text-ink"
          >
            LinkedIn ↗
          </a>
        )}
      </div>
    </li>
  );
}

export default async function AboutPage() {
  const { counts, members, institutions } = await getNetwork();
  // Angels and ambassadors under "Our members" (ambassadors after the members);
  // institutional representatives under the institutions.
  const angels = [
    ...members.filter((m) => m.membership === "angel"),
    ...members.filter((m) => m.membership === "ambassador"),
  ];
  // Representatives follow the order of the institution logos above them;
  // two people from the same institution stay in name order.
  const logoOrder = (name: string | null) => {
    const i = institutions.findIndex((inst) => inst.name === name);
    return i === -1 ? institutions.length : i;
  };
  const representatives = members
    .filter((m) => m.membership === "institutional")
    .sort((a, b) => logoOrder(a.institution) - logoOrder(b.institution));

  const stats = [
    ...(counts
      ? [
          { value: String(counts.angels), label: "angels in the association" },
          { value: String(counts.institutions), label: "institutional members" },
        ]
      : []),
    { value: "2017", label: "founded, relaunched in 2026" },
    { value: "EBAN", label: "member of the European Business Angels Network" },
  ];

  return (
    <>
      <section className="on-brand bg-surface-brand text-on-brand">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-8 sm:py-20">
          <h1 className="text-balance text-3xl font-bold tracking-[-0.01em] sm:text-5xl sm:leading-[52px]">
            Our credo and the <span className="text-yellow">people behind it</span>
          </h1>
          <p className="mt-4 max-w-2xl text-on-brand-muted">
            HunBAN, the Hungarian Business Angel Network, brings together angels, institutional investors, founders and
            the people who help them succeed.
          </p>
        </div>
      </section>

      <section className="border-b border-line-subtle">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:px-8 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <p className="font-display text-5xl leading-none tracking-[0.02em]">{s.value}</p>
                <p className="mt-2 text-sm text-ink-muted">{s.label}</p>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className={h2}>Our story</h2>
            <p className="mt-4 text-ink-muted">
              HunBAN was founded in 2017 as a club of angels, and relaunched in 2026 with a bigger ambition: to become
              the cornerstone of the Hungarian early-stage startup scene. We&apos;re a membership-based, nonprofit
              association based in Budapest, and a member of EBAN, the European Business Angels Network.
            </p>
            <p className="mt-4 text-ink-muted">
              We believe every successful business leader and entrepreneur should invest their time, effort and
              capital in the next generation of founders. Our mission is to make that the norm, turning angel
              investing from a rare exception into a habit for Hungary&apos;s business community. We work for Hungarians at home, foreigners living in Hungary, and Hungarians abroad.
            </p>
          </div>
          <div>
            <h2 className={h2}>How we work</h2>
            <p className="mt-4 text-ink-muted">
              HunBAN doesn&apos;t manage a fund and doesn&apos;t make investment decisions. Our members invest
              individually, on their own terms and their own judgement. Our job is to connect: we help founders build
              success stories by connecting them with the people they need, whether that&apos;s an expert, an advisor, a
              mentor or an investor.
            </p>
            <p className="mt-4 text-ink-muted">
              We&apos;re a community of angels, founders and the people who help them succeed, run by a small team that
              knows everyone in it. That&apos;s what makes our intros work: we know who&apos;s building what, who&apos;s
              looking for what, and who would genuinely enjoy meeting whom.
            </p>
          </div>
        </div>

        <div id="network" className="mt-12 scroll-mt-24 sm:mt-16">
          <h2 className={h2}>Our network</h2>
          <p className="mt-4 max-w-3xl text-ink-muted">
            Around the association is the HunBAN Network: the people we know, trust and keep
            connecting.
          </p>
          <ul className="mt-8 grid gap-8 md:grid-cols-3">
            {networkGroups.map((g) => (
              <li key={g.title} className="border-t-4 border-yellow pt-5">
                <h3 className="text-xl font-semibold leading-7">{g.title}</h3>
                <p className="mt-2 text-ink-muted">{g.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-surface-alt">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-[3fr_1fr]">
            <div>
              <h2 className={h2}>Board</h2>
              <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {board.map((p) => (
                  <Person key={p.name} name={p.name} role={p.role} photo={p.photo} linkedin={p.linkedin} />
                ))}
              </ul>
            </div>
            <div>
              <h2 className={h2}>Team</h2>
              <ul className="mt-6 grid gap-6">
                {team.map((p) => (
                  <Person key={p.name} name={p.name} role={p.role} photo={p.photo} linkedin={p.linkedin} />
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {angels.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
          <h2 className={h2}>Our members</h2>
          <p className="mt-2 max-w-2xl text-ink-muted">
            The angels who keep HunBAN going. We only show members who chose to be listed.
          </p>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {angels.map((m) => (
              <Person
                key={m.id}
                name={m.full_name}
                tier={tierLabel(m)}
                role={[m.position, m.institution].filter(Boolean).join(", ") || null}
                photo={m.photo_url}
                linkedin={m.linkedin_url}
              />
            ))}
          </ul>
        </section>
      )}

      {institutions.length > 0 && (
        <section className={angels.length > 0 ? "bg-surface-alt" : ""}>
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
            <h2 className={h2}>Institutional members</h2>
            <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {institutions.map((i) => {
                const inner = i.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={i.logo_url} alt={i.name} className="max-h-16 w-auto max-w-full object-contain" />
                ) : (
                  <span className="text-center font-semibold">{i.name}</span>
                );
                return (
                  <li key={i.id}>
                    {i.website_url ? (
                      <a
                        href={i.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={i.name}
                        className="flex h-28 items-center justify-center rounded-md bg-white p-4"
                      >
                        {inner}
                      </a>
                    ) : (
                      <div className="flex h-28 items-center justify-center rounded-md bg-white p-4">{inner}</div>
                    )}
                  </li>
                );
              })}
            </ul>
            {representatives.length > 0 && (
              <>
                <h3 className="mt-10 text-xl font-semibold leading-7">Their representatives</h3>
                <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {representatives.map((m) => (
                    <Person
                      key={m.id}
                      name={m.full_name}
                      role={[m.position, m.institution].filter(Boolean).join(", ") || null}
                      photo={m.photo_url}
                      linkedin={m.linkedin_url}
                    />
                  ))}
                </ul>
              </>
            )}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
        <h2 className={h2}>Find your way in</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link href="/founders" className="on-brand group rounded-md bg-surface-brand p-6 text-on-brand">
            <p className="text-xl font-semibold leading-7">For founders</p>
            <p className="mt-2 text-on-brand-muted">Pitch to Hungary&apos;s angels at Startup Arena.</p>
            <p className="mt-4 font-semibold text-yellow group-hover:underline">Apply to pitch →</p>
          </Link>
          <Link href="/investors" className="on-brand group rounded-md bg-surface-brand p-6 text-on-brand">
            <p className="text-xl font-semibold leading-7">For investors</p>
            <p className="mt-2 text-on-brand-muted">Join the angels who give back.</p>
            <p className="mt-4 font-semibold text-yellow group-hover:underline">Start a conversation →</p>
          </Link>
        </div>
      </section>
    </>
  );
}
