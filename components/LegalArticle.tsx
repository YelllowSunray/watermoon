export function LegalArticle({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="mx-auto max-w-2xl px-5 py-16 md:px-10">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="display mt-3 mb-10 text-5xl">{title}</h1>
      <div className="space-y-6 text-sm leading-7 text-dust">{children}</div>
    </article>
  );
}
