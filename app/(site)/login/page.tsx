import Link from "next/link";
import { redirect } from "next/navigation";
import { getPublicSiteAuthSettings } from "@/helper/admin-settings-service";
import { getSiteBrandingSafe } from "@/helper/site-branding";
import { getPublicSiteUser } from "@/helper/public-user-auth";
import { formPageCardClass } from "@/helper/form-ui";
import { UserLoginForm } from "./user-login-form";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const s = await getSiteBrandingSafe();
  return { title: `Sign in | ${s.siteName}` };
}

export default async function UserLoginPage() {
  const auth = await getPublicSiteAuthSettings();
  if (!auth.loginEnabled) {
    redirect("/");
  }

  const user = await getPublicSiteUser();
  if (user) {
    redirect("/");
  }

  const s = await getSiteBrandingSafe();

  return (
    <div className="bg-zinc-100 px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto w-full max-w-md">
        <Link href="/" className="text-sm font-medium text-blue-600 hover:text-blue-800">
          ← Home
        </Link>
        <div className={`mt-6 ${formPageCardClass}`}>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Member sign in</h1>
          <p className="mt-2 text-sm text-slate-600">
            Creator / member account — use the email and password you chose at registration.
          </p>
          <div className="mt-8">
            <UserLoginForm />
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-slate-500">
          {s.siteName} — need an account? Register via &quot;Join As Creator&quot; in the home sidebar.
        </p>
      </div>
    </div>
  );
}
