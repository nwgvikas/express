import Link from "next/link";
import { getAdminBreakingRibbonSettings } from "@/helper/admin-settings-service";
import { BreakingRibbonForm } from "./breaking-ribbon-form";

export const dynamic = "force-dynamic";

export const metadata = { title: "Breaking ribbon | Admin" };

export default async function BreakingPage() {
  const initial = await getAdminBreakingRibbonSettings();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/backoffice/dashboard"
          className="text-sm font-medium text-violet-700 underline-offset-4 hover:underline"
        >
          ← Dashboard
        </Link>
      </div>
      <BreakingRibbonForm initial={initial} />
    </div>
  );
}
