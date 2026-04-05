"use server";

import { revalidatePath } from "next/cache";
import {
  createCategoryInDb,
  deleteCategoryInDb,
  updateCategoryInDb,
} from "@/helper/category-service";
import { requireBackofficeSession } from "@/helper/backoffice-api-auth";

export type SaveCategoryState =
  | { ok: true; message: string }
  | { ok: false; error: string };

export async function saveCategoryFromForm(formData: FormData): Promise<SaveCategoryState> {
  const session = await requireBackofficeSession();
  if (!session) {
    return { ok: false, error: "Please sign in" };
  }

  const name = String(formData.get("name") ?? "");
  const description = String(formData.get("description") ?? "");

  const result = await createCategoryInDb(name, description);

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  revalidatePath("/backoffice/categories");
  return { ok: true, message: "Category saved to the database." };
}

export async function updateCategoryFromForm(formData: FormData): Promise<SaveCategoryState> {
  const session = await requireBackofficeSession();
  if (!session) {
    return { ok: false, error: "Please sign in" };
  }

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "");
  const description = String(formData.get("description") ?? "");
  const slugField = String(formData.get("slug") ?? "").trim();

  const result = await updateCategoryInDb(
    id,
    name,
    description,
    slugField ? slugField : undefined,
  );

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  revalidatePath("/backoffice/categories");
  return { ok: true, message: "Category updated." };
}

export async function deleteCategoryAction(formData: FormData): Promise<SaveCategoryState> {
  const session = await requireBackofficeSession();
  if (!session) {
    return { ok: false, error: "Please sign in" };
  }

  const id = String(formData.get("id") ?? "");
  const result = await deleteCategoryInDb(id);

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  revalidatePath("/backoffice/categories");
  return { ok: true, message: "Category deleted." };
}
