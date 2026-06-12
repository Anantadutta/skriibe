import React from 'react';

export default function PrivacyPolicy() {
  return (
    <main style={{ maxWidth: "800px", margin: "0 auto", padding: "48px 24px", fontFamily: "inherit", color: "#111", lineHeight: "1.7", backgroundColor: "#fff", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "8px" }}>Privacy Policy</h1>
      <p style={{ color: "#666", marginBottom: "40px" }}>Last updated: June 12, 2026</p>

      <p>
        This Privacy Policy describes how <strong>Edlern Innovations Private Limited</strong> ("we", "us", or "our"),
        operating as <strong>Skriibe</strong> (<a href="https://skriibe.com">skriibe.com</a>), collects, uses, and
        protects the information you provide when using our platform.
      </p>

      <Section title="1. Information We Collect">
        <p>When you connect your Instagram account to Skriibe, we collect and store the following information via the Instagram Basic Display API:</p>
        <ul>
          <li>Instagram <strong>username</strong></li>
          <li>Instagram <strong>profile picture</strong></li>
          <li>Instagram <strong>follower count</strong></li>
          <li>Instagram <strong>account ID</strong></li>
        </ul>
        <p>We do not collect your passwords, private messages, or any content from private accounts.</p>
      </Section>

      <Section title="2. How We Use Your Information">
        <p>The information collected is used solely to:</p>
        <ul>
          <li>Display your Instagram profile details on your Skriibe creator portfolio</li>
          <li>Allow potential clients or collaborators to view your public Instagram presence</li>
          <li>Improve and maintain our platform</li>
        </ul>
        <p>We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>
      </Section>

      <Section title="3. Data Storage and Security">
        <p>
          Your Instagram data is stored securely in our database. We use industry-standard security practices
          to protect your information from unauthorized access, disclosure, alteration, or destruction.
          Access to stored data is restricted to authorized personnel only.
        </p>
      </Section>

      <Section title="4. Data Retention">
        <p>
          We retain your Instagram data for as long as you maintain an active Skriibe account. If you
          disconnect your Instagram account or delete your Skriibe account, your Instagram data will be
          permanently removed from our systems within 30 days.
        </p>
      </Section>

      <Section title="5. Your Rights">
        <p>You have the right to:</p>
        <ul>
          <li><strong>Access</strong> the data we hold about you</li>
          <li><strong>Correct</strong> inaccurate data</li>
          <li><strong>Delete</strong> your data by disconnecting your Instagram account or deleting your Skriibe account</li>
          <li><strong>Withdraw consent</strong> at any time by disconnecting your Instagram account from Skriibe</li>
        </ul>
        <p>
          To exercise any of these rights, please contact us at{" "}
          <a href="mailto:founder@skriibe.com">founder@skriibe.com</a>.
        </p>
      </Section>

      <Section title="6. Instagram API and Meta Platform Policy">
        <p>
          Skriibe uses the Instagram Basic Display API provided by Meta Platforms, Inc. By connecting
          your Instagram account, you also agree to{" "}
          <a href="https://www.instagram.com/legal/terms/api/" target="_blank" rel="noopener noreferrer">
            Instagram's Platform Policy
          </a>{" "}
          and{" "}
          <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer">
            Meta's Privacy Policy
          </a>.
        </p>
      </Section>

      <Section title="7. Cookies">
        <p>
          Skriibe may use cookies and similar tracking technologies to maintain your session and
          improve your experience. You can disable cookies in your browser settings, though some
          features of Skriibe may not function properly without them.
        </p>
      </Section>

      <Section title="8. Children's Privacy">
        <p>
          Skriibe is not intended for users under the age of 13. We do not knowingly collect personal
          information from children under 13. If you believe we have inadvertently collected such
          information, please contact us immediately.
        </p>
      </Section>

      <Section title="9. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any significant
          changes by posting the new policy on this page with an updated date. Continued use of
          Skriibe after changes constitutes acceptance of the updated policy.
        </p>
      </Section>

      <Section title="10. Contact Us">
        <p>If you have any questions or concerns about this Privacy Policy, please contact us at:</p>
        <p>
          <strong>Edlern Innovations Private Limited</strong><br />
          Sector 27 D, Chandigarh – 160019, India<br />
          Email: <a href="mailto:founder@skriibe.com">founder@skriibe.com</a><br />
          Website: <a href="https://skriibe.com">https://skriibe.com</a>
        </p>
      </Section>
    </main>
  );
}

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: "32px" }}>
      <h2 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "12px", borderBottom: "1px solid #eee", paddingBottom: "8px" }}>
        {title}
      </h2>
      {children}
    </section>
  );
}
