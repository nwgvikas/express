"use client";

import { useState } from "react";
import {
  formErrorBoxClass,
  formLabelClass,
  formLoginInputClass,
  formPrimaryButtonClass,
} from "@/helper/form-ui";

export function AdminLoginForm({
  defaultEmail = "",
}: {
  defaultEmail?: string;
}) {
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/backoffice/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Login fail.");
        return;
      }
      window.location.assign("/backoffice/dashboard");
    } catch {
      setError("Network error.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div>
        <label htmlFor="admin-email" className={formLabelClass}>
          Email
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={formLoginInputClass}
        />
      </div>
      <div>
        <label htmlFor="admin-password" className={formLabelClass}>
          Password
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={formLoginInputClass}
        />
      </div>
      {error ? (
        <p className={formErrorBoxClass} role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className={`${formPrimaryButtonClass} mt-1 w-full disabled:cursor-not-allowed`}
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
