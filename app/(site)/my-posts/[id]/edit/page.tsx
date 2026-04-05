import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PostForm } from "@/app/backoffice/(admin)/posts/post-form";
import { connectDB } from "@/helper/db";
import { getPostForEdit, isPostOwnedByAuthor } from "@/helper/post-service";
import { Category } from "@/models/category";
import { Subcategory } from "@/models/subcategory";
import { getPublicSiteUser } from "@/helper/public-user-auth";
import { updateMemberPostFromForm, createMemberPostFromForm } from "../../actions";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return { title: `Post edit | ${id.slice(0, 8)}…` };
}

export default async function MyPostsEditPage({ params }: Props) {
  const user = await getPublicSiteUser();
  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const owned = await isPostOwnedByAuthor(id, user.id);
  if (!owned) {
    notFound();
  }

  const initial = await getPostForEdit(id);
  if (!initial) {
    notFound();
  }

  await connectDB();
  const categories = await Category.find().sort({ name: 1 }).lean();
  const subcategories = await Subcategory.find().sort({ name: 1 }).lean();

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
    <div className="bg-zinc-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/my-posts" className="text-sm font-medium text-blue-600 hover:text-blue-800">
          ← My posts
        </Link>
        <PostForm
          categories={catOpts}
          subcategories={subOpts}
          mode="edit"
          postId={id}
          initial={initial}
          createPostFromForm={createMemberPostFromForm}
          updatePostFromForm={updateMemberPostFromForm}
          afterSaveRedirectHref="/my-posts"
          cancelHref="/my-posts"
          loginRedirectHref="/login"
          showTrendingBreaking={false}
          memberApprovalFlow
        />
      </div>
    </div>
  );
}
