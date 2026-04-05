"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  formDarkButtonClass,
  formErrorBoxClass,
  formInputClass,
  formInputMonoClass,
  formLabelClass,
  formPageCardClass,
  formPageCardHighlightClass,
  formPrimaryButtonClass,
  formSecondaryButtonClass,
  formSuccessBoxClass,
} from "@/helper/form-ui";
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
import {
  deleteSubcategoryAction,
  saveSubcategoryFromForm,
  updateSubcategoryFromForm,
} from "./actions";

type ParentCat = { id: string; name: string; slug: string };

type SubRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  createdAt?: string;
};

function formatDate(iso: string | undefined) {
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

export function SubcategoriesClient() {
  const [parents, setParents] = useState<ParentCat[]>([]);
  const [list, setList] = useState<SubRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editingRow, setEditingRow] = useState<SubRow | null>(null);
  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterQ, setFilterQ] = useState("");
  const [parentFilter, setParentFilter] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    let rows = list;
    if (parentFilter) {
      rows = rows.filter((r) => r.categoryId === parentFilter);
    }
    const t = filterQ.trim().toLowerCase();
    if (!t) return rows;
    return rows.filter(
      (row) =>
        row.name.toLowerCase().includes(t) ||
        row.slug.toLowerCase().includes(t) ||
        (row.description || "").toLowerCase().includes(t) ||
        row.categoryName.toLowerCase().includes(t),
    );
  }, [list, filterQ, parentFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const pageRows = useMemo(() => {
    const p = Math.min(page, totalPages);
    const start = (p - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [filterQ, parentFilter]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const loadParents = useCallback(async () => {
    try {
      const res = await fetch("/api/backoffice/categories", { credentials: "include" });
      if (!res.ok) return;
      const data = (await res.json()) as {
        categories?: { id: string; name: string; slug: string }[];
      };
      setParents(
        (data.categories ?? []).map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
        })),
      );
    } catch {
      /* ignore */
    }
  }, []);

  const loadSubs = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/backoffice/subcategories", { credentials: "include" });
      if (res.status === 401) {
        window.location.href = "/backoffice/login";
        return;
      }
      const data = (await res.json()) as { subcategories?: SubRow[]; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Load failed");
        return;
      }
      setList(data.subcategories ?? []);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAll = useCallback(async () => {
    await loadParents();
    await loadSubs();
  }, [loadParents, loadSubs]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  function openAdd() {
    setEditingRow(null);
    setEditSlug("");
    setName("");
    setDescription("");
    setCategoryId(parents[0]?.id ?? "");
    setFormError(null);
    setShowAdd((v) => !v);
    setSaveOk(null);
  }

  function openEdit(row: SubRow) {
    setShowAdd(false);
    setEditingRow(row);
    setCategoryId(row.categoryId);
    setName(row.name);
    setDescription(row.description);
    setEditSlug(row.slug);
    setFormError(null);
    setSaveOk(null);
  }

  function closeEdit() {
    setEditingRow(null);
    setName("");
    setDescription("");
    setEditSlug("");
    setCategoryId("");
    setFormError(null);
  }

  async function onSubmitAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setSaveOk(null);
    if (!categoryId) {
      setFormError("Select a parent category");
      return;
    }
    const n = name.trim();
    if (!n) {
      setFormError("Name is required");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData(e.currentTarget);
      fd.set("categoryId", categoryId);
      fd.set("name", n);
      fd.set("description", description.trim());
      const result = await saveSubcategoryFromForm(fd);
      if (!result.ok) {
        if (result.error === "Please sign in") {
          window.location.href = "/backoffice/login";
          return;
        }
        setFormError(result.error);
        return;
      }
      setName("");
      setDescription("");
      setShowAdd(false);
      setSaveOk(result.message);
      setTimeout(() => setSaveOk(null), 4000);
      await loadSubs();
    } catch {
      setFormError("Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onSubmitEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingRow) return;
    setFormError(null);
    setSaveOk(null);
    if (!categoryId) {
      setFormError("Select a parent category");
      return;
    }
    const n = name.trim();
    if (!n) {
      setFormError("Name is required");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData(e.currentTarget);
      fd.set("id", editingRow.id);
      fd.set("categoryId", categoryId);
      fd.set("name", n);
      fd.set("description", description.trim());
      fd.set("slug", editSlug.trim());
      const result = await updateSubcategoryFromForm(fd);
      if (!result.ok) {
        if (result.error === "Please sign in") {
          window.location.href = "/backoffice/login";
          return;
        }
        setFormError(result.error);
        return;
      }
      closeEdit();
      setSaveOk(result.message);
      setTimeout(() => setSaveOk(null), 4000);
      await loadSubs();
    } catch {
      setFormError("Update fail");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(row: SubRow) {
    if (!window.confirm(`"${row.name}" delete?`)) return;
    setError(null);
    setDeletingId(row.id);
    try {
      const fd = new FormData();
      fd.set("id", row.id);
      const result = await deleteSubcategoryAction(fd);
      if (!result.ok) {
        if (result.error === "Please sign in") {
          window.location.href = "/backoffice/login";
          return;
        }
        setError(result.error);
        return;
      }
      if (editingRow?.id === row.id) closeEdit();
      setSaveOk(result.message);
      setTimeout(() => setSaveOk(null), 4000);
      await loadSubs();
    } catch {
      setError("Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Sub category</h1>
          <p className="mt-1 text-sm text-slate-600">
            Each subcategory belongs under a parent <strong>Category</strong>.
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          disabled={parents.length === 0}
          className={`${formPrimaryButtonClass} disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {showAdd ? "Close" : "+ Add sub category"}
        </button>
      </div>

      {parents.length === 0 ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          First add at least one category on the{" "}
          <Link href="/backoffice/categories" className="font-semibold underline underline-offset-2">
            Category
          </Link>{" "}
          page, then you can add subcategories here.
        </p>
      ) : null}

      {showAdd && parents.length > 0 ? (
        <form onSubmit={onSubmitAdd} className={formPageCardClass}>
          <h2 className="text-lg font-bold text-slate-900">New subcategory</h2>
          <div className="mt-6 max-w-xl space-y-5">
            <div>
              <label htmlFor="sub-parent" className={formLabelClass}>
                Parent category <span className="text-red-600">*</span>
              </label>
              <select
                id="sub-parent"
                name="categoryId"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={formInputClass}
                required
              >
                {parents.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="sub-name" className={formLabelClass}>
                Subcategory name <span className="text-red-600">*</span>
              </label>
              <input
                id="sub-name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={formInputClass}
                placeholder="e.g. City, District"
                autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor="sub-desc" className={formLabelClass}>
                Description (optional)
              </label>
              <textarea
                id="sub-desc"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className={formInputClass}
              />
            </div>
            {formError ? (
              <p className={formErrorBoxClass} role="alert">
                {formError}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={saving} className={formDarkButtonClass}>
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAdd(false);
                  setFormError(null);
                }}
                className={formSecondaryButtonClass}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      ) : null}

      {editingRow ? (
        <form onSubmit={onSubmitEdit} className={formPageCardHighlightClass}>
          <h2 className="text-lg font-bold text-slate-900">Sub category edit</h2>
          <input type="hidden" name="id" value={editingRow.id} />
          <div className="mt-6 max-w-xl space-y-5">
            <div>
              <label htmlFor="edit-sub-parent" className={formLabelClass}>
                Parent category <span className="text-red-600">*</span>
              </label>
              <select
                id="edit-sub-parent"
                name="categoryId"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={formInputClass}
                required
              >
                {parents.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="edit-sub-name" className={formLabelClass}>
                Name <span className="text-red-600">*</span>
              </label>
              <input
                id="edit-sub-name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={formInputClass}
              />
            </div>
            <div>
              <label htmlFor="edit-sub-slug" className={formLabelClass}>
                Slug
              </label>
              <input
                id="edit-sub-slug"
                name="slug"
                value={editSlug}
                onChange={(e) => setEditSlug(e.target.value)}
                className={formInputMonoClass}
              />
            </div>
            <div>
              <label htmlFor="edit-sub-desc" className={formLabelClass}>
                Description
              </label>
              <textarea
                id="edit-sub-desc"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className={formInputClass}
              />
            </div>
            {formError ? (
              <p className={formErrorBoxClass} role="alert">
                {formError}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={saving} className={formPrimaryButtonClass}>
                {saving ? "Saving…" : "Update"}
              </button>
              <button type="button" onClick={closeEdit} className={formSecondaryButtonClass}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      ) : null}

      {saveOk ? (
        <p className={formSuccessBoxClass} role="status">
          {saveOk}
        </p>
      ) : null}

      {error ? <p className={formErrorBoxClass}>{error}</p> : null}

      <AdminTableToolbar
        left={
          !loading && list.length > 0 ? (
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-800">{filtered.length}</span> match
              {filterQ.trim() || parentFilter ? ` · ${list.length} total` : ""}
            </p>
          ) : null
        }
      >
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Parent category</span>
            <select
              value={parentFilter}
              onChange={(e) => setParentFilter(e.target.value)}
              className={adminFilterSelectClass}
            >
              <option value="">All parents</option>
              {parents.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Search</span>
            <input
              type="search"
              value={filterQ}
              onChange={(e) => setFilterQ(e.target.value)}
              placeholder="Sub naam, slug, parent…"
              className={`${adminFilterInputClass} min-w-[12rem] sm:min-w-[16rem]`}
            />
          </label>
          <button
            type="button"
            className={adminFilterBtnClass}
            onClick={() => {
              setFilterQ("");
              setParentFilter("");
            }}
          >
            Clear
          </button>
        </div>
      </AdminTableToolbar>

      <AdminTableFrame>
        <table className={`${adminTableClass} min-w-[800px]`}>
          <thead>
            <AdminTableHeadRow>
              <AdminTh>#</AdminTh>
              <AdminTh>Parent</AdminTh>
              <AdminTh>Sub category</AdminTh>
              <AdminTh>Slug</AdminTh>
              <AdminTh>Description</AdminTh>
              <AdminTh>Created</AdminTh>
              <AdminTh align="right">Actions</AdminTh>
            </AdminTableHeadRow>
          </thead>
          <tbody>
            {loading ? (
              <AdminTr>
                <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                  Loading…
                </td>
              </AdminTr>
            ) : list.length === 0 ? (
              <AdminTr>
                <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                  No subcategories — create a parent category first, then add here.
                </td>
              </AdminTr>
            ) : pageRows.length === 0 ? (
              <AdminTr>
                <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                  No matches for this filter.
                </td>
              </AdminTr>
            ) : (
              pageRows.map((row, i) => (
                <AdminTr key={row.id}>
                  <AdminTd className="tabular-nums text-slate-500" nowrap>
                    {(page - 1) * pageSize + i + 1}
                  </AdminTd>
                  <AdminTd className="text-slate-800">{row.categoryName}</AdminTd>
                  <AdminTd className="font-medium text-slate-900">{row.name}</AdminTd>
                  <AdminTd className="font-mono text-xs text-violet-800">{row.slug}</AdminTd>
                  <AdminTd className="max-w-[200px] truncate text-slate-600" title={row.description}>
                    {row.description || "—"}
                  </AdminTd>
                  <AdminTd className="text-slate-500" nowrap>
                    {formatDate(row.createdAt)}
                  </AdminTd>
                  <AdminTd className="text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-violet-200 hover:bg-violet-50/50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={deletingId === row.id}
                        onClick={() => void onDelete(row)}
                        className="rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-700 shadow-sm transition hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === row.id ? "…" : "Delete"}
                      </button>
                    </div>
                  </AdminTd>
                </AdminTr>
              ))
            )}
          </tbody>
        </table>
        {!loading && list.length > 0 ? (
          <AdminPaginationClient
            page={Math.min(page, totalPages)}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        ) : null}
      </AdminTableFrame>
    </div>
  );
}
