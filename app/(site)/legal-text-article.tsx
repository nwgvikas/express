type Props = {
  title: string;
  body: string;
  emptyMessage: string;
};

export function LegalTextArticle({ title, body, emptyMessage }: Props) {
  const trimmed = body.trim();
  return (
    <article className="overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">{title}</h1>
      {trimmed ? (
        <div className="mt-6 text-base leading-relaxed text-zinc-700 whitespace-pre-wrap">{body}</div>
      ) : (
        <p className="mt-6 text-sm leading-relaxed text-zinc-500">{emptyMessage}</p>
      )}
    </article>
  );
}
