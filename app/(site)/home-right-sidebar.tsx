import Link from "next/link";

export function HomeRightSidebar() {
  return (
    <div className="space-y-4">
      <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-sky-50 text-sm font-medium text-sky-800/80">
        ADVERTISEMENT
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-zinc-800">Download App from</h3>
        <div className="flex flex-col gap-2">
          <a
            href="#"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white"
          >
            <span aria-hidden>▶</span>
            Google Play
          </a>
          <a
            href="#"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white"
          >
            <span aria-hidden>⌘</span>
            App Store
          </a>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600 shadow-sm">
        <ul className="space-y-2">
          <li>
            <Link href="#" className="hover:text-blue-600">
              Term &amp; Conditions
            </Link>
          </li>
          <li>
            <Link href="#" className="hover:text-blue-600">
              Privacy Policy
            </Link>
          </li>
        </ul>
        <p className="mt-4 border-t border-zinc-100 pt-4 text-xs text-zinc-500">
          Copyright {new Date().getFullYear()} UNNAO EXPRESS All rights reserved.
        </p>
      </div>
    </div>
  );
}
