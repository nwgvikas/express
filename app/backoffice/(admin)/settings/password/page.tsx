import Link from "next/link";
import { ChangePasswordForm } from "./change-password-form";

export const metadata = { title: "Change password | Admin" };

export default function ChangePasswordPage() {
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
      <ChangePasswordForm />
    </div>
  );
}
