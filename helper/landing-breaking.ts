import { getAdminGeneralSettings, normalizeOutboundUrl } from "@/helper/admin-settings-service";
import { getPublishedBreakingTicker } from "@/helper/public-post-service";

export type LandingBreakingResolved = {
  label: string;
  line: string;
  href?: string;
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

  const customLine = (s.breakingRibbonText || "").trim();
  if (customLine) {
    const hrefRaw = (s.breakingRibbonUrl || "").trim();
    return {
      label,
      line: customLine,
      href: hrefRaw ? resolveRibbonHref(hrefRaw) : undefined,
    };
  }

  const ticker = await getPublishedBreakingTicker();
  if (ticker?.title) {
    return { label, line: ticker.title, href: `/news/${ticker.slug}` };
  }

  const fb = feedFallback;
  if (fb?.title?.trim() && fb.slug?.trim()) {
    return {
      label,
      line: fb.title.trim(),
      href: `/news/${fb.slug.trim()}`,
    };
  }

  return {
    label,
    line: "Stay with UNNAO EXPRESS for the latest news and local updates.",
    href: undefined,
  };
}
