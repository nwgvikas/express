"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deletePostAction } from "./actions";

export function PostRowActions({ postId, title }: { postId: string; title: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onDelete() {
    const short = title.length > 56 ? `${title.slice(0, 56)}…` : title;
    if (!window.confirm(`“${short}” delete? This cannot be undone.`)) {
      return;
    }
    setPending(true);
    try {
      const res = await deletePostAction(postId);
      if (!res.ok) {
        if (res.error === "Please sign in") {
          window.location.href = "/backoffice/login";
          return;
        }
        toast.error(res.error);
        return;
      }
      toast.success(res.message);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/backoffice/posts/${postId}/edit`}
        className="inline-flex rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-800 transition hover:bg-violet-100"
      >
        Edit
      </Link>
      <button
        type="button"
        disabled={pending}
        onClick={onDelete}
        className="inline-flex rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-800 transition hover:bg-red-100 disabled:opacity-50"
      >
        {pending ? "…" : "Delete"}
      </button>
    </div>
  );
}
