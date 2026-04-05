"use server";

import { revalidatePath } from "next/cache";
import {
  createSubcategoryInDb,
  deleteSubcategoryInDb,
  updateSubcategoryInDb,
} from "@/helper/subcategory-service";
import { requireBackofficeSession } from "@/helper/backoffice-api-auth";

export type SubSaveState =
  | { ok: true; message: string }
  | { ok: false; error: string };

export async function saveSubcategoryFromForm(formData: FormData): Promise<SubSaveState> {
  const session = await requireBackofficeSession();
  if (!session) return { ok: false, error: "Please sign in" };

  const categoryId = String(formData.get("categoryId") ?? "");
  const name = String(formData.get("name") ?? "");
  const description = String(formData.get("description") ?? "");
  const slugField = String(formData.get("slug") ?? "").trim();

  const result = await createSubcategoryInDb(
    categoryId,
    name,
    description,
    slugField || undefined,
  );
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/backoffice/subcategories");
  return { ok: true, message: "Subcategory saved." };
}

export async function updateSubcategoryFromForm(formData: FormData): Promise<SubSaveState> {
  const session = await requireBackofficeSession();
  if (!session) return { ok: false, error: "Please sign in" };

  const id = String(formData.get("id") ?? "");
  const categoryId = String(formData.get("categoryId") ?? "");
  const name = String(formData.get("name") ?? "");
  const description = String(formData.get("description") ?? "");
  const slugField = String(formData.get("slug") ?? "").trim();

  const result = await updateSubcategoryInDb(
    id,
    categoryId,
    name,
    description,
    slugField ? slugField : undefined,
  );
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/backoffice/subcategories");
  return { ok: true, message: "Subcategory updated." };
}

export async function deleteSubcategoryAction(formData: FormData): Promise<SubSaveState> {
  const session = await requireBackofficeSession();
  if (!session) return { ok: false, error: "Please sign in" };

  const id = String(formData.get("id") ?? "");
  const result = await deleteSubcategoryInDb(id);
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/backoffice/subcategories");
  return { ok: true, message: "Subcategory deleted." };
}
