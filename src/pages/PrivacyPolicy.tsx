import {
  APP_NAME,
  COMPANY_NAME,
  POLICY_EFFECTIVE_DATE,
  POLICY_LAST_UPDATED,
  PRIVACY_EMAIL,
  WEBSITE_URL,
} from '../config';

export default function PrivacyPolicy() {
  return (
    <article className="policy container-narrow">
      <span className="eyebrow">Legal</span>
      <h1>Privacy Policy</h1>
      <p className="updated">
        Effective date: {POLICY_EFFECTIVE_DATE} &nbsp;·&nbsp; Last updated:{' '}
        {POLICY_LAST_UPDATED}
      </p>

      <p>
        This Privacy Policy explains how {COMPANY_NAME} (&ldquo;{APP_NAME}
        &rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;)
        collects, uses, shares, and protects information about you when you use
        the {APP_NAME} mobile application and related services (collectively,
        the &ldquo;Service&rdquo;). {APP_NAME} is a real-football fantasy league
        platform that lets users create profiles, join competitions, and track
        match results.
      </p>

      <p>
        By using the Service, you agree to the practices described in this
        policy. If you do not agree, please do not use the Service.
      </p>

      <nav className="toc" aria-label="Table of contents">
        <h3>Contents</h3>
        <ol>
          <li>
            <a href="#info-we-collect">Information we collect</a>
          </li>
          <li>
            <a href="#how-we-use">How we use your information</a>
          </li>
          <li>
            <a href="#legal-basis">Legal basis for processing (GDPR)</a>
          </li>
          <li>
            <a href="#sharing">How we share information</a>
          </li>
          <li>
            <a href="#third-parties">Third-party services</a>
          </li>
          <li>
            <a href="#permissions">Device permissions</a>
          </li>
          <li>
            <a href="#retention">Data retention</a>
          </li>
          <li>
            <a href="#deletion">Account &amp; data deletion</a>
          </li>
          <li>
            <a href="#your-rights">Your rights</a>
          </li>
          <li>
            <a href="#california">California privacy rights</a>
          </li>
          <li>
            <a href="#children">Children&rsquo;s privacy</a>
          </li>
          <li>
            <a href="#international">International transfers</a>
          </li>
          <li>
            <a href="#security">Security</a>
          </li>
          <li>
            <a href="#changes">Changes to this policy</a>
          </li>
          <li>
            <a href="#contact">Contact us</a>
          </li>
        </ol>
      </nav>

      <h2 id="info-we-collect">1. Information we collect</h2>
      <p>
        We collect information you provide directly, information collected
        automatically when you use the Service, and information from third
        parties when you choose to connect them.
      </p>

      <h3>Information you provide</h3>
      <ul>
        <li>
          <strong>Account information:</strong> name, nickname, email address,
          password (stored as a one-way hash), and profile image.
        </li>
        <li>
          <strong>Profile data:</strong> birthday, gender, location (city /
          region), preferred football position, and other optional profile
          fields.
        </li>
        <li>
          <strong>Gameplay data:</strong> competitions you create or join,
          match-related information, ratings, and player statistics generated
          while using the Service.
        </li>
        <li>
          <strong>Support communications:</strong> messages, attachments, and
          contact details when you contact us for support.
        </li>
      </ul>

      <h3>Information collected automatically</h3>
      <ul>
        <li>
          <strong>Device &amp; technical data:</strong> device model, operating
          system and version, app version, language, time zone, and unique
          device identifiers.
        </li>
        <li>
          <strong>Usage data:</strong> screens viewed, features used, in-app
          actions, session duration, and approximate timestamps.
        </li>
        <li>
          <strong>Diagnostic data:</strong> crash logs, performance traces, and
          error reports.
        </li>
        <li>
          <strong>Network data:</strong> IP address (used to derive approximate
          coarse location and to secure the Service).
        </li>
      </ul>

      <h3>Information from third parties</h3>
      <ul>
        <li>
          <strong>Sign-in providers:</strong> if you sign in with Google, we
          receive your basic profile (name, email, profile picture, Google
          account ID) as authorized by you.
        </li>
      </ul>

      <h2 id="how-we-use">2. How we use your information</h2>
      <p>We use the information we collect to:</p>
      <ul>
        <li>Create and manage your account and authenticate you.</li>
        <li>
          Operate core features of the Service such as competitions, matches,
          ratings, and player profiles.
        </li>
        <li>
          Personalize your experience and show relevant content within the app.
        </li>
        <li>
          Send transactional notifications (for example, match invites or
          competition updates).
        </li>
        <li>
          Diagnose, debug, secure, and improve the Service, including by
          analyzing crashes and performance.
        </li>
        <li>
          Detect, prevent, and respond to fraud, abuse, or violations of our
          terms.
        </li>
        <li>
          Comply with legal obligations and enforce our agreements.
        </li>
      </ul>

      <h2 id="legal-basis">3. Legal basis for processing (GDPR)</h2>
      <p>
        If you are located in the European Economic Area or United Kingdom, we
        rely on the following legal bases under the GDPR / UK GDPR:
      </p>
      <table>
        <thead>
          <tr>
            <th>Purpose</th>
            <th>Legal basis</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Providing the Service you request (account, matches)</td>
            <td>Performance of a contract</td>
          </tr>
          <tr>
            <td>Security, fraud prevention, debugging</td>
            <td>Legitimate interests</td>
          </tr>
          <tr>
            <td>Optional analytics &amp; product improvement</td>
            <td>Consent (where required) / legitimate interests</td>
          </tr>
          <tr>
            <td>Legal &amp; regulatory compliance</td>
            <td>Legal obligation</td>
          </tr>
        </tbody>
      </table>

      <h2 id="sharing">4. How we share information</h2>
      <p>We do <strong>not</strong> sell your personal information. We share information only:</p>
      <ul>
        <li>
          <strong>With other users</strong>, when you publish a profile, join a
          competition, or participate in a match (e.g., your nickname, image,
          position, rating, and match results may be visible).
        </li>
        <li>
          <strong>With service providers</strong> that process data on our
          behalf under written agreements (hosting, analytics, crash
          reporting, authentication, communications).
        </li>
        <li>
          <strong>For legal reasons</strong>, when we believe in good faith that
          disclosure is required by law, regulation, legal process, or
          governmental request, or to protect our rights or the safety of
          users.
        </li>
        <li>
          <strong>In a corporate event</strong> such as a merger, acquisition,
          or asset sale, in which case we will require the recipient to honor
          this policy or notify you of any changes.
        </li>
      </ul>

      <h2 id="third-parties">5. Third-party services</h2>
      <p>
        The Service relies on the following categories of third-party providers.
        Each provider has its own privacy policy:
      </p>
      <table>
        <thead>
          <tr>
            <th>Provider</th>
            <th>Purpose</th>
            <th>Policy</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Google Sign-In</td>
            <td>Authentication via Google account</td>
            <td>
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noreferrer noopener"
              >
                policies.google.com/privacy
              </a>
            </td>
          </tr>
          <tr>
            <td>Firebase Crashlytics (Google)</td>
            <td>Crash and stability reporting</td>
            <td>
              <a
                href="https://firebase.google.com/support/privacy"
                target="_blank"
                rel="noreferrer noopener"
              >
                firebase.google.com/support/privacy
              </a>
            </td>
          </tr>
          <tr>
            <td>Cloud hosting provider</td>
            <td>Backend hosting, storage, and database</td>
            <td>
              Contact us at{' '}
              <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a> for the
              current list.
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        We may add, replace, or remove providers from time to time. We update
        this list when we do.
      </p>

      <h2 id="permissions">6. Device permissions</h2>
      <p>
        The {APP_NAME} mobile app may request the following device permissions.
        You can grant or revoke them at any time in your device settings.
      </p>
      <ul>
        <li>
          <strong>Photos / Camera:</strong> only used when you choose to upload
          or change your profile picture.
        </li>
        <li>
          <strong>Internet access:</strong> required to communicate with our
          backend.
        </li>
        <li>
          <strong>Notifications:</strong> used to deliver match-related and
          account notifications you opt in to.
        </li>
      </ul>
      <p>
        We do not collect precise GPS location, microphone audio, contacts, or
        SMS data.
      </p>

      <h2 id="retention">7. Data retention</h2>
      <p>
        We retain personal data for as long as your account is active and for a
        limited period afterward to satisfy legitimate operational, legal, or
        accounting needs. Specifically:
      </p>
      <ul>
        <li>
          <strong>Account &amp; profile data:</strong> kept while your account
          exists. Deleted within 30 days of account deletion, except where law
          requires longer retention.
        </li>
        <li>
          <strong>Gameplay records:</strong> historical match and competition
          results may be retained in anonymized or pseudonymized form so that
          rankings and league histories remain consistent for other players.
        </li>
        <li>
          <strong>Diagnostic logs:</strong> typically retained for up to 90
          days.
        </li>
        <li>
          <strong>Backups:</strong> may persist for up to 30 days after
          deletion before being overwritten.
        </li>
      </ul>

      <h2 id="deletion">8. Account &amp; data deletion</h2>
      <p>
        You can request permanent deletion of your account and associated
        personal data at any time:
      </p>
      <ul>
        <li>
          <strong>In-app:</strong> open {APP_NAME} → Settings → Account →
          Delete Account, and confirm.
        </li>
        <li>
          <strong>By email:</strong> contact us at{' '}
          <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a> from the email
          address associated with your account, and we will process your
          request.
        </li>
      </ul>
      <p>
        After your request is confirmed, your account is removed from the
        Service immediately, and your personal data is purged from active
        systems within 30 days. Anonymized statistical data and information we
        are legally required to retain may be kept longer, as described in
        section 7.
      </p>

      <h2 id="your-rights">9. Your rights</h2>
      <p>
        Depending on where you live, you may have the following rights regarding
        your personal data:
      </p>
      <ul>
        <li>
          <strong>Access:</strong> request a copy of the personal data we hold
          about you.
        </li>
        <li>
          <strong>Rectification:</strong> ask us to correct inaccurate or
          incomplete data.
        </li>
        <li>
          <strong>Erasure:</strong> ask us to delete your data (see section 8).
        </li>
        <li>
          <strong>Restriction / Objection:</strong> ask us to limit or stop
          certain processing.
        </li>
        <li>
          <strong>Portability:</strong> request a machine-readable export of the
          data you provided.
        </li>
        <li>
          <strong>Withdraw consent:</strong> where processing is based on
          consent, you can withdraw it at any time.
        </li>
        <li>
          <strong>Lodge a complaint:</strong> with your local data protection
          authority.
        </li>
      </ul>
      <p>
        To exercise any of these rights, contact us at{' '}
        <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>. We will respond
        within the timeframe required by applicable law.
      </p>

      <h2 id="california">10. California privacy rights (CCPA / CPRA)</h2>
      <p>
        If you are a California resident, you have the right to know what
        personal information we collect, to request deletion of that
        information, to correct inaccurate information, and to opt out of any
        &ldquo;sale&rdquo; or &ldquo;sharing&rdquo; of personal information.
      </p>
      <p>
        <strong>We do not sell or share your personal information</strong> as
        those terms are defined under the California Consumer Privacy Act
        (&ldquo;CCPA&rdquo;) as amended by the CPRA. To exercise your rights,
        email <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>.
      </p>

      <h2 id="children">11. Children&rsquo;s privacy</h2>
      <p>
        {APP_NAME} is not directed to children under 13 (or under 16 in the
        EEA / UK), and we do not knowingly collect personal information from
        them. If you believe a child has provided us with personal data, please
        contact us at <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>{' '}
        and we will promptly delete it.
      </p>

      <h2 id="international">12. International data transfers</h2>
      <p>
        Your information may be processed and stored in countries other than
        your own, including countries that may have different data-protection
        rules. When we transfer data internationally we use appropriate
        safeguards, such as Standard Contractual Clauses, where required by
        law.
      </p>

      <h2 id="security">13. Security</h2>
      <p>
        We use industry-standard administrative, technical, and physical
        safeguards to protect your information, including encryption in transit
        (HTTPS/TLS), secure password hashing, access controls, and audit
        logging on our backend. However, no method of transmission or storage
        is 100% secure, and we cannot guarantee absolute security.
      </p>

      <h2 id="changes">14. Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. When we do, we
        will revise the &ldquo;Last updated&rdquo; date at the top of this
        page. If the changes are material, we will provide a more prominent
        notice (for example, an in-app banner or email).
      </p>

      <h2 id="contact">15. Contact us</h2>
      <p>
        If you have any questions, concerns, or requests about this Privacy
        Policy or how we handle your data, please contact us:
      </p>
      <ul>
        <li>
          Email:{' '}
          <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>
        </li>
        <li>
          Website:{' '}
          <a href={WEBSITE_URL} target="_blank" rel="noreferrer noopener">
            {WEBSITE_URL}
          </a>
        </li>
      </ul>

    </article>
  );
}
