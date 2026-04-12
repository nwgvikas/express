import mongoose from "mongoose";
import { PUBLIC_VISIBLE_COMMENT_STATUSES } from "@/helper/public-comment-visibility";
import { connectDB } from "@/helper/db";
import { Category } from "@/models/category";
import { Post } from "@/models/post";
import { PostComment } from "@/models/post-comment";
import { Subcategory } from "@/models/subcategory";

/** Published posts — DB mein kabhi-kabhi casing alag ho sakti hai. */
export function publishedFilter(extra: Record<string, unknown> = {}) {
  return {
    ...extra,
    $or: [
      { status: "published" },
      { status: "Published" },
      { status: /^published$/i },
    ],
  };
}

/** URL / `[slug]` param se — decode (1–2 baar) + trim + lowercase; DB `slug` ke saath match. */
export function normalizePublicPostSlug(raw: string): string {
  let s = String(raw ?? "").trim();
  for (let i = 0; i < 2; i++) {
    try {
      const next = decodeURIComponent(s);
      if (next === s) break;
      s = next.trim();
    } catch {
      break;
    }
  }
  return s.toLowerCase();
}

export type PublicPostCard = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  categoryName: string;
  subcategoryName: string;
  /** Subcategory listing page — khali ho to pill sirf visual. */
  subcategorySlug: string;
  isTrending: boolean;
  updatedAt: string;
  mediaType: "image" | "youtube";
  imageUrl: string;
  youtubeUrl: string;
  viewCount: number;
  commentCount: number;
  likeCount: number;
};

export type PublicPostComment = {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
};

async function countVisibleCommentsByPostIds(
  postObjectIds: mongoose.Types.ObjectId[],
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (!postObjectIds.length) return map;
  const agg = await PostComment.aggregate<{ _id: mongoose.Types.ObjectId; n: number }>([
    {
      $match: {
        post: { $in: postObjectIds },
        status: { $in: [...PUBLIC_VISIBLE_COMMENT_STATUSES] },
      },
    },
    { $group: { _id: "$post", n: { $sum: 1 } } },
  ]);
  for (const row of agg) {
    map.set(String(row._id), Math.max(0, Math.floor(Number(row.n) || 0)));
  }
  return map;
}

async function listVisibleCommentsForPost(
  postId: mongoose.Types.ObjectId,
): Promise<PublicPostComment[]> {
  const rows = await PostComment.find({
    post: postId,
    status: { $in: [...PUBLIC_VISIBLE_COMMENT_STATUSES] },
  })
    .select("authorName body createdAt")
    .sort({ createdAt: 1 })
    .lean();
  return rows.map((r) => {
    const raw = r as { _id: unknown; authorName?: string; body?: string; createdAt?: Date };
    return {
      id: String(raw._id),
      authorName: String(raw.authorName ?? "").trim() || "Anonymous",
      body: String(raw.body ?? ""),
      createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : "",
    };
  });
}

