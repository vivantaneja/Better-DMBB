import { LegalPage } from "@/components/legal-page";
import { siteConfig } from "@/lib/site-config";

export const metadata = { title: "Terms of use" };

export default function TermsPage() {
  const { governingBody, contactEmail } = siteConfig;

  return (
    <LegalPage title="Terms of use" updated="17 September 2026">
      <p>
        By using this website you accept these terms. They are deliberately short and written in plain
        English.
      </p>

      <h2>1. No affiliation</h2>
      <p>
        This website is an independent project with no connection to the {governingBody.name}, Basketball
        Ireland, or any listed club. Nothing on this site is an official statement of any of those
        organisations.
      </p>

      <h2>2. No warranty</h2>
      <p>
        This site is provided &ldquo;as is&rdquo;, free of charge, with no guarantee that any
        information on it is accurate, complete or current. Fixtures change and data may be stale or
        incorrect.
      </p>

      <h2>3. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, this website and its operator accept no liability for any
        loss, cost or inconvenience arising from reliance on information published here - including
        wasted journeys to cancelled or rescheduled games. Always confirm details with your club or
        the official source. Nothing in these terms limits liability for death or personal injury
        caused by negligence, or for fraud, where such limitation is not permitted by Irish law.
      </p>

      <h2>4. Third-party names and marks</h2>
      <p>
        Organisation, club and competition names are used descriptively to identify teams and
        fixtures. All trademarks and logos remain the property of their owners. No endorsement is
        claimed or implied.
      </p>

      <h2>5. Acceptable use</h2>
      <ul>
        <li>Do not scrape or bulk-download this site by automated means.</li>
        <li>Do not present this site&rsquo;s content as official.</li>
        <li>Do not use it in a way that disrupts it for other people.</li>
      </ul>

      <h2>6. Corrections and removal</h2>
      <p>
        Rights holders, clubs and individuals may request correction or removal of any content.
        Requests are actioned promptly and without argument.
        {contactEmail ? (
          <>
            {" "}
            Contact <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
          </>
        ) : null}
      </p>

      <h2>7. Governing law</h2>
      <p>
        These terms are governed by the laws of Ireland, and the Irish courts have exclusive
        jurisdiction over any dispute arising from them.
      </p>

      <h2>8. Changes</h2>
      <p>These terms may be updated. The &ldquo;last updated&rdquo; date above will change.</p>
    </LegalPage>
  );
}
