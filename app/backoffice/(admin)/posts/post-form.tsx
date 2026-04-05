"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  formActionsRowClass,
  formCheckboxGroupClass,
  formDarkButtonClass,
  formErrorBoxClass,
  formFileInputClass,
  formHintClass,
  formInputClass,
  formInputMonoClass,
  formLabelClass,
  formNestedPanelClass,
  formPageCardClass,
  formPageDescClass,
  formPageTitleClass,
  formPrimaryButtonClass,
  formRadioCardClass,
  formSecondaryButtonClass,
  formStackTightClass,
} from "@/helper/form-ui";
import {
  createPostFromForm as defaultCreatePostFromForm,
  updatePostFromForm as defaultUpdatePostFromForm,
  type SavePostState,
} from "./actions";
import { PostContentEditor } from "./post-content-editor";

/** DB / server ke `PostLifecycleStatus` ke saath match. */
export type PostFormLifecycleStatus = "draft" | "pending" | "published";

type Opt = { id: string; name: string };
type SubOpt = Opt & { categoryId: string };

export type AuthorUserOption = {
  id: string;
  name: string;
  email: string;
};

export type PostFormInitial = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: PostFormLifecycleStatus;
  categoryId: string;
  subcategoryId: string;
  mediaType: "image" | "youtube";
  imageUrl: string;
  youtubeUrl: string;
  isTrending: boolean;
  isBreaking: boolean;
  /** Backoffice edit — creator assign. */
  authorId?: string;
};

