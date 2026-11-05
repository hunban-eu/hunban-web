import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import type { ReactNode } from "react";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

// Renders a legal document from a plain Markdown file in /content.
// To change the text, edit the .md file (on GitHub or by asking Claude);
// the page layout below stays the same. Git keeps every earlier version.

export function readDocument(file: string) {
  return fs.readFileSync(path.join(process.cwd(), "content", file), "utf8");
}

// "2. Data controller and contact" → "data-controller-and-contact", so each
// section can be linked directly, e.g. hunban.eu/privacy#your-rights-and-how-to-use-them
function slug(children: ReactNode) {
  const text = Array.isArray(children) ? children.join("") : String(children ?? "");
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/^\d+\.\s*/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-4xl font-bold leading-tight tracking-[-0.01em] sm:text-5xl sm:leading-[56px]">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 id={slug(children)} className="mt-12 scroll-mt-24 text-[28px] font-semibold leading-9">
      {children}
    </h2>
  ),
  h3: ({ children }) => <h3 className="mt-8 text-xl font-semibold leading-7">{children}</h3>,
  p: ({ children }) => <p className="mt-4 leading-7">{children}</p>,
  ul: ({ children }) => <ul className="mt-4 list-disc space-y-2 pl-6 leading-7">{children}</ul>,
  ol: ({ children }) => <ol className="mt-4 list-decimal space-y-2 pl-6 leading-7">{children}</ol>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  a: ({ href = "", children }) =>
    href.startsWith("mailto:") ? (
      <a href={href} className="font-semibold underline underline-offset-4">
        {children}
      </a>
    ) : href.startsWith("/") || href.startsWith("#") ? (
      <Link href={href} className="font-semibold underline underline-offset-4">
        {children}
      </Link>
    ) : (
      <a href={href} className="font-semibold underline underline-offset-4" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
  // Two-column tables wrap to the screen; tables with three or more columns
  // keep a minimum width and scroll sideways on phones.
  table: ({ children }) => (
    <div className="mt-6 overflow-x-auto rounded-md ring-1 ring-line-subtle">
      <table className="w-full border-collapse text-left text-[15px] leading-6 [&:has(th:nth-child(3))]:min-w-[600px]">
        {children}
      </table>
    </div>
  ),
  // A header row with only empty cells (like the controller table) is hidden.
  thead: ({ children }) => (
    <thead className="bg-surface-alt [&:not(:has(th:not(:empty)))]:hidden">{children}</thead>
  ),
  th: ({ children }) => <th className="px-4 py-3 align-top font-semibold">{children}</th>,
  td: ({ children }) => <td className="border-t border-line-subtle px-4 py-3 align-top">{children}</td>,
};

export default function LegalDocument({ markdown }: { markdown: string }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-8 sm:py-16">
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {markdown}
      </Markdown>
      <p className="mt-12 border-t border-line-subtle pt-6 text-sm text-ink-muted">
        Questions about this document? Write to us at{" "}
        <a href="mailto:info@hunban.eu" className="font-semibold text-ink underline underline-offset-4">
          info@hunban.eu
        </a>
        .
      </p>
    </article>
  );
}
