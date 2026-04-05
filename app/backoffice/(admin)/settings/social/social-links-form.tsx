"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { AdminSocialSettings } from "@/helper/admin-settings-service";
import {
  formDarkButtonClass,
  formHintClass,
  formInputClass,
  formLabelClass,
  formPageCardClass,
  formPageDescClass,
  formPageTitleClass,
  formStackClass,
} from "@/helper/form-ui";
import { saveSocialLinksAction } from "../actions";

export function SocialLinksForm({ initial }: { initial: AdminSocialSettings }) {
  const router = useRouter();
  const [socialFacebookUrl, setSocialFacebookUrl] = useState(initial.socialFacebookUrl);
  const [socialInstagramUrl, setSocialInstagramUrl] = useState(initial.socialInstagramUrl);
  const [socialXUrl, setSocialXUrl] = useState(initial.socialXUrl);
  const [socialYoutubeUrl, setSocialYoutubeUrl] = useState(initial.socialYoutubeUrl);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setSocialFacebookUrl(initial.socialFacebookUrl);
    setSocialInstagramUrl(initial.socialInstagramUrl);
    setSocialXUrl(initial.socialXUrl);
    setSocialYoutubeUrl(initial.socialYoutubeUrl);
  }, [
    initial.socialFacebookUrl,
    initial.socialInstagramUrl,
    initial.socialXUrl,
    initial.socialYoutubeUrl,
  ]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      const res = await saveSocialLinksAction({
        socialFacebookUrl: socialFacebookUrl.trim(),
        socialInstagramUrl: socialInstagramUrl.trim(),
        socialXUrl: socialXUrl.trim(),
        socialYoutubeUrl: socialYoutubeUrl.trim(),
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
        <h1 className={formPageTitleClass}>Social links</h1>
        <p className={formPageDescClass}>
          &quot;Follow us on&quot; — left sidebar on the home page. Only filled-in links show icons. Saved in
          the <span className="font-mono text-xs text-slate-500">admin_settings</span> collection.
        </p>
        <p className={formHintClass}>
          The <span className="font-medium text-slate-700">https://</span> prefix is optional — it is added
          automatically when you save.
        </p>

        <form onSubmit={onSubmit} className={formStackClass}>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="social-facebook" className={formLabelClass}>
                Facebook
              </label>
              <input
                id="social-facebook"
                name="socialFacebookUrl"
                type="text"
                inputMode="url"
                autoComplete="off"
                value={socialFacebookUrl}
                onChange={(e) => setSocialFacebookUrl(e.target.value)}
                className={formInputClass}
                placeholder="https://facebook.com/…"
              />
            </div>
            <div>
              <label htmlFor="social-instagram" className={formLabelClass}>
                Instagram
              </label>
              <input
                id="social-instagram"
                name="socialInstagramUrl"
                type="text"
                inputMode="url"
                autoComplete="off"
                value={socialInstagramUrl}
                onChange={(e) => setSocialInstagramUrl(e.target.value)}
                className={formInputClass}
                placeholder="https://instagram.com/…"
              />
            </div>
            <div>
              <label htmlFor="social-x" className={formLabelClass}>
                X (Twitter)
              </label>
              <input
                id="social-x"
                name="socialXUrl"
                type="text"
                inputMode="url"
                autoComplete="off"
                value={socialXUrl}
                onChange={(e) => setSocialXUrl(e.target.value)}
                className={formInputClass}
                placeholder="https://x.com/…"
              />
            </div>
            <div>
              <label htmlFor="social-youtube" className={formLabelClass}>
                YouTube
              </label>
              <input
                id="social-youtube"
                name="socialYoutubeUrl"
                type="text"
                inputMode="url"
                autoComplete="off"
                value={socialYoutubeUrl}
                onChange={(e) => setSocialYoutubeUrl(e.target.value)}
                className={formInputClass}
                placeholder="https://youtube.com/@…"
              />
            </div>
          </div>

          <button type="submit" disabled={pending} className={formDarkButtonClass}>
            {pending ? "Saving…" : "Save social links"}
          </button>
        </form>
      </div>
    </div>
  );
}
