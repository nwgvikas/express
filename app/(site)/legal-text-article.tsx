type Props = {
  title: string;
  body: string;
  emptyMessage: string;
  /** From MongoDB `admin_settings.siteName` (General settings). */
  siteName?: string;
};

export function LegalTextArticle({ title, body, emptyMessage, siteName }: Props) {
  const trimmed = body.trim();
  const name = siteName?.trim();
  return (
    <article className="overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
      {name ? (
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">{name}</p>
      ) : null}
      <h1
        className={`text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl ${name ? "mt-2" : ""}`}
      >
        {title}
      </h1>
      {trimmed ? (
        <div className="mt-6 text-base leading-relaxed text-zinc-700 whitespace-pre-wrap">{body}</div>
      ) : (
        <p className="mt-6 text-sm leading-relaxed text-zinc-500">{emptyMessage}</p>
      )}
    </article>
  );
}
