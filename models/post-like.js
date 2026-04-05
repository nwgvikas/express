import mongoose, { Schema } from "mongoose";

/**
 * Ek post + IP hash = ek like (toggle off par doc delete).
 * Collection: `post_likes`
 */
const PostLikeSchema = new Schema(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    ipHash: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

PostLikeSchema.index({ post: 1, ipHash: 1 }, { unique: true });

export const PostLike =
  mongoose.models.PostLike || mongoose.model("PostLike", PostLikeSchema, "post_likes");
