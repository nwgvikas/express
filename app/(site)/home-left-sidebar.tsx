import Link from "next/link";
import { listCategoriesWithSubcategoriesForNav } from "@/helper/public-category-nav";
import { getPublicSiteUser } from "@/helper/public-user-auth";
import { getSiteBrandingSafe } from "@/helper/site-branding";
import { HomeAccordion } from "./home-accordion";
import { JoinAsCreatorBlock } from "./join-as-creator-block";
import { SocialFollowStrip } from "./social-follow-strip";

type Props = {
  activeSubSlug?: string;
  activeCatSlug?: string;
};

export async function HomeLeftSidebar({
  activeSubSlug = "",
  activeCatSlug = "",
}: Props = {}) {
  const navCategories = await listCategoriesWithSubcategoriesForNav();
  const branding = await getSiteBrandingSafe();
  const siteUser = await getPublicSiteUser();

  return (
    <div className="space-y-4">
      <nav className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <ul className="space-y-2 text-sm font-medium text-zinc-800">
          <li>
            <Link
              href="/"
              className={`block rounded-lg px-2 py-2 hover:bg-zinc-50 ${
                !activeSubSlug && !activeCatSlug ? "bg-zinc-100 font-semibold text-zinc-900" : ""
              }`}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/web-stories"
              className="block rounded-lg px-2 py-2 hover:bg-zinc-50"
            >
              Web Stories
            </Link>
          </li>
          {siteUser ? (
            <li>
              <Link
                href="/my-posts"
                className="block rounded-lg px-2 py-2 font-semibold text-violet-800 hover:bg-violet-50"
              >
                My posts
              </Link>
            </li>
          ) : null}
          <li>
            <Link href="/terms" className="block rounded-lg px-2 py-2 hover:bg-zinc-50">
              Terms & Conditions
            </Link>
          </li>
          <li>
            <Link href="/privacy" className="block rounded-lg px-2 py-2 hover:bg-zinc-50">
              Privacy Policy
            </Link>
          </li>
        </ul>
      </nav>

      <div className="rounded-xl bg-blue-600 p-4 text-white shadow-sm">
        <h3 className="text-lg font-bold">Become a News Creator</h3>
        <p className="mt-1 text-sm text-blue-100">Your local stories, Your voice</p>
        <JoinAsCreatorBlock
          registerEnabled={branding.registerEnabled}
          registerOffMessage={branding.registerOffMessage}
        />
        <Link
          href="/join-creator"
          className="mt-2 block text-center text-xs font-medium text-blue-100 underline-offset-2 hover:underline"
        >
          More info
        </Link>
      </div>

      <SocialFollowStrip />

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Top Cities
        </h3>
        <HomeAccordion
          categories={navCategories}
          activeSubSlug={activeSubSlug}
          activeCatSlug={activeCatSlug}
        />
      </div>
    </div>
  );
}
