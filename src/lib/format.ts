/**
 * Deterministic date formatting.
 *
 * Server and client must produce byte-identical output or React will report a
 * hydration mismatch. `toLocaleString()` with no arguments uses the ambient
 * locale and timezone, which differ between the server and the visitor - so it
 * is never used here. Everything is pinned to Europe/Dublin, which is also the
 * timezone every fixture on this site is actually played in.
 */

const TIME_ZONE = "Europe/Dublin";

const dateTimeFormatter = new Intl.DateTimeFormat("en-IE", {
  timeZone: TIME_ZONE,
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const dateFormatter = new Intl.DateTimeFormat("en-IE", {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
});

function parse(value: string): Date | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** e.g. "Tue 7 Oct, 21:45" */
export function formatTipOff(value: string): string {
  const date = parse(value);
  return date ? dateTimeFormatter.format(date) : "Date TBC";
}

/** e.g. "7 Oct 2026" */
export function formatDate(value: string): string {
  const date = parse(value);
  return date ? dateFormatter.format(date) : "Date TBC";
}
