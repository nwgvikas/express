import { NextResponse } from "next/server";
import { createSubcategoryInDb, listSubcategoriesForApi } from "@/helper/subcategory-service";
import { requireBackofficeSession } from "@/helper/backoffice-api-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireBackofficeSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const subcategories = await listSubcategoriesForApi();
    return NextResponse.json({ subcategories });
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
    const body = (await req.json()) as {
      categoryId?: string;
      name?: string;
      description?: string;
      slug?: string;
    };
    const categoryId = typeof body.categoryId === "string" ? body.categoryId : "";
    const name = typeof body.name === "string" ? body.name : "";
    const description = typeof body.description === "string" ? body.description : "";
    const slug = typeof body.slug === "string" ? body.slug : undefined;

    const result = await createSubcategoryInDb(categoryId, name, description, slug);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ subcategory: result.subcategory });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
