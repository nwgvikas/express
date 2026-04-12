import Link from "next/link";
import { BreakingMarqueeTrack } from "./breaking-marquee-track";

function isExternalHref(h: string) {
  return /^https?:\/\//i.test(h);
}

export type HomeBreakingItem = {
  title: string;
  slug: string;
};

type Props = {
  /** Badge from admin (e.g. BREAKING, LIVE, FLASH). */
  label?: string;
  line?: string;
  /** Article or custom link — internal or external. */
  href?: string;
  /** Published `isBreaking` posts — marquee + scroll list (max 5 from server). */
  breakingItems?: HomeBreakingItem[];
};

export function HomeBreakingBar({ label, line, href, breakingItems = [] }: Props) {
  const badge = (label ?? "BREAKING").trim() || "BREAKING";
  const defaultLine = "Stay with UNNAO EXPRESS for the latest news and local updates.";
  const resolvedLine = line?.trim() || defaultLine;

  const hasList = breakingItems.length > 0;
  const topTitle = breakingItems[0]?.title?.trim() ?? "";
  const lineForLink = line?.trim();
  /** Admin custom ribbon line (different from top breaking title) — prepend to marquee. */
  const customPrefix =
    hasList && lineForLink && lineForLink !== topTitle ? `${lineForLink}  ·  ` : "";
  const marqueePlain = hasList
    ? customPrefix +
      breakingItems
        .map((i) => i.title.trim())
        .filter(Boolean)
        .join("  ·  ")
    : resolvedLine;

  const linkClass =
    "truncate text-sm text-zinc-800 underline-offset-2 hover:text-blue-700 hover:underline";

  const linkedHeadline =
    href && lineForLink ? (
      isExternalHref(href) ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          {lineForLink}
        </a>
      ) : (
        <Link href={href} className={linkClass}>
          {lineForLink}
        </Link>
      )
    ) : (
      <p className="truncate text-sm text-zinc-800">{resolvedLine}</p>
    );

  const showTopList = breakingItems.length >= 2;

  return (
    <div className="border-b border-zinc-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-stretch lg:gap-3">
          <div className="flex min-w-0 flex-1 flex-row items-stretch">
            <div className="flex w-[min(38%,9rem)] shrink-0 items-center rounded-l-lg bg-red-600 px-2.5 py-2 text-xs font-bold tracking-wide text-white sm:w-auto sm:min-w-[7.5rem] sm:px-3">
              <span className="truncate">{badge}</span>
            </div>

            {hasList ? (
              <div
                className="relative flex min-w-0 max-w-full flex-1 flex-col justify-center overflow-hidden rounded-r-lg border border-l-0 border-zinc-200 bg-zinc-50 py-2 pl-3 pr-3"
                role="region"
                aria-label={breakingItems.map((i) => i.title).join(". ").slice(0, 240)}
              >
                <BreakingMarqueeTrack text={marqueePlain} />
              </div>
            ) : (
              <div className="flex min-w-0 flex-1 items-center overflow-hidden rounded-r-lg border border-l-0 border-zinc-200 bg-zinc-50 px-3 py-2">
                {linkedHeadline}
              </div>
            )}
          </div>

          {hasList && showTopList ? (
            <div className="hidden min-w-0 border-t border-zinc-200 pt-2 lg:block lg:w-64 lg:shrink-0 lg:border-l lg:border-t-0 lg:pl-3 lg:pt-0 xl:w-72">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                Top {breakingItems.length}
              </p>
              <ul className="max-h-[6.5rem] space-y-2 overflow-y-auto overscroll-y-contain py-0.5 pr-1 text-xs leading-snug">
                {breakingItems.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/news/${encodeURIComponent(item.slug)}`}
                      className="line-clamp-3 text-zinc-800 underline-offset-2 hover:text-blue-700 hover:underline"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        {hasList && showTopList ? (
          <div className="mt-2 flex gap-2 overflow-x-auto pb-0.5 [-webkit-overflow-scrolling:touch] lg:hidden">
            {breakingItems.map((item) => (
              <Link
                key={item.slug}
                href={`/news/${encodeURIComponent(item.slug)}`}
                className="max-w-[min(240px,78vw)] shrink-0 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-800 hover:border-blue-300 hover:bg-blue-50/80"
              >
                <span className="line-clamp-1">{item.title}</span>
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
