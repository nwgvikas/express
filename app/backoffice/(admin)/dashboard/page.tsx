import Link from "next/link";
import { getBackofficeDashboardStats } from "@/helper/backoffice-dashboard-stats";
import { getBackofficeAdmin } from "@/helper/backoffice-auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard | Admin",
};

function StatCard({
  label,
  value,
  hint,
  href,
  accent,
}: {
  label: string;
  value: string | number;
  hint: string;
  href?: string;
  accent: "violet" | "emerald" | "amber" | "sky" | "rose" | "indigo";
}) {
  const accents = {
    violet: "from-violet-500/12 via-violet-500/5 to-transparent ring-violet-200/70 shadow-violet-500/5",
    emerald: "from-emerald-500/12 via-emerald-500/5 to-transparent ring-emerald-200/70 shadow-emerald-500/5",
    amber: "from-amber-500/12 via-amber-500/5 to-transparent ring-amber-200/70 shadow-amber-500/5",
    sky: "from-sky-500/12 via-sky-500/5 to-transparent ring-sky-200/70 shadow-sky-500/5",
    rose: "from-rose-500/12 via-rose-500/5 to-transparent ring-rose-200/70 shadow-rose-500/5",
    indigo: "from-indigo-500/12 via-indigo-500/5 to-transparent ring-indigo-200/70 shadow-indigo-500/5",
  } as const;
  const inner = (
    <>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-slate-900 sm:text-4xl">
        {value}
      </p>
      <p className="mt-2 text-sm leading-snug text-slate-600">{hint}</p>
      {href ? (
        <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-violet-600 transition group-hover:gap-2">
          Manage
          <span aria-hidden>→</span>
        </span>
      ) : null}
    </>
  );
  const cardClass = `group relative overflow-hidden rounded-2xl bg-gradient-to-br p-5 shadow-md ring-1 ring-inset transition hover:shadow-lg ${accents[accent]}`;
  if (href) {
    return (
      <Link href={href} className={`${cardClass} block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500`}>
        {inner}
      </Link>
    );
  }
  return <div className={cardClass}>{inner}</div>;
}

const quickActions = [
  {
    href: "/backoffice/posts/new",
    title: "New post",
    desc: "Write drafts and publish",
    icon: "✍️",
    style: "from-violet-600 to-fuchsia-600 shadow-violet-500/25",
  },
  {
    href: "/backoffice/posts",
    title: "Post list",
    desc: "Draft, pending, published — filter",
    icon: "📰",
    style: "from-sky-600 to-blue-700 shadow-sky-500/25",
  },
  {
    href: "/backoffice/categories",
    title: "Categories",
    desc: "Sections and cities",
    icon: "📁",
    style: "from-emerald-600 to-teal-700 shadow-emerald-500/25",
  },
  {
    href: "/backoffice/comments",
    title: "Comments",
    desc: "Pending approve / reject",
    icon: "💬",
    style: "from-amber-500 to-orange-600 shadow-amber-500/25",
  },
  {
    href: "/backoffice/breaking",
    title: "Breaking ribbon",
    desc: "Homepage ticker text",
    icon: "⚡",
    style: "from-rose-600 to-red-700 shadow-rose-500/25",
  },
  {
    href: "/backoffice/settings/general",
    title: "Site settings",
    desc: "Branding and general",
    icon: "⚙️",
    style: "from-slate-700 to-slate-900 shadow-slate-900/20",
  },
] as const;

export default async function AdminDashboardPage() {
  const { admin } = await getBackofficeAdmin();
  const stats = await getBackofficeDashboardStats();
  const firstName = admin.name?.trim().split(/\s+/)[0] || admin.email.split("@")[0] || "Admin";

  return (
    <div className="space-y-8 sm:space-y-10">
      <section className="relative overflow-hidden rounded-3xl border border-violet-200/60 bg-gradient-to-br from-white via-violet-50/40 to-fuchsia-50/30 p-6 shadow-lg shadow-violet-500/5 sm:p-8">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-400/15 blur-2xl"
          aria-hidden
        />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">Overview</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              Hello, {firstName}
            </h1>
            <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-slate-600 sm:text-base">
              Manage news, categories, comments, and the breaking ribbon from here. Live counts and
              shortcuts below.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <Link
              href="/backoffice/posts/new"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:brightness-105 active:scale-[0.98]"
            >
              Write a new post
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/90 px-6 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-violet-200 hover:bg-violet-50/50"
            >
              View live site
              <span aria-hidden className="text-violet-600">
                ↗
              </span>
            </Link>
          </div>
        </div>
      </section>

      {stats.failed ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Stats could not load — check the database. The rest of the panel may still work.
        </p>
      ) : null}

      <div>
        <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Today at a glance</h2>
        <p className="mt-1 text-sm text-slate-600">Live numbers from the database — click a card to open that section.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            label="Published posts"
            value={stats.publishedPosts}
            hint="Stories visible on the site"
            href="/backoffice/posts?status=published"
            accent="violet"
          />
          <StatCard
            label="Pending approval"
            value={stats.pendingPosts}
            hint="Submitted by a member — publish from admin"
            href="/backoffice/posts?status=pending"
            accent="sky"
          />
          <StatCard
            label="Drafts"
            value={stats.draftPosts}
            hint="Drafts only — pending counted separately"
            href="/backoffice/posts?status=draft"
            accent="amber"
          />
          <StatCard
            label="Trending"
            value={stats.trendingPosts}
            hint="Marked trending in the home feed"
            href="/backoffice/posts"
            accent="rose"
          />
          <StatCard
            label="Categories"
            value={stats.categories}
            hint="Top-level sections"
            href="/backoffice/categories"
            accent="emerald"
          />
          <StatCard
            label="Subcategories"
            value={stats.subcategories}
            hint="Cities / local areas"
            href="/backoffice/subcategories"
            accent="sky"
          />
          <StatCard
            label="Comments pending"
            value={stats.pendingComments}
            hint="Moderation required"
            href="/backoffice/comments"
            accent="indigo"
          />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Quick actions</h2>
        <p className="mt-1 text-sm text-slate-600">Common tasks in one click.</p>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((a) => (
            <li key={a.href}>
              <Link
                href={a.href}
                className="flex h-full min-h-[7.5rem] flex-col rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
              >
                <span
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-lg text-white shadow-lg ${a.style}`}
                  aria-hidden
                >
                  {a.icon}
                </span>
                <span className="mt-4 text-base font-bold text-slate-900">{a.title}</span>
                <span className="mt-1 text-sm text-slate-600">{a.desc}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <section className="rounded-3xl border border-slate-200/90 bg-white/90 p-6 shadow-sm backdrop-blur sm:p-8">
        <h2 className="text-lg font-bold text-slate-900">Account</h2>
        <p className="mt-1 text-sm text-slate-600">Your back-office profile.</p>
        <dl className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50/80 p-4 ring-1 ring-slate-100">
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Email</dt>
            <dd className="mt-2 break-all text-sm font-semibold text-slate-900">{admin.email}</dd>
          </div>
          {admin.name ? (
            <div className="rounded-2xl bg-slate-50/80 p-4 ring-1 ring-slate-100">
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Name</dt>
              <dd className="mt-2 text-sm font-semibold text-slate-900">{admin.name}</dd>
            </div>
          ) : null}
          <div className="rounded-2xl bg-slate-50/80 p-4 ring-1 ring-slate-100 sm:col-span-2">
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Role</dt>
            <dd className="mt-2">
              <span className="inline-flex items-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-violet-500/25">
                Administrator
              </span>
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
