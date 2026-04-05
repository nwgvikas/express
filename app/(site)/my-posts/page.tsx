import Link from "next/link";
import { redirect } from "next/navigation";
import { listPostsForAuthor } from "@/helper/post-service";
import { getPublicSiteUser } from "@/helper/public-user-auth";
import { getSiteBrandingSafe } from "@/helper/site-branding";

export const dynamic = "force-dynamic";

function firstString(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return (v[0] ?? "").trim();
  return typeof v === "string" ? v.trim() : "";
}

function formatDate(iso: string) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

function statusLabel(status: string) {
  if (status === "published") return "Published";
  if (status === "pending") return "Approval pending";
  return "Draft";
}

function statusPillClass(status: string) {
  if (status === "published") return "bg-emerald-100 text-emerald-800 ring-emerald-200/80";
  if (status === "pending") return "bg-violet-100 text-violet-900 ring-violet-200/80";
  return "bg-amber-100 text-amber-900 ring-amber-200/80";
}

function buildMyPostsHref(input: {
  q: string;
  status: string;
  limit: number;
  page: number;
}) {
  const p = new URLSearchParams();
  if (input.q) p.set("q", input.q);
  if (input.status && input.status !== "all") p.set("status", input.status);
  if (input.limit !== 15) p.set("limit", String(input.limit));
  if (input.page > 1) p.set("page", String(input.page));
  const qs = p.toString();
  return qs ? `/my-posts?${qs}` : "/my-posts";
}

