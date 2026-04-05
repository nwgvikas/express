"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { AdminGeneralSettings } from "@/helper/admin-settings-service";
import {
  formDarkButtonClass,
  formFileInputClass,
  formHintClass,
  formInputClass,
  formLabelClass,
  formNestedPanelClass,
  formPageCardClass,
  formPageDescClass,
  formPageTitleClass,
  formSectionBoxClass,
  formSectionTitleClass,
  formTextareaClass,
} from "@/helper/form-ui";
import { saveGeneralSettingsAction } from "../actions";

function revokeBlob(url: string | null) {
  if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
}

function urlPreviewSrc(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  if (t.startsWith("http://") || t.startsWith("https://") || t.startsWith("/")) return t;
  if (t.startsWith("//")) return `https:${t}`;
  return null;
}

function ImagePreviewBlock({
  src,
  alt,
  emptyHint,
  imgClassName,
  minHeightClass = "min-h-[140px]",
}: {
  src: string | null;
  alt: string;
  emptyHint: string;
  imgClassName: string;
  minHeightClass?: string;
}) {
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setBroken(false);
  }, [src]);

  return (
    <div className={formNestedPanelClass}>
      <p className={formSectionTitleClass}>Image preview</p>
      <div
        className={`mt-3 flex items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-200 bg-slate-50/80 p-4 ${minHeightClass}`}
      >
        {src && !broken ? (
          <img src={src} alt={alt} className={imgClassName} onError={() => setBroken(true)} />
        ) : (
          <p className="max-w-[14rem] text-center text-sm text-slate-400">
            {broken ? "Image failed to load — check the URL or file." : emptyHint}
          </p>
        )}
      </div>
    </div>
  );
}

function AuthToggle({
  id,
  label,
  hint,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200/90 bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100/80">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        <p className="mt-0.5 text-xs text-slate-500">{hint}</p>
      </div>
      <label htmlFor={id} className="flex shrink-0 cursor-pointer items-center gap-3">
        <span
          className={`text-xs font-bold tabular-nums ${checked ? "text-violet-700" : "text-slate-400"}`}
        >
          {checked ? "On" : "Off"}
        </span>
        <div className="relative h-7 w-12 shrink-0">
          <input
            id={id}
            type="checkbox"
            role="switch"
            aria-checked={checked}
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="peer sr-only"
          />
          <div className="absolute inset-0 rounded-full bg-slate-300 transition-colors peer-checked:bg-violet-600 peer-focus-visible:ring-2 peer-focus-visible:ring-violet-400 peer-focus-visible:ring-offset-2" />
          <div className="pointer-events-none absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-200 ease-out peer-checked:translate-x-5" />
        </div>
      </label>
    </div>
  );
}

