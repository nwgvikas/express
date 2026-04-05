import mongoose, { Schema } from "mongoose";

/**
 * Singleton-style general options for admin / site branding.
 * Collection: `admin_settings`
 */
const AdminSettingsSchema = new Schema(
  {
    siteName: { type: String, trim: true, default: "Unnao Express" },
    tagline: { type: String, trim: true, default: "" },
    logoUrl: { type: String, trim: true, default: "" },
    faviconUrl: { type: String, trim: true, default: "" },
    loginEnabled: { type: Boolean, default: true },
    registerEnabled: { type: Boolean, default: true },
    registerOffMessage: { type: String, trim: true, default: "" },
    /** Public sidebar "Follow us" — khali = icon hide. */
    socialFacebookUrl: { type: String, trim: true, default: "" },
    socialInstagramUrl: { type: String, trim: true, default: "" },
    socialXUrl: { type: String, trim: true, default: "" },
    socialYoutubeUrl: { type: String, trim: true, default: "" },
    /** Landing top ribbon — badge text (e.g. BREAKING, ताज़ा). */
    breakingLabel: { type: String, trim: true, default: "BREAKING" },
    /** Khali ho to post `isBreaking` / feed fallback; bhara ho to yahi line dikhegi. */
    breakingRibbonText: { type: String, trim: true, default: "" },
    /** Custom line ke saath link — `/news/...` ya https:// */
    breakingRibbonUrl: { type: String, trim: true, default: "" },
    /** Public `/terms` — plain text / line breaks. */
    termsContent: { type: String, default: "" },
    /** Public `/privacy` — plain text / line breaks. */
    privacyContent: { type: String, default: "" },
  },
  { timestamps: true },
);

export const AdminSettings =
  mongoose.models.AdminSettings ||
  mongoose.model("AdminSettings", AdminSettingsSchema, "admin_settings");