export function PostForm({
  categories,
  subcategories,
  mode = "create",
  postId,
  initial,
  createPostFromForm = defaultCreatePostFromForm,
  updatePostFromForm = defaultUpdatePostFromForm,
  afterSaveRedirectHref = "/backoffice/posts",
  cancelHref = "/backoffice/posts",
  loginRedirectHref = "/backoffice/login",
  showTrendingBreaking = true,
  /** Backoffice: member users dropdown; `undefined` = hide (site member form). */
  authorUsers,
  /** Site `/my-posts` — no direct publish; draft or admin approval queue only. */
  memberApprovalFlow = false,
}: {
  categories: Opt[];
  subcategories: SubOpt[];
  mode?: "create" | "edit";
  postId?: string;
  initial?: PostFormInitial;
  createPostFromForm?: (fd: FormData) => Promise<SavePostState>;
  updatePostFromForm?: (fd: FormData) => Promise<SavePostState>;
  afterSaveRedirectHref?: string;
  cancelHref?: string;
  loginRedirectHref?: string;
  showTrendingBreaking?: boolean;
  authorUsers?: AuthorUserOption[];
  memberApprovalFlow?: boolean;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [status, setStatus] = useState<PostFormLifecycleStatus>(() => {
    const s = initial?.status ?? "draft";
    if (memberApprovalFlow && s === "published") return "pending";
    return s;
  });
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [subcategoryId, setSubcategoryId] = useState(initial?.subcategoryId ?? "");
  const [mediaType, setMediaType] = useState<"image" | "youtube">(
    initial?.mediaType ?? "image",
  );
  const [imageUrlText, setImageUrlText] = useState(initial?.imageUrl ?? "");
  const [youtubeUrl, setYoutubeUrl] = useState(initial?.youtubeUrl ?? "");
  const [isTrending, setIsTrending] = useState(initial?.isTrending ?? false);
  const [isBreaking, setIsBreaking] = useState(initial?.isBreaking ?? false);
  const [postAuthorId, setPostAuthorId] = useState(initial?.authorId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const fileBlobRef = useRef<string | null>(null);
  const [fileBlobPreview, setFileBlobPreview] = useState<string | null>(null);

  function revokeBlobUrl(url: string | null) {
    if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
  }

  function onImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    revokeBlobUrl(fileBlobRef.current);
    fileBlobRef.current = file ? URL.createObjectURL(file) : null;
    setFileBlobPreview(fileBlobRef.current);
  }

  useEffect(() => {
    return () => revokeBlobUrl(fileBlobRef.current);
  }, []);

  useEffect(() => {
    if (authorUsers !== undefined) {
      setPostAuthorId(initial?.authorId ?? "");
    }
  }, [authorUsers, initial?.authorId, mode, postId]);

  useEffect(() => {
    const s = initial?.status ?? "draft";
    setStatus(memberApprovalFlow && s === "published" ? "pending" : s);
  }, [memberApprovalFlow, initial?.status, postId, mode]);

  useEffect(() => {
    if (mediaType !== "image") {
      revokeBlobUrl(fileBlobRef.current);
      fileBlobRef.current = null;
      setFileBlobPreview(null);
    }
  }, [mediaType]);

  const urlImagePreview = useMemo(() => {
    const t = imageUrlText.trim();
    if (!t) return null;
    if (t.startsWith("http://") || t.startsWith("https://") || t.startsWith("/")) {
      return t;
    }
    return null;
  }, [imageUrlText]);

  const imagePreviewSrc = fileBlobPreview ?? urlImagePreview;

  const editorKey = `${mode}-${postId ?? "new"}`;

  const filteredSubs = useMemo(() => {
    if (!categoryId) return [];
    return subcategories.filter((s) => s.categoryId === categoryId);
  }, [subcategories, categoryId]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const fd = new FormData(e.currentTarget);
      fd.set("title", title.trim());
      fd.set("slug", slug.trim());
      fd.set("excerpt", excerpt.trim());
      fd.set("content", content);
      fd.set("status", status);
      fd.set("categoryId", categoryId);
      fd.set("subcategoryId", subcategoryId);
      fd.set("mediaType", mediaType);
      fd.set("imageUrl", imageUrlText.trim());
      fd.set("youtubeUrl", youtubeUrl.trim());
      fd.set("isTrending", showTrendingBreaking && isTrending ? "1" : "0");
      fd.set("isBreaking", showTrendingBreaking && isBreaking ? "1" : "0");
      if (mode === "edit" && postId) {
        fd.set("postId", postId);
      }
      if (authorUsers !== undefined) {
        fd.set("authorId", postAuthorId.trim());
      }

      const res =
        mode === "edit" && postId
          ? await updatePostFromForm(fd)
          : await createPostFromForm(fd);

      if (!res.ok) {
        if (res.error === "Please sign in") {
          window.location.href = loginRedirectHref;
          return;
        }
        toast.error(res.error);
        setError(res.error);
        return;
      }
      toast.success(res.message);
      router.push(afterSaveRedirectHref);
      router.refresh();
    } catch {
      toast.error("Save failed — please try again");
      setError("Save failed — please try again");
    } finally {
      setPending(false);
    }
  }

  const isEdit = mode === "edit";

  return (
    <div className={formPageCardClass}>
      <h1 className={formPageTitleClass}>{isEdit ? "Post edit" : "New post"}</h1>
      <p className={formPageDescClass}>
        {isEdit
          ? "Save your changes — a toast confirms on the list."
          : "Title, slug (optional), body — after save you return to the list."}
      </p>

      <form
        onSubmit={onSubmit}
        encType="multipart/form-data"
        noValidate
        className={`${formStackTightClass} max-w-3xl`}
      >
        {isEdit && postId ? <input type="hidden" name="postId" value={postId} /> : null}
        <input type="hidden" name="content" value={content} />
        <input
          type="hidden"
          name="isTrending"
          value={showTrendingBreaking && isTrending ? "1" : "0"}
        />
        <input
          type="hidden"
          name="isBreaking"
          value={showTrendingBreaking && isBreaking ? "1" : "0"}
        />
        <div>
          <label htmlFor="post-title" className={formLabelClass}>
            Title <span className="text-red-600">*</span>
          </label>
          <input
            id="post-title"
            name="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={formInputClass}
            placeholder="Headline"
          />
        </div>

        <div>
          <label htmlFor="post-slug" className={formLabelClass}>
            Slug (optional)
          </label>
          <input
            id="post-slug"
            name="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className={formInputMonoClass}
            placeholder="auto — from title if left empty"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="post-cat" className={formLabelClass}>
              Category
            </label>
            <select
              id="post-cat"
              name="categoryId"
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setSubcategoryId("");
              }}
              className={formInputClass}
            >
              <option value="">— select —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="post-sub" className={formLabelClass}>
              Sub category
            </label>
            <select
              id="post-sub"
              name="subcategoryId"
              value={subcategoryId}
              onChange={(e) => setSubcategoryId(e.target.value)}
              className={formInputClass}
              disabled={!categoryId}
            >
              <option value="">
                {!categoryId
                  ? "— select a category first —"
                  : filteredSubs.length === 0
                    ? "— no subcategories in this category —"
                    : "— optional —"}
              </option>
              {filteredSubs.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {authorUsers !== undefined ? (
          <div>
            <label htmlFor="post-author" className={formLabelClass}>
              Creator (member user)
            </label>
            <select
              id="post-author"
              name="authorId"
              value={postAuthorId}
              onChange={(e) => setPostAuthorId(e.target.value)}
              className={formInputClass}
            >
              <option value="">— none assigned —</option>
              {authorUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {(u.name || u.email) + (u.name?.trim() ? ` · ${u.email}` : "")}
                </option>
              ))}
            </select>
            <p className={formHintClass}>
              The selected member can view and edit this post under &quot;My posts&quot; on the site (only
              accounts with role: user).
            </p>
          </div>
        ) : null}

        <fieldset className="space-y-3">
          <legend className={formLabelClass}>Type</legend>
          <p className="text-xs text-slate-500">Image: file or URL. YouTube: video link.</p>
          <div className="flex flex-wrap gap-3">
            <label className={formRadioCardClass}>
              <input
                type="radio"
                name="mediaType"
                value="image"
                checked={mediaType === "image"}
                onChange={() => setMediaType("image")}
                className="h-4 w-4 border-slate-300 text-violet-600 focus:ring-violet-500"
              />
              <span className="text-sm font-semibold text-slate-800">Image</span>
            </label>
            <label className={formRadioCardClass}>
              <input
                type="radio"
                name="mediaType"
                value="youtube"
                checked={mediaType === "youtube"}
                onChange={() => setMediaType("youtube")}
                className="h-4 w-4 border-slate-300 text-violet-600 focus:ring-violet-500"
              />
              <span className="text-sm font-semibold text-slate-800">YouTube URL</span>
            </label>
          </div>
        </fieldset>

        {mediaType === "image" ? (
          <div className={`${formNestedPanelClass} bg-slate-50/50`}>
            <div>
              <label htmlFor="post-image-file" className={formLabelClass}>
                Image upload
              </label>
              <input
                id="post-image-file"
                name="imageFile"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={onImageFileChange}
                className={formFileInputClass}
              />
              <p className={formHintClass}>
                JPEG, PNG, WebP, GIF — max 5MB. A new upload replaces the URL.
              </p>
            </div>
            <div>
              <label htmlFor="post-image-url" className={formLabelClass}>
                Or image URL
              </label>
              <input
                id="post-image-url"
                name="imageUrl"
                type="text"
                inputMode="url"
                autoComplete="off"
                value={imageUrlText}
                onChange={(e) => setImageUrlText(e.target.value)}
                className={formInputClass}
                placeholder="https://…"
              />
            </div>
            {imagePreviewSrc ? (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-800">Preview</p>
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
                  <img
                    src={imagePreviewSrc}
                    alt="Image preview"
                    className="mx-auto max-h-64 w-full max-w-lg object-contain"
                  />
                </div>
                <p className={formHintClass}>
                  {fileBlobPreview
                    ? "New file — this upload is used when you save."
                    : "URL / saved path se preview."}
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          <div>
            <label htmlFor="post-youtube-url" className={formLabelClass}>
              YouTube URL <span className="text-red-600">*</span>
            </label>
            <input
              id="post-youtube-url"
              name="youtubeUrl"
              type="text"
              inputMode="url"
              autoComplete="off"
              required={mediaType === "youtube"}
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className={formInputClass}
              placeholder="https://www.youtube.com/watch?v=… or youtu.be/…"
            />
          </div>
        )}

        <div>
          <label htmlFor="post-excerpt" className={formLabelClass}>
            Excerpt
          </label>
          <textarea
            id="post-excerpt"
            name="excerpt"
            rows={2}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className={formInputClass}
            placeholder="Short summary (list / SEO)"
          />
        </div>

        <div>
          <label htmlFor="post-content" className={formLabelClass}>
            Content
          </label>
          <PostContentEditor key={editorKey} value={content} onChange={setContent} />
        </div>

        <div
          className={
            showTrendingBreaking ? "grid gap-5 sm:grid-cols-2 sm:items-end" : "max-w-md"
          }
        >
          <div>
            <label htmlFor="post-status" className={formLabelClass}>
              Status
            </label>
            <select
              id="post-status"
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as PostFormLifecycleStatus)}
              className={formInputClass}
            >
              {memberApprovalFlow ? (
                <>
                  <option value="draft">Draft — not on the site yet</option>
                  <option value="pending">Submit for admin approval to publish</option>
                </>
              ) : (
                <>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending (approval)</option>
                  <option value="published">Published</option>
                </>
              )}
            </select>
            {memberApprovalFlow ? (
              <p className={`${formHintClass} mt-1.5`}>
                The post appears on the site after an admin sets it to Published. If you edit a live post and
                save, you can move it to draft or send it back for approval using the status you choose.
              </p>
            ) : null}
          </div>
          {showTrendingBreaking ? (
            <div className={formCheckboxGroupClass}>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={isTrending}
                  onChange={(e) => setIsTrending(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                />
                <span>
                  <span className="block text-sm font-semibold text-slate-800">Trending</span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    Highlight on the homepage / trending tab.
                  </span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 border-t border-slate-200/80 pt-3">
                <input
                  type="checkbox"
                  checked={isBreaking}
                  onChange={(e) => setIsBreaking(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                />
                <span>
                  <span className="block text-sm font-semibold text-slate-800">
                    Breaking (homepage strip)
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    The published post title appears on the BREAKING bar (most recently updated).
                  </span>
                </span>
              </label>
            </div>
          ) : null}
        </div>

        {error ? (
          <p className={formErrorBoxClass} role="alert">
            {error}
          </p>
        ) : null}

        <div className={formActionsRowClass}>
          <button type="submit" disabled={pending} className={formDarkButtonClass}>
            {pending ? "Saving…" : isEdit ? "Update post" : "Save post"}
          </button>
          <Link href={cancelHref} className={formSecondaryButtonClass}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
