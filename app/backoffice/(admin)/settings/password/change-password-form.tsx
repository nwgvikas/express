"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  formDarkButtonClass,
  formInputClass,
  formLabelClass,
  formPageCardClass,
  formPageDescClass,
  formPageTitleClass,
  formStackTightClass,
} from "@/helper/form-ui";
import { changePasswordAction } from "../actions";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      const fd = new FormData();
      fd.set("currentPassword", currentPassword);
      fd.set("newPassword", newPassword);
      fd.set("confirmPassword", confirmPassword);
      const res = await changePasswordAction(fd);
      if (!res.ok) {
        if (res.error === "Please sign in") {
          window.location.href = "/backoffice/login";
          return;
        }
        toast.error(res.error);
        return;
      }
      toast.success(res.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={`mx-auto max-w-md ${formPageCardClass}`}>
      <h1 className={formPageTitleClass}>Change password</h1>
      <p className={formPageDescClass}>New password: at least 8 characters.</p>

      <form onSubmit={onSubmit} className={formStackTightClass}>
        <div>
          <label htmlFor="current-password" className={formLabelClass}>
            Current password <span className="text-red-600">*</span>
          </label>
          <input
            id="current-password"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={formInputClass}
          />
        </div>
        <div>
          <label htmlFor="new-password" className={formLabelClass}>
            New password <span className="text-red-600">*</span>
          </label>
          <input
            id="new-password"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={formInputClass}
          />
        </div>
        <div>
          <label htmlFor="confirm-password" className={formLabelClass}>
            Confirm new password <span className="text-red-600">*</span>
          </label>
          <input
            id="confirm-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={formInputClass}
          />
        </div>
        <button type="submit" disabled={pending} className={`w-full ${formDarkButtonClass} sm:w-auto`}>
          {pending ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
