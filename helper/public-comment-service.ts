import mongoose from "mongoose";
import { connectDB } from "@/helper/db";
import { normalizeIndianMobile } from "@/helper/indian-mobile";
import { Post } from "@/models/post";
import { PostComment } from "@/models/post-comment";
import { syncPostApprovedCommentCount } from "@/helper/post-comment-count-sync";
import { PUBLIC_VISIBLE_COMMENT_STATUSES } from "@/helper/public-comment-visibility";
import { publishedFilter } from "@/helper/public-post-service";

function stripTags(s: string): string {
  return s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export type CreatePublicCommentResult =
  | { ok: true; commentCount: number }
  | { ok: false; error: string; status: number };

export async function createPublicComment(input: {
  slug: string;
  name: string;
  mobile: string;
  body: string;
}): Promise<CreatePublicCommentResult> {
  const slug = input.slug.trim().toLowerCase();
  const name = stripTags(input.name).slice(0, 120);
  const body = stripTags(input.body).slice(0, 4000);
  const mobile = normalizeIndianMobile(input.mobile);

  if (!slug) {
    return { ok: false, error: "Post invalid", status: 400 };
  }
  if (name.length < 2) {
    return { ok: false, error: "Name must be at least 2 characters", status: 400 };
  }
  if (!mobile) {
    return { ok: false, error: "Sahi 10 digit mobile number daalein (6–9 se shuru)", status: 400 };
  }
  if (body.length < 2) {
    return { ok: false, error: "Comment must be at least 2 characters", status: 400 };
  }

  await connectDB();
  const post = await Post.findOne(publishedFilter({ slug })).select("_id").lean();
  if (!post?._id) {
    return { ok: false, error: "Post not found or not published", status: 404 };
  }

  const postId = post._id as mongoose.Types.ObjectId;

  try {
    await PostComment.create({
      post: postId,
      authorName: name,
      mobile,
      body,
      status: "pending",
    });
    await syncPostApprovedCommentCount(postId);
  } catch (e) {
    console.error("createPublicComment:", e);
    return { ok: false, error: "Could not save — please try again", status: 500 };
  }

  const commentCount = await PostComment.countDocuments({
    post: postId,
    status: { $in: [...PUBLIC_VISIBLE_COMMENT_STATUSES] },
  });
  return { ok: true, commentCount: Math.max(0, commentCount) };
}
