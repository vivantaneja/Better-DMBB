/**
 * How this site identifies itself.
 *
 * The site keeps the Dublin Men's Basketball Board name, because that is what
 * the fixtures it lists actually are. What it does NOT do is claim to be the
 * board. That distinction is carried entirely by wording, so every string that
 * draws it lives here rather than being retyped per page.
 *
 * Two rules for anything added below:
 *   1. Never describe this site as "official".
 *   2. Refer to this site as "this website", never by the board's name. Saying
 *      "X is not affiliated with X" is incoherent, and incoherent disclaimers
 *      are worth less than none.
 */

export const siteConfig = {
  /** Shown in the masthead. Always paired with the qualifier below. */
  displayName: "Dublin Men's Basketball Board",
  /** Never rendered without this attached. */
  qualifier: "Unofficial",
  shortName: "DMBB",

  tagline: "Fixtures, results and tables for Dublin men's basketball.",

  /** Absolute base URL of THIS site. Never point this at dmbb.ie. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  /** Contact address for corrections, complaints and takedown requests. */
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",

  /** The governing body, and the authoritative source. */
  governingBody: {
    name: "Dublin Men's Basketball Board",
    abbreviation: "DMBB",
    url: "https://dmbb.ie",
  },

  disclaimerShort:
    "Unofficial fan-run site. Not affiliated with the Dublin Men's Basketball Board.",

  disclaimerLong:
    "This website is an independent, fan-run project. It is not affiliated with, endorsed by, " +
    "sponsored by, or connected to the Dublin Men's Basketball Board (DMBB) or any of the clubs " +
    "listed here. Club, competition and organisation names are used descriptively to identify " +
    "the teams and fixtures being reported, and remain the property of their respective owners. " +
    "For official information, always refer to dmbb.ie.",
} as const;

export type SiteConfig = typeof siteConfig;
