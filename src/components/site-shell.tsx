import Link from "next/link";
import type { Competition, Fixture, NewsItem, StandingsRow } from "@/lib/schemas/dmbb";
import { siteConfig } from "@/lib/site-config";
import { formatDate, formatTipOff } from "@/lib/format";

type BracketRound = {
  label: string;
  matches: Fixture[];
};

/**
 * Shown above the masthead on every page. This is the primary defence against
 * anyone mistaking this site for the official one, so it is not collapsible,
 * not dismissible, and not hidden on mobile.
 */
export function UnofficialBanner() {
  return (
    <div className="border-b border-amber-300 bg-amber-100 text-brand-ink">
      <div className="mbd-container flex flex-wrap items-center justify-center gap-x-2 gap-y-1 py-2 text-center text-xs sm:text-sm">
        <span className="font-semibold">Unofficial fan-run site.</span>
        <span className="text-brand-muted">
          Not affiliated with the {siteConfig.governingBody.name}.
        </span>
        <a
          href={siteConfig.governingBody.url}
          className="font-semibold underline underline-offset-2 hover:text-brand-accent"
          rel="noopener noreferrer"
          target="_blank"
        >
          Official site: {siteConfig.governingBody.url.replace("https://", "")}
        </a>
      </div>
    </div>
  );
}

export function SiteHeader() {
  const nav = [
    { href: "/", label: "Home" },
    { href: "/fixtures-results", label: "Fixtures & Results" },
    { href: "/competitions", label: "Competitions" },
    { href: "/news", label: "News" },
    { href: "/about", label: "About" },
  ];

  return (
    <>
      <UnofficialBanner />
      <header className="bg-brand-ink text-white">
        <div className="mbd-container flex flex-wrap items-center justify-between gap-3 py-4">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            {/* Original mark. Never the DMBB crest. */}
            <svg
              viewBox="0 0 64 64"
              aria-hidden="true"
              className="h-10 w-10 shrink-0"
            >
              <rect width="64" height="64" rx="16" fill="#123057" />
              <circle cx="32" cy="32" r="15" fill="none" stroke="#F5A623" strokeWidth="3" />
              <path d="M32 17v30M17 32h30" stroke="#F5A623" strokeWidth="3" strokeLinecap="round" />
              <path
                d="M21.5 21.5c6 6 15 6 21 0M21.5 42.5c6-6 15-6 21 0"
                fill="none"
                stroke="#F5A623"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <span className="min-w-0">
              <span className="block truncate text-base font-bold leading-tight sm:text-lg">
                {siteConfig.name}
              </span>
              <span className="block truncate text-[11px] text-white/60">
                Unofficial · community-run
              </span>
            </span>
          </Link>
          <nav
            aria-label="Main"
            className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm"
          >
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-white/80 transition-colors hover:text-brand-accent-bright"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
    </>
  );
}

export function Hero({
  title,
  subtitle,
  fixtureCount,
}: {
  title: string;
  subtitle: string;
  fixtureCount: number;
}) {
  return (
    <section className="border-b border-border bg-white">
      <div className="mbd-container py-12 md:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-accent">
          Season 2026&ndash;27
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight text-brand-ink md:text-6xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-brand-muted">{subtitle}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/fixtures-results"
            className="rounded-lg bg-brand-ink px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-ink/90"
          >
            Browse {fixtureCount.toLocaleString("en-IE")} fixtures
          </Link>
          <Link
            href="/competitions"
            className="rounded-lg border border-border bg-white px-5 py-3 text-sm font-semibold text-brand-ink transition-colors hover:border-brand-accent"
          >
            Competitions &amp; tables
          </Link>
        </div>
      </div>
    </section>
  );
}

export function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-accent">{eyebrow}</p>
      <h2 className="mt-1 text-2xl font-bold tracking-tight text-brand-ink md:text-3xl">{title}</h2>
    </div>
  );
}

/**
 * Used wherever the source genuinely has no data. Saying so plainly is the
 * whole point - the old build shipped invented fixtures to fill these gaps.
 */
export function EmptyState({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mbd-card p-6">
      <p className="font-semibold text-brand-ink">{title}</p>
      {children && <div className="mt-1.5 text-sm text-brand-muted">{children}</div>}
    </div>
  );
}

export function FixtureCard({ fixture }: { fixture: Fixture }) {
  return (
    <article className="mbd-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
        {fixture.division}
      </p>
      <h3 className="mt-2 text-base font-semibold text-brand-ink">
        {fixture.homeTeam} <span className="font-normal text-brand-muted">v</span> {fixture.awayTeam}
      </h3>
      <p className="mt-1.5 text-sm text-brand-muted">{fixture.venue}</p>
      <p className="mt-1 text-sm font-medium text-brand-ink">
        <time dateTime={fixture.tipOff}>{formatTipOff(fixture.tipOff)}</time>
      </p>
    </article>
  );
}

