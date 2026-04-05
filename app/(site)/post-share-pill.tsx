"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

function IconShare({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <circle cx="18" cy="5" r="2.25" />
      <circle cx="6" cy="12" r="2.25" />
      <circle cx="18" cy="19" r="2.25" />
      <path strokeLinecap="round" d="M8.2 10.9L15.8 7M8.2 13.1l7.6 3.9" />
    </svg>
  );
}

function openCenteredPopup(url: string) {
  const w = 560;
  const h = 520;
  const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - w) / 2));
  const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - h) / 2));
  window.open(url, "share", `width=${w},height=${h},left=${left},top=${top},noopener,noreferrer`);
}

type Props = {
  title: string;
  articlePath: string;
  disabled?: boolean;
};

export function PostSharePill({ title, articlePath, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [fullUrl, setFullUrl] = useState("");

  const path = articlePath.startsWith("/") ? articlePath : `/${articlePath}`;

  const openModal = useCallback(() => {
    if (disabled) {
      toast.message("Demo post", {
        description: "Sharing is available on published posts.",
      });
      return;
    }
    setFullUrl(`${window.location.origin}${path}`);
    setOpen(true);
  }, [disabled, path]);

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

  const shareText = `${title}\n\n${fullUrl}`.trim();

  const shareFacebook = () => {
    if (!fullUrl) return;
    openCenteredPopup(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
    );
  };

  const shareX = () => {
    if (!fullUrl) return;
    const q = new URLSearchParams({
      text: title,
      url: fullUrl,
    });
    openCenteredPopup(`https://twitter.com/intent/tweet?${q.toString()}`);
  };

  const shareWhatsApp = () => {
    if (!fullUrl) return;
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const shareInstagram = async () => {
    if (!fullUrl) return;
    try {
      await navigator.clipboard.writeText(shareText);
      toast.success("Link copied", {
        description: "Open Instagram and paste into a story or post.",
      });
      window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Could not copy", {
        description: "Your browser may have blocked the clipboard — copy the link manually.",
      });
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-0 bg-gradient-to-br from-emerald-50 to-teal-50/80 px-3 py-2 text-sm font-semibold text-emerald-950 shadow-sm ring-1 ring-emerald-100/80 transition hover:from-emerald-100/90 hover:to-teal-100/70 hover:ring-emerald-200"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <IconShare className="h-5 w-5 shrink-0 text-emerald-600" />
        <span className="text-emerald-950">
          Shares <span className="tabular-nums text-emerald-800">0</span>
        </span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-zinc-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="share-dialog-title" className="text-lg font-bold text-zinc-900">
                  Share
                </h2>
                <p className="mt-1 line-clamp-2 text-sm text-zinc-600">{title}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800"
                aria-label="Close"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <ul className="mt-6 space-y-2">
              <li>
                <button
                  type="button"
                  onClick={shareFacebook}
                  className="flex w-full items-center gap-3 rounded-xl bg-[#1877F2] px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-[#166FE5]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/20 text-lg font-bold">
                    f
                  </span>
                  Share on Facebook
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={shareX}
                  className="flex w-full items-center gap-3 rounded-xl bg-zinc-900 px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-zinc-800"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 text-sm font-bold">
                    𝕏
                  </span>
                  Share on X (Twitter)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={shareWhatsApp}
                  className="flex w-full items-center gap-3 rounded-xl bg-[#25D366] px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-[#20BD5A]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/20 text-xs font-bold">
                    WA
                  </span>
                  Share on WhatsApp
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={shareInstagram}
                  className="flex w-full items-center gap-3 rounded-xl bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af] px-4 py-3 text-left text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/25 text-xs font-bold">
                    IG
                  </span>
                  Instagram — copy link and open app
                </button>
              </li>
            </ul>
            <p className="mt-4 text-center text-xs text-zinc-500">
              Instagram on the web does not support direct link sharing; the link is copied to your clipboard.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
