"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  adminFilterBtnClass,
  adminFilterInputClass,
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
  formDarkButtonClass,
  formErrorBoxClass,
  formHintClass,
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
  deleteCategoryAction,
  saveCategoryFromForm,
  updateCategoryFromForm,
} from "./actions";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
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

export function CategoriesClient() {
  const [list, setList] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editingRow, setEditingRow] = useState<CategoryRow | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterQ, setFilterQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    const t = filterQ.trim().toLowerCase();
    if (!t) return list;
    return list.filter(
      (row) =>
        row.name.toLowerCase().includes(t) ||
        row.slug.toLowerCase().includes(t) ||
        (row.description || "").toLowerCase().includes(t),
    );
  }, [list, filterQ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const pageRows = useMemo(() => {
    const p = Math.min(page, totalPages);
    const start = (p - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [filterQ]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/backoffice/categories", { credentials: "include" });
      if (res.status === 401) {
        window.location.href = "/backoffice/login";
        return;
      }
      const data = (await res.json()) as { categories?: CategoryRow[]; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Load failed");
        return;
      }
      setList(data.categories ?? []);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openAdd() {
    setEditingRow(null);
    setEditSlug("");
    setName("");
    setDescription("");
    setFormError(null);
    setShowAdd((v) => !v);
    setSaveOk(null);
  }

  function openEdit(row: CategoryRow) {
    setShowAdd(false);
    setEditingRow(row);
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
    setFormError(null);
  }

  async function onSubmitAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setSaveOk(null);
    const n = name.trim();
    if (!n) {
      setFormError("Name is required");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData(e.currentTarget);
      fd.set("name", n);
      fd.set("description", description.trim());
      const result = await saveCategoryFromForm(fd);
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
      await load();
    } catch {
      setFormError("Save failed — please try again");
    } finally {
      setSaving(false);
    }
  }

  async function onSubmitEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingRow) return;
    setFormError(null);
    setSaveOk(null);
    const n = name.trim();
    if (!n) {
      setFormError("Name is required");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData(e.currentTarget);
      fd.set("id", editingRow.id);
      fd.set("name", n);
      fd.set("description", description.trim());
      fd.set("slug", editSlug.trim());
      const result = await updateCategoryFromForm(fd);
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
      await load();
    } catch {
      setFormError("Update failed — please try again");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(row: CategoryRow) {
    if (
      !window.confirm(
        `"${row.name}" delete? This will be permanently removed from the MongoDB categories collection.`,
      )
    ) {
      return;
    }
    setError(null);
    setDeletingId(row.id);
    try {
      const fd = new FormData();
      fd.set("id", row.id);
      const result = await deleteCategoryAction(fd);
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
      await load();
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Category</h1>
          <p className="mt-1 text-sm text-slate-600">Add, edit, delete — all stored in MongoDB categories.</p>
        </div>
        <button type="button" onClick={openAdd} className={formPrimaryButtonClass}>
          {showAdd ? "Close" : "+ Add category"}
        </button>
      </div>

      {showAdd ? (
        <form onSubmit={onSubmitAdd} className={formPageCardClass}>
          <h2 className="text-lg font-bold text-slate-900">New category</h2>
          <div className="mt-6 max-w-xl space-y-5">
            <div>
              <label htmlFor="cat-name" className={formLabelClass}>
                Name <span className="text-red-600">*</span>
              </label>
              <input
                id="cat-name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={formInputClass}
                placeholder="e.g. Breaking, Local, Sports"
                autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor="cat-desc" className={formLabelClass}>
                Description (optional)
              </label>
              <textarea
                id="cat-desc"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className={formInputClass}
                placeholder="Chhota sa description..."
              />
            </div>
            {formError ? (
              <p className={formErrorBoxClass} role="alert">
                {formError}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={saving} className={formDarkButtonClass}>
                {saving ? "Saving…" : "Save category"}
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
          <h2 className="text-lg font-bold text-slate-900">Category edit</h2>
          <input type="hidden" name="id" value={editingRow.id} />
          <div className="mt-6 max-w-xl space-y-5">
            <div>
              <label htmlFor="edit-name" className={formLabelClass}>
                Name <span className="text-red-600">*</span>
              </label>
              <input
                id="edit-name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={formInputClass}
                autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor="edit-slug" className={formLabelClass}>
                Slug (URL)
              </label>
              <input
                id="edit-slug"
                name="slug"
                value={editSlug}
                onChange={(e) => setEditSlug(e.target.value)}
                className={formInputMonoClass}
                placeholder="e.g. local-news"
              />
              <p className={formHintClass}>Leave empty to generate the slug from the name.</p>
            </div>
            <div>
              <label htmlFor="edit-desc" className={formLabelClass}>
                Description (optional)
              </label>
              <textarea
                id="edit-desc"
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
                {saving ? "Saving…" : "Update category"}
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
              {filterQ.trim() ? ` · ${list.length} total` : ""}
            </p>
          ) : null
        }
      >
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-end">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Search</span>
            <input
              type="search"
              value={filterQ}
              onChange={(e) => setFilterQ(e.target.value)}
              placeholder="Naam, slug, description…"
              className={`${adminFilterInputClass} min-w-[12rem] sm:min-w-[16rem]`}
            />
          </label>
          <button type="button" className={adminFilterBtnClass} onClick={() => setFilterQ("")}>
            Clear
          </button>
        </div>
      </AdminTableToolbar>

      <AdminTableFrame>
        <table className={`${adminTableClass} min-w-[720px]`}>
          <thead>
            <AdminTableHeadRow>
              <AdminTh>#</AdminTh>
              <AdminTh>Name</AdminTh>
              <AdminTh>Slug</AdminTh>
              <AdminTh>Description</AdminTh>
              <AdminTh>Created</AdminTh>
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
                  No categories yet — use &quot;Add category&quot; above.
                </td>
              </AdminTr>
            ) : pageRows.length === 0 ? (
              <AdminTr>
                <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                  No matches for this search — clear the filter.
                </td>
              </AdminTr>
            ) : (
              pageRows.map((row, i) => (
                <AdminTr key={row.id}>
                  <AdminTd className="tabular-nums text-slate-500" nowrap>
                    {(page - 1) * pageSize + i + 1}
                  </AdminTd>
                  <AdminTd className="font-medium text-slate-900">{row.name}</AdminTd>
                  <AdminTd className="font-mono text-xs text-violet-800">{row.slug}</AdminTd>
                  <AdminTd className="max-w-xs truncate text-slate-600" title={row.description}>
                    {row.description || "—"}
                  </AdminTd>
                  <AdminTd className="text-slate-500" nowrap>
                    {formatDate(row.createdAt)}
                  </AdminTd>
                  <AdminTd className="text-right">
                    <div className="flex flex-wrap items-center justify-end gap-2">
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
