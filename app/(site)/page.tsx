import { getLandingBreakingResolved } from "@/helper/landing-breaking";
import {
  listPublishedPostsByCategorySlug,
  listPublishedPostsBySubcategorySlug,
  listPublishedPostsForHome,
} from "@/helper/public-post-service";
import { HomeBreakingBar } from "./home-breaking-bar";
import { HomeFeedTabs, type HomeFeedFilter } from "./home-feed-tabs";
import { HomeLeftSidebar } from "./home-left-sidebar";
import { HOME_SAMPLE_FEED } from "./home-sample-feed";
import { HomeRightSidebar } from "./home-right-sidebar";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstQuery(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return (v[0] ?? "").trim();
  return typeof v === "string" ? v.trim() : "";
}

export default async function HomePage({ searchParams }: PageProps) {
  const sp = (await searchParams) ?? {};
  const subSlug = firstQuery(sp.sub).toLowerCase();
  const catSlug = firstQuery(sp.cat).toLowerCase();

  let fromDb: Awaited<ReturnType<typeof listPublishedPostsForHome>>["posts"] = [];
  let failed = false;
  let feedFilter: HomeFeedFilter = null;

  if (subSlug) {
    const r = await listPublishedPostsBySubcategorySlug(subSlug, 50);
    fromDb = r.posts;
    failed = r.failed;
    feedFilter = {
      kind: "sub",
      title: r.subcategoryName?.trim() || subSlug,
      categoryLine: r.categoryName?.trim() || undefined,
    };
  } else if (catSlug) {
    const r = await listPublishedPostsByCategorySlug(catSlug, 50);
    fromDb = r.posts;
    failed = r.failed;
    feedFilter = {
      kind: "cat",
      title: r.categoryName?.trim() || catSlug,
    };
  } else {
    const r = await listPublishedPostsForHome(20);
    fromDb = r.posts;
    failed = r.failed;
  }

  const first = fromDb[0];
  const breaking = await getLandingBreakingResolved(
    first ? { title: first.title, slug: first.slug } : null,
  );

  return (
    <div className="bg-zinc-100">
      <HomeBreakingBar label={breaking.label} line={breaking.line} href={breaking.href} />

      {/*
        lg+: Row height = viewport minus ~site header + breaking bar. Left/right columns
        stay in that band (no column scroll);         only the center column scrolls the main feed. Left nav scrolls only if Top Cities
        content is taller than the band; right column stays fixed (overflow hidden).
        Mobile: stacked layout, normal page scroll.
      */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-4">
        <div className="grid grid-cols-1 gap-6 lg:h-[calc(100dvh-8rem)] lg:min-h-0 lg:grid-cols-12 lg:gap-8 lg:overflow-hidden">
          <aside className="order-2 lg:order-1 lg:col-span-3 lg:min-h-0 lg:overflow-y-auto lg:overflow-x-hidden lg:overscroll-y-contain lg:pr-1 lg:[scrollbar-gutter:stable]">
            <HomeLeftSidebar activeSubSlug={subSlug} activeCatSlug={catSlug} />
          </aside>

          <main className="order-1 space-y-4 lg:order-2 lg:col-span-6 lg:min-h-0 lg:overflow-y-auto lg:overscroll-y-contain lg:px-1 lg:[scrollbar-gutter:stable]">
            <div className="flex min-h-[100px] shrink-0 items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-sky-50 text-sm font-medium text-sky-800/80">
              ADVERTISEMENT
            </div>
            <HomeFeedTabs
              dbPosts={fromDb}
              failed={failed}
              samplePosts={HOME_SAMPLE_FEED}
              feedFilter={feedFilter}
            />
          </main>

          <aside className="order-3 lg:col-span-3 lg:min-h-0 lg:overflow-hidden lg:overflow-x-hidden lg:pl-1">
            <HomeRightSidebar />
          </aside>
        </div>
      </div>
    </div>
  );
}
