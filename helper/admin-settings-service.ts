import { connectDB } from "@/helper/db";
import { AdminSettings } from "@/models/admin-settings";

export type AdminGeneralSettings = {
  siteName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  loginEnabled: boolean;
  registerEnabled: boolean;
  registerOffMessage: string;
  socialFacebookUrl: string;
  socialInstagramUrl: string;
  socialXUrl: string;
  socialYoutubeUrl: string;
  breakingLabel: string;
  breakingRibbonText: string;
  breakingRibbonUrl: string;
  termsContent: string;
  privacyContent: string;
};

/** Optional URL — empty string allowed. */
export function normalizeOutboundUrl(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  if (t.startsWith("//")) return `https:${t}`;
  return `https://${t}`;
}

export async function getAdminGeneralSettings(): Promise<AdminGeneralSettings> {
  await connectDB();
  let doc = await AdminSettings.findOne().sort({ createdAt: 1 }).lean();
  if (!doc) {
    const row = await AdminSettings.create({});
    doc = row.toObject();
  }
  const d = doc as {
    siteName?: string;
    tagline?: string;
    logoUrl?: string;
    faviconUrl?: string;
    loginEnabled?: boolean;
    registerEnabled?: boolean;
    registerOffMessage?: string;
    socialFacebookUrl?: string;
    socialInstagramUrl?: string;
    socialXUrl?: string;
    socialYoutubeUrl?: string;
    breakingLabel?: string;
    breakingRibbonText?: string;
    breakingRibbonUrl?: string;
    termsContent?: string;
    privacyContent?: string;
  };
  return {
    siteName: d.siteName || "Unnao Express",
    tagline: d.tagline || "",
    logoUrl: d.logoUrl || "",
    faviconUrl: d.faviconUrl || "",
    loginEnabled: d.loginEnabled !== false,
    registerEnabled: d.registerEnabled !== false,
    registerOffMessage: d.registerOffMessage || "",
    socialFacebookUrl: d.socialFacebookUrl || "",
    socialInstagramUrl: d.socialInstagramUrl || "",
    socialXUrl: d.socialXUrl || "",
    socialYoutubeUrl: d.socialYoutubeUrl || "",
    breakingLabel: d.breakingLabel || "BREAKING",
    breakingRibbonText: d.breakingRibbonText || "",
    breakingRibbonUrl: d.breakingRibbonUrl || "",
    termsContent: typeof d.termsContent === "string" ? d.termsContent : "",
    privacyContent: typeof d.privacyContent === "string" ? d.privacyContent : "",
  };
}

export type AdminBreakingRibbonSettings = {
  breakingLabel: string;
  breakingRibbonText: string;
  breakingRibbonUrl: string;
};

export async function getAdminBreakingRibbonSettings(): Promise<AdminBreakingRibbonSettings> {
  const s = await getAdminGeneralSettings();
  return {
    breakingLabel: s.breakingLabel,
    breakingRibbonText: s.breakingRibbonText,
    breakingRibbonUrl: s.breakingRibbonUrl,
  };
}

export async function saveAdminBreakingRibbonSettings(input: AdminBreakingRibbonSettings): Promise<void> {
  await connectDB();
  const payload = {
    breakingLabel: input.breakingLabel,
    breakingRibbonText: input.breakingRibbonText,
    breakingRibbonUrl: input.breakingRibbonUrl,
  };
  const one = await AdminSettings.findOne().sort({ createdAt: 1 }).select("_id").lean();
  if (one?._id) {
    const r = await AdminSettings.updateOne({ _id: one._id }, { $set: payload });
    if (r.matchedCount === 0) throw new Error("Admin settings row update failed");
    return;
  }
  await AdminSettings.create({
    siteName: "Unnao Express",
    ...payload,
  });
}

export type AdminSocialSettings = {
  socialFacebookUrl: string;
  socialInstagramUrl: string;
  socialXUrl: string;
  socialYoutubeUrl: string;
};

