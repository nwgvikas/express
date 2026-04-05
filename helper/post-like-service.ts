import crypto from "crypto";
import mongoose from "mongoose";
import { connectDB } from "@/helper/db";
import { Post } from "@/models/post";
import { PostLike } from "@/models/post-like";
import { publishedFilter } from "@/helper/public-post-service";

function hashLikeIp(rawIp: string): string {
  const ip = rawIp.trim() || "unknown";
  const salt =
    process.env.POST_LIKE_IP_SALT?.trim() ||
    process.env.POST_VIEW_IP_SALT?.trim() ||
    "unnao-express-post-likes";
  return crypto.createHash("sha256").update(`${salt}:like:${ip}`, "utf8").digest("hex");
}

async function clampNonNegativeLikeCount(postId: mongoose.Types.ObjectId): Promise<void> {
  await Post.updateOne({ _id: postId, likeCount: { $lt: 0 } }, { $set: { likeCount: 0 } });
}

export async function getPostLikeStateForSlug(
  slug: string,
  clientIp: string,
): Promise<
  { ok: true; likeCount: number; liked: boolean } | { ok: false; error: "not_found" }
> {
  await connectDB();
  const s = slug.trim().toLowerCase();
  if (!s) return { ok: false, error: "not_found" };

  const post = await Post.findOne(publishedFilter({ slug: s })).select("_id likeCount").lean();
  if (!post?._id) return { ok: false, error: "not_found" };

  const postId = post._id as mongoose.Types.ObjectId;
  const ipHash = hashLikeIp(clientIp);
  const liked = Boolean(await PostLike.findOne({ post: postId, ipHash }).select("_id").lean());
  const likeCount = Math.max(0, Math.floor(Number((post as { likeCount?: number }).likeCount ?? 0)));

  return { ok: true, likeCount, liked };
}

export async function togglePostLikeForSlug(
  slug: string,
  clientIp: string,
): Promise<
  { ok: true; likeCount: number; liked: boolean } | { ok: false; error: "not_found" }
> {
  await connectDB();
  const s = slug.trim().toLowerCase();
  if (!s) return { ok: false, error: "not_found" };

  const post = await Post.findOne(publishedFilter({ slug: s })).select("_id").lean();
  if (!post?._id) return { ok: false, error: "not_found" };

  const postId = post._id as mongoose.Types.ObjectId;
  const ipHash = hashLikeIp(clientIp);

  const existing = await PostLike.findOne({ post: postId, ipHash }).select("_id").lean();
  if (existing) {
    await PostLike.deleteOne({ _id: existing._id });
    await Post.updateOne({ _id: postId }, { $inc: { likeCount: -1 } });
    await clampNonNegativeLikeCount(postId);
  } else {
    try {
      await PostLike.create({ post: postId, ipHash });
      await Post.updateOne({ _id: postId }, { $inc: { likeCount: 1 } });
    } catch (e: unknown) {
      const err = e as { code?: number };
      if (err?.code !== 11000) {
        console.error("togglePostLikeForSlug:", e);
        throw e;
      }
    }
  }

  const fresh = await Post.findById(postId).select("likeCount").lean();
  const likeCount = Math.max(0, Math.floor(Number((fresh as { likeCount?: number })?.likeCount ?? 0)));
  const liked = Boolean(await PostLike.findOne({ post: postId, ipHash }).select("_id").lean());
  return { ok: true, likeCount, liked };
}
