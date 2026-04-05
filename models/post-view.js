import mongoose, { Schema } from "mongoose";

/**
 * Ek post + IP hash = ek baar count — duplicate index se rokte hain.
 * Collection: `post_views`
 */
const PostViewSchema = new Schema(
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

PostViewSchema.index({ post: 1, ipHash: 1 }, { unique: true });

export const PostView =
  mongoose.models.PostView ||
  mongoose.model("PostView", PostViewSchema, "post_views");
