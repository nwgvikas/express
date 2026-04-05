export function PlaceholderPanel({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-red-800">Unnao Express</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">{title}</h1>
      {description ? (
        <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-zinc-600 sm:text-base">
          {description}
        </p>
      ) : null}
      <div className="mt-8 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 px-4 py-6 text-center text-sm text-zinc-500">
        This section will connect to a CMS / API soon — for now it is a layout and navigation placeholder.
      </div>
    </div>
  );
}
