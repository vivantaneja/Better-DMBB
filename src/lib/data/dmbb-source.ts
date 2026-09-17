/**
 * Live ingestion from dmbb.ie.
 *
 * ---------------------------------------------------------------------------
 * READ THIS BEFORE ENABLING
 * ---------------------------------------------------------------------------
 * https://dmbb.ie/robots.txt currently ends with:
 *
 *     User-agent: *
 *     Disallow: /
 *
 * That asks every automated client not to fetch any path on the site. This
 * module is therefore DISABLED BY DEFAULT and stays disabled until the board
 * gives written permission. See docs/data-permission.md.
 *
 * Nothing in this file runs unless DMBB_LIVE_SYNC is explicitly set to "true".
 * ---------------------------------------------------------------------------
 */

import * as cheerio from "cheerio";
import {
  type Competition,
  type DmbbPayload,
  type Fixture,
  type StandingsRow,
  dmbbPayloadSchema,
} from "@/lib/schemas/dmbb";

const BASE_URL = "https://dmbb.ie";

/** Live sync is opt-in. Absent or anything other than "true" means off. */
export const LIVE_SYNC_ENABLED = process.env.DMBB_LIVE_SYNC === "true";

/**
 * Identifies this crawler and gives anyone reading dmbb.ie's access logs a way
 * to reach a human. An anonymous scraper is indistinguishable from an attack.
 */
const USER_AGENT =
  process.env.DMBB_SYNC_USER_AGENT ??
  "MensBasketballDublin/1.0 (unofficial community site; +https://github.com/; contact via site)";

/** Never hold more than this many sockets open against the origin at once. */
const MAX_CONCURRENCY = 4;
/** Give up on any single page rather than letting it stall the whole render. */
const REQUEST_TIMEOUT_MS = 8_000;
/** Politeness delay between requests in the same worker. */
const REQUEST_SPACING_MS = 150;

/**
 * Runs `task` over `items` with at most `limit` in flight.
 *
 * The previous implementation fired `Promise.all` over every discovered club
 * and competition at once - 40+ simultaneous requests at a legacy ASP.NET site
 * that is slow under a single request. That is both the main source of page
 * latency and the thing most likely to look like an attack from the far end.
 */
async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  task: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;

  async function worker(): Promise<void> {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      results[index] = await task(items[index]);
      if (REQUEST_SPACING_MS > 0) {
        await new Promise((resolve) => setTimeout(resolve, REQUEST_SPACING_MS));
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker()),
  );
  return results;
}

async function fetchHtml(path: string): Promise<string | null> {
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      headers: { "user-agent": USER_AGENT },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      next: { revalidate: 900 },
    });
    if (!response.ok) return null;
    return await response.text();
  } catch {
    // A timeout or network error degrades that one page, never the whole sync.
    return null;
  }
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function absoluteUrl(href: string | undefined): string | undefined {
  if (!href) return undefined;
  if (href.startsWith("http")) return href;
  // The legacy templates emit relative hrefs with no leading slash, which the
  // previous concatenation turned into "https://dmbb.iehomepageitem.aspx?...".
  return `${BASE_URL}/${href.replace(/^\/+/, "")}`;
}

function parseDmbbDateTime(value: string): string | null {
  const cleaned = normalizeWhitespace(value).toLowerCase();
  const match = cleaned.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)?$/,
  );
  // Returning null (rather than "now") keeps undated rows out of the dataset
  // instead of silently stamping them with the time of the sync.
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const yearRaw = Number(match[3]);
  const year = yearRaw < 100 ? 2000 + yearRaw : yearRaw;
  let hour = Number(match[4] ?? 19);
  const minute = Number(match[5] ?? 0);
  const ampm = match[6];

  if (ampm === "pm" && hour < 12) hour += 12;
  if (ampm === "am" && hour === 12) hour = 0;

  const date = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function mergeCompetitionTierFromName(name: string): string {
  if (/cup|shield/i.test(name)) return "Cup";
  if (/under\s*\d+|u\d+/i.test(name)) return "Underage";
  return "Senior";
}

/** DMBB awards 3 standings points per win and 1 per loss. */
function deriveWinsLossesFromPoints(
  played: number,
  points: number,
): { won: number; lost: number } | null {
  if (played < 0 || points < 0) return null;
  const wonNumerator = points - played;
  if (wonNumerator < 0 || wonNumerator % 2 !== 0) return null;
  const won = wonNumerator / 2;
  const lost = played - won;
  if (won < 0 || lost < 0 || won + lost !== played) return null;
  if (3 * won + lost !== points) return null;
  return { won, lost };
}

function applyStandingsRecord(row: StandingsRow): StandingsRow | null {
  const derived = deriveWinsLossesFromPoints(row.played, row.points);
  if (derived) return { ...row, won: derived.won, lost: derived.lost };
  if (row.played > 0 && row.won + row.lost === row.played) return row;
  return null;
}

