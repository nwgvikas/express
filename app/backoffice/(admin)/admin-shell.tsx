"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoutButton } from "../logout-button";
import { BackofficeToaster } from "./backoffice-toaster";

const nav = [
  { href: "/backoffice/dashboard", label: "Dashboard", icon: IconHome },
  { href: "/backoffice/categories", label: "Category", icon: IconFolder },
  { href: "/backoffice/subcategories", label: "Sub category", icon: IconLayers },
  { href: "/backoffice/posts", label: "Post list", icon: IconList },
  { href: "/backoffice/breaking", label: "Breaking", icon: IconBolt },
  { href: "/backoffice/comments", label: "Comments", icon: IconChat },
];

function IconHome({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}

function IconFolder({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
    </svg>
  );
}

function IconLayers({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.142 3.857L21.75 12l-10.179-6.75m-4.179 3.75-4.179-2.25m4.179 2.25 5.143 3.857m0 0 4.178-2.25m-4.178 2.25-4.179 3.75m4.179-3.75 4.179 2.25M6.429 14.25 2.25 16.5l4.179 2.25m0-4.5 5.142 3.857 10.179-6.75-10.179-6.75-5.142 3.857" />
    </svg>
  );
}

function IconList({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  );
}

function IconBolt({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 13.5 14.25 2.25 12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
      />
    </svg>
  );
}

function IconChat({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}

function IconSettings({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

function IconChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

function IconMenu({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function IconClose({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function IconExternal({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5a2.25 2.25 0 0 0 2.25-2.25V10.5M19.5 3v6m0 0h-6m6 0-9 9" />
    </svg>
  );
}

function pageHeading(pathname: string): string {
  if (pathname === "/backoffice/dashboard" || pathname.startsWith("/backoffice/dashboard/")) {
    return "Dashboard";
  }
  if (pathname === "/backoffice/categories" || pathname.startsWith("/backoffice/categories/")) {
    return "Category";
  }
  if (pathname === "/backoffice/subcategories" || pathname.startsWith("/backoffice/subcategories/")) {
    return "Sub category";
  }
  if (pathname === "/backoffice/posts" || pathname.startsWith("/backoffice/posts/")) {
    return "Post list";
  }
  if (pathname === "/backoffice/breaking" || pathname.startsWith("/backoffice/breaking/")) {
    return "Breaking";
  }
  if (pathname === "/backoffice/comments" || pathname.startsWith("/backoffice/comments/")) {
    return "Comments";
  }
  if (pathname.startsWith("/backoffice/settings/social")) {
    return "Social links";
  }
  if (pathname.startsWith("/backoffice/settings/general")) {
    return "General settings";
  }
  if (pathname.startsWith("/backoffice/settings/password")) {
    return "Change password";
  }
  if (pathname.startsWith("/backoffice/settings/legal")) {
    return "Terms & Privacy";
  }
  if (pathname.startsWith("/backoffice/settings")) {
    return "Settings";
  }
  return "Admin";
}

function userInitial(name: string, email: string): string {
  const t = name?.trim() || email || "?";
  return t.charAt(0).toUpperCase();
}

export function AdminShell({
  children,
  userEmail,
  userName,
}: {
  children: React.ReactNode;
  userEmail: string;
  userName: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(() =>
    pathname.startsWith("/backoffice/settings"),
  );

  useEffect(() => {
    if (pathname.startsWith("/backoffice/settings")) {
      setSettingsOpen(true);
    }
  }, [pathname]);

  const settingsActive = pathname.startsWith("/backoffice/settings");
  const settingsLinks = [
    { href: "/backoffice/settings/general", label: "General settings" },
    { href: "/backoffice/settings/social", label: "Social links" },
    { href: "/backoffice/settings/legal", label: "Terms & Privacy" },
    { href: "/backoffice/settings/password", label: "Change password" },
  ] as const;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const id = window.requestAnimationFrame(() => {
      document.body.style.overflow = "hidden";
    });
    return () => {
      cancelAnimationFrame(id);
      document.body.style.overflow = "";
    };
  }, [open]);

  const sidebar = (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-slate-800/80 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 shadow-xl shadow-slate-950/40 lg:w-64 lg:shadow-none">
      <div className="relative flex h-[4.25rem] items-center gap-3 overflow-hidden px-5">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
          aria-hidden
        />
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-sm font-bold text-white shadow-lg shadow-violet-600/30 ring-2 ring-white/10">
          UE
        </div>
        <div className="relative min-w-0 flex-1">
          <p className="truncate text-sm font-bold tracking-tight text-white">Unnao Express</p>
          <p className="text-[11px] font-medium uppercase tracking-wider text-violet-300/90">
            Backoffice
          </p>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto overscroll-contain px-3 pb-2 pt-2" aria-label="Main">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-gradient-to-r from-violet-600/25 to-fuchsia-600/10 text-white shadow-inner ring-1 ring-violet-500/35"
                  : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-100"
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                  active
                    ? "bg-violet-500/20 text-violet-200"
                    : "bg-slate-800/60 text-slate-500 group-hover:bg-slate-700/80 group-hover:text-slate-300"
                }`}
              >
                <Icon className="h-[1.15rem] w-[1.15rem]" />
              </span>
              {label}
            </Link>
          );
        })}

        <div className="pt-2">
          <button
            type="button"
            onClick={() => setSettingsOpen((v) => !v)}
            aria-expanded={settingsOpen}
            className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all ${
              settingsActive
                ? "bg-gradient-to-r from-violet-600/25 to-fuchsia-600/10 text-white ring-1 ring-violet-500/35"
                : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-100"
            }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                settingsActive
                  ? "bg-violet-500/20 text-violet-200"
                  : "bg-slate-800/60 text-slate-500 group-hover:bg-slate-700/80 group-hover:text-slate-300"
              }`}
            >
              <IconSettings className="h-[1.15rem] w-[1.15rem]" />
            </span>
            <span className="min-w-0 flex-1">Settings</span>
            <IconChevronDown
              className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${settingsOpen ? "rotate-180" : ""}`}
            />
          </button>
          {settingsOpen ? (
            <div className="ml-4 mt-1 space-y-0.5 border-l border-slate-700 py-1 pl-3">
              {settingsLinks.map(({ href, label }) => {
                const subActive = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      subActive
                        ? "bg-violet-600/30 text-violet-100"
                        : "text-slate-500 hover:bg-slate-800/60 hover:text-slate-200"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>

        <Link
          href="/"
          className="mt-3 flex items-center gap-3 rounded-xl border border-slate-700/80 bg-slate-800/40 px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:border-violet-500/40 hover:bg-slate-800 hover:text-white"
        >
          <IconExternal className="h-5 w-5 shrink-0 text-violet-400/90" />
          Public site
        </Link>
      </nav>
      <div className="border-t border-slate-800/90 p-3">
        <div className="rounded-xl bg-slate-800/70 px-3 py-3 ring-1 ring-slate-700/80">
          <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Signed in
          </p>
          <p className="truncate text-sm font-semibold text-slate-100" title={userEmail}>
            {userName || userEmail}
          </p>
          <p className="truncate text-xs text-slate-500">{userEmail}</p>
        </div>
        <LogoutButton className="mt-3 w-full justify-center rounded-xl border border-slate-600 bg-slate-800/80 py-2.5 text-sm font-medium text-slate-200 shadow-sm transition hover:border-slate-500 hover:bg-slate-800 disabled:opacity-60" />
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-dvh flex-1">
      <div className="hidden lg:flex">{sidebar}</div>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-md lg:hidden"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div
        id="admin-mobile-nav"
        className={`fixed inset-y-0 left-0 z-50 w-[min(100%,18rem)] transform transition-transform duration-200 ease-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebar}
      </div>

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200/90 bg-white/90 shadow-sm shadow-slate-200/40 backdrop-blur-xl">
          <div className="flex h-14 items-center gap-3 px-4 sm:h-[4.25rem] sm:gap-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-800 shadow-sm transition hover:border-violet-200 hover:bg-violet-50/50 lg:hidden"
              aria-expanded={open}
              aria-controls="admin-mobile-nav"
            >
              {open ? <IconClose className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
            </button>

            <div className="min-w-0 flex-1 lg:flex lg:items-center lg:gap-6">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-600 sm:text-xs">
                  Unnao Express · Backoffice
                </p>
                <h1 className="truncate bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-base font-bold text-transparent sm:text-xl">
                  {pageHeading(pathname)}
                </h1>
              </div>

              <div className="ml-auto hidden items-center gap-3 lg:flex">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50/40 hover:text-violet-900"
                >
                  <IconExternal className="h-4 w-4 text-violet-600" />
                  Storefront
                </Link>
                <div
                  className="flex items-center gap-2 rounded-xl border border-slate-200/90 bg-gradient-to-br from-slate-50 to-white py-1.5 pl-1.5 pr-3 shadow-sm"
                  title={userEmail}
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 text-xs font-bold text-white shadow-md shadow-violet-500/25"
                    aria-hidden
                  >
                    {userInitial(userName, userEmail)}
                  </span>
                  <div className="min-w-0 max-w-[10rem] xl:max-w-[14rem]">
                    <p className="truncate text-xs font-semibold text-slate-900">{userName || "Admin"}</p>
                    <p className="truncate text-[11px] text-slate-500">{userEmail}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="relative flex-1 overflow-hidden px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          <div
            className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-violet-50/40 via-slate-50 to-sky-50/30"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-32 top-0 -z-10 h-96 w-96 rounded-full bg-violet-200/20 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -left-20 bottom-0 -z-10 h-72 w-72 rounded-full bg-fuchsia-200/15 blur-3xl"
            aria-hidden
          />
          <div className="relative mx-auto max-w-6xl">{children}</div>
        </main>

        <footer className="mt-auto border-t border-slate-200/90 bg-gradient-to-r from-slate-50 via-white to-violet-50/30">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-6 lg:px-8">
            <div className="text-sm text-slate-600">
              <p className="font-semibold text-slate-800">Unnao Express</p>
              <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                © {new Date().getFullYear()} Backoffice · Internal use
              </p>
            </div>
            <nav
              className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-slate-600"
              aria-label="Footer"
            >
              <Link href="/" className="transition hover:text-violet-700">
                Storefront
              </Link>
              <Link href="/backoffice/dashboard" className="transition hover:text-violet-700">
                Dashboard
              </Link>
              <Link href="/backoffice/posts/new" className="transition hover:text-violet-700">
                New post
              </Link>
            </nav>
          </div>
        </footer>
      </div>
      <BackofficeToaster />
    </div>
  );
}
