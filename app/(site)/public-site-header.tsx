import Link from "next/link";
import { getPublicSiteUser } from "@/helper/public-user-auth";
import { getSiteBrandingSafe } from "@/helper/site-branding";

function brandInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0][0] ?? "";
    const b = parts[1][0] ?? "";
    return (a + b).toUpperCase() || "UE";
  }
  const u = name.trim().toUpperCase();
  return u.slice(0, 2) || "UE";
}

export async function PublicSiteHeader() {
  const s = await getSiteBrandingSafe();
  const siteUser = await getPublicSiteUser();
  const initials = brandInitials(s.siteName);
  const locationLine =
    s.tagline?.trim() ||
    "201301 · Noida, Gautam Budh Nagar, Uttar Pradesh";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900 text-white shadow-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          {s.logoUrl ? (
            <img
              src={s.logoUrl}
              alt=""
              className="h-11 w-11 shrink-0 rounded-lg object-cover sm:h-12 sm:w-12"
            />
          ) : (
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-600 text-sm font-bold tracking-tight text-white sm:h-12 sm:w-12"
              aria-hidden
            >
              {initials}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-base font-bold tracking-wide sm:text-lg">
              {s.siteName.toUpperCase()}
            </p>
            <p className="truncate text-xs text-slate-400 sm:text-sm">{locationLine}</p>
          </div>
        </Link>

        <div className="flex w-full shrink-0 items-center justify-end gap-3 sm:w-auto">
          <label className="sr-only" htmlFor="site-lang">
            Select language
          </label>
          <select
            id="site-lang"
            name="lang"
            defaultValue="hi"
            className="max-w-[140px] rounded-lg border border-slate-600 bg-slate-800 px-2 py-2 text-xs text-slate-100 sm:text-sm"
          >
            <option value="hi">Hindi</option>
            <option value="en">English</option>
          </select>
          {s.loginEnabled ? (
            siteUser ? (
              <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
                <span className="max-w-[10rem] truncate text-sm text-slate-200 sm:max-w-[14rem]">
                  {siteUser.name?.trim() || siteUser.email}
                </span>
                <a
                  href="/api/public/logout"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-500 bg-slate-800 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Log out
                </a>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Sign in
              </Link>
            )
          ) : (
            <span className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-500">
              Sign in off
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
