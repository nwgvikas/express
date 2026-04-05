import Link from "next/link";
import { notFound } from "next/navigation";
import { listPublishedPostsBySubcategorySlug } from "@/helper/public-post-service";
import { HomePostCard } from "../../home-post-card";
import { PostExpandProvider } from "../../post-expand-context";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function SubcategoryPostsPage({ params }: Props) {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw).trim().toLowerCase();
  if (!slug) notFound();

  const { posts, subcategoryName, categoryName, failed } =
    await listPublishedPostsBySubcategorySlug(slug, 50);

  if (!subcategoryName && !failed) {
    notFound();
  }

  const titleParts = [categoryName, subcategoryName].filter(Boolean);

  return (
    <div className="bg-zinc-100">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/" className="text-sm font-medium text-blue-600 hover:text-blue-800">
          ← Home
        </Link>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900">
          {titleParts.length > 0 ? titleParts.join(" · ") : "Subcategory"}
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          {posts.length} published post{posts.length === 1 ? "" : "s"}
          {failed ? " — load error; the list may be empty." : ""}
        </p>

        {posts.length === 0 ? (
          <p className="mt-8 rounded-xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-600">
            No published posts in this subcategory yet.
          </p>
        ) : (
          <PostExpandProvider>
            <ul className="mt-8 space-y-5">
              {posts.map((p) => (
                <li key={p.id}>
                  <HomePostCard post={p} />
                </li>
              ))}
            </ul>
          </PostExpandProvider>
        )}
      </div>
    </div>
  );
}
