import Link from "next/link";
import { listPostsForAdmin } from "@/helper/post-service";
import {
  adminFilterBtnClass,
  adminFilterInputClass,
  adminFilterSelectClass,
  AdminFilterField,
  AdminPaginationServer,
  AdminTableFrame,
  AdminTableHeadRow,
  AdminTableToolbar,
  AdminTd,
  AdminTh,
  AdminTr,
  adminTableClass,
} from "../_components/admin-data-table";
import { PostRowActions } from "./post-row-actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Post list | Admin",
};

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

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PostsListPage({ searchParams }: PageProps) {
  const sp = (await searchParams) ?? {};
  const q = firstString(sp.q);
  const statusRaw = firstString(sp.status).toLowerCase();
  const status =
    statusRaw === "draft" || statusRaw === "pending" || statusRaw === "published"
      ? statusRaw
      : "all";
  const page = Math.max(1, Number.parseInt(firstString(sp.page) || "1", 10) || 1);
  const limit = Math.min(50, Math.max(5, Number.parseInt(firstString(sp.limit) || "15", 10) || 15));

  const { rows: posts, total, totalPages, page: curPage, limit: curLimit } =
    await listPostsForAdmin({
      page,
      limit,
      q,
      status: status as "all" | "draft" | "pending" | "published",
    });

  function buildHref(nextPage: number) {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    p.set("status", status);
    p.set("limit", String(curLimit));
    p.set("page", String(nextPage));
    const qs = p.toString();
    return qs ? `/backoffice/posts?${qs}` : "/backoffice/posts";
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Post list</h1>
          <p className="mt-1 text-sm text-slate-600">
            Draft, pending approval, published — filter, search, pagination.
          </p>
        </div>
        <Link
          href="/backoffice/posts/new"
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-105"
        >
          + New post
        </Link>
      </div>

      <AdminTableToolbar
        left={
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-800">{total}</span> posts match
          </p>
        }
      >
        <form method="get" action="/backoffice/posts" className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <input type="hidden" name="page" value="1" />
          <AdminFilterField label="Search">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Title, slug, excerpt…"
              className={`${adminFilterInputClass} min-w-[12rem] sm:min-w-[16rem]`}
            />
          </AdminFilterField>
          <AdminFilterField label="Status">
            <select name="status" defaultValue={status} className={adminFilterSelectClass}>
              <option value="all">All</option>
              <option value="published">Published</option>
              <option value="pending">Pending approval</option>
              <option value="draft">Draft</option>
            </select>
          </AdminFilterField>
          <AdminFilterField label="Page size">
            <select name="limit" defaultValue={String(curLimit)} className={adminFilterSelectClass}>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </AdminFilterField>
          <button type="submit" className={adminFilterBtnClass}>
            Apply
          </button>
        </form>
      </AdminTableToolbar>

      <AdminTableFrame>
        <table className={`${adminTableClass} min-w-[1240px]`}>
          <thead>
            <AdminTableHeadRow>
              <AdminTh>#</AdminTh>
              <AdminTh>Title</AdminTh>
              <AdminTh>Slug</AdminTh>
              <AdminTh>Status</AdminTh>
              <AdminTh>Type</AdminTh>
              <AdminTh>Trending</AdminTh>
              <AdminTh>Breaking</AdminTh>
              <AdminTh>Category</AdminTh>
              <AdminTh>Sub</AdminTh>
              <AdminTh>Creator</AdminTh>
              <AdminTh>Updated</AdminTh>
              <AdminTh align="right">Actions</AdminTh>
            </AdminTableHeadRow>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <AdminTr>
                <td colSpan={12} className="px-5 py-14 text-center text-sm text-slate-500">
                  No posts —{" "}
                  <Link href="/backoffice/posts/new" className="font-semibold text-violet-700 underline">
                    new post
                  </Link>{" "}
                  add one or change the filter.
                </td>
              </AdminTr>
            ) : (
              posts.map((row, i) => (
                <AdminTr key={row.id}>
                  <AdminTd className="tabular-nums text-slate-500" nowrap>
                    {(curPage - 1) * curLimit + i + 1}
                  </AdminTd>
                  <AdminTd className="max-w-[220px] font-medium text-slate-900" nowrap={false}>
                    <span className="line-clamp-2" title={row.title}>
                      {row.title}
                    </span>
                  </AdminTd>
                  <AdminTd className="font-mono text-xs text-violet-800" nowrap={false}>
                    {row.slug}
                  </AdminTd>
                  <AdminTd nowrap>
                    <span
                      className={`inline-flex rounded-lg px-2 py-0.5 text-xs font-semibold ${
                        row.status === "published"
                          ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/80"
                          : row.status === "pending"
                            ? "bg-violet-100 text-violet-900 ring-1 ring-violet-200/80"
                            : "bg-amber-100 text-amber-900 ring-1 ring-amber-200/80"
                      }`}
                    >
                      {row.status}
                    </span>
                  </AdminTd>
                  <AdminTd nowrap>
                    <span
                      className={`inline-flex rounded-lg px-2 py-0.5 text-xs font-semibold ${
                        row.mediaType === "youtube"
                          ? "bg-rose-100 text-rose-800 ring-1 ring-rose-200/80"
                          : "bg-sky-100 text-sky-800 ring-1 ring-sky-200/80"
                      }`}
                    >
                      {row.mediaType === "youtube" ? "YouTube" : "Image"}
                    </span>
                  </AdminTd>
                  <AdminTd nowrap>
                    {row.isTrending ? (
                      <span className="inline-flex rounded-lg bg-fuchsia-100 px-2 py-0.5 text-xs font-semibold text-fuchsia-900 ring-1 ring-fuchsia-200/80">
                        Haan
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </AdminTd>
                  <AdminTd nowrap>
                    {row.isBreaking ? (
                      <span className="inline-flex rounded-lg bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-900 ring-1 ring-red-200/80">
                        Haan
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </AdminTd>
                  <AdminTd className="text-slate-700">{row.categoryName}</AdminTd>
                  <AdminTd className="text-slate-700">{row.subcategoryName}</AdminTd>
                  <AdminTd className="max-w-[160px] text-xs text-slate-600" nowrap={false} title={row.authorLabel}>
                    <span className="line-clamp-2">{row.authorLabel}</span>
                  </AdminTd>
                  <AdminTd className="text-slate-500" nowrap>
                    {formatDate(row.updatedAt)}
                  </AdminTd>
                  <AdminTd className="text-right">
                    <PostRowActions postId={row.id} title={row.title} />
                  </AdminTd>
                </AdminTr>
              ))
            )}
          </tbody>
        </table>
        <AdminPaginationServer
          page={curPage}
          totalPages={totalPages}
          totalItems={total}
          pageSize={curLimit}
          buildHref={buildHref}
        />
      </AdminTableFrame>
    </div>
  );
}