async function mapLeanPostsToPublicCards(
  rows: Array<{
    _id: unknown;
    slug?: string;
    title?: string;
    excerpt?: string;
    category?: unknown;
    subcategory?: unknown;
    isTrending?: boolean;
    updatedAt?: Date;
    mediaType?: string;
    imageUrl?: string;
    youtubeUrl?: string;
    viewCount?: number;
    commentCount?: number;
    likeCount?: number;
  }>,
): Promise<PublicPostCard[]> {
  const postIdStrings = uniqueObjectIds(rows.map((p) => p._id));
  const postOids = postIdStrings
    .filter((id) => mongoose.isValidObjectId(id))
    .map((id) => new mongoose.Types.ObjectId(id));
  const commentCountByPost = await countVisibleCommentsByPostIds(postOids);

  const catIds = uniqueObjectIds(rows.map((p) => p.category));
  const subIds = uniqueObjectIds(rows.map((p) => p.subcategory));

  const [catDocs, subDocs] = await Promise.all([
    catIds.length
      ? Category.find({ _id: { $in: toObjectIdList(catIds) } })
          .select("name")
          .lean()
      : [],
    subIds.length
      ? Subcategory.find({ _id: { $in: toObjectIdList(subIds) } })
          .select("name slug")
          .lean()
      : [],
  ]);

  const catById = new Map(catDocs.map((c) => [String(c._id), String(c.name ?? "")]));
  const subById = new Map(
    subDocs.map((s) => [
      String(s._id),
      {
        name: String(s.name ?? ""),
        slug: String((s as { slug?: string }).slug ?? "").trim().toLowerCase(),
      },
    ]),
  );

  return rows.map((p) => {
    const mediaType: "image" | "youtube" =
      (p.mediaType as string) === "youtube" ? "youtube" : "image";
    const cid = p.category != null ? String(p.category) : "";
    const sid = p.subcategory != null ? String(p.subcategory) : "";
    const subMeta = sid ? subById.get(sid) : undefined;
    return {
      id: String(p._id),
      slug: p.slug as string,
      title: p.title as string,
      excerpt: stripHtml((p.excerpt as string) || ""),
      categoryName: (cid && catById.get(cid)) || "News",
      subcategoryName: subMeta?.name || "",
      subcategorySlug: subMeta?.slug || "",
      isTrending: Boolean(p.isTrending),
      updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : "",
      mediaType,
      imageUrl: ((p.imageUrl as string) || "").trim(),
      youtubeUrl: ((p.youtubeUrl as string) || "").trim(),
      viewCount: Math.max(0, Math.floor(Number(p.viewCount ?? 0))),
      commentCount: commentCountByPost.get(String(p._id)) ?? 0,
      likeCount: Math.max(0, Math.floor(Number((p as { likeCount?: number }).likeCount ?? 0))),
    };
  });
}

export async function listPublishedPostsForHome(limit = 20): Promise<{
  posts: PublicPostCard[];
  failed: boolean;
}> {
  try {
    await connectDB();
    const rows = await Post.find(publishedFilter())
      .sort({ updatedAt: -1 })
      .limit(limit)
      .lean();
    const posts = await mapLeanPostsToPublicCards(rows);
    return { posts, failed: false };
  } catch (e) {
    console.error("listPublishedPostsForHome:", e);
    return { posts: [], failed: true };
  }
}

export async function listPublishedPostsBySubcategorySlug(
  subSlug: string,
  limit = 40,
): Promise<{
  posts: PublicPostCard[];
  subcategoryName: string | null;
  categoryName: string | null;
  failed: boolean;
}> {
  try {
    await connectDB();
    const slug = subSlug.trim().toLowerCase();
    if (!slug) {
      return { posts: [], subcategoryName: null, categoryName: null, failed: false };
    }
    const sub = await Subcategory.findOne({ slug }).lean();
    if (!sub) {
      return { posts: [], subcategoryName: null, categoryName: null, failed: false };
    }
    const rows = await Post.find(publishedFilter({ subcategory: sub._id }))
      .sort({ updatedAt: -1 })
      .limit(limit)
      .lean();
    const posts = await mapLeanPostsToPublicCards(rows);

    let categoryName: string | null = null;
    const catRef = sub.category;
    if (catRef != null && mongoose.isValidObjectId(String(catRef))) {
      const c = await Category.findById(catRef).select("name").lean();
      if (c?.name) categoryName = String(c.name);
    }

    return {
      posts,
      subcategoryName: String(sub.name ?? ""),
      categoryName,
      failed: false,
    };
  } catch (e) {
    console.error("listPublishedPostsBySubcategorySlug:", e);
    return { posts: [], subcategoryName: null, categoryName: null, failed: true };
  }
}

export async function listPublishedPostsByCategorySlug(
  categorySlug: string,
  limit = 40,
): Promise<{
  posts: PublicPostCard[];
  categoryName: string | null;
  failed: boolean;
}> {
  try {
    await connectDB();
    const slug = categorySlug.trim().toLowerCase();
    if (!slug) {
      return { posts: [], categoryName: null, failed: false };
    }
    const cat = await Category.findOne({ slug }).lean();
    if (!cat) {
      return { posts: [], categoryName: null, failed: false };
    }
    const catId = cat._id;
    const rows = await Post.find(publishedFilter({ category: catId }))
      .sort({ updatedAt: -1 })
      .limit(limit)
      .lean();
    const posts = await mapLeanPostsToPublicCards(rows);
    const categoryName = String((cat as { name?: string }).name ?? "").trim() || null;
    return { posts, categoryName, failed: false };
  } catch (e) {
    console.error("listPublishedPostsByCategorySlug:", e);
    return { posts: [], categoryName: null, failed: true };
  }
}