function shouldPreferStandingsRow(candidate: StandingsRow, existing: StandingsRow): boolean {
  if (candidate.played !== existing.played) return candidate.played > existing.played;
  if (candidate.points !== existing.points) return candidate.points > existing.points;
  const existingHasRecord = existing.won > 0 || existing.lost > 0;
  const candidateHasRecord = candidate.won > 0 || candidate.lost > 0;
  return !existingHasRecord && candidateHasRecord;
}

function parseClubIds($: cheerio.CheerioAPI): string[] {
  const ids = new Set<string>();
  $("a[href*='cid=']").each((_, element) => {
    const match = ($(element).attr("href") ?? "").match(/cid=(\d+)/);
    if (match) ids.add(match[1]);
  });
  $("option").each((_, element) => {
    const value = normalizeWhitespace($(element).attr("value") ?? "");
    if (/^\d+$/.test(value) && Number(value) >= 10000) ids.add(value);
  });
  return [...ids];
}

function parseCompetitionsFromClubPage($: cheerio.CheerioAPI): {
  competitions: Competition[];
  teamsByCompId: Map<string, Set<string>>;
  standingsRows: StandingsRow[];
} {
  const competitionMap = new Map<string, Competition>();
  const teamsByCompId = new Map<string, Set<string>>();
  const standingsRows: StandingsRow[] = [];

  $("option").each((_, element) => {
    const value = normalizeWhitespace($(element).attr("value") ?? "");
    const label = normalizeWhitespace($(element).text());
    if (!/^\d+$/.test(value) || Number(value) < 1000 || !label) return;
    if (/standard item|google map|facebook feed|home logo|black tie|ui darkness/i.test(label)) return;

    const competitionId = `comp-${value}`;
    if (!competitionMap.has(competitionId)) {
      competitionMap.set(competitionId, {
        id: competitionId,
        name: label,
        tier: mergeCompetitionTierFromName(label),
        teamCount: 0,
        description: "",
      });
    }
  });

  $("a[href*='fixtures.aspx'][href*='teamID='][href*='compId=']").each((_, element) => {
    const match = ($(element).attr("href") ?? "").match(/compId=(\d+)/);
    if (!match) return;
    const competitionId = `comp-${match[1]}`;
    const team = normalizeWhitespace($(element).text());
    if (!team) return;
    if (!teamsByCompId.has(competitionId)) teamsByCompId.set(competitionId, new Set());
    teamsByCompId.get(competitionId)!.add(team);
  });

  $("table").each((_, tableElement) => {
    const table = $(tableElement);
    const headerMap = new Map<string, number>();
    table.find("thead th").each((index, headerCell) => {
      const normalized = normalizeWhitespace($(headerCell).text()).toLowerCase();
      if (normalized) headerMap.set(normalized, index);
    });

    const playedIndex =
      headerMap.get("p") ?? headerMap.get("pld") ?? headerMap.get("played") ?? 2;
    const pointsIndex = headerMap.get("pts") ?? headerMap.get("points");

    // Official tables list played (p), points for (f), points against (a) and
    // standings points. There are no W/L columns - those are derived above.
    table.find("tbody tr").each((_, rowElement) => {
      const row = $(rowElement);
      const teamLink = row.find("a[href*='fixtures.aspx'][href*='compId=']").first();
      const compMatch = (teamLink.attr("href") ?? "").match(/compId=(\d+)/);
      if (!compMatch) return;

      const cells = row.find("td");
      if (cells.length < 4) return;

      const team = normalizeWhitespace(teamLink.text());
      const played = Number.parseInt(
        normalizeWhitespace($(cells.get(playedIndex) ?? cells.get(2)).text()),
        10,
      );
      const points = Number.parseInt(
        normalizeWhitespace(
          $(pointsIndex != null ? cells.get(pointsIndex) : cells.get(cells.length - 1)).text(),
        ),
        10,
      );
      if (!team || Number.isNaN(played) || Number.isNaN(points)) return;

      const normalized = applyStandingsRecord({
        competitionId: `comp-${compMatch[1]}`,
        team,
        played,
        won: 0,
        lost: 0,
        points,
      });
      if (normalized) standingsRows.push(normalized);
    });
  });

  return { competitions: [...competitionMap.values()], teamsByCompId, standingsRows };
}

