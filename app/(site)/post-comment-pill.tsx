"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { normalizeIndianMobile } from "@/helper/indian-mobile";
import {
  formActionsRowCompactClass,
  formDialogPanelClass,
  formInputClass,
  formLabelClass,
  formPrimaryButtonClass,
  formSecondaryButtonClass,
  formTextareaClass,
} from "@/helper/form-ui";

function IconChat({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}

type Props = {
  slug: string;
  isSample: boolean;
  initialCommentCount: number;
};

export function PostCommentPill({ slug, isSample, initialCommentCount }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(initialCommentCount);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setCount(initialCommentCount);
  }, [initialCommentCount]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const resetForm = useCallback(() => {
    setName("");
    setMobile("");
    setBody("");
  }, []);

  const openModal = useCallback(() => {
    if (isSample) {
      toast.message("Demo post", {
        description: "Comments are available on published posts.",
      });
      return;
    }
    setOpen(true);
  }, [isSample]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSample) return;
    const n = name.trim();
    const m = normalizeIndianMobile(mobile);
    const b = body.trim();
    if (n.length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }
    if (!m) {
      toast.error("Valid 10-digit mobile (starts with 6–9)");
      return;
    }
    if (b.length < 2) {
      toast.error("Comment must be at least 2 characters");
      return;
    }
    setPending(true);
    try {
      const r = await fetch("/api/public/post-comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, name: n, mobile, body: b }),
      });
      const j = (await r.json().catch(() => ({}))) as { error?: string; commentCount?: unknown };
      if (!r.ok) {
        toast.error(j.error || "Could not save");
        return;
      }
      const c = Number(j.commentCount);
      if (Number.isFinite(c) && c >= 0) {
        setCount(Math.floor(c));
      } else {
        setCount((x) => x + 1);
      }
      toast.success("Comment sent", {
        description: "It will appear on the site after admin approval.",
      });
      resetForm();
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Network error — please try again");
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-0 bg-gradient-to-br from-violet-50 to-indigo-50/80 px-3 py-2 text-sm font-semibold text-violet-950 shadow-sm ring-1 ring-violet-100/80 transition hover:from-violet-100/90 hover:to-indigo-100/70 hover:ring-violet-200"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <IconChat className="h-5 w-5 shrink-0 text-violet-600" />
        <span className="text-violet-950">
          Comments <span className="tabular-nums text-violet-800">{count}</span>
        </span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onClick={() => !pending && setOpen(false)}
        >
          <div
            className={formDialogPanelClass}
            role="dialog"
            aria-modal="true"
            aria-labelledby="comment-dialog-title"
            onClick={(ev) => ev.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <h2 id="comment-dialog-title" className="text-lg font-bold text-slate-900">
                Write a comment
              </h2>
              <button
                type="button"
                disabled={pending}
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
                aria-label="Close"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Your name, mobile, and comment are saved with this story (shown after moderation).
            </p>

            <form onSubmit={onSubmit} className="mt-5 space-y-4">
              <div>
                <label htmlFor={`cmt-name-${slug}`} className={formLabelClass}>
                  Name <span className="text-red-600">*</span>
                </label>
                <input
                  id={`cmt-name-${slug}`}
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={formInputClass}
                  placeholder="Your name"
                  maxLength={120}
                  required
                />
              </div>
              <div>
                <label htmlFor={`cmt-mobile-${slug}`} className={formLabelClass}>
                  Mobile number <span className="text-red-600">*</span>
                </label>
                <input
                  id={`cmt-mobile-${slug}`}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className={formInputClass}
                  placeholder="9876543210 or +91 9876543210"
                  maxLength={16}
                  required
                />
              </div>
              <div>
                <label htmlFor={`cmt-body-${slug}`} className={formLabelClass}>
                  Comment <span className="text-red-600">*</span>
                </label>
                <textarea
                  id={`cmt-body-${slug}`}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={4}
                  className={formTextareaClass}
                  placeholder="Share your thoughts here…"
                  maxLength={4000}
                  required
                />
              </div>
              <div className={formActionsRowCompactClass}>
                <button type="submit" disabled={pending} className={formPrimaryButtonClass}>
                  {pending ? "Saving…" : "Submit"}
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setOpen(false)}
                  className={formSecondaryButtonClass}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
