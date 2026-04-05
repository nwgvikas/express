import Link from "next/link";
import { getSiteBrandingSafe } from "@/helper/site-branding";
import { LegalTextArticle } from "../legal-text-article";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Terms & Conditions",
};

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
          title="Terms & Conditions"
          body={s.termsContent}
          emptyMessage="No text here yet. Add content in Admin → Settings → Terms & Privacy."
        />
      </div>
    </div>
  );
}
