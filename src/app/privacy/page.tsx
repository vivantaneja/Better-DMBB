import { LegalPage } from "@/components/legal-page";
import { siteConfig } from "@/lib/site-config";

export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  const { name, contactEmail } = siteConfig;

  return (
    <LegalPage title="Privacy" updated="17 September 2026">
      <p>
        Short version: {name} does not ask you for personal information, does not set advertising or
        analytics cookies, and does not track you across websites.
      </p>

      <h2>What is collected</h2>
      <ul>
        <li>
          <strong>No account data.</strong> There is nothing to sign up for, so no names, emails or
          passwords are collected.
        </li>
        <li>
          <strong>No cookies set by this site.</strong> Because no tracking or advertising cookies
          are used, no cookie consent banner is required under the ePrivacy Regulations.
        </li>
        <li>
          <strong>Server logs.</strong> The hosting provider may keep standard technical logs (IP
          address, timestamp, page requested) for security and reliability. These are not used to
          build profiles and are not sold or shared.
        </li>
      </ul>

      <h2>If you email us</h2>
      <p>
        If you send a correction or takedown request, your message is kept only as long as needed to
        deal with it.
      </p>

      <h2>Personal data about players</h2>
      <p>
        This site publishes team names, fixtures and scores. It does not publish individual player
        names, photographs, contact details or statistics. If you believe personal data about you
        appears here, contact us and it will be removed.
      </p>

      <h2>Your rights</h2>
      <p>
        Under the GDPR you have the right to access, correct or erase personal data held about you,
        and to complain to the Irish Data Protection Commission (
        <a href="https://www.dataprotection.ie" rel="noopener noreferrer" target="_blank">
          dataprotection.ie
        </a>
        ).
        {contactEmail ? (
          <>
            {" "}
            To exercise these rights, contact <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
          </>
        ) : null}
      </p>
    </LegalPage>
  );
}
