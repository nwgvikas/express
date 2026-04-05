import mongoose from "mongoose";
import { connectDB } from "@/helper/db";
import { Category } from "@/models/category";

export function slugify(raw: string): string {
  const s = raw
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\u0900-\u097F-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return s || "category";
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let n = 0;
  while (await Category.exists({ slug })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

async function uniqueSlugExcluding(base: string, excludeId: string): Promise<string> {
  let slug = base;
  let n = 0;
  while (await Category.exists({ slug, _id: { $ne: excludeId } })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

export type CreateCategoryResult =
  | { ok: true; category: { id: string; name: string; slug: string; description: string } }
  | { ok: false; error: string; status: number };

export async function createCategoryInDb(
  name: string,
  description: string,
  slugOverride?: string,
): Promise<CreateCategoryResult> {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return { ok: false, error: "Name is required", status: 400 };
  }

  await connectDB();

  if (await Category.exists({ name: trimmedName })) {
    return { ok: false, error: "A category with this name already exists", status: 409 };
  }

  const baseSlug = slugOverride?.trim()
    ? slugify(slugOverride)
    : slugify(trimmedName);
  const slug = await uniqueSlug(baseSlug);

  try {
    const doc = await Category.create({
      name: trimmedName,
      slug,
      description: description.trim(),
      sortOrder: 0,
    });

    return {
      ok: true,
      category: {
        id: String(doc._id),
        name: doc.name as string,
        slug: doc.slug as string,
        description: (doc.description as string) ?? "",
      },
    };
  } catch (e: unknown) {
    const err = e as { code?: number };
    if (err?.code === 11000) {
      return {
        ok: false,
        error: "Duplicate category (name or slug already in use)",
        status: 409,
      };
    }
    console.error(e);
    return { ok: false, error: "Database save fail", status: 500 };
  }
}

export type MutateOk = { ok: true };
export type MutateFail = { ok: false; error: string; status: number };
export type MutateResult = MutateOk | MutateFail;

export async function updateCategoryInDb(
  id: string,
  name: string,
  description: string,
  slugInput?: string,
): Promise<MutateResult> {
  if (!mongoose.isValidObjectId(id)) {
    return { ok: false, error: "Invalid category id", status: 400 };
  }
  const trimmedName = name.trim();
  if (!trimmedName) {
    return { ok: false, error: "Name is required", status: 400 };
  }

  await connectDB();
  const doc = await Category.findById(id);
  if (!doc) {
    return { ok: false, error: "Category not found", status: 404 };
  }

  const other = await Category.findOne({ name: trimmedName, _id: { $ne: id } });
  if (other) {
    return { ok: false, error: "A category with this name already exists", status: 409 };
  }

  const slugTrim = slugInput?.trim();
  const base = slugTrim ? slugify(slugTrim) : slugify(trimmedName);
  let slug: string;
  if (base === (doc.slug as string)) {
    slug = doc.slug as string;
  } else {
    slug = await uniqueSlugExcluding(base, id);
  }

  try {
    doc.name = trimmedName;
    doc.description = description.trim();
    doc.slug = slug;
    await doc.save();
    return { ok: true };
  } catch (e: unknown) {
    const err = e as { code?: number };
    if (err?.code === 11000) {
      return {
        ok: false,
        error: "Duplicate slug — try a different slug",
        status: 409,
      };
    }
    console.error(e);
    return { ok: false, error: "Update failed", status: 500 };
  }
}

export async function deleteCategoryInDb(id: string): Promise<MutateResult> {
  if (!mongoose.isValidObjectId(id)) {
    return { ok: false, error: "Invalid category id", status: 400 };
  }
  await connectDB();
  const deleted = await Category.findByIdAndDelete(id);
  if (!deleted) {
    return { ok: false, error: "Category not found", status: 404 };
  }
  return { ok: true };
}
