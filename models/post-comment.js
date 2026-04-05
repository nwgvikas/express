import mongoose, { Schema } from "mongoose";

/**
 * Public post comments — collection: `post_comments`
 */
const PostCommentSchema = new Schema(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    authorName: { type: String, required: true, trim: true, maxlength: 120 },
    /** Normalized 10-digit India mobile (digits only). */
    mobile: { type: String, required: true, trim: true, maxlength: 15 },
    body: { type: String, required: true, trim: true, maxlength: 4000 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "spam"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true },
);

PostCommentSchema.index({ post: 1, createdAt: -1 });

export const PostComment =
  mongoose.models.PostComment ||
  mongoose.model("PostComment", PostCommentSchema, "post_comments");
