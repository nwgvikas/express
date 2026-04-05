import mongoose from "mongoose";
import { slugify } from "@/helper/category-service";
import { connectDB } from "@/helper/db";
import { Category } from "@/models/category";
import { Subcategory } from "@/models/subcategory";

async function uniqueSlugInCategory(
  base: string,
  categoryId: string,
  excludeSubId?: string,
): Promise<string> {
  let slug = base;
  let n = 0;
  for (;;) {
    const q: Record<string, unknown> = { category: categoryId, slug };
    if (excludeSubId) q._id = { $ne: excludeSubId };
    if (!(await Subcategory.exists(q))) break;
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

export type MutateOk = { ok: true };
export type MutateFail = { ok: false; error: string; status: number };
export type MutateResult = MutateOk | MutateFail;

export async function listSubcategoriesForApi() {
  await connectDB();
  const rows = await Subcategory.find()
    .populate("category", "name slug")
    .sort({ category: 1, sortOrder: 1, name: 1 })
    .lean();
  return rows.map((s) => {
    const cat = s.category as { _id: unknown; name?: string; slug?: string } | null;
    return {
      id: String(s._id),
      name: s.name as string,
      slug: s.slug as string,
      description: (s.description as string) ?? "",
      sortOrder: (s.sortOrder as number) ?? 0,
      categoryId: cat ? String(cat._id) : "",
      categoryName: cat?.name ?? "—",
      categorySlug: cat?.slug ?? "",
      createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : undefined,
      updatedAt: s.updatedAt ? new Date(s.updatedAt).toISOString() : undefined,
    };
  });
}

export async function createSubcategoryInDb(
  categoryId: string,
  name: string,
  description: string,
  slugInput?: string,
): Promise<
  | { ok: true; subcategory: { id: string; name: string; slug: string } }
  | MutateFail
> {
  if (!mongoose.isValidObjectId(categoryId)) {
    return { ok: false, error: "Parent category invalid", status: 400 };
  }
  const trimmedName = name.trim();
  if (!trimmedName) {
    return { ok: false, error: "Name is required", status: 400 };
  }

  await connectDB();
  const parent = await Category.findById(categoryId);
  if (!parent) {
    return { ok: false, error: "Parent category not found", status: 400 };
  }

  const dup = await Subcategory.findOne({ category: categoryId, name: trimmedName });
  if (dup) {
    return { ok: false, error: "This name already exists under this category", status: 409 };
  }

  const base = slugInput?.trim() ? slugify(slugInput) : slugify(trimmedName);
  const slug = await uniqueSlugInCategory(base, categoryId);

  try {
    const doc = await Subcategory.create({
      category: categoryId,
      name: trimmedName,
      slug,
      description: description.trim(),
      sortOrder: 0,
    });
    return {
      ok: true,
      subcategory: {
        id: String(doc._id),
        name: doc.name as string,
        slug: doc.slug as string,
      },
    };
  } catch (e: unknown) {
    const err = e as { code?: number };
    if (err?.code === 11000) {
      return { ok: false, error: "Duplicate name or slug under this parent", status: 409 };
    }
    console.error(e);
    return { ok: false, error: "Database save fail", status: 500 };
  }
}

export async function updateSubcategoryInDb(
  id: string,
  categoryId: string,
  name: string,
  description: string,
  slugInput?: string,
): Promise<MutateResult> {
  if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(categoryId)) {
    return { ok: false, error: "Invalid id", status: 400 };
  }
  const trimmedName = name.trim();
  if (!trimmedName) {
    return { ok: false, error: "Name is required", status: 400 };
  }

  await connectDB();
  const doc = await Subcategory.findById(id);
  if (!doc) {
    return { ok: false, error: "Subcategory not found", status: 404 };
  }

  const parent = await Category.findById(categoryId);
  if (!parent) {
    return { ok: false, error: "Parent category not found", status: 400 };
  }

  const dup = await Subcategory.findOne({
    category: categoryId,
    name: trimmedName,
    _id: { $ne: id },
  });
  if (dup) {
    return { ok: false, error: "This name already exists under this category", status: 409 };
  }

  const slugTrim = slugInput?.trim();
  const base = slugTrim ? slugify(slugTrim) : slugify(trimmedName);
  let slug: string;
  if (String(doc.category) !== categoryId) {
    slug = await uniqueSlugInCategory(base, categoryId, id);
  } else if (base === (doc.slug as string)) {
    slug = doc.slug as string;
  } else {
    slug = await uniqueSlugInCategory(base, categoryId, id);
  }

  try {
    doc.category = new mongoose.Types.ObjectId(categoryId);
    doc.name = trimmedName;
    doc.description = description.trim();
    doc.slug = slug;
    await doc.save();
    return { ok: true };
  } catch (e: unknown) {
    const err = e as { code?: number };
    if (err?.code === 11000) {
      return { ok: false, error: "Duplicate slug or name", status: 409 };
    }
    console.error(e);
    return { ok: false, error: "Update fail", status: 500 };
  }
}

export async function deleteSubcategoryInDb(id: string): Promise<MutateResult> {
  if (!mongoose.isValidObjectId(id)) {
    return { ok: false, error: "Invalid id", status: 400 };
  }
  await connectDB();
  const deleted = await Subcategory.findByIdAndDelete(id);
  if (!deleted) {
    return { ok: false, error: "Subcategory not found", status: 404 };
  }
  return { ok: true };
}
