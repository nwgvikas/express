"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { PublicPostCard } from "@/helper/public-post-service";
import { HomePostCard } from "./home-post-card";
import { PostExpandProvider, usePostExpand } from "./post-expand-context";

type Tab = "pin" | "trending" | "following";

export type HomeFeedFilter =
  | null
  | { kind: "sub"; title: string; categoryLine?: string }
  | { kind: "cat"; title: string };

type Props = {
  /** Published posts from DB only — Your PIN is built from this list. */
  dbPosts: PublicPostCard[];
  failed: boolean;
  /** DB fail hone par hi demo feed. */
  samplePosts: PublicPostCard[];
  feedFilter?: HomeFeedFilter;
};

export function HomeFeedTabs(props: Props) {
  return (
    <PostExpandProvider>
      <HomeFeedTabsInner {...props} />
    </PostExpandProvider>
  );
}

function HomeFeedTabsInner({ dbPosts, failed, samplePosts, feedFilter = null }: Props) {
  const { setExpandedPostId } = usePostExpand();
  const [tab, setTab] = useState<Tab>("pin");

  useEffect(() => {
    setExpandedPostId(null);
  }, [tab, dbPosts, setExpandedPostId]);

  const pinList = useMemo(() => {
    if (dbPosts.length > 0) return dbPosts;
    if (failed) return samplePosts;
    return [];
  }, [dbPosts, failed, samplePosts]);

  const trendingList = useMemo(
    () => dbPosts.filter((p) => p.isTrending),
    [dbPosts],
  );

  const tabs: { id: Tab; label: string }[] = [
    { id: "pin", label: "Your PIN" },
    { id: "trending", label: "Trending" },
    { id: "following", label: "Following" },
  ];

  const list =
    tab === "following"
      ? []
      : tab === "trending"
        ? trendingList
        : pinList;

  const showApiWarning = failed && tab === "pin";

  return (
    <div>
      {feedFilter ? (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-blue-100 bg-blue-50/90 px-3 py-2 text-sm">
          <span className="text-zinc-700">
            <span className="font-semibold text-zinc-900">Filter: </span>
            {feedFilter.kind === "sub" ? (
              <>
                {feedFilter.title}
                {feedFilter.categoryLine ? (
                  <span className="text-zinc-500"> · {feedFilter.categoryLine}</span>
                ) : null}
              </>
            ) : (
              <span>{feedFilter.title} (entire category)</span>
            )}
          </span>
          <Link
            href="/"
            className="ml-auto font-medium text-blue-600 hover:underline"
            scroll={false}
          >
            Show all
          </Link>
        </div>
      ) : null}

      <div className="mb-3 flex gap-6 border-b border-zinc-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`relative pb-3 text-sm font-medium ${
              tab === t.id ? "text-blue-600" : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            {t.label}
            {tab === t.id ? (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-blue-600" />
            ) : null}
          </button>
        ))}
      </div>

      {tab === "pin" && dbPosts.length > 0 ? (
        <p className="mb-3 text-xs text-zinc-500">
          {dbPosts.length} published post{dbPosts.length === 1 ? "" : "s"} · database
        </p>
      ) : null}

      {showApiWarning ? (
        <p className="mb-3 text-sm text-amber-700">
          Could not load from the database. Showing a sample feed below.
        </p>
      ) : null}

      {tab === "following" ? (
        <p className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50 p-6 text-center text-sm text-zinc-600">
          Sign in to see posts from people you follow. Coming soon.
        </p>
      ) : tab === "trending" && list.length === 0 ? (
        <p className="rounded-lg border border-zinc-200 bg-zinc-50 p-6 text-center text-sm text-zinc-600">
          {dbPosts.length === 0 ? (
            feedFilter ? (
              <>
                No published posts for this filter — trending is empty too.{" "}
                <Link href="/" className="font-medium text-blue-600 hover:underline" scroll={false}>
                  View all posts
                </Link>
              </>
            ) : (
              "No published posts yet — the trending tab is empty."
            )
          ) : (
            'No trending posts yet — mark posts as “Trending” in the admin panel.'
          )}
        </p>
      ) : tab === "pin" && list.length === 0 ? (
        <p className="rounded-lg border border-zinc-200 bg-zinc-50 p-6 text-center text-sm text-zinc-600">
          {feedFilter ? (
            <>
              No published posts for this filter yet.{" "}
              <Link href="/" className="font-medium text-blue-600 hover:underline" scroll={false}>
                View all posts
              </Link>
            </>
          ) : (
            <>
              No published posts yet. Publish from the back office — they will appear here under &quot;Your
              PIN&quot;.
            </>
          )}
        </p>
      ) : (
        <ul className="space-y-5">
          {list.map((p) => (
            <li key={p.id}>
              <HomePostCard post={p} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
