import Link from "next/link";
import { getSiteBrandingSafe } from "@/helper/site-branding";

export const dynamic = "force-dynamic";

const CREATOR_EMAIL = process.env.NEXT_PUBLIC_CREATOR_CONTACT_EMAIL?.trim();

export async function generateMetadata() {
  const s = await getSiteBrandingSafe();
  return { title: `News Creator | ${s.siteName}` };
}

export default async function JoinCreatorPage() {
  const s = await getSiteBrandingSafe();

  return (
    <div className="bg-zinc-100">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <Link href="/" className="text-sm font-medium text-blue-600 hover:text-blue-800">
          ← Home
        </Link>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900">
          Become a News Creator
        </h1>
        <p className="mt-2 text-lg text-zinc-600">Your local stories, your voice.</p>
        <p className="mt-6 text-zinc-700">
          Join {s.siteName} to share local news, photos, and updates. Our team will onboard you after
          reviewing your profile and content guidelines.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {CREATOR_EMAIL ? (
            <a
              href={`mailto:${CREATOR_EMAIL}?subject=${encodeURIComponent(`News creator — ${s.siteName}`)}`}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Email us
            </a>
          ) : null}
          {s.loginEnabled ? (
            <Link
              href="/backoffice/login"
              className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
            >
              Admin / team login
            </Link>
          ) : null}
        </div>
        {!CREATOR_EMAIL ? (
          <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Set a contact email for creators in env:{" "}
            <code className="rounded bg-amber-100/80 px-1 font-mono text-xs">
              NEXT_PUBLIC_CREATOR_CONTACT_EMAIL
            </code>{" "}
            — then the &quot;Email us&quot; button will appear here.
          </p>
        ) : null}
      </div>
    </div>
  );
}
