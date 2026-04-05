"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { AdminLegalPagesSettings } from "@/helper/admin-settings-service";
import {
  formDarkButtonClass,
  formHintClass,
  formLabelClass,
  formPageCardClass,
  formPageDescClass,
  formPageTitleClass,
  formStackClass,
  formTextareaClass,
} from "@/helper/form-ui";
import { saveLegalPagesAction } from "../actions";

export function LegalPagesForm({ initial }: { initial: AdminLegalPagesSettings }) {
  const router = useRouter();
  const [termsContent, setTermsContent] = useState(initial.termsContent ?? "");
  const [privacyContent, setPrivacyContent] = useState(initial.privacyContent ?? "");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      const res = await saveLegalPagesAction({ termsContent, privacyContent });
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
    <div className="mx-auto max-w-3xl space-y-8">
      <div className={formPageCardClass}>
        <h1 className={formPageTitleClass}>Terms & Privacy</h1>
        <p className={formPageDescClass}>
          Text is saved in MongoDB <span className="font-mono text-xs text-slate-600">admin_settings</span> on
          the <span className="font-mono text-xs text-slate-600">termsContent</span> and{" "}
          <span className="font-mono text-xs text-slate-600">privacyContent</span> fields. Public URLs:{" "}
          <span className="font-mono text-xs text-slate-600">/terms</span>,{" "}
          <span className="font-mono text-xs text-slate-600">/privacy</span> — plain text with line breaks.
        </p>

        <form onSubmit={onSubmit} className={formStackClass}>
          <div>
            <label htmlFor="legal-terms" className={formLabelClass}>
              Terms & Conditions
            </label>
            <textarea
              id="legal-terms"
              name="termsContent"
              rows={14}
              value={termsContent}
              onChange={(e) => setTermsContent(e.target.value)}
              className={formTextareaClass}
              placeholder="Enter Terms & Conditions here…"
            />
            <p className={formHintClass}>Max ~120k characters. Plain text only — no HTML.</p>
          </div>
          <div>
            <label htmlFor="legal-privacy" className={formLabelClass}>
              Privacy Policy
            </label>
            <textarea
              id="legal-privacy"
              name="privacyContent"
              rows={14}
              value={privacyContent}
              onChange={(e) => setPrivacyContent(e.target.value)}
              className={formTextareaClass}
              placeholder="Enter Privacy Policy here…"
            />
            <p className={formHintClass}>Max ~120k characters. Plain text only — no HTML.</p>
          </div>
          <button type="submit" disabled={pending} className={formDarkButtonClass}>
            {pending ? "Saving…" : "Save Terms & Privacy"}
          </button>
        </form>
      </div>
    </div>
  );
}
