import { cache } from "react";
import type { AdminGeneralSettings } from "@/helper/admin-settings-service";
import { getAdminGeneralSettings } from "@/helper/admin-settings-service";

const FALLBACK: AdminGeneralSettings = {
  siteName: "Unnao Express",
  tagline: "",
  logoUrl: "",
  faviconUrl: "",
  loginEnabled: true,
  registerEnabled: true,
  registerOffMessage: "",
  socialFacebookUrl: "",
  socialInstagramUrl: "",
  socialXUrl: "",
  socialYoutubeUrl: "",
  breakingLabel: "BREAKING",
  breakingRibbonText: "",
  breakingRibbonUrl: "",
  termsContent: "",
  privacyContent: "",
};

/** Ek request mein ek hi DB read (layout + header + page). */
export const getSiteBrandingSafe = cache(async (): Promise<AdminGeneralSettings> => {
  try {
    return await getAdminGeneralSettings();
  } catch {
    return FALLBACK;
  }
});
