import Link from "next/link";

function isExternalHref(h: string) {
  return /^https?:\/\//i.test(h);
}

type Props = {
  /** Badge from admin (e.g. BREAKING, LIVE, FLASH). */
  label?: string;
  line?: string;
  /** Article or custom link — internal or external. */
  href?: string;
};

export function HomeBreakingBar({ label, line, href }: Props) {
  const badge = (label ?? "BREAKING").trim() || "BREAKING";
  const text =
    line?.trim() ||
    "Stay with UNNAO EXPRESS for the latest news and local updates.";

  const linkClass =
    "truncate text-sm text-zinc-800 underline-offset-2 hover:text-blue-700 hover:underline";

  const inner =
    href && line?.trim() ? (
      isExternalHref(href) ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          {text}
        </a>
      ) : (
        <Link href={href} className={linkClass}>
          {text}
        </Link>
      )
    ) : (
      <p className="truncate text-sm text-zinc-800">{text}</p>
    );

  return (
    <div className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-stretch gap-0 px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex max-w-[40%] shrink-0 items-center rounded-l-lg bg-red-600 px-3 py-1.5 text-xs font-bold tracking-wide text-white sm:max-w-none">
          <span className="truncate">{badge}</span>
        </div>
        <div className="flex min-w-0 flex-1 items-center overflow-hidden rounded-r-lg border border-l-0 border-zinc-200 bg-zinc-50 px-3 py-1.5">
          {inner}
        </div>
      </div>
    </div>
  );
}
