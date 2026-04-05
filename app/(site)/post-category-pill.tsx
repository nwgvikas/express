import Link from "next/link";

function IconSection({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
      />
    </svg>
  );
}

type Props = {
  categoryName: string;
  subcategoryName: string;
  subcategorySlug?: string;
};

const shellClass =
  "group relative inline-flex max-w-full items-center gap-2 overflow-hidden rounded-full px-3.5 py-1.5 text-left text-[0.8125rem] font-semibold leading-tight text-white shadow-md ring-1 transition duration-200 will-change-transform sm:text-sm";

const gradientClass =
  "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 shadow-emerald-900/25 ring-white/30";

export function PostCategoryPill({
  categoryName,
  subcategoryName,
  subcategorySlug = "",
}: Props) {
  const label = subcategoryName.trim()
    ? `${categoryName.trim()} · ${subcategoryName.trim()}`
    : categoryName.trim() || "News";

  const slug = subcategorySlug.trim().toLowerCase();
  const href = slug ? `/subcategory/${encodeURIComponent(slug)}` : null;

  const shine =
    "pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition duration-700 group-hover:translate-x-full group-hover:opacity-100";

  const content = (
    <>
      <span className={shine} aria-hidden />
      <IconSection className="relative z-10 h-4 w-4 shrink-0 text-emerald-100 drop-shadow-sm" />
      <span className="relative z-10 min-w-0 flex-1 truncate drop-shadow-sm">{label}</span>
      {href ? (
        <span
          className="relative z-10 shrink-0 text-xs font-bold text-emerald-100/90 transition group-hover:translate-x-0.5"
          aria-hidden
        >
          →
        </span>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        title={`${label} — more stories`}
        className={`${shellClass} ${gradientClass} hover:shadow-lg hover:brightness-[1.05] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500`}
      >
        {content}
      </Link>
    );
  }

  return (
    <span
      title={label}
      className={`${shellClass} ${gradientClass} cursor-default hover:shadow-lg`}
    >
      {content}
    </span>
  );
}
