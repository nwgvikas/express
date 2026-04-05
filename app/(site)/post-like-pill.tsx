"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

function IconHeart({ className, filled }: { className?: string; filled?: boolean }) {
  if (filled) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.003-.003.001a.75.75 0 01-.673 0l-.003-.001z" />
      </svg>
    );
  }
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    </svg>
  );
}

type Props = {
  slug: string;
  isSample: boolean;
  initialLikeCount: number;
};

export function PostLikePill({ slug, isSample, initialLikeCount }: Props) {
  const [count, setCount] = useState(initialLikeCount);
  const [liked, setLiked] = useState(false);
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setCount(initialLikeCount);
  }, [initialLikeCount]);

  useEffect(() => {
    if (isSample) {
      setReady(true);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`/api/public/post-like?slug=${encodeURIComponent(slug)}`, {
          cache: "no-store",
        });
        if (!r.ok) return;
        const j = (await r.json()) as { likeCount?: unknown; liked?: unknown };
        if (cancelled) return;
        const c = Number(j.likeCount);
        if (Number.isFinite(c) && c >= 0) setCount(Math.floor(c));
        setLiked(Boolean(j.liked));
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, isSample]);

  const onClick = useCallback(async () => {
    if (isSample) {
      toast.message("Demo post", {
        description: "Likes are available on the live post.",
      });
      return;
    }
    if (pending) return;
    setPending(true);
    try {
      const r = await fetch("/api/public/post-like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const j = (await r.json().catch(() => ({}))) as {
        error?: string;
        likeCount?: unknown;
        liked?: unknown;
      };
      if (!r.ok) {
        toast.error(j.error || "Could not save like");
        return;
      }
      const c = Number(j.likeCount);
      if (Number.isFinite(c) && c >= 0) setCount(Math.floor(c));
      setLiked(Boolean(j.liked));
    } catch {
      toast.error("Network error");
    } finally {
      setPending(false);
    }
  }, [slug, isSample, pending]);

  return (
    <button
      type="button"
      onClick={() => void onClick()}
      disabled={pending || (!isSample && !ready)}
      className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border-0 px-3 py-2 text-sm font-semibold shadow-sm ring-1 transition hover:brightness-[1.02] active:scale-[0.98] disabled:opacity-60 ${
        liked
          ? "bg-gradient-to-br from-rose-100 to-pink-100 text-rose-900 ring-rose-200"
          : "bg-gradient-to-br from-rose-50 to-pink-50/80 text-rose-950 ring-rose-100/80"
      }`}
      aria-pressed={liked}
      aria-label={liked ? "Unlike" : "Like"}
    >
      <IconHeart
        className={`h-5 w-5 shrink-0 ${liked ? "text-rose-600" : "text-rose-500"}`}
        filled={liked}
      />
      <span className="text-rose-950">
        Likes <span className="tabular-nums text-rose-800">{count}</span>
      </span>
    </button>
  );
}
