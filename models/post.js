import mongoose, { Schema } from "mongoose";

/**
 * News posts / articles — collection: `posts`
 */
const PostSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: { type: String, trim: true, default: "" },
    content: { type: String, default: "" },
    mediaType: {
      type: String,
      enum: ["image", "youtube"],
      default: "image",
    },
    imageUrl: { type: String, trim: true, default: "" },
    youtubeUrl: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["draft", "pending", "published"],
      default: "draft",
    },
    isTrending: { type: Boolean, default: false },
    /** Homepage BREAKING strip — published posts only; latest updated wins. */
    isBreaking: { type: Boolean, default: false },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    subcategory: {
      type: Schema.Types.ObjectId,
      ref: "Subcategory",
      default: null,
    },
    /** User who created / is assigned — `users` id (`user` or `admin` role). */
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    /** Show more / read — unique IPs in `post_views`; total stored here. */
    viewCount: { type: Number, default: 0, min: 0 },
    /** Only admin-approved public comments — synced via `syncPostApprovedCommentCount`. */
    commentCount: { type: Number, default: 0, min: 0 },
    /** By unique IP (`post_likes`); unlike can decrease this count. */
    likeCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

PostSchema.index({ author: 1, updatedAt: -1 });

export const Post =
  mongoose.models.Post || mongoose.model("Post", PostSchema, "posts");
