import Link from "next/link";
import type { ReactNode } from "react";

/** Outer card + horizontal scroll for admin tables */
export function AdminTableFrame({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-md shadow-slate-200/50 ring-1 ring-slate-100/90">
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export const adminTableClass = "w-full min-w-[640px] text-left text-sm";

export function AdminTableHeadRow({ children }: { children: ReactNode }) {
  return (
    <tr className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-violet-50/40 to-slate-50">
      {children}
    </tr>
  );
}

export function AdminTh({
  children,
  className = "",
  align,
}: {
  children: ReactNode;
  className?: string;
  align?: "right";
}) {
  return (
    <th
      scope="col"
      className={`px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 sm:px-5 ${
        align === "right" ? "text-right" : "text-left"
      } ${className}`}
    >
      {children}
    </th>
  );
}

export function AdminTr({ children }: { children: ReactNode }) {
  return (
    <tr className="border-b border-slate-100 transition-colors last:border-0 hover:bg-violet-50/50">
      {children}
    </tr>
  );
}

export function AdminTd({
  children,
  className = "",
  nowrap,
  title,
}: {
  children: ReactNode;
  className?: string;
  nowrap?: boolean;
  title?: string;
}) {
  return (
    <td
      title={title}
      className={`px-4 py-3 text-sm text-slate-700 sm:px-5 ${nowrap ? "whitespace-nowrap" : ""} ${className}`}
    >
      {children}
    </td>
  );
}

export function AdminTableToolbar({
  left,
  children,
}: {
  left?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
      {left ? <div className="min-w-0 flex-1">{left}</div> : null}
      {children ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">{children}</div>
      ) : null}
    </div>
  );
}

const inputClass =
  "rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-500/20";
const selectClass = `${inputClass} min-w-[8rem] cursor-pointer`;
const btnClass =
  "inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition hover:brightness-105 active:scale-[0.98] disabled:opacity-50";

export function AdminFilterField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      {children}
    </label>
  );
}

export { inputClass as adminFilterInputClass, selectClass as adminFilterSelectClass, btnClass as adminFilterBtnClass };

type ClientPaginationProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  className?: string;
};

export function AdminPaginationClient({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className = "",
}: ClientPaginationProps) {
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return (
    <div
      className={`flex flex-col gap-3 border-t border-slate-100 bg-slate-50/50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 ${className}`}
    >
      <p className="text-sm text-slate-600">
        {totalItems === 0 ? (
          <span className="font-medium text-slate-500">No matching rows</span>
        ) : (
          <>
            <span className="font-medium text-slate-800">
              {from}–{to}
            </span>
            <span className="text-slate-500"> · {totalItems} total</span>
          </>
        )}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
        >
          ← Previous
        </button>
        <span className="px-2 text-sm font-medium tabular-nums text-slate-600">
          Page {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

type ServerPaginationProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  buildHref: (nextPage: number) => string;
  className?: string;
};

export function AdminPaginationServer({
  page,
  totalPages,
  totalItems,
  pageSize,
  buildHref,
  className = "",
}: ServerPaginationProps) {
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return (
    <div
      className={`flex flex-col gap-3 border-t border-slate-100 bg-slate-50/50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 ${className}`}
    >
      <p className="text-sm text-slate-600">
        {totalItems === 0 ? (
          <span className="font-medium text-slate-500">No posts</span>
        ) : (
          <>
            <span className="font-medium text-slate-800">
              {from}–{to}
            </span>
            <span className="text-slate-500"> · {totalItems} posts</span>
          </>
        )}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {page > 1 ? (
          <Link
            href={buildHref(page - 1)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            scroll={false}
          >
            ← Previous
          </Link>
        ) : (
          <span className="rounded-lg border border-slate-100 px-3 py-1.5 text-sm text-slate-400">← Previous</span>
        )}
        <span className="px-2 text-sm font-medium tabular-nums text-slate-600">
          Page {page} / {totalPages}
        </span>
        {page < totalPages ? (
          <Link
            href={buildHref(page + 1)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            scroll={false}
          >
            Next →
          </Link>
        ) : (
          <span className="rounded-lg border border-slate-100 px-3 py-1.5 text-sm text-slate-400">Next →</span>
        )}
      </div>
    </div>
  );
}
