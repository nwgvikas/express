import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getSiteBrandingSafe } from "@/helper/site-branding";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteBrandingSafe();
  return {
    title: { default: s.siteName, template: `%s | ${s.siteName}` },
    description: s.tagline || `${s.siteName} — news & updates`,
    ...(s.faviconUrl
      ? {
          icons: {
            icon: [{ url: s.faviconUrl }],
            shortcut: [{ url: s.faviconUrl }],
          },
        }
      : {}),
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-dvh flex-col bg-zinc-100">{children}</body>
    </html>
  );
}
