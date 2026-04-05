import { NextResponse } from "next/server";
import { createPublicComment } from "@/helper/public-comment-service";

export const dynamic = "force-dynamic";

type Body = {
  slug?: unknown;
  name?: unknown;
  mobile?: unknown;
  body?: unknown;
};

export async function POST(request: Request) {
  try {
    const json = (await request.json().catch(() => null)) as Body | null;
    const slug = typeof json?.slug === "string" ? json.slug : "";
    const name = typeof json?.name === "string" ? json.name : "";
    const mobile = typeof json?.mobile === "string" ? json.mobile : "";
    const body = typeof json?.body === "string" ? json.body : "";

    const result = await createPublicComment({ slug, name, mobile, body });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ commentCount: result.commentCount });
  } catch (e) {
    console.error("POST /api/public/post-comment:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
