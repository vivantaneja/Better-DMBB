import Link from "next/link";
import {
  EmptyState,
  FixtureCard,
  Hero,
  ResultCard,
  SectionTitle,
} from "@/components/site-shell";
import { getSeasonView } from "@/lib/data/dmbb";
import { siteConfig } from "@/lib/site-config";

/** Regenerated at most every 15 minutes; visitors are served static HTML. */
export const revalidate = 900;

export default async function Home() {
  const { upcoming, recentResults, totalFixtures } = await getSeasonView();

  return (
    <>
      <Hero
        title="Dublin men's basketball, easier to read."
        subtitle={`${siteConfig.tagline} Independent and community-run.`}
        fixtureCount={totalFixtures}
      />

      <section className="py-12">
        <div className="mbd-container grid gap-10 lg:grid-cols-2">
          <div>
            <SectionTitle eyebrow="Next up" title="Upcoming fixtures" />
            {upcoming.length > 0 ? (
              <>
                <div className="space-y-3">
                  {upcoming.slice(0, 5).map((fixture) => (
                    <FixtureCard key={fixture.id} fixture={fixture} />
                  ))}
                </div>
                <Link
                  href="/fixtures-results"
                  className="mt-4 inline-block text-sm font-semibold text-brand-accent underline underline-offset-2"
                >
                  All {totalFixtures.toLocaleString("en-IE")} fixtures &rarr;
                </Link>
              </>
            ) : (
              <EmptyState title="No upcoming fixtures listed">
                Nothing is scheduled in the current dataset.
              </EmptyState>
            )}
          </div>

          <div>
            <SectionTitle eyebrow="Latest" title="Recent results" />
            {recentResults.length > 0 ? (
              <div className="space-y-3">
                {recentResults.slice(0, 5).map((result) => (
                  <ResultCard key={result.id} result={result} />
                ))}
              </div>
            ) : (
              <EmptyState title="No results yet this season">
                The 2026&ndash;27 season has not tipped off. Results will appear here once games
                have been played and published.
              </EmptyState>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
