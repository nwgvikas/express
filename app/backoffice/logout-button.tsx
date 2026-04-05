"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function logout() {
    setPending(true);
    try {
      await fetch("/api/backoffice/logout", { method: "POST" });
      router.push("/backoffice/login");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  const base =
    "inline-flex h-10 items-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-60";

  return (
    <button
      type="button"
      onClick={() => void logout()}
      disabled={pending}
      className={className ?? base}
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