export async function getPublishedPostBySlug(slug: string): Promise<PublicPostCard | null> {
  const full = await getPublishedPostFullBySlug(slug);
  return full?.card ?? null;
}

export async function getPublishedPostFullBySlug(
  slug: string,
): Promise<{ card: PublicPostCard; contentHtml: string; comments: PublicPostComment[] } | null> {
  try {
    await connectDB();
    const s = normalizePublicPostSlug(slug);
    if (!s) return null;
    const p = await Post.findOne(publishedFilter({ slug: s })).lean();
    if (!p) return null;

    const postOid = new mongoose.Types.ObjectId(String(p._id));
    const comments = await listVisibleCommentsForPost(postOid);

    let categoryName = "News";
    let subcategoryName = "";
    let subcategorySlug = "";
    const cid = p.category != null ? String(p.category) : "";
    const sid = p.subcategory != null ? String(p.subcategory) : "";
    if (cid && mongoose.isValidObjectId(cid)) {
      const c = await Category.findById(cid).select("name").lean();
      if (c?.name) categoryName = String(c.name);
    }
    if (sid && mongoose.isValidObjectId(sid)) {
      const subDoc = await Subcategory.findById(sid).select("name slug").lean();
      if (subDoc?.name) subcategoryName = String(subDoc.name);
      const sl = (subDoc as { slug?: string } | null)?.slug;
      if (typeof sl === "string" && sl.trim()) subcategorySlug = sl.trim().toLowerCase();
    }

    const mediaType: "image" | "youtube" =
      (p.mediaType as string) === "youtube" ? "youtube" : "image";
    const card: PublicPostCard = {
      id: String(p._id),
      slug: p.slug as string,
      title: p.title as string,
      excerpt: stripHtml((p.excerpt as string) || ""),
      categoryName,
      subcategoryName,
      subcategorySlug,
      isTrending: Boolean(p.isTrending),
      updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : "",
      mediaType,
      imageUrl: ((p.imageUrl as string) || "").trim(),
      youtubeUrl: ((p.youtubeUrl as string) || "").trim(),
      viewCount: Math.max(0, Math.floor(Number((p as { viewCount?: number }).viewCount ?? 0))),
      commentCount: comments.length,
      likeCount: Math.max(
        0,
        Math.floor(Number((p as { likeCount?: number }).likeCount ?? 0)),
      ),
    };
    return { card, contentHtml: (p.content as string) || "", comments };
  } catch {
    return null;
  }
}

/** Latest published post marked breaking (admin). */
export async function getPublishedBreakingTicker(): Promise<{
  title: string;
  slug: string;
} | null> {
  try {
    await connectDB();
    const p = await Post.findOne(publishedFilter({ isBreaking: true }))
      .sort({ updatedAt: -1 })
      .select("title slug")
      .lean();
    if (!p) return null;
    const title = (p.title as string)?.trim();
    const slug = (p.slug as string)?.trim();
    if (!title || !slug) return null;
    return { title, slug };
  } catch {
    return null;
  }
}

/** Top N published posts marked breaking (homepage ticker + list). */
export async function getPublishedBreakingTopN(
  limit: number,
): Promise<{ title: string; slug: string }[]> {
  const n = Math.min(20, Math.max(1, Math.floor(limit)));
  try {
    await connectDB();
    const rows = await Post.find(publishedFilter({ isBreaking: true }))
      .sort({ updatedAt: -1 })
      .limit(n)
      .select("title slug")
      .lean();
    const out: { title: string; slug: string }[] = [];
    for (const p of rows) {
      const title = (p.title as string)?.trim();
      const slug = (p.slug as string)?.trim();
      if (!title || !slug) continue;
      out.push({ title, slug });
    }
    return out;
  } catch {
    return [];
  }
}

function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function uniqueObjectIds(refs: unknown[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const r of refs) {
    if (r == null) continue;
    const s = String(r);
    if (!mongoose.isValidObjectId(s) || seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}

function toObjectIdList(ids: string[]): mongoose.Types.ObjectId[] {
  return ids.filter((id) => mongoose.isValidObjectId(id)).map((id) => new mongoose.Types.ObjectId(id));
}