export function ResultCard({ result }: { result: Fixture }) {
  return (
    <article className="mbd-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
        {result.division}
      </p>
      <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
        <h3 className="min-w-0 text-base font-semibold text-brand-ink">
          {result.homeTeam} <span className="font-normal text-brand-muted">v</span> {result.awayTeam}
        </h3>
        <p className="shrink-0 whitespace-nowrap text-right text-xl font-bold tabular-nums text-brand-ink">
          {result.homeScore ?? "-"}&ndash;{result.awayScore ?? "-"}
        </p>
      </div>
      <p className="mt-1.5 text-sm text-brand-muted">
        <time dateTime={result.tipOff}>{formatDate(result.tipOff)}</time>
      </p>
    </article>
  );
}

export function NewsCard({ item }: { item: NewsItem }) {
  return (
    <article className="mbd-card p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-accent">
        {item.category.replace(/_/g, " ")}
      </p>
      <h3 className="mt-2 text-xl font-bold leading-snug text-brand-ink">{item.title}</h3>
      <p className="mt-2 text-brand-muted">{item.excerpt}</p>
      {item.href && (
        <a
          href={item.href}
          className="mt-3 inline-block text-sm font-semibold text-brand-accent underline underline-offset-2"
          rel="noopener noreferrer"
          target="_blank"
        >
          Read on {siteConfig.governingBody.abbreviation} &rarr;
        </a>
      )}
    </article>
  );
}

export function CompetitionCard({
  competition,
  compact = false,
}: {
  competition: Competition;
  compact?: boolean;
}) {
  return (
    <Link href={`/competitions/${competition.id}`} className="block">
      <article
        className={`mbd-card transition-colors hover:border-brand-accent ${compact ? "p-4" : "p-5"}`}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-accent">
          {competition.tier}
        </p>
        <h3
          className={`mt-1.5 font-bold leading-tight text-brand-ink ${compact ? "text-base" : "text-xl"}`}
        >
          {competition.name}
        </h3>
        {competition.teamCount > 0 && (
          <p className="mt-1 text-sm text-brand-muted">{competition.teamCount} teams</p>
        )}
        {!compact && competition.description && (
          <p className="mt-2 text-sm text-brand-muted">{competition.description}</p>
        )}
      </article>
    </Link>
  );
}

export function StandingsTable({ rows }: { rows: StandingsRow[] }) {
  return (
    <div className="mbd-card overflow-x-auto">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">League table</caption>
        <thead className="bg-brand-ink text-white">
          <tr>
            <th scope="col" className="px-4 py-2.5 font-semibold">Team</th>
            <th scope="col" className="px-3 py-2.5 text-right font-semibold">P</th>
            <th scope="col" className="px-3 py-2.5 text-right font-semibold">W</th>
            <th scope="col" className="px-3 py-2.5 text-right font-semibold">L</th>
            <th scope="col" className="px-4 py-2.5 text-right font-semibold">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.competitionId}-${row.team}`} className="border-t border-border">
              <td className="px-4 py-2.5 font-medium text-brand-ink">{row.team}</td>
              <td className="px-3 py-2.5 text-right tabular-nums">{row.played}</td>
              <td className="px-3 py-2.5 text-right tabular-nums">{row.won}</td>
              <td className="px-3 py-2.5 text-right tabular-nums">{row.lost}</td>
              <td className="px-4 py-2.5 text-right font-semibold tabular-nums">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TournamentBracket({ rounds }: { rounds: BracketRound[] }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="grid min-w-max grid-flow-col auto-cols-[17rem] items-start gap-5">
        {rounds.map((round) => (
          <section key={round.label} className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-accent">
              {round.label}
            </h4>
            {round.matches.map((match) => (
              <article key={match.id} className="mbd-card p-4">
                <p className="text-xs text-brand-muted">
                  <time dateTime={match.tipOff}>{formatDate(match.tipOff)}</time>
                </p>
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-brand-ink">{match.homeTeam}</span>
                    <span className="font-bold tabular-nums text-brand-ink">
                      {match.homeScore ?? "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-brand-ink">{match.awayTeam}</span>
                    <span className="font-bold tabular-nums text-brand-ink">
                      {match.awayScore ?? "-"}
                    </span>
                  </div>
                </div>
                <p className="mt-2.5 text-xs text-brand-muted">{match.venue}</p>
              </article>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-brand-ink text-sm text-white/70">
      <div className="mbd-container space-y-6 py-10">
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/about" className="hover:text-white">About &amp; disclaimer</Link>
          <Link href="/terms" className="hover:text-white">Terms of use</Link>
          <Link href="/privacy" className="hover:text-white">Privacy</Link>
          <a
            href={siteConfig.governingBody.url}
            className="hover:text-white"
            rel="noopener noreferrer"
            target="_blank"
          >
            Official {siteConfig.governingBody.abbreviation} site
          </a>
        </div>
        <p className="max-w-3xl leading-relaxed text-white/60">{siteConfig.disclaimerLong}</p>
        <p className="text-white/40">
          &copy; {new Date().getUTCFullYear()} {siteConfig.name}. Fixture and result information is
          factual sporting data compiled from public sources and remains the responsibility of the
          organising body.
        </p>
      </div>
    </footer>
  );
}
