"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { formatCommentDateEnIn } from "@/helper/format-post-date";
import { usePostExpandOptional } from "./post-expand-context";

const contentClass =
  "mt-3 rounded-lg border border-zinc-100 bg-zinc-50/50 p-4 text-base leading-relaxed text-zinc-800 [&_a]:text-blue-600 [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mt-3 [&_img]:max-w-full [&_p]:text-zinc-700 [&_ul]:list-disc [&_ul]:pl-6";

type FeedComment = {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
};

function formatCommentWhen(iso: string) {
  return formatCommentDateEnIn(iso);
}

function ExpandedComments({ comments }: { comments: FeedComment[] }) {
  if (!comments.length) {
    return (
      <p className="mt-3 text-sm text-zinc-500">
        No approved comments yet — add one below under &quot;Comments&quot;.
      </p>
    );
  }
  return (
    <div className="mt-4 border-t border-zinc-200/90 pt-4">
      <h3 className="text-sm font-bold text-zinc-900">Comments</h3>
      <ul className="mt-3 space-y-3">
        {comments.map((c) => (
          <li
            key={c.id}
            className="rounded-lg border border-zinc-100 bg-white/90 px-3 py-2.5 ring-1 ring-zinc-100/80"
          >
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-sm font-semibold text-zinc-900">{c.authorName}</span>
              {c.createdAt ? (
                <time
                  dateTime={c.createdAt}
                  className="text-xs text-zinc-500"
                  suppressHydrationWarning
                >
                  {formatCommentWhen(c.createdAt)}
                </time>
              ) : null}
            </div>
            <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
              {c.body}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

type Props = {
  postId: string;
  slug: string;
  excerpt: string;
  isSample: boolean;
  /** Full article URL (e.g. `/news/slug`) — “Read full story” opens this page. */
  articlePath: string;
  /** After “show more”, server returns updated viewCount (unchanged if IP was already counted). */
  onViewCount?: (count: number) => void;
};

export function HomePostExpandableBody({
  postId,
  slug,
  excerpt,
  isSample,
  articlePath,
  onViewCount,
}: Props) {
  const ctx = usePostExpandOptional();
  const [localOpen, setLocalOpen] = useState(false);
  const [html, setHtml] = useState<string | null>(null);
  const [comments, setComments] = useState<FeedComment[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const isExpanded = ctx ? ctx.expandedPostId === postId : localOpen;

  const setExpanded = useCallback(
    (next: boolean) => {
      if (ctx) {
        if (next) {
          ctx.setExpandedPostId(postId);
        } else if (ctx.expandedPostId === postId) {
          ctx.setExpandedPostId(null);
        }
      } else {
        setLocalOpen(next);
      }
    },
    [ctx, postId],
  );

  const load = useCallback(
    async (opts?: { silent?: boolean }): Promise<boolean> => {
      const silent = Boolean(opts?.silent);
      if (!silent) {
        setLoading(true);
      }
      setErr(null);
      try {
        const r = await fetch(`/api/public/posts/${encodeURIComponent(slug)}`, {
          cache: "no-store",
        });
        if (!r.ok) throw new Error("failed");
        const data = (await r.json()) as {
          contentHtml?: string;
          comments?: unknown;
        };
        setHtml(typeof data.contentHtml === "string" ? data.contentHtml : "");
        const raw = data.comments;
        if (Array.isArray(raw)) {
          setComments(
            raw.map((item, i) => {
              const o = item as Record<string, unknown>;
              return {
                id: typeof o.id === "string" ? o.id : `c-${i}`,
                authorName: typeof o.authorName === "string" ? o.authorName : "",
                body: typeof o.body === "string" ? o.body : "",
                createdAt: typeof o.createdAt === "string" ? o.createdAt : "",
              };
            }),
          );
        } else {
          setComments([]);
        }
        return true;
      } catch {
        if (!silent) {
          setErr("Could not load the full post — please try again.");
        }
        return false;
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [slug],
  );

  const registerView = useCallback(async () => {
    if (isSample) return;
    try {
      const r = await fetch("/api/public/post-view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (!r.ok) return;
      const j = (await r.json()) as { viewCount?: unknown };
      const n = Number(j.viewCount);
      if (Number.isFinite(n) && n >= 0) {
        onViewCount?.(Math.floor(n));
      }
    } catch {
      /* ignore */
    }
  }, [slug, isSample, onViewCount]);

  const onToggle = async () => {
    if (isExpanded) {
      setExpanded(false);
      return;
    }
    if (html === null) {
      const ok = await load();
      if (!ok) return;
    } else {
      void load({ silent: true });
    }
    setExpanded(true);
    void registerView();
  };

  if (isSample) {
    return (
      <div className="space-y-2">
        {excerpt ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-zinc-700">{excerpt}</p>
        ) : null}
        <p className="text-xs text-zinc-400">Demo preview — same page par poori story + share link.</p>
        <Link
          href={articlePath}
          className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 underline-offset-2 hover:text-blue-800 hover:underline"
        >
          Read full story
          <span aria-hidden>→</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {excerpt ? (
        <p
          className={`text-sm leading-relaxed text-zinc-700 ${isExpanded ? "" : "line-clamp-3"}`}
        >
          {excerpt}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-0.5">
        <button
          type="button"
          onClick={onToggle}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 underline-offset-2 hover:text-blue-800 hover:underline disabled:opacity-60"
          aria-expanded={isExpanded}
        >
          <span>{isExpanded ? "Show less" : "Show more"}</span>
          <span className="text-base leading-none text-blue-500" aria-hidden>
            {isExpanded ? "↑" : "↓"}
          </span>
          <span className="sr-only">
            {isExpanded ? ", collapse full post" : ", expand full post on this page"}
          </span>
        </button>
        <Link
          href={articlePath}
          className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 underline-offset-2 hover:text-blue-800 hover:underline"
        >
          Read full story
          <span aria-hidden>→</span>
        </Link>
      </div>
      {loading ? <p className="text-sm text-zinc-500">Loading…</p> : null}
      {err ? <p className="text-sm text-red-600">{err}</p> : null}
      {isExpanded && html !== null ? (
        <div className={contentClass}>
          <div
            dangerouslySetInnerHTML={{ __html: html || "<p></p>" }}
          />
          {comments !== null ? <ExpandedComments comments={comments} /> : null}
        </div>
      ) : null}
    </div>
  );
}
