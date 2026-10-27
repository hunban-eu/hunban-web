// A personal way in next to the forms: Adam's face and direct contacts,
// so HunBAN reads as people who answer, not a generic inbox.
// Photo lives in the public "images" bucket of our Supabase storage.
const PHOTO = "https://cnxdwkqgydlivbrokoim.supabase.co/storage/v1/object/public/images/Adam_Brandisz.jpeg";

const contacts = [
  { label: "info@hunban.eu", href: "mailto:info@hunban.eu" },
  { label: "WhatsApp", href: "https://wa.me/36308733561", external: true },
  { label: "+36 30 873 3561", href: "tel:+36308733561" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/adam-brandisz", external: true },
];

export default function ContactCard({ id }: { id?: string }) {
  return (
    <aside id={id} className="scroll-mt-24 rounded-md border border-line-subtle bg-surface p-6">
      <div className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PHOTO}
          alt="Ádám Brándisz"
          width={64}
          height={64}
          className="h-16 w-16 shrink-0 rounded-full object-cover"
        />
        <div>
          <p className="text-lg font-semibold leading-6">Ádám Brándisz</p>
          <p className="text-sm text-ink-muted">Community &amp; Operations Manager</p>
        </div>
      </div>
      <p className="mt-4 text-ink-muted">
        Not a form person? Reach out to me directly. Happy to have a coffee or a call.
      </p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {contacts.map((c) => (
          <li key={c.label}>
            <a
              href={c.href}
              {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="inline-block rounded-sm border border-line px-3 py-2 text-sm font-semibold text-ink hover:border-ink"
            >
              {c.label}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
