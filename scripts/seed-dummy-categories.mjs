/**
 * Dummy categories + subcategories MongoDB mein upsert karta hai.
 * Run: npm run seed:dummy-categories
 * Chahiye: .env mein MONGO_DB_URL (aur optional MONGO_DB_NAME)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    description: { type: String, trim: true, default: "" },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);
CategorySchema.index({ name: 1 }, { unique: true });
CategorySchema.index({ slug: 1 }, { unique: true });

const SubcategorySchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SeedCategory",
      required: true,
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

async function main() {
  loadEnv();
  const url = process.env.MONGO_DB_URL?.trim();
  if (!url) {
    console.error("MONGO_DB_URL .env mein set karein.");
    process.exit(1);
  }
  const dbName = process.env.MONGO_DB_NAME || "unnao-express";

  await mongoose.connect(url, { dbName, serverSelectionTimeoutMS: 12_000 });

  const Category =
    mongoose.models.SeedCategory ||
    mongoose.model("SeedCategory", CategorySchema, "categories");
  const Subcategory =
    mongoose.models.SeedSubcategory ||
    mongoose.model("SeedSubcategory", SubcategorySchema, "subcategories");

  const categories = [
    {
      name: "Breaking",
      slug: "breaking",
      description: "Turant khabrein aur alerts",
    },
    {
      name: "Local",
      slug: "local",
      description: "Unnao aur aas-paas ki khabrein",
    },
    {
      name: "Sports",
      slug: "sports",
      description: "Khel, tournament, results",
    },
    {
      name: "Opinion",
      slug: "opinion",
      description: "Vichar, editorial, column",
    },
  ];

  /** @type {Record<string, import('mongoose').Types.ObjectId>} */
  const categoryIds = {};

  for (const c of categories) {
    await Category.updateOne(
      { slug: c.slug },
      {
        $set: {
          name: c.name,
          slug: c.slug,
          description: c.description,
          sortOrder: 0,
        },
      },
      { upsert: true },
    );
    const doc = await Category.findOne({ slug: c.slug }).lean();
    if (doc) categoryIds[c.slug] = doc._id;
    console.log("Category:", c.slug);
  }

  const subcategories = [
    { parentSlug: "breaking", name: "Live ticker", slug: "live-ticker", description: "Chalte hue update" },
    { parentSlug: "local", name: "Unnao city", slug: "unnao-city", description: "Shahar ki khabrein" },
    { parentSlug: "local", name: "District", slug: "district", description: "Zila star" },
    { parentSlug: "sports", name: "Cricket", slug: "cricket", description: "Cricket news" },
    { parentSlug: "sports", name: "Hockey", slug: "hockey", description: "Hockey updates" },
    { parentSlug: "opinion", name: "Editorial", slug: "editorial", description: "Sampadakiye" },
  ];

  for (const s of subcategories) {
    const catId = categoryIds[s.parentSlug];
    if (!catId) {
      console.warn("Skip sub (no parent):", s.slug);
      continue;
    }
    await Subcategory.updateOne(
      { category: catId, slug: s.slug },
      {
        $set: {
          category: catId,
          name: s.name,
          slug: s.slug,
          description: s.description,
          sortOrder: 0,
        },
      },
      { upsert: true },
    );
    console.log("Subcategory:", s.parentSlug, "/", s.slug);
  }

  await mongoose.disconnect();
  console.log("Done — categories + subcategories DB mein.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
