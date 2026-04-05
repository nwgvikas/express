import mongoose, { Schema } from "mongoose";

/**
 * News / content categories — MongoDB collection: `categories`
 */
const CategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
    description: { type: String, trim: true, default: "" },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Category =
  mongoose.models.Category ||
  mongoose.model("Category", CategorySchema, "categories");
