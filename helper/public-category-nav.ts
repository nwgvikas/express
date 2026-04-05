import { connectDB } from "@/helper/db";
import { Category } from "@/models/category";
import { Subcategory } from "@/models/subcategory";

export type PublicNavSubcategory = {
  id: string;
  name: string;
  slug: string;
};

export type PublicNavCategory = {
  id: string;
  name: string;
  slug: string;
  subcategories: PublicNavSubcategory[];
};

/** Top Cities accordion: saari categories + unki subcategories (sortOrder, phir naam). */
export async function listCategoriesWithSubcategoriesForNav(): Promise<PublicNavCategory[]> {
  try {
    await connectDB();
    const categories = await Category.find()
      .sort({ sortOrder: 1, name: 1 })
      .select("name slug")
      .lean();
    const subs = await Subcategory.find()
      .sort({ sortOrder: 1, name: 1 })
      .select("name slug category")
      .lean();

    const byCat = new Map<string, PublicNavSubcategory[]>();
    for (const s of subs) {
      const cid = s.category != null ? String(s.category) : "";
      if (!cid) continue;
      const list = byCat.get(cid) ?? [];
      list.push({
        id: String(s._id),
        name: String(s.name ?? ""),
        slug: String(s.slug ?? ""),
      });
      byCat.set(cid, list);
    }

    return categories.map((c) => ({
      id: String(c._id),
      name: String(c.name ?? ""),
      slug: String(c.slug ?? ""),
      subcategories: byCat.get(String(c._id)) ?? [],
    }));
  } catch (e) {
    console.error("listCategoriesWithSubcategoriesForNav:", e);
    return [];
  }
}
