export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-10">
      <div className="mbd-container max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-brand-ink md:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-brand-muted">Last updated: {updated}</p>
        <div className="mt-8 space-y-6 leading-relaxed text-brand-ink/90 [&_a]:font-semibold [&_a]:underline [&_a]:underline-offset-2 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-brand-ink [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1.5">
          {children}
        </div>
      </div>
    </section>
  );
}
