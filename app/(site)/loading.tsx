export default function SiteLoading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8" aria-busy="true">
      <div className="relative overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-white via-violet-50/50 to-fuchsia-50/40 px-5 py-10 shadow-xl shadow-violet-100/60 sm:px-8 dark:border-violet-500/30 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950/40 dark:shadow-black/40">
        <div
          className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_2.2s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/10"
          aria-hidden
        />
        <div className="relative grid min-h-[46vh] gap-8 lg:grid-cols-[300px,1fr] lg:items-center">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/90 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm dark:border-emerald-400/30 dark:bg-emerald-500/15 dark:text-emerald-200">
              <span className="text-sm" aria-hidden>
                📰
              </span>
              <span>unnao</span>
            </div>
            <div className="relative flex h-20 w-20 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-violet-200/55 dark:bg-violet-500/30" aria-hidden />
              <span
                className="absolute inset-1 rounded-full border-4 border-transparent border-t-violet-600 border-r-fuchsia-500 animate-spin dark:border-t-violet-300 dark:border-r-fuchsia-300"
                aria-hidden
              />
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-700 shadow-sm ring-1 ring-violet-100 dark:bg-slate-900 dark:text-violet-200 dark:ring-violet-400/30">
                UE
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-zinc-800 dark:text-zinc-100">Unnao Express</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">Preparing your latest feed…</p>
            </div>
            <div className="flex items-center gap-1.5" aria-hidden>
              <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-violet-500 [animation-delay:-0.25s]" />
              <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-fuchsia-500 [animation-delay:-0.12s]" />
              <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-violet-400" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center overflow-hidden rounded-lg border border-red-200/80 bg-white/80 dark:border-red-400/25 dark:bg-slate-900/50">
              <div className="shrink-0 bg-red-600 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white">
                Breaking
              </div>
              <div className="w-full px-3 py-2">
                <div className="h-3.5 w-11/12 rounded bg-zinc-200/80 dark:bg-zinc-700/70" />
              </div>
            </div>
            <div className="h-6 w-2/3 rounded-lg bg-zinc-200/80 dark:bg-zinc-700/70" />
            <div className="h-4 w-11/12 rounded-md bg-zinc-200/70 dark:bg-zinc-700/60" />
            <div className="h-4 w-10/12 rounded-md bg-zinc-200/70 dark:bg-zinc-700/60" />
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-zinc-200/80 bg-white/70 p-3 dark:border-zinc-700 dark:bg-slate-900/60">
                <div className="mb-2 h-28 rounded-lg bg-zinc-200/70 dark:bg-zinc-700/60" />
                <div className="h-3.5 w-4/5 rounded bg-zinc-200/80 dark:bg-zinc-700/70" />
                <div className="mt-2 h-3 w-2/3 rounded bg-zinc-200/70 dark:bg-zinc-700/60" />
              </div>
              <div className="rounded-xl border border-zinc-200/80 bg-white/70 p-3 dark:border-zinc-700 dark:bg-slate-900/60">
                <div className="mb-2 h-28 rounded-lg bg-zinc-200/70 dark:bg-zinc-700/60" />
                <div className="h-3.5 w-5/6 rounded bg-zinc-200/80 dark:bg-zinc-700/70" />
                <div className="mt-2 h-3 w-1/2 rounded bg-zinc-200/70 dark:bg-zinc-700/60" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
