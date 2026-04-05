/**
 * Sample posts — `posts` collection (upsert by slug).
 * Run: npm run seed:dummy-posts
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

const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: { type: String, trim: true, default: "" },
    content: { type: String, default: "" },
    mediaType: { type: String, enum: ["image", "youtube"], default: "image" },
    imageUrl: { type: String, trim: true, default: "" },
    youtubeUrl: { type: String, trim: true, default: "" },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    isTrending: { type: Boolean, default: false },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "SeedCat", default: null },
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: "SeedSub", default: null },
  },
  { timestamps: true },
);

async function main() {
  loadEnv();
  const url = process.env.MONGO_DB_URL?.trim();
  if (!url) {
    console.error("MONGO_DB_URL missing");
    process.exit(1);
  }
  const dbName = process.env.MONGO_DB_NAME || "unnao-express";
  await mongoose.connect(url, { dbName, serverSelectionTimeoutMS: 12_000 });

  const Category = mongoose.model("SeedCat", new mongoose.Schema({}, { strict: false }), "categories");
  const Subcategory = mongoose.model("SeedSub", new mongoose.Schema({}, { strict: false }), "subcategories");
  const Post =
    mongoose.models.SeedPost || mongoose.model("SeedPost", PostSchema, "posts");

  const local = await Category.findOne({ slug: "local" }).lean();
  const breaking = await Category.findOne({ slug: "breaking" }).lean();
  const unnaoCity = local
    ? await Subcategory.findOne({ slug: "unnao-city", category: local._id }).lean()
    : null;

  const samples = [
    {
      slug: "welcome-unnao-express",
      title: "Unnao Express mein aapka swagat",
      excerpt: "Digital news desk — local se lekar breaking tak.",
      content:
        "Yeh sample post hai. Admin panel se nayi post add karke isse replace kar sakte ho.\n\nHappy publishing!",
      status: "published",
      mediaType: "image",
      imageUrl: "",
      youtubeUrl: "",
      isTrending: true,
      category: local?._id ?? null,
      subcategory: unnaoCity?._id ?? null,
    },
    {
      slug: "mandi-bhav-update-sample",
      title: "Mandi: aaj ke bhav (sample)",
      excerpt: "Placeholder — asli data CMS se judega.",
      content: "Yahan mandi / bazar ki detail likhi jayegi.",
      status: "draft",
      mediaType: "image",
      imageUrl: "",
      youtubeUrl: "",
      isTrending: false,
      category: local?._id ?? null,
      subcategory: null,
    },
    {
      slug: "breaking-sample-alert",
      title: "Breaking: sample alert line",
      excerpt: "Turant khabar — short line.",
      content: "Poori story yahan. Editor baad mein rich text add kar sakta hai.",
      status: "published",
      mediaType: "youtube",
      imageUrl: "",
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      isTrending: true,
      category: breaking?._id ?? null,
      subcategory: null,
    },
  ];

  for (const p of samples) {
    await Post.updateOne(
      { slug: p.slug },
      {
        $set: {
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt,
          content: p.content,
          status: p.status,
          mediaType: p.mediaType,
          imageUrl: p.imageUrl,
          youtubeUrl: p.youtubeUrl,
          isTrending: p.isTrending,
          category: p.category,
          subcategory: p.subcategory,
        },
      },
      { upsert: true },
    );
    console.log("Post:", p.slug);
  }

  await mongoose.disconnect();
  console.log("Done — dummy posts.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
