import Link from "next/link";
import { getAdminSocialSettings } from "@/helper/admin-settings-service";
import { SocialLinksForm } from "./social-links-form";

export const dynamic = "force-dynamic";

export const metadata = { title: "Social links | Admin" };

export default async function SocialLinksSettingsPage() {
  const initial = await getAdminSocialSettings();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/backoffice/dashboard"
          className="text-sm font-medium text-violet-700 underline-offset-4 hover:underline"
        >
          ← Dashboard
        </Link>
        <span className="text-zinc-300">|</span>
        <Link
          href="/backoffice/settings/general"
          className="text-sm font-medium text-violet-700 underline-offset-4 hover:underline"
        >
          General settings
        </Link>
      </div>
      <SocialLinksForm initial={initial} />
    </div>
  );
}
