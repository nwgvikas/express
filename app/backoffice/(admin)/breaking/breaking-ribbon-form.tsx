"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { AdminBreakingRibbonSettings } from "@/helper/admin-settings-service";
import {
  formDangerGradientButtonClass,
  formHintClass,
  formInputClass,
  formLabelClass,
  formPageCardClass,
  formPageDescClass,
  formPageTitleClass,
  formStackClass,
} from "@/helper/form-ui";
import { saveBreakingRibbonAction } from "../settings/actions";

export function BreakingRibbonForm({ initial }: { initial: AdminBreakingRibbonSettings }) {
  const router = useRouter();
  const [breakingLabel, setBreakingLabel] = useState(initial.breakingLabel);
  const [breakingRibbonText, setBreakingRibbonText] = useState(initial.breakingRibbonText);
  const [breakingRibbonUrl, setBreakingRibbonUrl] = useState(initial.breakingRibbonUrl);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setBreakingLabel(initial.breakingLabel);
    setBreakingRibbonText(initial.breakingRibbonText);
    setBreakingRibbonUrl(initial.breakingRibbonUrl);
  }, [initial.breakingLabel, initial.breakingRibbonText, initial.breakingRibbonUrl]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      const res = await saveBreakingRibbonAction({
        breakingLabel: breakingLabel.trim(),
        breakingRibbonText: breakingRibbonText.trim(),
        breakingRibbonUrl: breakingRibbonUrl.trim(),
      });
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
    <div className="mx-auto max-w-2xl space-y-8">
      <div className={formPageCardClass}>
        <h1 className={formPageTitleClass}>Breaking ribbon</h1>
        <p className={formPageDescClass}>
          Red strip above the home landing — stored in the <span className="font-medium">database</span> (
          <span className="font-mono text-xs text-slate-500">admin_settings</span>).
        </p>

        <form onSubmit={onSubmit} className={formStackClass}>
          <div>
            <label htmlFor="breaking-label" className={formLabelClass}>
              Badge label
            </label>
            <input
              id="breaking-label"
              type="text"
              value={breakingLabel}
              onChange={(e) => setBreakingLabel(e.target.value)}
              className={formInputClass}
              placeholder="BREAKING"
              maxLength={48}
            />
            <p className={formHintClass}>Short label in any language (e.g. LIVE, FLASH).</p>
          </div>

          <div>
            <label htmlFor="breaking-custom-line" className={formLabelClass}>
              Custom headline <span className="font-normal text-slate-500">(optional)</span>
            </label>
            <textarea
              id="breaking-custom-line"
              rows={3}
              value={breakingRibbonText}
              onChange={(e) => setBreakingRibbonText(e.target.value)}
              className={formInputClass}
              placeholder="Leave empty: use a post with Breaking on, otherwise the first feed item."
              maxLength={500}
            />
            <p className={formHintClass}>
              If you enter text here, this line is shown and post-based breaking is skipped.
            </p>
          </div>

          <div>
            <label htmlFor="breaking-custom-url" className={formLabelClass}>
              Custom link <span className="font-normal text-slate-500">(optional)</span>
            </label>
            <input
              id="breaking-custom-url"
              type="text"
              inputMode="url"
              autoComplete="off"
              value={breakingRibbonUrl}
              onChange={(e) => setBreakingRibbonUrl(e.target.value)}
              className={formInputClass}
              placeholder="/news/your-slug or https://…"
            />
            <p className={formHintClass}>
              Clickable link with a custom headline. Empty = text only, no link.
            </p>
          </div>

          <button type="submit" disabled={pending} className={formDangerGradientButtonClass}>
            {pending ? "Saving…" : "Save breaking ribbon"}
          </button>
        </form>
      </div>
    </div>
  );
}