export async function generateMetadata() {
  const s = await getSiteBrandingSafe();
  return { title: `My posts | ${s.siteName}` };
}

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MyPostsPage({ searchParams }: PageProps) {
  const user = await getPublicSiteUser();
  if (!user) {
    redirect("/login");
  }

  const sp = (await searchParams) ?? {};
  const q = firstString(sp.q);
  const statusRaw = firstString(sp.status).toLowerCase();
  const statusFilter =
    statusRaw === "draft" || statusRaw === "pending" || statusRaw === "published"
      ? statusRaw
      : "all";
  const page = Math.max(1, Number.parseInt(firstString(sp.page) || "1", 10) || 1);
  const limit = Math.min(50, Math.max(5, Number.parseInt(firstString(sp.limit) || "15", 10) || 15));

  const { rows, total, totalPages, page: curPage, limit: curLimit } = await listPostsForAuthor({
    authorId: user.id,
    page,
    limit,
    status: statusFilter as "all" | "draft" | "pending" | "published",
    q,
  });

  const filterFormBase = { q, status: statusFilter, limit: curLimit };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-zinc-100 via-zinc-50/80 to-zinc-100 pb-12 pt-6 sm:pt-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-6 flex flex-col gap-5 border-b border-zinc-200/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <nav className="text-sm">
              <Link href="/" className="font-medium text-blue-600 transition hover:text-blue-800">
                ← Home
              </Link>
            </nav>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              My posts
            </h1>
            <p className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-zinc-600 sm:text-base">
              Drafts, pending approval, and published — use filters and pages. Only items the admin has
              published appear on the site.
            </p>
          </div>
          <Link
            href="/my-posts/new"
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:brightness-105 active:scale-[0.99]"
          >
            + New post
          </Link>
        </header>

        {/* Filters */}
        <section
          className="mb-5 rounded-2xl border border-zinc-200/90 bg-white/90 p-4 shadow-sm backdrop-blur-sm sm:p-5"
          aria-label="Filter posts"
        >
          <form method="get" action="/my-posts" className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
            <input type="hidden" name="page" value="1" />
            <div className="min-w-0 flex-1 lg:min-w-[14rem]">
              <label htmlFor="my-posts-q" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Search
              </label>
              <input
                id="my-posts-q"
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Title, slug, excerpt…"
                className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm outline-none ring-zinc-400/30 transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2"
              />
            </div>
            <div className="w-full sm:w-auto sm:min-w-[11rem]">
              <label htmlFor="my-posts-status" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Status
              </label>
              <select
                id="my-posts-status"
                name="status"
                defaultValue={statusFilter}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-zinc-400/30"
              >
                <option value="all">All</option>
                <option value="published">Published</option>
                <option value="pending">Approval pending</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div className="w-full sm:w-auto sm:min-w-[8.5rem]">
              <label htmlFor="my-posts-limit" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Page size
              </label>
              <select
                id="my-posts-limit"
                name="limit"
                defaultValue={String(curLimit)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-zinc-400/30"
              >
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-2 pt-1 lg:pt-0">
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
              >
                Apply
              </button>
              <Link
                href="/my-posts"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50"
              >
                Reset
              </Link>
            </div>
          </form>
        </section>

        {/* Result summary */}
        <p className="mb-3 text-sm text-zinc-600">
          <span className="font-semibold text-zinc-900">{total}</span> post{total === 1 ? "" : "s"} match
        </p>

        {/* Mobile cards */}
        <div className="space-y-3 md:hidden">
          {rows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white/80 px-4 py-12 text-center text-sm text-zinc-500">
              No posts — try different filters or{" "}
              <Link href="/my-posts/new" className="font-semibold text-blue-600 underline">
                create a new post
              </Link>
              .
            </div>
          ) : (
            rows.map((p) => (
              <article
                key={p.id}
                className="rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm"
              >
                <h2 className="font-semibold leading-snug text-zinc-900">{p.title}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                  <span>{p.categoryName}</span>
                  <span aria-hidden>·</span>
                  <time dateTime={p.updatedAt}>{formatDate(p.updatedAt)}</time>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${statusPillClass(p.status)}`}
                  >
                    {statusLabel(p.status)}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 border-t border-zinc-100 pt-3 text-sm font-medium">
                  <Link href={`/my-posts/${p.id}/edit`} className="text-violet-700 hover:underline">
                    Edit
                  </Link>
                  {p.status === "published" ? (
                    <Link
                      href={`/news/${encodeURIComponent(p.slug)}`}
                      className="text-blue-600 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </Link>
                  ) : null}
                </div>
              </article>
            ))
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-md shadow-zinc-900/5 md:block">
          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full divide-y divide-zinc-100 text-left text-sm lg:min-w-0">
              <thead className="bg-zinc-50/90">
                <tr>
                  <th scope="col" className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Title
                  </th>
                  <th scope="col" className="hidden px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-zinc-500 lg:table-cell">
                    Category
                  </th>
                  <th scope="col" className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Status
                  </th>
                  <th scope="col" className="hidden px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-zinc-500 xl:table-cell">
                    Updated
                  </th>
                  <th scope="col" className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-14 text-center text-sm text-zinc-500">
                      No posts — try different filters or{" "}
                      <Link href="/my-posts/new" className="font-semibold text-blue-600 underline">
                        create a new post
                      </Link>
                      .
                    </td>
                  </tr>
                ) : (
                  rows.map((p) => (
                    <tr key={p.id} className="transition-colors hover:bg-zinc-50/80">
                      <td className="max-w-[min(280px,28vw)] px-5 py-4 font-medium text-zinc-900 lg:max-w-md">
                        <span className="line-clamp-2" title={p.title}>
                          {p.title}
                        </span>
                      </td>
                      <td className="hidden whitespace-nowrap px-5 py-4 text-zinc-600 lg:table-cell">
                        {p.categoryName}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${statusPillClass(p.status)}`}
                        >
                          {statusLabel(p.status)}
                        </span>
                      </td>
                      <td className="hidden whitespace-nowrap px-5 py-4 text-zinc-600 xl:table-cell">
                        <time dateTime={p.updatedAt}>{formatDate(p.updatedAt)}</time>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <div className="flex flex-wrap items-center justify-end gap-3">
                          <Link
                            href={`/my-posts/${p.id}/edit`}
                            className="font-semibold text-violet-700 hover:underline"
                          >
                            Edit
                          </Link>
                          {p.status === "published" ? (
                            <Link
                              href={`/news/${encodeURIComponent(p.slug)}`}
                              className="font-semibold text-blue-600 hover:underline"
                              target="_blank"
                              rel="noreferrer"
                            >
                              View
                            </Link>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination — desktop table footer */}
          <MyPostsPaginationFooter
            page={curPage}
            totalPages={totalPages}
            totalItems={total}
            pageSize={curLimit}
            buildHref={(next) => buildMyPostsHref({ ...filterFormBase, page: next })}
          />
        </div>

        {/* Pagination — below mobile cards */}
        {rows.length > 0 ? (
          <div className="mt-4 md:hidden">
            <div className="rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm">
              <MyPostsPaginationFooter
                page={curPage}
                totalPages={totalPages}
                totalItems={total}
                pageSize={curLimit}
                buildHref={(next) => buildMyPostsHref({ ...filterFormBase, page: next })}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function MyPostsPaginationFooter({
  page,
  totalPages,
  totalItems,
  pageSize,
  buildHref,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  buildHref: (page: number) => string;
}) {
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-col gap-3 border-t border-zinc-100 bg-zinc-50/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <p className="text-sm text-zinc-600">
        {totalItems === 0 ? (
          <span className="font-medium text-zinc-500">No posts</span>
        ) : (
          <>
            <span className="font-semibold text-zinc-900">
              {from}–{to}
            </span>
            <span className="text-zinc-500"> · {totalItems} total</span>
          </>
        )}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {page > 1 ? (
          <Link
            href={buildHref(page - 1)}
            className="rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50"
            scroll={false}
          >
            ← Previous
          </Link>
        ) : (
          <span className="rounded-xl border border-zinc-100 px-3.5 py-2 text-sm text-zinc-400">← Previous</span>
        )}
        <span className="px-2 text-sm font-medium tabular-nums text-zinc-600">
          Page {page} / {totalPages}
        </span>
        {page < totalPages ? (
          <Link
            href={buildHref(page + 1)}
            className="rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50"
            scroll={false}
          >
            Next →
          </Link>
        ) : (
          <span className="rounded-xl border border-zinc-100 px-3.5 py-2 text-sm text-zinc-400">Next →</span>
        )}
      </div>
    </div>
  );
}
