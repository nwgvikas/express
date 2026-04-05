import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { clientIpFromHeaders } from "@/helper/client-ip";
import { recordPostViewForSlug } from "@/helper/post-view-service";

export const dynamic = "force-dynamic";

/**
 * POST JSON: `{ "slug": "post-slug" }` — dynamic `/[slug]/view` route se zyada reliable.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as { slug?: unknown } | null;
    const raw = typeof body?.slug === "string" ? body.slug : "";
    const slug = decodeURIComponent(raw).trim();
    if (!slug) {
      return NextResponse.json({ error: "slug required" }, { status: 400 });
    }

    const h = await headers();
    const ip = clientIpFromHeaders(h);

    const result = await recordPostViewForSlug(slug, ip);
    if (!result.ok) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ viewCount: result.viewCount });
  } catch (e) {
    console.error("POST /api/public/post-view:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
