import mongoose from "mongoose";
import { connectDB } from "@/helper/db";
import { Post } from "@/models/post";
import { PostComment } from "@/models/post-comment";

/** `posts.commentCount` = sirf approved public comments (aggregate ke saath match). */
export async function syncPostApprovedCommentCount(
  postId: mongoose.Types.ObjectId,
): Promise<number> {
  await connectDB();
  const n = await PostComment.countDocuments({ post: postId, status: "approved" });
  const safe = Math.max(0, n);
  await Post.updateOne({ _id: postId }, { $set: { commentCount: safe } });
  return safe;
}
