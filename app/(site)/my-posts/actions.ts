"use server";

import { revalidatePath } from "next/cache";
import {
  createPostInDb,
  updatePostInDb,
  type PostLifecycleStatus,
} from "@/helper/post-service";
import { getPublicSiteUser } from "@/helper/public-user-auth";
import { savePostImageFile } from "@/helper/save-post-image";

export type MemberSavePostState =
  | { ok: true; message: string }
  | { ok: false; error: string };

export async function createMemberPostFromForm(formData: FormData): Promise<MemberSavePostState> {
  try {
    const user = await getPublicSiteUser();
    if (!user) {
      return { ok: false, error: "Please sign in" };
    }

    const title = String(formData.get("title") ?? "");
    const slug = String(formData.get("slug") ?? "").trim();
    const excerpt = String(formData.get("excerpt") ?? "");
    const content = String(formData.get("content") ?? "");
    const statusRaw = String(formData.get("status") ?? "draft");
    const status: PostLifecycleStatus = statusRaw === "pending" ? "pending" : "draft";
    const categoryId = String(formData.get("categoryId") ?? "").trim();
    const subcategoryId = String(formData.get("subcategoryId") ?? "").trim();
    const mediaTypeRaw = String(formData.get("mediaType") ?? "image");
    const mediaType = mediaTypeRaw === "youtube" ? "youtube" : "image";

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
      isTrending: false,
      isBreaking: false,
      authorId: user.id,
      actorUserId: user.id,
    });

    if (!result.ok) {
      return { ok: false, error: result.error };
    }

    revalidatePath("/");
    revalidatePath("/my-posts");
    return { ok: true, message: "Post saved." };
  } catch (e) {
    console.error("createMemberPostFromForm:", e);
    return { ok: false, error: "Save failed — please try again." };
  }
}

export async function updateMemberPostFromForm(formData: FormData): Promise<MemberSavePostState> {
  try {
    const user = await getPublicSiteUser();
    if (!user) {
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
    const statusRaw = String(formData.get("status") ?? "draft");
    const status: PostLifecycleStatus = statusRaw === "pending" ? "pending" : "draft";
    const categoryId = String(formData.get("categoryId") ?? "").trim();
    const subcategoryId = String(formData.get("subcategoryId") ?? "").trim();
    const mediaTypeRaw = String(formData.get("mediaType") ?? "image");
    const mediaType = mediaTypeRaw === "youtube" ? "youtube" : "image";

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

    const result = await updatePostInDb(
      postId,
      {
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
        isTrending: false,
        isBreaking: false,
      },
      { authorIdMustMatch: user.id, preserveTrendingBreaking: true },
    );

    if (!result.ok) {
      if (result.status === 403) {
        return { ok: false, error: result.error };
      }
      return { ok: false, error: result.error };
    }

    revalidatePath("/");
    revalidatePath("/my-posts");
    return { ok: true, message: "Post updated." };
  } catch (e) {
    console.error("updateMemberPostFromForm:", e);
    return { ok: false, error: "Update failed — please try again." };
  }
}
