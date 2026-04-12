import { formatPostDateEnIn } from "@/helper/format-post-date";
import { postHeadlineBackgroundClass } from "@/helper/post-headline-accent";
import type { PublicPostCard } from "@/helper/public-post-service";
import { parseYoutubeVideoId } from "@/helper/youtube-url";
import { PostCardInteractiveShell } from "./post-card-interactive-shell";
import { PostCategoryPill } from "./post-category-pill";
import { PostYoutubeClickPlay } from "./post-youtube-click-play";

function cardThumb(post: PublicPostCard): string | null {
  if (post.mediaType === "youtube" && post.youtubeUrl) {
    const id = parseYoutubeVideoId(post.youtubeUrl);
    return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
  }
  const u = post.imageUrl?.trim();
  if (u && (u.startsWith("http") || u.startsWith("/"))) return u;
  return null;
}

export function HomePostCard({ post }: { post: PublicPostCard }) {
  const isSample = post.id.startsWith("sample");
  const href = `/news/${encodeURIComponent(post.slug)}`;
  const thumb = cardThumb(post);
  const youtubeId =
    post.mediaType === "youtube" && post.youtubeUrl
      ? parseYoutubeVideoId(post.youtubeUrl)
      : null;
  const headlineBg = postHeadlineBackgroundClass(`${post.id}:${post.slug}`);
  const headline = (
    <div className={`${headlineBg} px-4 py-3`}>
      <h2 className="text-lg font-bold leading-snug text-white drop-shadow-sm md:text-xl">
        {post.title}
      </h2>
    </div>
  );

  const mediaBlock =
    youtubeId != null ? (
      <PostYoutubeClickPlay videoId={youtubeId} title={post.title} />
    ) : thumb != null ? (
      <div className="relative w-full overflow-hidden bg-zinc-100">
        {/* object-contain: tall/editorial graphics (text on image) crop na hon; aspect-video + cover neeche ka text kaat deta tha */}
        {/* eslint-disable-next-line @next/next/no-img-element -- admin / external URLs */}
        <img
          src={thumb}
          alt=""
          className="mx-auto block w-full max-h-[min(85vw,520px)] object-contain sm:max-h-[560px]"
          loading="lazy"
        />
      </div>
    ) : null;

  return (
    <article className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="p-4 pb-2">
        <PostCategoryPill
          categoryName={post.categoryName}
          subcategoryName={post.subcategoryName}
          subcategorySlug={post.subcategorySlug}
        />
      </div>
      <>
        {mediaBlock}
        <div className="block">{headline}</div>
      </>
      <div className="space-y-2 p-4 pt-3">
        <p className="text-xs text-zinc-500" suppressHydrationWarning>
          Unnao Desk · {formatPostDateEnIn(post.updatedAt)}
        </p>
        <PostCardInteractiveShell
          postId={post.id}
          slug={post.slug}
          excerpt={post.excerpt}
          isSample={isSample}
          initialViewCount={post.viewCount}
          initialCommentCount={post.commentCount}
          initialLikeCount={post.likeCount}
          shareTitle={post.title}
          articlePath={href}
        />
      </div>
    </article>
  );
}
