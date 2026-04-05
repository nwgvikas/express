import Link from "next/link";
import { connectDB } from "@/helper/db";
import { listMemberUsersForAuthorPicker } from "@/helper/post-service";
import { Category } from "@/models/category";
import { Subcategory } from "@/models/subcategory";
import { PostForm } from "../post-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "New post | Admin",
};

export default async function NewPostPage() {
  await connectDB();
  const [categories, subcategories, authorUsers] = await Promise.all([
    Category.find().sort({ name: 1 }).lean(),
    Subcategory.find().sort({ name: 1 }).lean(),
    listMemberUsersForAuthorPicker(),
  ]);

  const catOpts = categories.map((c) => ({
    id: String(c._id),
    name: c.name as string,
  }));
  const subOpts = subcategories.map((s) => {
    const cat = s.category as { toString?: () => string } | string | undefined;
    const categoryId =
      cat == null
        ? ""
        : typeof cat === "string"
          ? cat
          : typeof cat === "object" && typeof cat.toString === "function"
            ? cat.toString()
            : String(cat);
    return {
      id: String(s._id),
      name: s.name as string,
      categoryId,
    };
  });

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/backoffice/posts"
          className="text-sm font-medium text-violet-700 underline-offset-4 hover:underline"
        >
          ← Post list
        </Link>
      </div>
      <PostForm categories={catOpts} subcategories={subOpts} authorUsers={authorUsers} />
    </div>
  );
}
