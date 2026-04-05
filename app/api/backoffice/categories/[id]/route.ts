import { NextResponse } from "next/server";
import { deleteCategoryInDb, updateCategoryInDb } from "@/helper/category-service";
import { requireBackofficeSession } from "@/helper/backoffice-api-auth";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const session = await requireBackofficeSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  try {
    const body = (await req.json()) as { name?: string; description?: string; slug?: string };
    const name = typeof body.name === "string" ? body.name : "";
    const description = typeof body.description === "string" ? body.description : "";
    const slug = typeof body.slug === "string" ? body.slug : undefined;

    const result = await updateCategoryInDb(id, name, description, slug);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const session = await requireBackofficeSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  try {
    const result = await deleteCategoryInDb(id);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
