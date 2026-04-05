import { NextResponse } from "next/server";
import { connectDB } from "@/helper/db";
import { createCategoryInDb } from "@/helper/category-service";
import { requireBackofficeSession } from "@/helper/backoffice-api-auth";
import { Category } from "@/models/category";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireBackofficeSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await connectDB();
    const items = await Category.find().sort({ sortOrder: 1, name: 1 }).lean();
    return NextResponse.json({
      categories: items.map((c) => ({
        id: String(c._id),
        name: c.name,
        slug: c.slug,
        description: c.description ?? "",
        sortOrder: c.sortOrder ?? 0,
        createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : undefined,
        updatedAt: c.updatedAt ? new Date(c.updatedAt).toISOString() : undefined,
      })),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await requireBackofficeSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await req.json()) as { name?: string; description?: string; slug?: string };
    const name = typeof body.name === "string" ? body.name : "";
    const description = typeof body.description === "string" ? body.description : "";
    const slugOverride = typeof body.slug === "string" ? body.slug : undefined;

    const result = await createCategoryInDb(name, description, slugOverride);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ category: result.category });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
