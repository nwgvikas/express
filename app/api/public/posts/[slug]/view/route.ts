import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { recordPostViewForSlug } from "@/helper/post-view-service";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ slug: string }> };

function clientIpFromHeaders(h: Headers): string {
  const xf = h.get("x-forwarded-for");
  if (xf) {
    const first = xf.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = h.get("x-real-ip")?.trim();
  if (real) return real;
  const cf = h.get("cf-connecting-ip")?.trim();
  if (cf) return cf;
  return "unknown";
}

/** Show more: IP ke hisaab se naya visitor → viewCount +1 */
export async function POST(_request: Request, context: RouteContext) {
  try {
    const { slug: raw } = await context.params;
    const slug = decodeURIComponent(raw || "").trim();
    if (!slug) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    const h = await headers();
    const ip = clientIpFromHeaders(h);

    const result = await recordPostViewForSlug(slug, ip);
    if (!result.ok) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ viewCount: result.viewCount });
  } catch (e) {
    console.error("POST /api/public/posts/[slug]/view:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
