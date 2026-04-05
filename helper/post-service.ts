import mongoose from "mongoose";
import { slugify } from "@/helper/category-service";
import { connectDB } from "@/helper/db";
import { escapeRegexForMongo } from "@/helper/escape-regex";
import { Category } from "@/models/category";
import { Post } from "@/models/post";
import { Subcategory } from "@/models/subcategory";
import { User } from "@/models/user";
import { canonicalYoutubeWatchUrl, parseYoutubeVideoId } from "@/helper/youtube-url";

async function uniquePostSlug(base: string): Promise<string> {
  let slug = base;
  let n = 0;
  while (await Post.exists({ slug })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

async function uniquePostSlugExcluding(
  base: string,
  excludeId: mongoose.Types.ObjectId,
): Promise<string> {
  let slug = base;
  let n = 0;
  while (await Post.exists({ slug, _id: { $ne: excludeId } })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

export type CreatePostResult =
  | { ok: true; id: string }
  | { ok: false; error: string; status: number };

/** Only `published` is public; members use `pending` while waiting for admin. */
export type PostLifecycleStatus = "draft" | "pending" | "published";

function normalizeStoredPostStatus(raw: string | undefined): PostLifecycleStatus {
  const s = String(raw ?? "").toLowerCase();
  if (s === "published") return "published";
  if (s === "pending") return "pending";
  return "draft";
}

function dbStatusFromInput(s: PostLifecycleStatus): PostLifecycleStatus {
  if (s === "published" || s === "pending") return s;
  return "draft";
}

/** Admin / shared — FormData `status` se. */
export function parsePostStatusFromForm(raw: string): PostLifecycleStatus {
  const s = String(raw ?? "draft").toLowerCase();
  if (s === "published") return "published";
  if (s === "pending") return "pending";
  return "draft";
}

export async function createPostInDb(input: {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  status: PostLifecycleStatus;
  categoryId?: string;
  subcategoryId?: string;
  mediaType?: "image" | "youtube";
  imageUrl?: string;
  youtubeUrl?: string;
  isTrending?: boolean;
  isBreaking?: boolean;
  /** Creator from admin form or member id — set by server only. */
  authorId?: string;
  /**
   * Account creating the post (session `userId`). If form `authorId` is empty, `author` falls back
   * to this user (e.g. admin as poster).
   */
  actorUserId?: string;
}): Promise<CreatePostResult> {
  const title = input.title.trim();
  if (!title) {
    return { ok: false, error: "Title is required", status: 400 };
  }

  await connectDB();

  let category: mongoose.Types.ObjectId | null = null;
  let subcategory: mongoose.Types.ObjectId | null = null;

  if (input.categoryId?.trim()) {
    if (!mongoose.isValidObjectId(input.categoryId)) {
      return { ok: false, error: "Category invalid", status: 400 };
    }
    const cat = await Category.findById(input.categoryId);
    if (!cat) {
      return { ok: false, error: "Category not found", status: 400 };
    }
    category = new mongoose.Types.ObjectId(input.categoryId);
  }

  if (input.subcategoryId?.trim()) {
    if (!mongoose.isValidObjectId(input.subcategoryId)) {
      return { ok: false, error: "Sub category invalid", status: 400 };
    }
    const sub = await Subcategory.findById(input.subcategoryId);
    if (!sub) {
      return { ok: false, error: "Subcategory not found", status: 400 };
    }
    if (category && String(sub.category) !== String(category)) {
      return {
        ok: false,
        error: "Subcategory does not belong to the selected category",
        status: 400,
      };
    }
    if (!category) {
      category = sub.category as mongoose.Types.ObjectId;
    }
    subcategory = new mongoose.Types.ObjectId(input.subcategoryId);
  }

  const base = input.slug?.trim()
    ? slugify(input.slug)
    : slugify(title);
  const slug = await uniquePostSlug(base || "post");

  const mediaType = input.mediaType === "youtube" ? "youtube" : "image";
  let imageUrl = (input.imageUrl ?? "").trim();
  let youtubeUrl = (input.youtubeUrl ?? "").trim();

  if (mediaType === "youtube") {
    imageUrl = "";
    if (!youtubeUrl) {
      return { ok: false, error: "YouTube URL is required", status: 400 };
    }
    const vid = parseYoutubeVideoId(youtubeUrl);
    if (!vid) {
      return { ok: false, error: "YouTube URL does not look valid", status: 400 };
    }
    youtubeUrl = canonicalYoutubeWatchUrl(vid);
  } else {
    youtubeUrl = "";
  }

  let author: mongoose.Types.ObjectId | null = null;
  const explicitAuthor = (input.authorId ?? "").trim();
  const actorId = (input.actorUserId ?? "").trim();
  const effectiveAuthorId = explicitAuthor || actorId;
  if (effectiveAuthorId) {
    if (!mongoose.isValidObjectId(effectiveAuthorId)) {
      return { ok: false, error: "Author invalid", status: 400 };
    }
    const u = await User.findById(effectiveAuthorId).select("role").lean();
    const role = u ? String(u.role) : "";
    if (!u || (role !== "user" && role !== "admin")) {
      return { ok: false, error: "Author user not found", status: 400 };
    }
    author = new mongoose.Types.ObjectId(effectiveAuthorId);
  }

  try {
    const doc = await Post.create({
      title,
      slug,
      excerpt: input.excerpt.trim(),
      content: input.content ?? "",
      mediaType,
      imageUrl,
      youtubeUrl,
      status: dbStatusFromInput(input.status),
      isTrending: Boolean(input.isTrending),
      isBreaking: Boolean(input.isBreaking),
      category,
      subcategory,
      author,
    });
    return { ok: true, id: String(doc._id) };
  } catch (e: unknown) {
    const err = e as { code?: number };
    if (err?.code === 11000) {
      return { ok: false, error: "Slug duplicate", status: 409 };
    }
    console.error(e);
    return { ok: false, error: "Save failed", status: 500 };
  }
}

export type PostForEdit = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: PostLifecycleStatus;
  categoryId: string;
  subcategoryId: string;
  mediaType: "image" | "youtube";
  imageUrl: string;
  youtubeUrl: string;
  isTrending: boolean;
  isBreaking: boolean;
  /** `users` id with `role: user` — empty means no creator assigned. */
  authorId: string;
};

export async function getPostForEdit(id: string): Promise<PostForEdit | null> {
  if (!mongoose.isValidObjectId(id)) return null;
  await connectDB();
  const p = await Post.findById(id).lean();
  if (!p) return null;
  return {
    id: String(p._id),
    title: p.title as string,
    slug: p.slug as string,
    excerpt: (p.excerpt as string) ?? "",
    content: (p.content as string) ?? "",
    status: normalizeStoredPostStatus(p.status as string),
    categoryId: p.category ? String(p.category) : "",
    subcategoryId: p.subcategory ? String(p.subcategory) : "",
    mediaType: (p.mediaType as string) === "youtube" ? "youtube" : "image",
    imageUrl: (p.imageUrl as string) ?? "",
    youtubeUrl: (p.youtubeUrl as string) ?? "",
    isTrending: Boolean(p.isTrending),
    isBreaking: Boolean(p.isBreaking),
    authorId: p.author ? String(p.author) : "",
  };
}

export async function updatePostInDb(
  postId: string,
  input: {
    title: string;
    slug?: string;
    excerpt: string;
    content: string;
    status: PostLifecycleStatus;
    categoryId?: string;
    subcategoryId?: string;
    mediaType?: "image" | "youtube";
    imageUrl?: string;
    youtubeUrl?: string;
    isTrending?: boolean;
    isBreaking?: boolean;
    /**
     * Admin update: `""` = clear author; valid id = assign member user.
     * Omitted = do not change `author` in DB (member edit).
     */
    authorId?: string;
  },
  options?: { authorIdMustMatch?: string; preserveTrendingBreaking?: boolean },
): Promise<CreatePostResult> {
  if (!mongoose.isValidObjectId(postId)) {
    return { ok: false, error: "Post id invalid", status: 400 };
  }

  const title = input.title.trim();
  if (!title) {
    return { ok: false, error: "Title is required", status: 400 };
  }

  await connectDB();

  const existing = await Post.findById(postId);
  if (!existing) {
    return { ok: false, error: "Post not found", status: 404 };
  }

  if (options?.authorIdMustMatch) {
    const a = existing.author ? String(existing.author) : "";
    if (a !== options.authorIdMustMatch) {
      return { ok: false, error: "This post is not yours — editing is not allowed.", status: 403 };
    }
  }

  const excludeId = existing._id as mongoose.Types.ObjectId;

  let category: mongoose.Types.ObjectId | null = null;
  let subcategory: mongoose.Types.ObjectId | null = null;

  if (input.categoryId?.trim()) {
    if (!mongoose.isValidObjectId(input.categoryId)) {
      return { ok: false, error: "Category invalid", status: 400 };
    }
    const cat = await Category.findById(input.categoryId);
    if (!cat) {
      return { ok: false, error: "Category not found", status: 400 };
    }
    category = new mongoose.Types.ObjectId(input.categoryId);
  }

  if (input.subcategoryId?.trim()) {
    if (!mongoose.isValidObjectId(input.subcategoryId)) {
      return { ok: false, error: "Sub category invalid", status: 400 };
    }
    const sub = await Subcategory.findById(input.subcategoryId);
    if (!sub) {
      return { ok: false, error: "Subcategory not found", status: 400 };
    }
    if (category && String(sub.category) !== String(category)) {
      return {
        ok: false,
        error: "Subcategory does not belong to the selected category",
        status: 400,
      };
    }
    if (!category) {
      category = sub.category as mongoose.Types.ObjectId;
    }
    subcategory = new mongoose.Types.ObjectId(input.subcategoryId);
  }

  const base = input.slug?.trim()
    ? slugify(input.slug)
    : slugify(title);
  const slug = await uniquePostSlugExcluding(base || "post", excludeId);

  const mediaType = input.mediaType === "youtube" ? "youtube" : "image";
  let imageUrl = (input.imageUrl ?? "").trim();
  let youtubeUrl = (input.youtubeUrl ?? "").trim();

  if (mediaType === "youtube") {
    imageUrl = "";
    if (!youtubeUrl) {
      return { ok: false, error: "YouTube URL is required", status: 400 };
    }
    const vid = parseYoutubeVideoId(youtubeUrl);
    if (!vid) {
      return { ok: false, error: "YouTube URL does not look valid", status: 400 };
    }
    youtubeUrl = canonicalYoutubeWatchUrl(vid);
  } else {
    youtubeUrl = "";
  }

  const isTrending = options?.preserveTrendingBreaking
    ? Boolean(existing.isTrending)
    : Boolean(input.isTrending);
  const isBreaking = options?.preserveTrendingBreaking
    ? Boolean(existing.isBreaking)
    : Boolean(input.isBreaking);

  let nextStatus: PostLifecycleStatus = dbStatusFromInput(input.status);
  if (options?.authorIdMustMatch && nextStatus === "published") {
    nextStatus = "pending";
  }

  let author: mongoose.Types.ObjectId | null | undefined = undefined;
  if (input.authorId !== undefined) {
    const raw = String(input.authorId).trim();
    if (!raw) {
      author = null;
    } else {
      if (!mongoose.isValidObjectId(raw)) {
        return { ok: false, error: "Creator (author) id invalid", status: 400 };
      }
      const u = await User.findById(raw).select("role").lean();
      if (!u || (u.role as string) !== "user") {
        return { ok: false, error: "Only a member (role: user) can be assigned as creator", status: 400 };
      }
      author = new mongoose.Types.ObjectId(raw);
    }
  }

  const patch: Record<string, unknown> = {
    title,
    slug,
    excerpt: input.excerpt.trim(),
    content: input.content ?? "",
    mediaType,
    imageUrl,
    youtubeUrl,
    status: nextStatus,
    isTrending,
    isBreaking,
    category,
    subcategory,
  };
  if (author !== undefined) {
    patch.author = author;
  }

  try {
    existing.set(patch);
    await existing.save();
    return { ok: true, id: String(existing._id) };
  } catch (e: unknown) {
    const err = e as { code?: number };
    if (err?.code === 11000) {
      return { ok: false, error: "Slug duplicate", status: 409 };
    }
    console.error(e);
    return { ok: false, error: "Update fail", status: 500 };
  }
}

export async function deletePostById(
  postId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!mongoose.isValidObjectId(postId)) {
    return { ok: false, error: "Post id invalid" };
  }
  await connectDB();
  const res = await Post.findByIdAndDelete(postId);
  if (!res) {
    return { ok: false, error: "Post not found" };
  }
  return { ok: true };
}

export type PostListRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  mediaType: string;
  isTrending: boolean;
  isBreaking: boolean;
  excerpt: string;
  categoryName: string;
  subcategoryName: string;
  updatedAt: string;
  /** Creator (member) — display label. */
  authorLabel: string;
};

export type ListPostsForAdminParams = {
  page?: number;
  limit?: number;
  q?: string;
  status?: "all" | "draft" | "pending" | "published";
};

export type ListPostsForAdminResult = {
  rows: PostListRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export async function listPostsForAdmin(
  params: ListPostsForAdminParams = {},
): Promise<ListPostsForAdminResult> {
  const page = Math.max(1, Math.floor(Number(params.page) || 1));
  const limit = Math.min(50, Math.max(5, Math.floor(Number(params.limit) || 15)));
  const q = (params.q ?? "").trim();
  const status = params.status ?? "all";

  await connectDB();

  const filter: Record<string, unknown> = {};
  if (status === "draft" || status === "pending" || status === "published") {
    filter.status = status;
  }
  if (q) {
    const esc = escapeRegexForMongo(q);
    const rx = new RegExp(esc, "i");
    filter.$or = [{ title: rx }, { slug: rx }, { excerpt: rx }];
  }

  const skip = (page - 1) * limit;

  const [total, rows] = await Promise.all([
    Post.countDocuments(filter),
    Post.find(filter)
      .populate("category", "name")
      .populate("subcategory", "name")
      .populate("author", "name email")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  const mapped = rows.map((p) => {
    const cat = p.category as { name?: string } | null;
    const sub = p.subcategory as { name?: string } | null;
    const au = p.author as { name?: string; email?: string } | null;
    let authorLabel = "—";
    if (au && (au.email || au.name)) {
      const n = typeof au.name === "string" ? au.name.trim() : "";
      const em = typeof au.email === "string" ? au.email : "";
      authorLabel = n ? (em ? `${n} · ${em}` : n) : em || "—";
    }
    return {
      id: String(p._id),
      title: p.title as string,
      slug: p.slug as string,
      status: p.status as string,
      mediaType: (p.mediaType as string) || "image",
      isTrending: Boolean(p.isTrending),
      isBreaking: Boolean(p.isBreaking),
      excerpt: (p.excerpt as string) ?? "",
      categoryName: cat?.name ?? "—",
      subcategoryName: sub?.name ?? "—",
      updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : "",
      authorLabel,
    };
  });

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    rows: mapped,
    total,
    page,
    limit,
    totalPages,
  };
}

export type MemberPostRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  updatedAt: string;
  categoryName: string;
};

export type ListPostsForAuthorParams = {
  authorId: string;
  page?: number;
  limit?: number;
  status?: "all" | "draft" | "pending" | "published";
  q?: string;
};

export type ListPostsForAuthorResult = {
  rows: MemberPostRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export async function listPostsForAuthor(
  params: ListPostsForAuthorParams,
): Promise<ListPostsForAuthorResult> {
  const authorId = params.authorId?.trim() ?? "";
  if (!mongoose.isValidObjectId(authorId)) {
    return { rows: [], total: 0, page: 1, limit: 15, totalPages: 1 };
  }

  const page = Math.max(1, Math.floor(Number(params.page) || 1));
  const limit = Math.min(50, Math.max(5, Math.floor(Number(params.limit) || 15)));
  const status = params.status ?? "all";
  const q = (params.q ?? "").trim();

  await connectDB();

  const filter: Record<string, unknown> = {
    author: new mongoose.Types.ObjectId(authorId),
  };
  if (status === "draft" || status === "pending" || status === "published") {
    filter.status = status;
  }
  if (q) {
    const esc = escapeRegexForMongo(q);
    const rx = new RegExp(esc, "i");
    filter.$or = [{ title: rx }, { slug: rx }, { excerpt: rx }];
  }

  const skip = (page - 1) * limit;

  const [total, rows] = await Promise.all([
    Post.countDocuments(filter),
    Post.find(filter)
      .populate("category", "name")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  const mapped: MemberPostRow[] = rows.map((p) => {
    const cat = p.category as { name?: string } | null;
    return {
      id: String(p._id),
      title: p.title as string,
      slug: p.slug as string,
      status: (p.status as string) || "draft",
      updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : "",
      categoryName: cat?.name ?? "—",
    };
  });

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    rows: mapped,
    total,
    page,
    limit,
    totalPages,
  };
}

export async function isPostOwnedByAuthor(postId: string, authorId: string): Promise<boolean> {
  if (!mongoose.isValidObjectId(postId) || !mongoose.isValidObjectId(authorId)) return false;
  await connectDB();
  const p = await Post.findById(postId).select("author").lean();
  if (!p) return false;
  return String(p.author || "") === authorId;
}

export type MemberUserAuthorOption = {
  id: string;
  name: string;
  email: string;
};

/** Backoffice post form — list of `role: user` for creator dropdown. */
export async function listMemberUsersForAuthorPicker(): Promise<MemberUserAuthorOption[]> {
  await connectDB();
  const rows = await User.find({ role: "user" })
    .sort({ name: 1, email: 1 })
    .limit(500)
    .select("name email")
    .lean();
  return rows.map((u) => ({
    id: String(u._id),
    name: typeof u.name === "string" ? u.name.trim() : "",
    email: typeof u.email === "string" ? u.email : "",
  }));
}
