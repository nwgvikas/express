import { PublicSiteHeader } from "./public-site-header";
import { SiteToaster } from "./site-toaster";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex w-full flex-col bg-zinc-100 text-zinc-900 [color-scheme:light]">
      <PublicSiteHeader />
      {children}
      <SiteToaster />
    </div>
  );
}
