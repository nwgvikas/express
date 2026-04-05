import Link from "next/link";
import { notFound } from "next/navigation";
import { formatCommentDateEnIn } from "@/helper/format-post-date";
import { postHeadlineBackgroundClass } from "@/helper/post-headline-accent";
import type { PublicPostComment } from "@/helper/public-post-service";
import { getPublishedPostFullBySlug } from "@/helper/public-post-service";
import { parseYoutubeVideoId } from "@/helper/youtube-url";
import { PostCategoryPill } from "../../post-category-pill";
import { PostCommentPill } from "../../post-comment-pill";
import { PostLikePill } from "../../post-like-pill";
import { PostYoutubeClickPlay } from "../../post-youtube-click-play";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

function formatCommentWhen(iso: string) {
  return formatCommentDateEnIn(iso);
}

function CommentThread({ comments }: { comments: PublicPostComment[] }) {
  if (!comments.length) {
    return (
      <p className="text-sm text-zinc-500">
        No approved comments yet. Add one below — after admin approval it will appear here.
      </p>
    );
  }
  return (
    <ul className="space-y-4">
      {comments.map((c) => (
        <li
          key={c.id}
          className="rounded-xl border border-zinc-100 bg-zinc-50/80 px-4 py-3 ring-1 ring-zinc-100/80"
        >
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="font-semibold text-zinc-900">{c.authorName}</span>
            {c.createdAt ? (
              <time
                dateTime={c.createdAt}
                className="text-xs font-medium text-zinc-500"
              >
                {formatCommentWhen(c.createdAt)}
              </time>
            ) : null}
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
            {c.body}
          </p>
        </li>
      ))}
    </ul>
  );
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;
  if (slug.startsWith("sample-")) {
    notFound();
  }

  const full = await getPublishedPostFullBySlug(slug);
  if (!full) notFound();

  const { card, contentHtml, comments } = full;
  const headlineBg = postHeadlineBackgroundClass(`${card.id}:${card.slug}`);
  const articleYoutubeId =
    card.mediaType === "youtube" && card.youtubeUrl
      ? parseYoutubeVideoId(card.youtubeUrl)
      : null;

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-6 inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← Home
        </Link>
        <article className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          <div className="p-4">
            <PostCategoryPill
              categoryName={card.categoryName}
              subcategoryName={card.subcategoryName}
              subcategorySlug={card.subcategorySlug}
            />
          </div>
          <div className={`${headlineBg} px-4 py-4`}>
            <h1 className="text-2xl font-bold text-white drop-shadow-sm md:text-3xl">{card.title}</h1>
          </div>
          {articleYoutubeId ? (
            <div className="border-b border-zinc-100 bg-black">
              <PostYoutubeClickPlay videoId={articleYoutubeId} title={card.title} />
            </div>
          ) : null}
          <div
            className="space-y-4 p-6 text-base leading-relaxed text-zinc-800 [&_a]:text-blue-600 [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_img]:max-w-full [&_p]:text-zinc-700 [&_ul]:list-disc [&_ul]:pl-6"
            dangerouslySetInnerHTML={{ __html: contentHtml || "<p></p>" }}
          />
        </article>

        <section
          className="mt-8 overflow-hidden rounded-xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"
          aria-labelledby="article-comments-heading"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <h2
              id="article-comments-heading"
              className="text-lg font-bold text-zinc-900"
            >
              Comments{" "}
              <span className="tabular-nums font-semibold text-violet-700">
                ({comments.length})
              </span>
            </h2>
            <div className="flex flex-wrap items-center gap-2.5">
              <PostLikePill
                slug={card.slug}
                isSample={false}
                initialLikeCount={card.likeCount}
              />
              <PostCommentPill
                slug={card.slug}
                isSample={false}
                initialCommentCount={card.commentCount}
              />
            </div>
          </div>
          <div className="mt-5 border-t border-zinc-100 pt-5">
            <CommentThread comments={comments} />
          </div>
        </section>
      </div>
    </div>
  );
}
