"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import type { AdminCommentListStatus } from "@/helper/backoffice-comment-service";
import {
  adminFilterBtnClass,
  adminFilterInputClass,
  adminFilterSelectClass,
  AdminPaginationClient,
  AdminTableFrame,
  AdminTableHeadRow,
  AdminTableToolbar,
  AdminTd,
  AdminTh,
  AdminTr,
  adminTableClass,
} from "../_components/admin-data-table";

type CommentRow = {
  id: string;
  authorName: string;
  mobile: string;
  body: string;
  status: string;
  createdAt: string;
  postId: string;
  postTitle: string;
  postSlug: string;
};

const TABS: { value: AdminCommentListStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "spam", label: "Spam" },
  { value: "all", label: "All" },
];

function formatWhen(iso: string) {
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

function statusPill(st: string) {
  const base = "inline-flex rounded-lg px-2 py-0.5 text-xs font-semibold ring-1";
  if (st === "pending") return `${base} bg-amber-100 text-amber-900 ring-amber-200/80`;
  if (st === "approved") return `${base} bg-emerald-100 text-emerald-800 ring-emerald-200/80`;
  if (st === "spam") return `${base} bg-orange-100 text-orange-900 ring-orange-200/80`;
  if (st === "rejected") return `${base} bg-slate-200 text-slate-800 ring-slate-300/80`;
  return `${base} bg-slate-100 text-slate-700 ring-slate-200/80`;
}

type Props = { initialStatus?: AdminCommentListStatus };

export function CommentsModerationClient({ initialStatus = "pending" }: Props) {
  const [status, setStatus] = useState<AdminCommentListStatus>(initialStatus);
  const [list, setList] = useState<CommentRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [q, setQ] = useState("");
  const [searchDraft, setSearchDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("status", status);
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`/api/backoffice/comments?${params.toString()}`, {
        credentials: "include",
      });
      if (res.status === 401) {
        window.location.href = "/backoffice/login";
        return;
      }
      const data = (await res.json()) as {
        comments?: CommentRow[];
        total?: number;
        totalPages?: number;
        page?: number;
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Load failed");
        return;
      }
      setList(data.comments ?? []);
      setTotal(typeof data.total === "number" ? data.total : 0);
      setTotalPages(Math.max(1, typeof data.totalPages === "number" ? data.totalPages : 1));
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [status, page, limit, q]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  useEffect(() => {
    setPage(1);
  }, [status, q, limit]);

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setQ(searchDraft.trim());
    setPage(1);
  }

  async function moderate(id: string, action: "approve" | "reject" | "spam") {
    setActingId(id);
    try {
      const res = await fetch(`/api/backoffice/comments/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action }),
      });
      if (res.status === 401) {
        window.location.href = "/backoffice/login";
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(data.error || "Update failed");
        return;
      }
      toast.success(
        action === "approve"
          ? "Comment approved"
          : action === "reject"
            ? "Comment reject kar diya"
            : "Spam mark kar diya",
      );
      await load();
    } catch {
      toast.error("Network error");
    } finally {
      setActingId(null);
    }
  }

  function actionCell(c: CommentRow) {
    return (
      <div className="flex max-w-[14rem] flex-wrap justify-end gap-1.5">
        {c.status === "pending" ? (
          <>
            <button
              type="button"
              disabled={actingId === c.id}
              onClick={() => void moderate(c.id, "approve")}
              className="rounded-lg bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50"
            >
              OK
            </button>
            <button
              type="button"
              disabled={actingId === c.id}
              onClick={() => void moderate(c.id, "reject")}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
            >
              Reject
            </button>
            <button
              type="button"
              disabled={actingId === c.id}
              onClick={() => void moderate(c.id, "spam")}
              className="rounded-lg border border-orange-200 bg-orange-50 px-2 py-1 text-[11px] font-semibold text-orange-900 hover:bg-orange-100 disabled:opacity-50"
            >
              Spam
            </button>
          </>
        ) : c.status === "approved" ? (
          <>
            <button
              type="button"
              disabled={actingId === c.id}
              onClick={() => void moderate(c.id, "reject")}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
            >
              Reject
            </button>
            <button
              type="button"
              disabled={actingId === c.id}
              onClick={() => void moderate(c.id, "spam")}
              className="rounded-lg border border-orange-200 bg-orange-50 px-2 py-1 text-[11px] font-semibold text-orange-900 hover:bg-orange-100 disabled:opacity-50"
            >
              Spam
            </button>
          </>
        ) : c.status === "rejected" || c.status === "spam" ? (
          <button
            type="button"
            disabled={actingId === c.id}
            onClick={() => void moderate(c.id, "approve")}
            className="rounded-lg bg-violet-600 px-2 py-1 text-[11px] font-semibold text-white shadow-sm hover:bg-violet-500 disabled:opacity-50"
          >
            Restore
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Comments</h1>
        <p className="mt-1 text-sm text-slate-600">
          Approve / reject / spam — search and pagination below.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setStatus(t.value)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              status === t.value
                ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-500/25"
                : "border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-violet-200 hover:bg-violet-50/40"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AdminTableToolbar
        left={
          !loading ? (
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-800">{total}</span> comments
            </p>
          ) : null
        }
      >
        <form onSubmit={onSearchSubmit} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Search</span>
            <input
              type="search"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder="Body, naam, mobile, post…"
              className={`${adminFilterInputClass} min-w-[12rem] sm:min-w-[18rem]`}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Page size</span>
            <select
              value={String(limit)}
              onChange={(e) => setLimit(Number(e.target.value))}
              className={adminFilterSelectClass}
            >
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </label>
          <button type="submit" className={adminFilterBtnClass}>
            Search
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            onClick={() => {
              setSearchDraft("");
              setQ("");
              setPage(1);
            }}
          >
            Clear
          </button>
        </form>
      </AdminTableToolbar>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      ) : null}

      <AdminTableFrame>
        <table className={`${adminTableClass} min-w-[960px]`}>
          <thead>
            <AdminTableHeadRow>
              <AdminTh>Author</AdminTh>
              <AdminTh>Comment</AdminTh>
              <AdminTh>Post</AdminTh>
              <AdminTh>Status</AdminTh>
              <AdminTh>When</AdminTh>
              <AdminTh align="right">Actions</AdminTh>
            </AdminTableHeadRow>
          </thead>
          <tbody>
            {loading ? (
              <AdminTr>
                <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                  Loading…
                </td>
              </AdminTr>
            ) : list.length === 0 ? (
              <AdminTr>
                <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                  No comments match this filter / search.
                </td>
              </AdminTr>
            ) : (
              list.map((c) => (
                <AdminTr key={c.id}>
                  <AdminTd nowrap={false}>
                    <div className="max-w-[10rem]">
                      <p className="font-semibold text-slate-900">{c.authorName}</p>
                      <p className="mt-0.5 font-mono text-xs text-slate-500">{c.mobile}</p>
                    </div>
                  </AdminTd>
                  <AdminTd nowrap={false}>
                    <p className="max-w-md whitespace-pre-wrap text-sm leading-relaxed text-slate-800 line-clamp-4" title={c.body}>
                      {c.body}
                    </p>
                  </AdminTd>
                  <AdminTd nowrap={false}>
                    {c.postSlug ? (
                      <Link
                        href={`/news/${c.postSlug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="line-clamp-2 text-sm font-medium text-violet-700 hover:underline"
                      >
                        {c.postTitle}
                      </Link>
                    ) : (
                      <span className="line-clamp-2 text-sm text-slate-700">{c.postTitle}</span>
                    )}
                  </AdminTd>
                  <AdminTd nowrap>
                    <span className={statusPill(c.status)}>{c.status}</span>
                  </AdminTd>
                  <AdminTd className="text-slate-500" nowrap>
                    {formatWhen(c.createdAt)}
                  </AdminTd>
                  <AdminTd className="text-right">{actionCell(c)}</AdminTd>
                </AdminTr>
              ))
            )}
          </tbody>
        </table>
        {!loading ? (
          <AdminPaginationClient
            page={page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={limit}
            onPageChange={setPage}
          />
        ) : null}
      </AdminTableFrame>
    </div>
  );
}
