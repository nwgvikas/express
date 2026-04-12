import { getAdminGeneralSettings, normalizeOutboundUrl } from "@/helper/admin-settings-service";
import { getPublishedBreakingTopN } from "@/helper/public-post-service";

export type LandingBreakingResolved = {
  label: string;
  line: string;
  href?: string;
  /** Up to 5 published `isBreaking` posts — marquee + scroll list. */
  breakingItems: { title: string; slug: string }[];
};

function resolveRibbonHref(raw: string): string | undefined {
  const t = raw.trim();
  if (!t) return undefined;
  if (t.startsWith("/")) return t;
  const out = normalizeOutboundUrl(t);
  return out || undefined;
}

/**
 * Landing top ribbon: admin custom line first, then published `isBreaking` post,
 * then first home-feed post, else default text.
 */
export async function getLandingBreakingResolved(
  feedFallback?: { title: string; slug: string } | null,
): Promise<LandingBreakingResolved> {
  const s = await getAdminGeneralSettings();
  const label = (s.breakingLabel || "BREAKING").trim() || "BREAKING";
  const breakingItems = await getPublishedBreakingTopN(5);
  const topBreaking = breakingItems[0];

  const customLine = (s.breakingRibbonText || "").trim();
  if (customLine) {
    const hrefRaw = (s.breakingRibbonUrl || "").trim();
    return {
      label,
      line: customLine,
      href: hrefRaw ? resolveRibbonHref(hrefRaw) : undefined,
      breakingItems,
    };
  }

  if (topBreaking?.title) {
    return {
      label,
      line: topBreaking.title,
      href: `/news/${encodeURIComponent(topBreaking.slug)}`,
      breakingItems,
    };
  }

  const fb = feedFallback;
  if (fb?.title?.trim() && fb.slug?.trim()) {
    return {
      label,
      line: fb.title.trim(),
      href: `/news/${encodeURIComponent(fb.slug.trim())}`,
      breakingItems,
    };
  }

  return {
    label,
    line: "Stay with UNNAO EXPRESS for the latest news and local updates.",
    href: undefined,
    breakingItems,
  };
}
