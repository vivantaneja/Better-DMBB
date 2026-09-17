import { LegalPage } from "@/components/legal-page";
import { siteConfig } from "@/lib/site-config";

export const metadata = {
  title: "About & disclaimer",
  description: `${siteConfig.name} is an independent, unofficial site with no affiliation to the ${siteConfig.governingBody.name}.`,
};

export default function AboutPage() {
  const { governingBody, name, contactEmail } = siteConfig;

  return (
    <LegalPage title="About this site" updated="17 September 2026">
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-5">
        <h2>This is not the official DMBB website</h2>
        <p className="mt-2">
          {name} is an independent, community-run website. It is <strong>not</strong> affiliated
          with, endorsed by, sponsored by, or connected in any way to the {governingBody.name} (
          {governingBody.abbreviation}), Basketball Ireland, or any club listed on this site.
        </p>
        <p className="mt-2">
          The official website of the {governingBody.name} is{" "}
          <a href={governingBody.url} rel="noopener noreferrer" target="_blank">
            {governingBody.url}
          </a>
          . Where this site and the official site disagree, the official site is correct.
        </p>
      </div>

      <h2>What this site is for</h2>
      <p>
        The official fixtures system works, but it is hard to read on a phone. This site is an
        attempt to present the same public sporting information - who is playing, where, and when -
        in a format that is faster and easier to scan. It is a hobby project run by a supporter of
        Dublin basketball, not a commercial service.
      </p>

      <h2>Why we use the DMBB name at all</h2>
      <p>
        Names such as &ldquo;{governingBody.name}&rdquo; and the names of individual clubs and
        competitions appear on this site purely to identify the organisations and games being
        described. That is nominative use: there is no way to tell you who is playing without naming
        the teams. No trademark, crest, badge or logo belonging to the {governingBody.abbreviation}
        {" "}or any club is reproduced here, and no claim of ownership over those names is made or
        implied. All such marks remain the property of their respective owners.
      </p>

      <h2>Where the data comes from</h2>
      <p>
        Fixture, competition and table information originates from publicly published sources,
        primarily {governingBody.url}. Scores, dates, venues and league positions are statements of
        fact about sporting events.
      </p>
      <p>
        This site does not currently run any automated collection against {governingBody.url}. Their
        published <code className="rounded bg-background px-1">robots.txt</code> asks automated
        clients not to crawl the site, and that request is being respected. The dataset shown here
        is a stored snapshot, and live syncing stays switched off unless and until the board gives
        written permission.
      </p>

      <h2>Accuracy, and what you should not rely on</h2>
      <p>
        Information here may be out of date, incomplete, or wrong. Throw-in times move, venues
        change, and games get called off at short notice.{" "}
        <strong>
          Never travel to a game on the strength of this site alone - always confirm with your club
          or the official listing first.
        </strong>
      </p>

      <h2>Corrections and takedown requests</h2>
      <p>
        If you are involved with the {governingBody.abbreviation} or a listed club and you want
        something corrected, attributed differently, or removed entirely, just ask and it will be
        actioned. There is no dispute to have here: this site exists to be useful to Dublin
        basketball, and if the board would rather it did not carry their data, it will stop.
      </p>
      {contactEmail ? (
        <p>
          Contact: <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
        </p>
      ) : (
        <p className="rounded border border-border bg-background p-4 text-sm text-brand-muted">
          <strong>Set a contact address before publishing.</strong> Add{" "}
          <code className="rounded bg-white px-1">NEXT_PUBLIC_CONTACT_EMAIL</code> to your
          environment so complaints and takedown requests reach a human. A site with no contact
          route looks evasive.
        </p>
      )}
    </LegalPage>
  );
}
