import crypto from "crypto";
import mongoose from "mongoose";
import { connectDB } from "@/helper/db";
import { Post } from "@/models/post";
import { PostView } from "@/models/post-view";
import { publishedFilter } from "@/helper/public-post-service";

function hashClientIp(rawIp: string): string {
  const ip = rawIp.trim() || "unknown";
  const salt = process.env.POST_VIEW_IP_SALT?.trim() || "unnao-express-post-views";
  return crypto.createHash("sha256").update(`${salt}:${ip}`, "utf8").digest("hex");
}

/**
 * Published post + naya IP (hash) → +1 viewCount; wahi IP dubara → count same.
 */
export async function recordPostViewForSlug(
  slug: string,
  clientIp: string,
): Promise<{ ok: true; viewCount: number } | { ok: false; error: "not_found" }> {
  await connectDB();
  const s = slug.trim().toLowerCase();
  if (!s) {
    return { ok: false, error: "not_found" };
  }

  const post = await Post.findOne(publishedFilter({ slug: s })).select("_id").lean();
  if (!post?._id) {
    return { ok: false, error: "not_found" };
  }

  const postId = post._id as mongoose.Types.ObjectId;
  const ipHash = hashClientIp(clientIp);

  try {
    await PostView.create({ post: postId, ipHash });
    await Post.updateOne({ _id: postId }, { $inc: { viewCount: 1 } });
  } catch (e: unknown) {
    const err = e as { code?: number };
    if (err?.code !== 11000) {
      console.error("recordPostViewForSlug:", e);
      throw e;
    }
  }

  const fresh = await Post.findById(postId).select("viewCount").lean();
  const viewCount = Math.max(0, Number(fresh?.viewCount ?? 0));
  return { ok: true, viewCount };
}
