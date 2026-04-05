import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDB } from "@/helper/db";
import { getPostForEdit, listMemberUsersForAuthorPicker } from "@/helper/post-service";
import { Category } from "@/models/category";
import { Subcategory } from "@/models/subcategory";
import { PostForm } from "../../post-form";

export const dynamic = "force-dynamic";

export const metadata = { title: "Edit post | Admin" };

type Props = { params: Promise<{ id: string }> };

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  await connectDB();
  const post = await getPostForEdit(id);
  if (!post) notFound();

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
      <PostForm
        key={post.id}
        categories={catOpts}
        subcategories={subOpts}
        mode="edit"
        postId={post.id}
        initial={{
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          status: post.status,
          categoryId: post.categoryId,
          subcategoryId: post.subcategoryId,
          mediaType: post.mediaType,
          imageUrl: post.imageUrl,
          youtubeUrl: post.youtubeUrl,
          isTrending: post.isTrending,
          isBreaking: post.isBreaking,
          authorId: post.authorId,
        }}
        authorUsers={authorUsers}
      />
    </div>
  );
}
