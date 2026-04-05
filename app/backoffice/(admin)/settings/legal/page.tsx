import { getAdminGeneralSettings } from "@/helper/admin-settings-service";
import { LegalPagesForm } from "./legal-pages-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Terms & Privacy | Settings",
};

export default async function LegalSettingsPage() {
  const settings = await getAdminGeneralSettings();
  return <LegalPagesForm initial={settings} />;
}
