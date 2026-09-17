import Link from "next/link";
import { notFound } from "next/navigation";
import {
  EmptyState,
  FixtureCard,
  ResultCard,
  SectionTitle,
  StandingsTable,
  TournamentBracket,
} from "@/components/site-shell";
import type { Fixture } from "@/lib/schemas/dmbb";
import { getDmbbData } from "@/lib/data/dmbb";

export const revalidate = 900;

type CompetitionPageProps = {
  params: Promise<{ competitionId: string }>;
};

/** Pre-renders every competition page at build time instead of on first visit. */
export async function generateStaticParams() {
  const data = await getDmbbData();
  return data.competitions.map((competition) => ({ competitionId: competition.id }));
}

export async function generateMetadata({ params }: CompetitionPageProps) {
  const { competitionId } = await params;
  const data = await getDmbbData();
  const competition = data.competitions.find((entry) => entry.id === competitionId);
  return { title: competition ? competition.name : "Competition" };
}

function isTournamentCompetition(name: string): boolean {
  return /cup|shield|top\s*4|final/i.test(name);
}

function dedupeMatches(matches: Fixture[]): Fixture[] {
  const deduped = new Map<string, Fixture>();
  for (const match of matches) {
    const key = `${match.division}|${match.homeTeam}|${match.awayTeam}|${match.tipOff}`;
    const existing = deduped.get(key);
    if (
      !existing ||
      (existing.status !== "final" && match.status === "final") ||
      ((existing.homeScore == null || existing.awayScore == null) &&
        match.homeScore != null &&
        match.awayScore != null)
    ) {
      deduped.set(key, match);
    }
  }
  return [...deduped.values()];
}

function buildBracketRounds(matches: Fixture[], competitionName: string) {
  const ordered = dedupeMatches(matches).sort(
    (a, b) => new Date(a.tipOff).getTime() - new Date(b.tipOff).getTime(),
  );

  if (ordered.length === 0) return [];
  if (ordered.length === 1) return [{ label: "Final", matches: ordered }];

  if (/top\s*4|top\s*four/i.test(competitionName)) {
    const finalMatch = ordered.at(-1)!;
    const remaining = ordered.slice(0, -1);
    const nonFinalPair = remaining.filter((match) => {
      const pair = new Set([match.homeTeam, match.awayTeam]);
      return !(pair.has(finalMatch.homeTeam) && pair.has(finalMatch.awayTeam));
    });
    const semis = (nonFinalPair.length >= 2 ? nonFinalPair : remaining).slice(-2);
    const rounds: { label: string; matches: Fixture[] }[] = [];
    if (semis.length > 0) rounds.push({ label: "Semi-Finals", matches: semis });
    rounds.push({ label: "Final", matches: [finalMatch] });
    return rounds;
  }

  const finalMatch = ordered.at(-1)!;
  const remaining = ordered.slice(0, -1);
  const rounds: { label: string; matches: Fixture[] }[] = [
    { label: "Final", matches: [finalMatch] },
  ];
  if (remaining.length === 0) return rounds;

  const semiCount = Math.min(2, remaining.length);
  rounds.unshift({ label: "Semi-Finals", matches: remaining.slice(-semiCount) });
  const beforeSemis = remaining.slice(0, -semiCount);
  if (beforeSemis.length === 0) return rounds;

  const quarterCount = Math.min(4, beforeSemis.length);
  rounds.unshift({ label: "Quarter-Finals", matches: beforeSemis.slice(-quarterCount) });
  const prelims = beforeSemis.slice(0, -quarterCount);
  if (prelims.length > 0) rounds.unshift({ label: "Round of 16", matches: prelims });

  return rounds;
}

export default async function CompetitionDetailPage({ params }: CompetitionPageProps) {
  const { competitionId } = await params;
  const data = await getDmbbData();
  const competition = data.competitions.find((entry) => entry.id === competitionId);

  if (!competition) notFound();

  const standings = data.standings.filter((row) => row.competitionId === competitionId);
  /*
   * A table where every team reads 0-0-0-0 is not a table, it is noise. Before
   * the season tips off the source publishes the team list with no record
   * attached, so we show the confirmed entrants instead of a grid of zeros.
   */
  const hasPlayedGames = standings.some((row) => row.played > 0);

  const fixtures = dedupeMatches(
    data.fixtures.filter((fixture) => fixture.division === competition.name),
  ).sort((a, b) => new Date(a.tipOff).getTime() - new Date(b.tipOff).getTime());

  const results = dedupeMatches(
    data.results.filter((result) => result.division === competition.name),
  ).sort((a, b) => new Date(b.tipOff).getTime() - new Date(a.tipOff).getTime());

  const isTournament = isTournamentCompetition(competition.name);
  const bracketRounds = buildBracketRounds([...results, ...fixtures], competition.name);

  return (
    <section className="py-10">
      <div className="mbd-container space-y-9">
        <div className="space-y-3">
          <Link
            href="/competitions"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-accent"
          >
            <span aria-hidden="true">&larr;</span> Back to competitions
          </Link>
          <SectionTitle eyebrow={competition.tier} title={competition.name} />
          {competition.description && (
            <p className="text-brand-muted">{competition.description}</p>
          )}
        </div>

        {isTournament ? (
          <div>
            <SectionTitle eyebrow="Tournament" title="Bracket" />
            {bracketRounds.length > 0 ? (
              <TournamentBracket rounds={bracketRounds} />
            ) : (
              <EmptyState title="No bracket published yet">
                Fixtures for this competition have not been drawn or published.
              </EmptyState>
            )}
          </div>
        ) : (
          <div>
            <SectionTitle eyebrow="Table" title="Standings" />
            {hasPlayedGames ? (
              <StandingsTable rows={standings} />
            ) : standings.length > 0 ? (
              <EmptyState title="No games played yet">
                <p>
                  The table will populate once results are published. {standings.length} teams are
                  listed in this competition:
                </p>
                <ul className="mt-2 flex flex-wrap gap-x-2 gap-y-1">
                  {standings.map((row) => (
                    <li
                      key={row.team}
                      className="rounded border border-border bg-background px-2 py-0.5 text-brand-ink"
                    >
                      {row.team}
                    </li>
                  ))}
                </ul>
              </EmptyState>
            ) : (
              <EmptyState title="No table published">
                No standings are available for this competition.
              </EmptyState>
            )}
          </div>
        )}

        <div>
          <SectionTitle eyebrow="Scheduled" title="Fixtures" />
          {fixtures.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {fixtures.slice(0, 12).map((fixture) => (
                <FixtureCard key={fixture.id} fixture={fixture} />
              ))}
            </div>
          ) : (
            <EmptyState title="No fixtures scheduled">
              Nothing has been published for this competition yet.
            </EmptyState>
          )}
        </div>

        {results.length > 0 && (
          <div>
            <SectionTitle eyebrow="Played" title="Results" />
            <div className="grid gap-3 md:grid-cols-2">
              {results.slice(0, 12).map((result) => (
                <ResultCard key={result.id} result={result} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
