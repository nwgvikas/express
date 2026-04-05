"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import {
  normalizeOutboundUrl,
  saveAdminBreakingRibbonSettings,
  saveAdminGeneralSettings,
  saveAdminLegalPagesSettings,
  saveAdminSocialSettings,
} from "@/helper/admin-settings-service";
import { requireBackofficeSession } from "@/helper/backoffice-api-auth";
import { saveBrandingFile } from "@/helper/save-branding-file";
import { connectDB } from "@/helper/db";
import { User } from "@/models/user";

export type SettingsActionState =
  | { ok: true; message: string }
  | { ok: false; error: string };

export async function saveGeneralSettingsAction(formData: FormData): Promise<SettingsActionState> {
  const session = await requireBackofficeSession();
  if (!session) {
    return { ok: false, error: "Please sign in" };
  }

  const siteName = String(formData.get("siteName") ?? "").trim();
  const tagline = String(formData.get("tagline") ?? "").trim();
  if (!siteName) {
    return { ok: false, error: "Site name is required" };
  }

  let logoUrl = String(formData.get("logoUrl") ?? "").trim();
  const logoFile = formData.get("logoFile");
  if (logoFile instanceof File && logoFile.size > 0) {
    const saved = await saveBrandingFile(logoFile, "logo");
    if (!saved.ok) {
      return { ok: false, error: saved.error };
    }
    logoUrl = saved.publicPath;
  }

  let faviconUrl = String(formData.get("faviconUrl") ?? "").trim();
  const faviconFile = formData.get("faviconFile");
  if (faviconFile instanceof File && faviconFile.size > 0) {
    const saved = await saveBrandingFile(faviconFile, "favicon");
    if (!saved.ok) {
      return { ok: false, error: saved.error };
    }
    faviconUrl = saved.publicPath;
  }

  const loginEnabled = String(formData.get("loginEnabled") ?? "") === "1";
  const registerEnabled = String(formData.get("registerEnabled") ?? "") === "1";
  const registerOffMessage = String(formData.get("registerOffMessage") ?? "").trim();

  try {
    await saveAdminGeneralSettings({
      siteName,
      tagline,
      logoUrl,
      faviconUrl,
      loginEnabled,
      registerEnabled,
      registerOffMessage,
    });
    revalidatePath("/backoffice/settings/general");
    revalidatePath("/");
    return { ok: true, message: "General settings saved." };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Save failed — please try again." };
  }
}

export type SaveSocialLinksInput = {
  socialFacebookUrl: string;
  socialInstagramUrl: string;
  socialXUrl: string;
  socialYoutubeUrl: string;
};

/** Plain object from client — saved to DB `admin_settings` via `$set`. */
export type SaveBreakingRibbonInput = {
  breakingLabel: string;
  breakingRibbonText: string;
  breakingRibbonUrl: string;
};

export async function saveBreakingRibbonAction(data: SaveBreakingRibbonInput): Promise<SettingsActionState> {
  const session = await requireBackofficeSession();
  if (!session) {
    return { ok: false, error: "Please sign in" };
  }

  const breakingLabel = String(data.breakingLabel ?? "").trim().slice(0, 48) || "BREAKING";
  const breakingRibbonText = String(data.breakingRibbonText ?? "").trim().slice(0, 500);
  let breakingRibbonUrl = String(data.breakingRibbonUrl ?? "").trim().slice(0, 500);
  if (breakingRibbonUrl && !breakingRibbonUrl.startsWith("/")) {
    breakingRibbonUrl = normalizeOutboundUrl(breakingRibbonUrl);
  }

  try {
    await saveAdminBreakingRibbonSettings({
      breakingLabel,
      breakingRibbonText,
      breakingRibbonUrl,
    });
    revalidatePath("/backoffice/breaking");
    revalidatePath("/");
    return { ok: true, message: "Breaking ribbon saved — landing updated." };
  } catch (e) {
    console.error("saveBreakingRibbonAction:", e);
    return { ok: false, error: "Save failed — please try again." };
  }
}

export async function saveSocialLinksAction(data: SaveSocialLinksInput): Promise<SettingsActionState> {
  const session = await requireBackofficeSession();
  if (!session) {
    return { ok: false, error: "Please sign in" };
  }

  const socialFacebookUrl = normalizeOutboundUrl(String(data.socialFacebookUrl ?? ""));
  const socialInstagramUrl = normalizeOutboundUrl(String(data.socialInstagramUrl ?? ""));
  const socialXUrl = normalizeOutboundUrl(String(data.socialXUrl ?? ""));
  const socialYoutubeUrl = normalizeOutboundUrl(String(data.socialYoutubeUrl ?? ""));

  try {
    await saveAdminSocialSettings({
      socialFacebookUrl,
      socialInstagramUrl,
      socialXUrl,
      socialYoutubeUrl,
    });
    revalidatePath("/backoffice/settings/social");
    revalidatePath("/");
    return { ok: true, message: "Social links saved." };
  } catch (e) {
    console.error("saveSocialLinksAction:", e);
    return { ok: false, error: "Save failed — please try again." };
  }
}

export type SaveLegalPagesInput = {
  termsContent: string;
  privacyContent: string;
};

export async function saveLegalPagesAction(data: SaveLegalPagesInput): Promise<SettingsActionState> {
  const session = await requireBackofficeSession();
  if (!session) {
    return { ok: false, error: "Please sign in" };
  }

  try {
    await saveAdminLegalPagesSettings({
      termsContent: String(data.termsContent ?? ""),
      privacyContent: String(data.privacyContent ?? ""),
    });
    revalidatePath("/backoffice/settings/legal");
    revalidatePath("/terms", "page");
    revalidatePath("/privacy", "page");
    return { ok: true, message: "Terms & Privacy saved to MongoDB (admin_settings)." };
  } catch (e) {
    console.error("saveLegalPagesAction:", e);
    return { ok: false, error: "Save failed — please try again." };
  }
}

export async function changePasswordAction(formData: FormData): Promise<SettingsActionState> {
  const session = await requireBackofficeSession();
  if (!session) {
    return { ok: false, error: "Please sign in" };
  }

  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (!current || !next || !confirm) {
    return { ok: false, error: "Saari fields bharen." };
  }
  if (next !== confirm) {
    return { ok: false, error: "New passwords do not match." };
  }
  if (next.length < 8) {
    return { ok: false, error: "New password must be at least 8 characters." };
  }
  if (next === current) {
    return { ok: false, error: "New password must differ from the current password." };
  }

  try {
    await connectDB();
    const user = await User.findById(session.userId);
    if (!user || user.role !== "admin") {
      return { ok: false, error: "User not found." };
    }

    const stored = user.password as string;
    const match = await bcrypt.compare(current, stored);
    if (!match) {
      return { ok: false, error: "Current password is incorrect." };
    }

    user.password = await bcrypt.hash(next, 10);
    await user.save();
    revalidatePath("/backoffice/settings/password");
    return { ok: true, message: "Password changed." };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Update failed — please try again." };
  }
}