export function GeneralSettingsForm({ initial }: { initial: AdminGeneralSettings }) {
  const router = useRouter();
  const [siteName, setSiteName] = useState(initial.siteName);
  const [tagline, setTagline] = useState(initial.tagline);
  const [logoUrlText, setLogoUrlText] = useState(initial.logoUrl);
  const [faviconUrlText, setFaviconUrlText] = useState(initial.faviconUrl);
  const [loginEnabled, setLoginEnabled] = useState(initial.loginEnabled);
  const [registerEnabled, setRegisterEnabled] = useState(initial.registerEnabled);
  const [registerOffMessage, setRegisterOffMessage] = useState(initial.registerOffMessage);
  const [pending, setPending] = useState(false);

  const logoBlobRef = useRef<string | null>(null);
  const [logoFilePreview, setLogoFilePreview] = useState<string | null>(null);
  const favBlobRef = useRef<string | null>(null);
  const [favFilePreview, setFavFilePreview] = useState<string | null>(null);

  function onLogoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    revokeBlob(logoBlobRef.current);
    logoBlobRef.current = file ? URL.createObjectURL(file) : null;
    setLogoFilePreview(logoBlobRef.current);
  }

  function onFaviconFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    revokeBlob(favBlobRef.current);
    favBlobRef.current = file ? URL.createObjectURL(file) : null;
    setFavFilePreview(favBlobRef.current);
  }

  useEffect(() => {
    return () => {
      revokeBlob(logoBlobRef.current);
      revokeBlob(favBlobRef.current);
    };
  }, []);

  const logoPreviewSrc = logoFilePreview ?? urlPreviewSrc(logoUrlText);
  const favPreviewSrc = favFilePreview ?? urlPreviewSrc(faviconUrlText);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      const fd = new FormData(e.currentTarget);
      fd.set("siteName", siteName.trim());
      fd.set("tagline", tagline.trim());
      fd.set("logoUrl", logoUrlText.trim());
      fd.set("faviconUrl", faviconUrlText.trim());
      fd.set("loginEnabled", loginEnabled ? "1" : "0");
      fd.set("registerEnabled", registerEnabled ? "1" : "0");
      fd.set("registerOffMessage", registerOffMessage.trim());
      const res = await saveGeneralSettingsAction(fd);
      if (!res.ok) {
        if (res.error === "Please sign in") {
          window.location.href = "/backoffice/login";
          return;
        }
        toast.error(res.error);
        return;
      }
      toast.success(res.message);
      revokeBlob(logoBlobRef.current);
      logoBlobRef.current = null;
      setLogoFilePreview(null);
      revokeBlob(favBlobRef.current);
      favBlobRef.current = null;
      setFavFilePreview(null);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className={formPageCardClass}>
        <h1 className={formPageTitleClass}>General settings</h1>
        <p className={formPageDescClass}>
          Site branding, logo, favicon, and public login / register switches.
        </p>

        <form onSubmit={onSubmit} encType="multipart/form-data" noValidate className="mt-8 space-y-8">
          <section className="space-y-4">
            <h2 className={formSectionTitleClass}>Site</h2>
            <div>
              <label htmlFor="site-name" className={formLabelClass}>
                Site name <span className="text-red-600">*</span>
              </label>
              <input
                id="site-name"
                name="siteName"
                required
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className={formInputClass}
                placeholder="Unnao Express"
              />
            </div>
            <div>
              <label htmlFor="site-tagline" className={formLabelClass}>
                Tagline
              </label>
              <textarea
                id="site-tagline"
                name="tagline"
                rows={2}
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className={formTextareaClass}
                placeholder="Chhoti line — header / meta"
              />
            </div>
          </section>

          <section className={formSectionBoxClass}>
            <h2 className={formSectionTitleClass}>Website logo</h2>
            <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
              <div className="space-y-4">
                <div>
                  <label htmlFor="logo-file" className={formLabelClass}>
                    Upload
                  </label>
                  <input
                    id="logo-file"
                    name="logoFile"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={onLogoFileChange}
                    className={formFileInputClass}
                  />
                  <p className={formHintClass}>
                    JPEG, PNG, WebP, GIF — max 2MB. Upload URL ko replace karega.
                  </p>
                </div>
                <div>
                  <label htmlFor="logo-url" className={formLabelClass}>
                    Ya logo URL
                  </label>
                  <input
                    id="logo-url"
                    name="logoUrl"
                    type="text"
                    inputMode="url"
                    autoComplete="off"
                    value={logoUrlText}
                    onChange={(e) => setLogoUrlText(e.target.value)}
                    className={formInputClass}
                    placeholder="https://… or /uploads/…"
                  />
                </div>
              </div>
              <ImagePreviewBlock
                src={logoPreviewSrc}
                alt="Logo preview"
                emptyHint="Logo preview — pick a file above or enter a URL (https://… or /path)."
                imgClassName="max-h-40 w-full max-w-sm object-contain"
                minHeightClass="min-h-[160px]"
              />
            </div>
          </section>

          <section className={formSectionBoxClass}>
            <h2 className={formSectionTitleClass}>Favicon</h2>
            <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
              <div className="space-y-4">
                <div>
                  <label htmlFor="favicon-file" className={formLabelClass}>
                    Upload
                  </label>
                  <input
                    id="favicon-file"
                    name="faviconFile"
                    type="file"
                    accept=".ico,.png,.svg,.webp,image/x-icon,image/png,image/svg+xml,image/webp"
                    onChange={onFaviconFileChange}
                    className={formFileInputClass}
                  />
                  <p className={formHintClass}>PNG, ICO, SVG, WebP — max 512KB.</p>
                </div>
                <div>
                  <label htmlFor="favicon-url" className={formLabelClass}>
                    Ya favicon URL
                  </label>
                  <input
                    id="favicon-url"
                    name="faviconUrl"
                    type="text"
                    inputMode="url"
                    autoComplete="off"
                    value={faviconUrlText}
                    onChange={(e) => setFaviconUrlText(e.target.value)}
                    className={formInputClass}
                    placeholder="/favicon.ico or https://…"
                  />
                </div>
              </div>
              <ImagePreviewBlock
                src={favPreviewSrc}
                alt="Favicon preview"
                emptyHint="Favicon preview — small icon file or URL."
                imgClassName="h-16 w-16 object-contain sm:h-20 sm:w-20"
                minHeightClass="min-h-[120px]"
              />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className={formSectionTitleClass}>Public login / register</h2>
            <p className="text-xs text-slate-500">
              These flags are saved in the DB — the storefront / register page can read them for the UI.
            </p>
            <AuthToggle
              id="toggle-login"
              label="Login"
              hint="When off, public sign-in is disabled (wired to your app flow)."
              checked={loginEnabled}
              onChange={setLoginEnabled}
            />
            <AuthToggle
              id="toggle-register"
              label="Register"
              hint="Naye user sign-up on / off."
              checked={registerEnabled}
              onChange={setRegisterEnabled}
            />
            <div>
              <label htmlFor="register-off-msg" className={formLabelClass}>
                Message when registration is off
              </label>
              <textarea
                id="register-off-msg"
                name="registerOffMessage"
                rows={3}
                value={registerOffMessage}
                onChange={(e) => setRegisterOffMessage(e.target.value)}
                className={formTextareaClass}
                placeholder="Shown to users when registration is off."
              />
              <p className={formHintClass}>
                When registration is <span className="font-medium">Off</span>, showing this message is
                recommended; you can still use it whenever you like.
              </p>
            </div>
          </section>

          <button type="submit" disabled={pending} className={formDarkButtonClass}>
            {pending ? "Saving…" : "Save settings"}
          </button>
        </form>
      </div>
    </div>
  );
}
