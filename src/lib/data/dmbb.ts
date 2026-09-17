/**
 * The single accessor every page uses to get basketball data.
 *
 * Two modes:
 *
 *   snapshot (default) - serves a dataset committed to the repo. No network
 *     calls at all, so pages render in single-digit milliseconds.
 *
 *   live - additionally refreshes from dmbb.ie in the background. Requires
 *     DMBB_LIVE_SYNC=true, which must not be set until the board has given
 *     written permission. See docs/data-permission.md.
 *
 * The live refresh never blocks a request: a visitor is always served the data
 * already in memory while any refresh happens behind them.
 */

import { LIVE_SYNC_ENABLED, fetchLiveDmbbPayload } from "@/lib/data/dmbb-source";
import { type DmbbPayload, type Fixture, dmbbPayloadSchema } from "@/lib/schemas/dmbb";
import snapshot from "@/lib/data/snapshot.json";

const REFRESH_INTERVAL_MS = 15 * 60 * 1000;

/** Parsed once at module load; the snapshot is static, so this never repeats. */
const snapshotPayload: DmbbPayload = dmbbPayloadSchema.parse(snapshot);

let current: DmbbPayload = snapshotPayload;
let lastRefreshedAt = 0;
let refreshInFlight: Promise<void> | null = null;

export type DataMode = "snapshot" | "live";

export function getDataMode(): DataMode {
  return LIVE_SYNC_ENABLED ? "live" : "snapshot";
}

/** Kicks off a refresh if one is due. Deliberately not awaited by callers. */
function refreshInBackground(): void {
  if (!LIVE_SYNC_ENABLED) return;
  if (refreshInFlight) return;
  if (Date.now() - lastRefreshedAt < REFRESH_INTERVAL_MS) return;

  refreshInFlight = fetchLiveDmbbPayload()
    .then((payload) => {
      // Only adopt a live payload that actually contains something. A partial
      // failure upstream must never blank out a working site.
      if (payload.competitions.length > 0) {
        current = payload;
      }
      lastRefreshedAt = Date.now();
    })
    .catch(() => {
      // Back off for a full interval rather than retrying on every request.
      lastRefreshedAt = Date.now();
    })
    .finally(() => {
      refreshInFlight = null;
    });
}

/**
 * Returns the current dataset immediately. Never throws, never blocks on the
 * network, and never returns invented data.
 */
export async function getDmbbData(): Promise<DmbbPayload> {
  refreshInBackground();
  return current;
}

/** Forces a synchronous refresh. Used by the admin sync endpoint only. */
export async function forceRefresh(): Promise<DmbbPayload> {
  if (!LIVE_SYNC_ENABLED) return current;
  const payload = await fetchLiveDmbbPayload();
  if (payload.competitions.length > 0) current = payload;
  lastRefreshedAt = Date.now();
  return current;
}

export type SeasonView = {
  capturedAt: string;
  /** Fixtures still to be played, soonest first. */
  upcoming: Fixture[];
  /** Completed games, most recent first. */
  recentResults: Fixture[];
  totalFixtures: number;
};

/**
 * Pre-splits the schedule into past and future.
 *
 * The "now" comparison lives here rather than in a page body: calling
 * `Date.now()` during render is impure and React's lint rules reject it. This
 * is a plain async function, so the clock read happens during data fetching,
 * and the pages stay pure functions of their input.
 */
export async function getSeasonView(): Promise<SeasonView> {
  const data = await getDmbbData();
  const now = Date.now();
  const time = (fixture: { tipOff: string }) => new Date(fixture.tipOff).getTime();

  return {
    capturedAt: data.capturedAt,
    upcoming: data.fixtures
      .filter((fixture) => time(fixture) >= now)
      .sort((a, b) => time(a) - time(b)),
    recentResults: [...data.results].sort((a, b) => time(b) - time(a)),
    totalFixtures: data.fixtures.length,
  };
}
