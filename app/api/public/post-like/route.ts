import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { clientIpFromHeaders } from "@/helper/client-ip";
import { getPostLikeStateForSlug, togglePostLikeForSlug } from "@/helper/post-like-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const raw = searchParams.get("slug") ?? "";
    const slug = decodeURIComponent(raw).trim();
    if (!slug) {
      return NextResponse.json({ error: "slug required" }, { status: 400 });
    }

    const h = await headers();
    const ip = clientIpFromHeaders(h);

    const result = await getPostLikeStateForSlug(slug, ip);
    if (!result.ok) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      likeCount: result.likeCount,
      liked: result.liked,
    });
  } catch (e) {
    console.error("GET /api/public/post-like:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

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

    const result = await togglePostLikeForSlug(slug, ip);
    if (!result.ok) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      likeCount: result.likeCount,
      liked: result.liked,
    });
  } catch (e) {
    console.error("POST /api/public/post-like:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
