import { NextResponse } from "next/server";
import { getPublishedPostFullBySlug, normalizePublicPostSlug } from "@/helper/public-post-service";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ slug: string }> };

/** Published post ka HTML body — feed par inline expand ke liye (sirf public). */
export async function GET(_request: Request, context: RouteContext) {
  const { slug: raw } = await context.params;
  const s = normalizePublicPostSlug(raw || "");
  if (!s) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const full = await getPublishedPostFullBySlug(s);
  if (!full) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    title: full.card.title,
    contentHtml: full.contentHtml || "",
    comments: full.comments.map((c) => ({
      id: c.id,
      authorName: c.authorName,
      body: c.body,
      createdAt: c.createdAt,
    })),
  });
}
