import Link from "next/link";
import { getAdminGeneralSettings } from "@/helper/admin-settings-service";
import { GeneralSettingsForm } from "./general-settings-form";

export const dynamic = "force-dynamic";

export const metadata = { title: "General settings | Admin" };

export default async function GeneralSettingsPage() {
  const settings = await getAdminGeneralSettings();

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
          href="/backoffice/settings/social"
          className="text-sm font-medium text-violet-700 underline-offset-4 hover:underline"
        >
          Social links
        </Link>
      </div>
      <GeneralSettingsForm initial={settings} />
    </div>
  );
}