export async function getAdminSocialSettings(): Promise<AdminSocialSettings> {
  const s = await getAdminGeneralSettings();
  return {
    socialFacebookUrl: s.socialFacebookUrl,
    socialInstagramUrl: s.socialInstagramUrl,
    socialXUrl: s.socialXUrl,
    socialYoutubeUrl: s.socialYoutubeUrl,
  };
}

/** Sirf social URLs — baaki `admin_settings` fields same rehti. MongoDB par `$set` se seedha likha jata hai. */
export async function saveAdminSocialSettings(input: AdminSocialSettings): Promise<void> {
  await connectDB();
  const payload = {
    socialFacebookUrl: input.socialFacebookUrl,
    socialInstagramUrl: input.socialInstagramUrl,
    socialXUrl: input.socialXUrl,
    socialYoutubeUrl: input.socialYoutubeUrl,
  };
  const one = await AdminSettings.findOne().sort({ createdAt: 1 }).select("_id").lean();
  if (one?._id) {
    const r = await AdminSettings.updateOne({ _id: one._id }, { $set: payload });
    if (r.matchedCount === 0) {
      throw new Error("Admin settings row update failed");
    }
    return;
  }
  await AdminSettings.create({
    siteName: "Unnao Express",
    ...payload,
  });
}

export async function saveAdminGeneralSettings(input: {
  siteName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  loginEnabled: boolean;
  registerEnabled: boolean;
  registerOffMessage: string;
}): Promise<void> {
  await connectDB();
  const one = await AdminSettings.findOne().sort({ createdAt: 1 });
  const payload = {
    siteName: input.siteName,
    tagline: input.tagline,
    logoUrl: input.logoUrl,
    faviconUrl: input.faviconUrl,
    loginEnabled: input.loginEnabled,
    registerEnabled: input.registerEnabled,
    registerOffMessage: input.registerOffMessage,
  };
  if (one) {
    one.set(payload);
    await one.save();
    return;
  }
  await AdminSettings.create(payload);
}

/** Public storefront / auth pages ke liye (future use). */
export async function getPublicSiteAuthSettings(): Promise<{
  siteName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  loginEnabled: boolean;
  registerEnabled: boolean;
  registerOffMessage: string;
}> {
  const s = await getAdminGeneralSettings();
  return {
    siteName: s.siteName,
    tagline: s.tagline,
    logoUrl: s.logoUrl,
    faviconUrl: s.faviconUrl,
    loginEnabled: s.loginEnabled,
    registerEnabled: s.registerEnabled,
    registerOffMessage: s.registerOffMessage,
  };
}

export type PublicSocialLinks = {
  facebookUrl: string;
  instagramUrl: string;
  xUrl: string;
  youtubeUrl: string;
};

export async function getPublicSocialLinks(): Promise<PublicSocialLinks> {
  const s = await getAdminGeneralSettings();
  return {
    facebookUrl: s.socialFacebookUrl.trim(),
    instagramUrl: s.socialInstagramUrl.trim(),
    xUrl: s.socialXUrl.trim(),
    youtubeUrl: s.socialYoutubeUrl.trim(),
  };
}

const LEGAL_MAX_LEN = 120_000;

export type AdminLegalPagesSettings = {
  termsContent: string;
  privacyContent: string;
};

export async function saveAdminLegalPagesSettings(input: AdminLegalPagesSettings): Promise<void> {
  await connectDB();
  const termsContent = String(input.termsContent ?? "").slice(0, LEGAL_MAX_LEN);
  const privacyContent = String(input.privacyContent ?? "").slice(0, LEGAL_MAX_LEN);
  const payload = { termsContent, privacyContent };
  /** Hydrated document + `.save()` — `$set` ke saath kabhi-kabhi stale schema / lean mismatch se bachte. */
  const one = await AdminSettings.findOne().sort({ createdAt: 1 });
  if (one) {
    one.set(payload);
    await one.save();
    return;
  }
  await AdminSettings.create({
    siteName: "Unnao Express",
    ...payload,
  });
}
