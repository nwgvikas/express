"use client";

import { useState } from "react";
import { HomePostExpandableBody } from "./home-post-expandable-body";
import { PostCommentPill } from "./post-comment-pill";
import { PostLikePill } from "./post-like-pill";
import { PostSharePill } from "./post-share-pill";

function IconEye({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

type Props = {
  postId: string;
  slug: string;
  excerpt: string;
  isSample: boolean;
  initialViewCount: number;
  initialCommentCount: number;
  initialLikeCount: number;
  shareTitle: string;
  articlePath: string;
};

export function PostCardInteractiveShell({
  postId,
  slug,
  excerpt,
  isSample,
  initialViewCount,
  initialCommentCount,
  initialLikeCount,
  shareTitle,
  articlePath,
}: Props) {
  const [viewCount, setViewCount] = useState(initialViewCount);

  return (
    <>
      <HomePostExpandableBody
        postId={postId}
        slug={slug}
        excerpt={excerpt}
        isSample={isSample}
        articlePath={articlePath}
        onViewCount={isSample ? undefined : setViewCount}
      />
      <div
        className="flex flex-wrap items-center gap-2.5 border-t border-zinc-100/90 pt-3.5"
        role="group"
        aria-label="Engagement"
      >
        <span className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50/80 px-3 py-2 text-sm font-semibold text-sky-950 shadow-sm ring-1 ring-sky-100/80">
          <IconEye className="h-5 w-5 shrink-0 text-sky-600" />
          <span className="text-sky-950">
            Views <span className="tabular-nums text-sky-700">{viewCount}</span>
          </span>
        </span>
        <PostCommentPill
          slug={slug}
          isSample={isSample}
          initialCommentCount={initialCommentCount}
        />
        <PostSharePill title={shareTitle} articlePath={articlePath} disabled={isSample} />
        <PostLikePill
          slug={slug}
          isSample={isSample}
          initialLikeCount={initialLikeCount}
        />
      </div>
    </>
  );
}
