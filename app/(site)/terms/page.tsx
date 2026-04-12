import type { Metadata } from "next";
import Link from "next/link";
import { getSiteBrandingSafe } from "@/helper/site-branding";
import { LegalTextArticle } from "../legal-text-article";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteBrandingSafe();
  const base = s.siteName?.trim() || "Unnao Express";
  return { title: `${base} — Terms & Conditions` };
}

export default async function TermsPage() {
  const s = await getSiteBrandingSafe();
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-6 inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← Home
        </Link>
        <LegalTextArticle
          siteName={s.siteName}
          title="Terms & Conditions"
          body={s.termsContent}
          emptyMessage="No text here yet. Add content in Backoffice → Settings → Terms & Privacy."
        />
      </div>
    </div>
  );
}
