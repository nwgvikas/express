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
import { listUsersForAdmin } from "@/helper/user-admin-service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Users | Admin",
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

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const sp = (await searchParams) ?? {};
  const q = firstString(sp.q);
  const page = Math.max(1, Number.parseInt(firstString(sp.page) || "1", 10) || 1);
  const limit = Math.min(100, Math.max(5, Number.parseInt(firstString(sp.limit) || "20", 10) || 20));

  const { rows, total, totalPages, page: curPage, limit: curLimit } = await listUsersForAdmin({
    page,
    limit,
    q: q || undefined,
  });

  function buildHref(nextPage: number) {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    p.set("limit", String(curLimit));
    p.set("page", String(nextPage));
    const qs = p.toString();
    return qs ? `/backoffice/users?${qs}` : "/backoffice/users";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Users</h1>
        <p className="mt-1 text-sm text-slate-600">
          Saare registered members aur admins — search by name, email, ya mobile.
        </p>
      </div>

      <AdminTableToolbar
        left={
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-800">{total}</span> users
          </p>
        }
      >
        <form method="get" action="/backoffice/users" className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <input type="hidden" name="page" value="1" />
          <AdminFilterField label="Search">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Name, email, mobile…"
              className={`${adminFilterInputClass} min-w-[12rem] sm:min-w-[16rem]`}
            />
          </AdminFilterField>
          <AdminFilterField label="Page size">
            <select name="limit" defaultValue={String(curLimit)} className={adminFilterSelectClass}>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </AdminFilterField>
          <button type="submit" className={adminFilterBtnClass}>
            Apply
          </button>
        </form>
      </AdminTableToolbar>

      <AdminTableFrame>
        <table className={`${adminTableClass} min-w-[720px]`}>
          <thead>
            <AdminTableHeadRow>
              <AdminTh>#</AdminTh>
              <AdminTh>Name</AdminTh>
              <AdminTh>Email</AdminTh>
              <AdminTh>Mobile</AdminTh>
              <AdminTh>Role</AdminTh>
              <AdminTh>Joined</AdminTh>
            </AdminTableHeadRow>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <AdminTr>
                <td colSpan={6} className="px-5 py-14 text-center text-sm text-slate-500">
                  {q ? "Koi user is search se match nahi karta." : "Abhi koi user nahi mila."}
                </td>
              </AdminTr>
            ) : (
              rows.map((row, i) => (
                <AdminTr key={row.id}>
                  <AdminTd className="tabular-nums text-slate-500" nowrap>
                    {(curPage - 1) * curLimit + i + 1}
                  </AdminTd>
                  <AdminTd className="max-w-[200px] font-medium text-slate-900" nowrap={false}>
                    <span className="line-clamp-2" title={row.name || "—"}>
                      {row.name || "—"}
                    </span>
                  </AdminTd>
                  <AdminTd className="max-w-[240px] text-sm text-slate-700" nowrap={false}>
                    <span className="line-clamp-2 break-all" title={row.email}>
                      {row.email}
                    </span>
                  </AdminTd>
                  <AdminTd className="font-mono text-sm text-slate-600" nowrap>
                    {row.mobile || "—"}
                  </AdminTd>
                  <AdminTd nowrap>
                    <span
                      className={`inline-flex rounded-lg px-2 py-0.5 text-xs font-semibold ${
                        row.role === "admin"
                          ? "bg-violet-100 text-violet-900 ring-1 ring-violet-200/80"
                          : "bg-slate-100 text-slate-800 ring-1 ring-slate-200/80"
                      }`}
                    >
                      {row.role}
                    </span>
                  </AdminTd>
                  <AdminTd className="text-slate-500" nowrap>
                    {formatDate(row.createdAt)}
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
