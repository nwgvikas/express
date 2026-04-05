"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { normalizeIndianMobile } from "@/helper/indian-mobile";
import {
  formActionsRowCompactClass,
  formDialogPanelClass,
  formErrorBoxClass,
  formInputClass,
  formLabelClass,
  formPrimaryButtonClass,
  formSecondaryButtonClass,
} from "@/helper/form-ui";

type Props = {
  registerEnabled: boolean;
  registerOffMessage: string;
};

export function JoinAsCreatorBlock({ registerEnabled, registerOffMessage }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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

  const reset = useCallback(() => {
    setName("");
    setEmail("");
    setMobile("");
    setPassword("");
    setConfirm("");
    setFormError(null);
  }, []);

  const onOpen = () => {
    if (!registerEnabled) {
      toast.message("Registration disabled", {
        description:
          registerOffMessage?.trim() ||
          "The admin has disabled new registrations. Try again later.",
      });
      return;
    }
    setFormError(null);
    setOpen(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const n = name.trim();
    const em = email.trim().toLowerCase();
    if (n.length < 2) {
      setFormError("Name must be at least 2 characters.");
      return;
    }
    if (!em || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      setFormError("Enter a valid email address.");
      return;
    }
    if (!normalizeIndianMobile(mobile)) {
      setFormError("Valid 10-digit mobile (starts with 6–9, +91 optional).");
      return;
    }
    if (password.length < 8) {
      setFormError("Password kam se kam 8 characters.");
      return;
    }
    if (password !== confirm) {
      setFormError("Password and confirmation do not match.");
      return;
    }

    setPending(true);
    try {
      const r = await fetch("/api/public/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: n, email: em, mobile, password }),
      });
      const j = (await r.json().catch(() => ({}))) as { error?: string; message?: string };
      if (!r.ok) {
        setFormError(j.error || "Registration failed.");
        return;
      }
      toast.success("Account created", {
        description: "Our team may share creator guidelines with you soon.",
      });
      reset();
      setOpen(false);
    } catch {
      setFormError("Network error — please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={onOpen}
        className="mt-4 inline-flex w-full cursor-pointer items-center justify-center rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-cyan-300"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        Join As Creator
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onClick={() => !pending && setOpen(false)}
        >
          <div
            className={`${formDialogPanelClass} max-w-lg`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="creator-register-title"
            onClick={(ev) => ev.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <h2 id="creator-register-title" className="text-lg font-bold text-slate-900">
                News Creator — register
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
              Create an account to join the creator programme — after guidelines review, our team will follow up.
            </p>

            <form onSubmit={onSubmit} className="mt-5 space-y-4">
              <div>
                <label htmlFor="creator-name" className={formLabelClass}>
                  Name <span className="text-red-600">*</span>
                </label>
                <input
                  id="creator-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={formInputClass}
                  placeholder="Your full name"
                  maxLength={120}
                  required
                />
              </div>
              <div>
                <label htmlFor="creator-email" className={formLabelClass}>
                  Email <span className="text-red-600">*</span>
                </label>
                <input
                  id="creator-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={formInputClass}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="creator-mobile" className={formLabelClass}>
                  Mobile number <span className="text-red-600">*</span>
                </label>
                <input
                  id="creator-mobile"
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
                <label htmlFor="creator-password" className={formLabelClass}>
                  Password <span className="text-red-600">*</span>
                </label>
                <input
                  id="creator-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={formInputClass}
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                />
              </div>
              <div>
                <label htmlFor="creator-confirm" className={formLabelClass}>
                  Confirm password <span className="text-red-600">*</span>
                </label>
                <input
                  id="creator-confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={formInputClass}
                  placeholder="Confirm password"
                  minLength={8}
                  required
                />
              </div>

              {formError ? <p className={formErrorBoxClass}>{formError}</p> : null}

              <div className={formActionsRowCompactClass}>
                <button type="submit" disabled={pending} className={formPrimaryButtonClass}>
                  {pending ? "Saving…" : "Register"}
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
