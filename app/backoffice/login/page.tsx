import Link from "next/link";
import { getDefaultAdminEmail } from "@/helper/default-admin-seed";
import { formPageCardClass } from "@/helper/form-ui";
import { AdminLoginForm } from "./admin-login-form";

export const metadata = {
  title: "Admin login | Backoffice",
};

export default function BackofficeLoginPage() {
  const defaultEmail = getDefaultAdminEmail();
  return (
    <div className="flex min-h-dvh flex-1">
      <div className="relative hidden w-[42%] min-w-[min(100%,20rem)] flex-col justify-between overflow-hidden bg-gradient-to-br from-violet-600 via-indigo-600 to-indigo-800 p-10 text-white lg:flex xl:p-12">
        <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.06%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-90" />
        <div className="relative">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-lg font-bold shadow-lg backdrop-blur-sm">
            U
          </div>
          <h2 className="mt-10 max-w-sm text-3xl font-bold leading-tight tracking-tight xl:text-4xl">
            Unnao Express Admin
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-indigo-100">
            Secure back office — manage content, categories, and the site from here.
          </p>
        </div>
        <p className="relative text-xs text-indigo-200/90">© {new Date().getFullYear()} Unnao Express</p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-8 sm:py-16">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 text-center lg:hidden">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-lg font-bold text-white shadow-lg shadow-violet-500/30">
              U
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-900">Unnao Express</p>
            <p className="text-xs text-slate-500">Admin sign in</p>
          </div>

          <div className={`${formPageCardClass} shadow-xl shadow-slate-200/50`}>
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">Backoffice</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem]">
              Sign in
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              MongoDB{" "}
              <code className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-800">
                users
              </code>{" "}
              collection,{" "}
              <span className="font-medium text-slate-800">role: admin</span>.
            </p>
            <div className="mt-8">
              <AdminLoginForm defaultEmail={defaultEmail} />
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-slate-500">
            <Link
              href="/"
              className="font-medium text-violet-700 underline-offset-4 transition hover:text-violet-800 hover:underline"
            >
              ← Back to site
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
