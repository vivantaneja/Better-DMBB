/**
 * Single source of truth for how this site identifies itself.
 *
 * This is an INDEPENDENT, UNOFFICIAL site. Every user-facing string that
 * describes the relationship to the Dublin Men's Basketball Board lives here
 * so it can never drift out of sync between pages.
 */

export const siteConfig = {
  name: "Men's Basketball Dublin",
  shortName: "MBD",
  tagline: "Unofficial fixtures, results and tables for Dublin men's basketball.",

  /** Absolute base URL of THIS site. Never point this at dmbb.ie. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  /** Contact address for corrections, complaints and takedown requests. */
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",

  /** The governing body. Referenced by name only - never as our own identity. */
  governingBody: {
    name: "Dublin Men's Basketball Board",
    abbreviation: "DMBB",
    url: "https://dmbb.ie",
  },

  /**
   * The one-line notice shown in the header on every page. Short by design:
   * a disclaimer nobody reads protects nobody.
   */
  disclaimerShort:
    "Unofficial fan-run site. Not affiliated with the Dublin Men's Basketball Board.",

  disclaimerLong:
    "Men's Basketball Dublin is an independent, fan-run website. It is not affiliated with, " +
    "endorsed by, sponsored by, or connected to the Dublin Men's Basketball Board (DMBB) or " +
    "any of the clubs listed on this site. All club, competition and organisation names are " +
    "used descriptively to identify the teams and fixtures being reported, and remain the " +
    "property of their respective owners. For official information, always refer to dmbb.ie.",
} as const;

export type SiteConfig = typeof siteConfig;
