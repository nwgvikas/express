export default function BackofficeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-slate-100 text-slate-900 antialiased [color-scheme:light] selection:bg-violet-200 selection:text-violet-900">
      {children}
    </div>
  );
}