function parseFixturesPage(
  html: string,
  competitionId: string,
): { competition: Competition; fixtures: Fixture[]; results: Fixture[] } {
  const $ = cheerio.load(html);
  const competitionName =
    normalizeWhitespace($("title").text()).replace(/^Games-/i, "") ||
    `Competition ${competitionId.replace("comp-", "")}`;

  const fixtures: Fixture[] = [];
  const results: Fixture[] = [];

  $("table")
    .first()
    .find("tbody tr")
    .each((index, rowElement) => {
      const cells = $(rowElement).find("td");
      if (cells.length < 7) return;

      const dateText = normalizeWhitespace($(cells.get(2)).text());
      const homeTeam = normalizeWhitespace($(cells.get(3)).text());
      const awayTeam = normalizeWhitespace($(cells.get(6)).text());
      const venue = normalizeWhitespace($(cells.get(8)).text()) || "TBC";
      if (!homeTeam || !awayTeam) return;

      const tipOff = parseDmbbDateTime(dateText);
      if (!tipOff) return;

      const homeScore = Number.parseInt(normalizeWhitespace($(cells.get(4)).text()), 10);
      const awayScore = Number.parseInt(normalizeWhitespace($(cells.get(5)).text()), 10);
      const isFinal = !Number.isNaN(homeScore) && !Number.isNaN(awayScore);

      const item: Fixture = {
        id: `${competitionId}-fx-${index + 1}-${homeTeam}-${awayTeam}`.replace(/\s+/g, "-"),
        division: competitionName,
        homeTeam,
        awayTeam,
        venue,
        tipOff,
        status: isFinal ? "final" : "upcoming",
        homeScore: isFinal ? homeScore : undefined,
        awayScore: isFinal ? awayScore : undefined,
      };
      if (isFinal) results.push(item);
      else fixtures.push(item);
    });

  return {
    competition: {
      id: competitionId,
      name: competitionName,
      tier: mergeCompetitionTierFromName(competitionName),
      teamCount: 0,
      description: "",
    },
    fixtures,
    results,
  };
}

function dedupeFixtures(items: Fixture[]): Fixture[] {
  const map = new Map<string, Fixture>();
  for (const item of items) {
    const key = `${item.division}|${item.homeTeam}|${item.awayTeam}|${item.tipOff}|${item.status}`;
    if (!map.has(key)) map.set(key, item);
  }
  return [...map.values()];
}

/**
 * Fetches and parses the full dataset. Throws if the origin is unreachable -
 * callers decide what to serve instead. This never invents data.
 */
export async function fetchLiveDmbbPayload(): Promise<DmbbPayload> {
  if (!LIVE_SYNC_ENABLED) {
    throw new Error(
      "Live DMBB sync is disabled. Set DMBB_LIVE_SYNC=true only after obtaining " +
        "written permission from the Dublin Men's Basketball Board.",
    );
  }

  const homeHtml = await fetchHtml("/homepage.aspx?oid=1006");
  if (!homeHtml) throw new Error("Unable to reach dmbb.ie");

  const homeDoc = cheerio.load(homeHtml);
  const clubIds = parseClubIds(homeDoc);

  const clubPages = await mapWithConcurrency(clubIds, MAX_CONCURRENCY, (clubId) =>
    fetchHtml(`/homepage.aspx?oid=1006&cid=${clubId}`),
  );

  const competitionsById = new Map<string, Competition>();
  const teamCounts = new Map<string, Set<string>>();
  const standingsByKey = new Map<string, StandingsRow>();

  for (const page of clubPages) {
    if (!page) continue;
    const parsed = parseCompetitionsFromClubPage(cheerio.load(page));

    for (const competition of parsed.competitions) {
      if (!competitionsById.has(competition.id)) competitionsById.set(competition.id, competition);
    }
    for (const [competitionId, teams] of parsed.teamsByCompId) {
      if (!teamCounts.has(competitionId)) teamCounts.set(competitionId, new Set());
      for (const team of teams) teamCounts.get(competitionId)!.add(team);
    }
    for (const row of parsed.standingsRows) {
      const key = `${row.competitionId}:${row.team}`;
      const existing = standingsByKey.get(key);
      if (!existing || shouldPreferStandingsRow(row, existing)) standingsByKey.set(key, row);
    }
  }

  const competitionIds = [...competitionsById.keys()];
  const fixturePages = await mapWithConcurrency(competitionIds, MAX_CONCURRENCY, (competitionId) =>
    fetchHtml(`/fixtures.aspx?compId=${competitionId.replace("comp-", "")}`),
  );

  const allFixtures: Fixture[] = [];
  const allResults: Fixture[] = [];

  fixturePages.forEach((html, index) => {
    if (!html) return;
    const parsed = parseFixturesPage(html, competitionIds[index]);
    const existing = competitionsById.get(parsed.competition.id);
    if (existing && !existing.name) competitionsById.set(parsed.competition.id, parsed.competition);
    allFixtures.push(...parsed.fixtures);
    allResults.push(...parsed.results);
  });

  const competitions = [...competitionsById.values()]
    .map((competition) => ({
      ...competition,
      teamCount: teamCounts.get(competition.id)?.size ?? competition.teamCount,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return dmbbPayloadSchema.parse({
    capturedAt: new Date().toISOString(),
    competitions,
    fixtures: dedupeFixtures(allFixtures),
    results: dedupeFixtures(allResults),
    // News parsing produced only navigation chrome and broken links, so it is
    // deliberately not published rather than shipped as filler.
    news: [],
    standings: [...standingsByKey.values()].sort(
      (a, b) => b.points - a.points || b.played - a.played || a.team.localeCompare(b.team),
    ),
  });
}

export { absoluteUrl };
