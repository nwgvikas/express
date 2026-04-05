"use server";

import { revalidatePath } from "next/cache";
import {
  createPostInDb,
  deletePostById,
  updatePostInDb,
  parsePostStatusFromForm,
} from "@/helper/post-service";
import { requireBackofficeSession } from "@/helper/backoffice-api-auth";
import { savePostImageFile } from "@/helper/save-post-image";

export type SavePostState =
  | { ok: true; message: string }
  | { ok: false; error: string };

export async function createPostFromForm(formData: FormData): Promise<SavePostState> {
  try {
    const session = await requireBackofficeSession();
    if (!session) {
      return { ok: false, error: "Please sign in" };
    }

    const title = String(formData.get("title") ?? "");
    const slug = String(formData.get("slug") ?? "").trim();
    const excerpt = String(formData.get("excerpt") ?? "");
    const content = String(formData.get("content") ?? "");
    const status = parsePostStatusFromForm(String(formData.get("status") ?? "draft"));
    const trendingRaw = String(formData.get("isTrending") ?? "");
    const isTrending =
      trendingRaw === "1" || trendingRaw === "true" || trendingRaw === "on";
    const breakingRaw = String(formData.get("isBreaking") ?? "");
    const isBreaking =
      breakingRaw === "1" || breakingRaw === "true" || breakingRaw === "on";
    const categoryId = String(formData.get("categoryId") ?? "").trim();
    const subcategoryId = String(formData.get("subcategoryId") ?? "").trim();
    const mediaTypeRaw = String(formData.get("mediaType") ?? "image");
    const mediaType = mediaTypeRaw === "youtube" ? "youtube" : "image";
    const authorId = String(formData.get("authorId") ?? "").trim();

    let imageUrl = String(formData.get("imageUrl") ?? "").trim();
    const youtubeUrl = String(formData.get("youtubeUrl") ?? "").trim();
    const imageFile = formData.get("imageFile");

    if (mediaType === "image" && imageFile instanceof File && imageFile.size > 0) {
      const saved = await savePostImageFile(imageFile);
      if (!saved.ok) {
        return { ok: false, error: saved.error };
      }
      imageUrl = saved.publicPath;
    }

    const result = await createPostInDb({
      title,
      slug: slug || undefined,
      excerpt,
      content,
      status,
      categoryId: categoryId || undefined,
      subcategoryId: subcategoryId || undefined,
      mediaType,
      imageUrl: mediaType === "image" ? imageUrl : undefined,
      youtubeUrl: mediaType === "youtube" ? youtubeUrl : undefined,
      isTrending,
      isBreaking,
      authorId: authorId || undefined,
      actorUserId: session.userId,
    });

    if (!result.ok) {
      return { ok: false, error: result.error };
    }

    revalidatePath("/");
    revalidatePath("/backoffice/posts");
    revalidatePath("/my-posts");
    return { ok: true, message: "Post saved." };
  } catch (e) {
    console.error("createPostFromForm:", e);
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("MONGO_DB_URL") || msg.includes("MONGO")) {
      return {
        ok: false,
        error: "Could not connect to database — check MONGO_DB_URL / MONGO_DB_NAME in .env.",
      };
    }
    return { ok: false, error: "Save failed — server error. Check console / logs." };
  }
}

export async function updatePostFromForm(formData: FormData): Promise<SavePostState> {
  try {
    const session = await requireBackofficeSession();
    if (!session) {
      return { ok: false, error: "Please sign in" };
    }

    const postId = String(formData.get("postId") ?? "").trim();
    if (!postId) {
      return { ok: false, error: "Post id missing" };
    }

    const title = String(formData.get("title") ?? "");
    const slug = String(formData.get("slug") ?? "").trim();
    const excerpt = String(formData.get("excerpt") ?? "");
    const content = String(formData.get("content") ?? "");
    const status = parsePostStatusFromForm(String(formData.get("status") ?? "draft"));
    const trendingRaw = String(formData.get("isTrending") ?? "");
    const isTrending =
      trendingRaw === "1" || trendingRaw === "true" || trendingRaw === "on";
    const breakingRaw = String(formData.get("isBreaking") ?? "");
    const isBreaking =
      breakingRaw === "1" || breakingRaw === "true" || breakingRaw === "on";
    const categoryId = String(formData.get("categoryId") ?? "").trim();
    const subcategoryId = String(formData.get("subcategoryId") ?? "").trim();
    const mediaTypeRaw = String(formData.get("mediaType") ?? "image");
    const mediaType = mediaTypeRaw === "youtube" ? "youtube" : "image";
    const authorId = String(formData.get("authorId") ?? "").trim();

    let imageUrl = String(formData.get("imageUrl") ?? "").trim();
    const youtubeUrl = String(formData.get("youtubeUrl") ?? "").trim();
    const imageFile = formData.get("imageFile");

    if (mediaType === "image" && imageFile instanceof File && imageFile.size > 0) {
      const saved = await savePostImageFile(imageFile);
      if (!saved.ok) {
        return { ok: false, error: saved.error };
      }
      imageUrl = saved.publicPath;
    }

    const result = await updatePostInDb(postId, {
      title,
      slug: slug || undefined,
      excerpt,
      content,
      status,
      categoryId: categoryId || undefined,
      subcategoryId: subcategoryId || undefined,
      mediaType,
      imageUrl: mediaType === "image" ? imageUrl : undefined,
      youtubeUrl: mediaType === "youtube" ? youtubeUrl : undefined,
      isTrending,
      isBreaking,
      authorId,
    });

    if (!result.ok) {
      return { ok: false, error: result.error };
    }

    revalidatePath("/");
    revalidatePath("/backoffice/posts");
    revalidatePath(`/backoffice/posts/${postId}/edit`);
    revalidatePath("/my-posts");
    return { ok: true, message: "Post updated." };
  } catch (e) {
    console.error("updatePostFromForm:", e);
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("MONGO_DB_URL") || msg.includes("MONGO")) {
      return {
        ok: false,
        error: "Could not connect to database — check MONGO_DB_URL / MONGO_DB_NAME in .env.",
      };
    }
    return { ok: false, error: "Update failed — server error." };
  }
}

export async function deletePostAction(postId: string): Promise<SavePostState> {
  try {
    const session = await requireBackofficeSession();
    if (!session) {
      return { ok: false, error: "Please sign in" };
    }
    const id = postId.trim();
    if (!id) {
      return { ok: false, error: "Post id missing" };
    }
    const result = await deletePostById(id);
    if (!result.ok) {
      return { ok: false, error: result.error };
    }
    revalidatePath("/");
    revalidatePath("/backoffice/posts");
    revalidatePath("/my-posts");
    return { ok: true, message: "Post deleted." };
  } catch (e) {
    console.error("deletePostAction:", e);
    return { ok: false, error: "Delete failed — server error." };
  }
}
