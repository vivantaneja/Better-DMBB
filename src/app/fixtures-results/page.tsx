import { EmptyState, FixtureCard, ResultCard, SectionTitle } from "@/components/site-shell";
import { getSeasonView } from "@/lib/data/dmbb";
import { formatDate } from "@/lib/format";

export const revalidate = 900;

export const metadata = {
  title: "Fixtures & results",
};

export default async function FixturesResultsPage() {
  const { upcoming, recentResults: results, capturedAt } = await getSeasonView();

  return (
    <section className="py-10">
      <div className="mbd-container space-y-6">
        <SectionTitle eyebrow="Season 2026-27" title="Fixtures &amp; results" />
        <p className="text-xs text-brand-muted">
          Data captured <time dateTime={capturedAt}>{formatDate(capturedAt)}</time>.
          Always confirm times with the organising club before travelling.
        </p>

        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="mb-3 text-lg font-bold text-brand-ink">
              Upcoming ({upcoming.length.toLocaleString("en-IE")})
            </h2>
            {upcoming.length > 0 ? (
              <div className="space-y-3">
                {upcoming.slice(0, 60).map((fixture) => (
                  <FixtureCard key={fixture.id} fixture={fixture} />
                ))}
              </div>
            ) : (
              <EmptyState title="No upcoming fixtures">
                Nothing is currently scheduled in this dataset.
              </EmptyState>
            )}
          </div>

          <div>
            <h2 className="mb-3 text-lg font-bold text-brand-ink">
              Results ({results.length.toLocaleString("en-IE")})
            </h2>
            {results.length > 0 ? (
              <div className="space-y-3">
                {results.slice(0, 60).map((result) => (
                  <ResultCard key={result.id} result={result} />
                ))}
              </div>
            ) : (
              <EmptyState title="No results yet this season">
                The 2026&ndash;27 season has not tipped off. Scores appear here once games are
                played and published.
              </EmptyState>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
