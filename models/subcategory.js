import mongoose, { Schema } from "mongoose";

/**
 * Subcategories under a parent category — collection: `subcategories`
 */
const SubcategorySchema = new Schema(
  {
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    description: { type: String, trim: true, default: "" },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

SubcategorySchema.index({ category: 1, name: 1 }, { unique: true });
SubcategorySchema.index({ category: 1, slug: 1 }, { unique: true });

export const Subcategory =
  mongoose.models.Subcategory ||
  mongoose.model("Subcategory", SubcategorySchema, "subcategories");
