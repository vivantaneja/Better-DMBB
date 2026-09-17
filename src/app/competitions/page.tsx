import Link from "next/link";
import { CompetitionCard, EmptyState, SectionTitle } from "@/components/site-shell";
import { getDmbbData } from "@/lib/data/dmbb";
import type { Competition } from "@/lib/schemas/dmbb";
import { formatDate } from "@/lib/format";

export const revalidate = 900;

export const metadata = {
  title: "Competitions & tables",
};

const TABS = [
  { key: "leagues", label: "Leagues" },
  { key: "cups", label: "Cups" },
  { key: "shields", label: "Shields" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

type CompetitionGroup = "division" | "over" | "under" | "other";

function classifyLeagueName(name: string): {
  group: CompetitionGroup;
  bucketLabel: string;
  primary: number;
  subgroup: number;
  variant: number;
  normalizedName: string;
} {
  const normalizedName = name.trim();
  const lower = normalizedName.toLowerCase();
  const top4 = /top\s*4|final/i.test(normalizedName) ? 1 : 0;
  const bracketMatch = normalizedName.match(/\((\d+)\)/);
  const bracket = bracketMatch ? Number(bracketMatch[1]) : 0;

  const divisionMatch = normalizedName.match(/division\s*(\d+)/i);
  if (divisionMatch) {
    return {
      group: "division",
      bucketLabel: `Division ${Number(divisionMatch[1])}`,
      primary: Number(divisionMatch[1]),
      subgroup: bracket,
      variant: top4,
      normalizedName: lower,
    };
  }

  const overMatch = normalizedName.match(/over\s*(\d+)/i);
  if (overMatch) {
    return {
      group: "over",
      bucketLabel: `Over ${Number(overMatch[1])}`,
      primary: Number(overMatch[1]),
      subgroup: bracket,
      variant: top4,
      normalizedName: lower,
    };
  }

  const underMatch = normalizedName.match(/(?:under|u)\s*(\d+)/i);
  if (underMatch) {
    const colorWeight = /\bblue\b/i.test(normalizedName)
      ? 1
      : /\bgreen\b/i.test(normalizedName)
        ? 2
        : /\bred\b/i.test(normalizedName)
          ? 3
          : 0;
    return {
      group: "under",
      bucketLabel: `Under ${Number(underMatch[1])}`,
      primary: Number(underMatch[1]),
      subgroup: bracket || colorWeight,
      variant: top4,
      normalizedName: lower,
    };
  }

  return {
    group: "other",
    bucketLabel: "Other",
    primary: Number.MAX_SAFE_INTEGER,
    subgroup: bracket,
    variant: top4,
    normalizedName: lower,
  };
}

const GROUP_ORDER: Record<CompetitionGroup, number> = {
  division: 0,
  over: 1,
  under: 2,
  other: 3,
};

function leagueSort(aName: string, bName: string): number {
  const a = classifyLeagueName(aName);
  const b = classifyLeagueName(bName);
  return (
    GROUP_ORDER[a.group] - GROUP_ORDER[b.group] ||
    a.primary - b.primary ||
    a.subgroup - b.subgroup ||
    a.variant - b.variant ||
    a.normalizedName.localeCompare(b.normalizedName)
  );
}

function bucketLeagues(competitions: Competition[]) {
  const buckets = new Map<string, { label: string; competitions: Competition[]; sortKey: number }>();

  for (const competition of competitions) {
    const meta = classifyLeagueName(competition.name);
    const existing = buckets.get(meta.bucketLabel);
    if (existing) {
      existing.competitions.push(competition);
      continue;
    }
    buckets.set(meta.bucketLabel, {
      label: meta.bucketLabel,
      competitions: [competition],
      sortKey: GROUP_ORDER[meta.group] * 1000 + Math.min(meta.primary, 999),
    });
  }

  return [...buckets.values()].sort((a, b) => a.sortKey - b.sortKey || a.label.localeCompare(b.label));
}

export default async function CompetitionsPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const resolved = searchParams ? await searchParams : undefined;
  const data = await getDmbbData();

  const sorted = [...data.competitions].sort((a, b) => leagueSort(a.name, b.name));
  const isCup = (name: string) => /\bcup\b/i.test(name);
  const isShield = (name: string) => /\bshield\b/i.test(name);
  const isTop4 = (name: string) => /top\s*4|final\s*4/i.test(name);

  const groups: Record<TabKey, Competition[]> = {
    leagues: sorted.filter((c) => isTop4(c.name) || (!isCup(c.name) && !isShield(c.name))),
    cups: sorted.filter((c) => !isTop4(c.name) && isCup(c.name) && !isShield(c.name)),
    shields: sorted.filter((c) => !isTop4(c.name) && isShield(c.name)),
  };

  const requested = resolved?.tab;
  const activeTab: TabKey = TABS.some((tab) => tab.key === requested)
    ? (requested as TabKey)
    : "leagues";

  const activeCompetitions = groups[activeTab];
  const activeLabel = TABS.find((tab) => tab.key === activeTab)!.label;

  return (
    <section className="py-10">
      <div className="mbd-container space-y-6">
        <SectionTitle
          eyebrow={`${sorted.length} competitions listed`}
          title="Competitions &amp; tables"
        />
        <p className="text-xs text-brand-muted">
          Data captured <time dateTime={data.capturedAt}>{formatDate(data.capturedAt)}</time>. For
          official confirmation, check{" "}
          <a
            href="https://dmbb.ie"
            className="underline underline-offset-2"
            rel="noopener noreferrer"
            target="_blank"
          >
            dmbb.ie
          </a>
          .
        </p>

        <nav aria-label="Competition type" className="flex flex-wrap gap-2">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Link
                key={tab.key}
                href={`/competitions?tab=${tab.key}`}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? "border-brand-ink bg-brand-ink text-white"
                    : "border-border bg-white text-brand-ink hover:border-brand-accent"
                }`}
              >
                {tab.label} ({groups[tab.key].length})
              </Link>
            );
          })}
        </nav>

        {/*
          Rendered unconditionally. Previously each panel was gated on
          `length > 0`, so selecting a tab with no competitions (Shields, which
          is empty this season) produced a blank page that read as a broken
          button.
        */}
        {activeCompetitions.length === 0 ? (
          <EmptyState title={`No ${activeLabel.toLowerCase()} listed for this season`}>
            Nothing in the current dataset falls under {activeLabel.toLowerCase()}. This usually
            means the competition has not been published yet.
          </EmptyState>
        ) : activeTab === "leagues" ? (
          <div className="space-y-6">
            {bucketLeagues(activeCompetitions).map((bucket) => (
              <section key={bucket.label} className="space-y-2.5">
                <h3 className="text-sm font-bold uppercase tracking-wide text-brand-ink">
                  {bucket.label} ({bucket.competitions.length})
                </h3>
                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {bucket.competitions.map((competition) => (
                    <CompetitionCard key={competition.id} competition={competition} compact />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {activeCompetitions.map((competition) => (
              <CompetitionCard key={competition.id} competition={competition} compact />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
