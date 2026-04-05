import Link from "next/link";
import { getSiteBrandingSafe } from "@/helper/site-branding";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const s = await getSiteBrandingSafe();
  return { title: `Web Stories | ${s.siteName}` };
}

export default async function WebStoriesPage() {
  const s = await getSiteBrandingSafe();

  return (
    <div className="bg-zinc-100">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← Home
        </Link>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900">
          Web Stories
        </h1>
        <p className="mt-3 text-zinc-600">
          Vertical, full-screen stories for {s.siteName} are coming soon — this section is under construction.
        </p>
        <p className="mt-4 text-sm text-zinc-500">
          You can publish from the back office; a dedicated stories experience may be linked here later.
        </p>
      </div>
    </div>
  );
}
