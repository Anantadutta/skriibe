import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Terms = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light');
      document.documentElement.classList.add('light');
    } else {
      document.body.classList.remove('light');
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'light' ? 'bg-[#f8fafc] text-black' : 'bg-[#0a0a0f] text-white'} flex flex-col`}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      
      <main className="flex-grow flex flex-col items-center p-6 sm:p-12 relative overflow-hidden font-syne">
        <div className="z-10 max-w-4xl w-full space-y-6 p-8 md:p-12 rounded-3xl text-left" style={{
          background: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          border: theme === 'light' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.08)',
          boxShadow: theme === 'light' ? '0 20px 40px rgba(0,0,0,0.05)' : '0 20px 40px rgba(0,0,0,0.3)'
        }}>
          <button 
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 mb-6 text-sm font-medium transition-colors ${theme === 'light' ? 'text-gray-500 hover:text-gray-900' : 'text-gray-400 hover:text-white'}`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#3BA8D8] to-[#7c3aed] mb-8 text-center break-words">
            Skriibe Terms of Service
          </h1>
          
          <div className={`text-base md:text-lg leading-relaxed space-y-6 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'} font-sans`}>
            <p className="font-semibold">LAST UPDATED: 18th June 2026</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>1. Introduction</h2>
            <p>Welcome to Skriibe ("Platform"). Skriibe is a creator monetization platform that enables users to pay to submit questions to creators through AMA (Ask Me Anything) and receive a response within the platform-defined response window, or a full refund. These Terms &amp; Conditions ("Terms"), together with our Privacy Policy, Contract Between Fan and Creator, Refund Policy, and Community Guidelines, form the complete legal agreement between you and Skriibe.</p>
            <p>By creating an account, making a payment, or using any feature of the Platform, you confirm that you have read, understood, and agree to be bound by these Terms. If you do not agree, discontinue use immediately.</p>
            <p>For the purposes of these Terms, "Platform" refers to the Skriibe website and all associated digital services operated by Edlern Innovations Private Limited.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>2. User Eligibility</h2>
            <p>2.1 Skriibe is intended exclusively for users who are <strong>18 years of age or older</strong>. By creating an account or accessing the Platform, you represent and warrant that you are at least 18 years old.</p>
            <p>2.2 If we discover that a user is under 18, we will immediately terminate their account and delete associated data in accordance with our Privacy Policy. We do not knowingly provide services to minors.</p>
            <p>2.3 By creating an account, you further represent and warrant that:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You are legally capable of entering into binding contracts under the Indian Contract Act, 1872.</li>
              <li>All information provided during registration is accurate, complete, and up to date.</li>
              <li>You are not subject to any legal prohibition that prevents you from using this Platform.</li>
              <li>Your use of the Platform does not violate any applicable laws in your jurisdiction.</li>
            </ul>
            <p>2.4 Skriibe may implement age verification checks at its sole discretion, including OTP-linked mobile verification or other mechanisms. Providing false age information constitutes fraud and Skriibe reserves all legal remedies in such cases.</p>
            <p>2.5 Skriibe reserves the right to verify user identity at any time and may request supporting documentation. Failure to provide verification within a reasonable period may result in account restriction or termination.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>3. Platform Usage</h2>
            <p>3.1 Skriibe provides a digital environment for the following interaction types during the initial platform phase:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>AMA (Ask Me Anything):</strong> Users pay to submit a question directly to a creator. The creator must respond within the platform-defined response window, or the user is entitled to a full refund, unless the creator validly rejects the question (see Section 4.6–4.7).</li>
            </ul>
            <p>3.2 All interactions on Skriibe are <strong>digital-only</strong>. No physical goods, in-person meetings, physical events, or offline services are facilitated, arranged, or implied through the Platform.</p>
            <p>3.3 Skriibe operates as an <strong>intermediary platform</strong> under the Information Technology Act, 2000. We provide the technology infrastructure that connects users and creators. Skriibe is not a party to the underlying interaction between a user and a creator, and does not endorse, verify, or guarantee the professional qualifications, expertise, identity claims, or advice provided by any creator.</p>
            <p>3.4 While Skriibe does not proactively monitor all user-generated content, we maintain a grievance redressal mechanism and will act on lawful takedown requests and complaints as required by the IT (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021. Skriibe's liability protection under Section 79 of the IT Act is contingent on adherence to applicable intermediary obligations.</p>
            <p>3.5 Users must not misuse the Platform, attempt to bypass payment systems, create false impressions of identity, or engage in any activity that disrupts Platform integrity or harms other users or creators.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>4. Paid Messaging Rules</h2>
            <p>4.1 Every paid message submitted through the Platform is subject to the creator's declared <strong>response fee</strong>, set solely by the creator within Skriibe's price guardrails.</p>
            <p>4.2 Upon successful payment:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The user's message is delivered to the creator's dashboard.</li>
              <li>The creator is contractually obligated to respond to, or validly reject (see Section 4.7), the question within the <strong>platform-defined response window</strong> — currently <strong>24 hours</strong>.</li>
            </ul>
            <p>4.3 Skriibe guarantees <strong>delivery</strong> of the user's message to the creator and guarantees that the creator is contractually bound to either respond to, or validly reject, the question within the defined window. Skriibe does not guarantee the substantive quality, depth, accuracy, or user satisfaction derived from a creator's response. If a creator neither responds to nor validly rejects the question within the window, the user's full refund remedy is as defined in the Refund &amp; Cancellation Policy.</p>
            <p>4.4 Users may submit <strong>one message per transaction</strong>. Additional messages require separate payments.</p>
            <p>4.5 Users must not submit messages that:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Contain requests for illegal services or activities.</li>
              <li>Are sexually explicit, abusive, threatening, or harassing in nature.</li>
              <li>Attempt to solicit a creator's personal contact information.</li>
              <li>Are designed to spam or flood a creator's inbox.</li>
              <li>Violate any provision of these Terms or the Community Guidelines.</li>
            </ul>
            <p>4.6 For <strong>AMA questions</strong>:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Each paid question is submitted directly to the creator. There is no session window, queue, or pool of competing submissions.</li>
              <li>The paid fee entitles the user to a response within the response window, or a full refund. The only exception is where the creator validly rejects the question under Section 4.7.</li>
              <li>This guarantee, and the rejection conditions in Section 4.7, are prominently disclosed at the point of AMA payment. By proceeding with payment, users acknowledge and accept these terms.</li>
              <li>Creators are responsible for responding to, or validly rejecting, every paid question they accept, within the response window (see Section 4.7).</li>
            </ul>
            <p>4.7 A creator may reject a submitted question without that rejection constituting a breach of Section 4.2–4.3, but only for reasons set out in the Contract Between Fan and Creator (for example, the question falls outside the creator's expertise, is incomplete, misleading, or unclear, or violates these Terms, the Community Guidelines, or applicable law). A valid rejection must occur within the response window.</p>
            <p>4.8 A creator who neither responds to nor validly rejects a question within the response window is in breach of this Section, and the user is entitled to a full refund as set out in the Refund &amp; Cancellation Policy.</p>
            <p>4.9 Skriibe employs impersonation detection and will remove accounts found impersonating public figures, celebrities, or other creators. Users should independently verify creator authenticity.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>5. Creator Responsibilities</h2>
            <p>5.1 Creators are independent individuals or entities who onboard Skriibe to offer paid digital interactions. They are <strong>not employees, agents, partners, or representatives</strong> of Skriibe.</p>
            <p>5.2 Creators are responsible for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Responding to paid messages within the declared response window.</li>
              <li>Maintaining professional and respectful conduct in all interactions.</li>
              <li>Ensuring their content complies with Indian law and these Terms.</li>
              <li>Declaring and paying applicable taxes on earnings, including Income Tax and GST where applicable.</li>
              <li>Accurately representing their identity, background, and expertise during onboarding and on their public profile.</li>
            </ul>
            <p>5.3 Creators must not:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Accept payment outside the Platform to bypass Skriibe's commission structure.</li>
              <li>Provide false or misleading information about themselves or their qualifications.</li>
              <li>Offer services or make representations that violate Platform guidelines or applicable law.</li>
              <li>Share user personal information with any third party.</li>
            </ul>
            <p>5.4 Full creator obligations, payout terms, and conduct standards are detailed in the <strong>Contract Between Fan and Creator</strong>, which forms an integral part of this legal framework.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>6. Prohibited Content and Behaviour</h2>
            <p>The following are strictly prohibited on Skriibe and may result in immediate account suspension, content removal, forfeiture of pending payouts (for creators), and/or legal action:</p>
            <p><strong>6.1 Content Prohibitions:</strong></p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sexually explicit, pornographic, or adult content of any nature.</li>
              <li>Content promoting violence, self-harm, suicide, terrorism, or extremism.</li>
              <li>Content that defames, harasses, threatens, or intimidates any individual.</li>
              <li>Misinformation, fraudulent claims, impersonation, or false identity.</li>
              <li>Content that infringes any third-party intellectual property rights.</li>
              <li>Content involving or exploiting minors in any harmful manner.</li>
              <li>Content promoting or normalizing casteism, communalism, or religious hate.</li>
            </ul>
            <p><strong>6.2 Behavioural Prohibitions:</strong></p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Circumventing or attempting to circumvent Platform payment mechanisms.</li>
              <li>Creating fake accounts, purchasing engagement, or manipulating Platform metrics.</li>
              <li>Attempting unauthorized access to Platform systems, databases, or user data.</li>
              <li>Engaging in phishing, scamming, or any form of financial manipulation.</li>
              <li>Coordinated inauthentic behaviour, bot activity, or platform manipulation.</li>
              <li>Soliciting off-platform arrangements from creators or users via the Platform.</li>
            </ul>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>7. Payment Terms</h2>
            <p>7.1 All payments on Skriibe are processed in <strong>Indian Rupees (INR)</strong> through our authorized payment gateway partner, <strong>Razorpay</strong>, which holds valid RBI authorization as a Payment Aggregator.</p>
            <p>7.2 Payment is collected from the user at the time of message submission. Funds are held and processed by the payment gateway in accordance with RBI regulations until creator response obligations are fulfilled.</p>
            <p>7.3 Skriibe facilitates payments through Razorpay, a duly authorised Payment Aggregator under RBI Master Directions on Payment Aggregators and Payment Gateways (2020). Skriibe itself does not hold, pool, or aggregate user funds. All payment collection, settlement, and fund-flow functions are performed by Razorpay. Skriibe acts solely as a technology platform facilitating the introduction of users and creators.</p>
            <p>7.4 Skriibe charges a <strong>platform commission</strong> on every transaction, as set out in the Refund &amp; Cancellation Policy. The net amount (after commission and applicable TDS deductions) is credited to the creator's registered bank account.</p>
            <p>7.5 All transaction fees displayed on the Platform are <strong>inclusive of applicable Goods and Services Tax (GST)</strong> unless explicitly stated otherwise. Skriibe will issue GST-compliant digital receipts for all user transactions. Creators are responsible for their own GST compliance on earnings received.</p>
            <p>7.6 Users are responsible for ensuring sufficient funds in their payment method. Failed transactions do not result in message delivery and are refunded per the Refund &amp; Cancellation Policy.</p>
            <p>7.7 Skriibe is not a banking institution and does not accept deposits. We do not hold user funds as deposits and are not a payment aggregator for regulatory purposes beyond the gateway relationship described above.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>8. Refund &amp; Cancellation Policy</h2>
            <p>8.1 Refunds are governed by the <strong>Refund &amp; Cancellation Policy</strong>, which forms an integral part of these Terms.</p>
            <p>8.2 In summary:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>If a creator <strong>fails to respond to, or validly reject, a question</strong> within the defined response window, the user is entitled to a <strong>full refund</strong>.</li>
              <li>A creator's valid rejection of a question, in accordance with Section 4.7 and the Contract Between Fan and Creator, does not constitute a breach of this Section.</li>
              <li><strong>No refunds</strong> are issued for completed creator responses solely on the basis of subjective user dissatisfaction.</li>
              <li>Quality dispute refunds are subject to Skriibe's discretionary review per the Refund Policy.</li>
              <li>Refunds for failed transactions are processed within <strong>5–7 business days</strong> to the original payment method.</li>
            </ul>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>9. Intellectual Property</h2>
            <p>9.1 All Platform content including the Skriibe name, logo, interface design, underlying technology, and branding is the exclusive intellectual property of <strong>Edlern Innovations Private Limited</strong> and is protected under applicable Indian IP laws.</p>
            <p>9.2 Users and creators <strong>retain full ownership</strong> of the original content they create and submit on the Platform.</p>
            <p>9.3 By submitting content on Skriibe, users and creators grant Skriibe a <strong>non-exclusive, royalty-free, worldwide, sub-licensable license</strong> to display, store, transmit, and process such content solely for the purpose of operating and improving the Platform.</p>
            <p>9.4 Skriibe will not sell, license, or commercially exploit user-generated or creator-generated content beyond Platform operations without prior written consent from the respective content owner.</p>
            <p>9.5 Any feedback, suggestions, or ideas voluntarily submitted to Skriibe may be used by us freely without obligation, compensation, or attribution.</p>
            <p>9.6 Skriibe respects third-party intellectual property rights. Users or creators who believe their IP has been infringed on the Platform may submit a takedown request to support@skriibe.com. Skriibe will process valid takedown requests in accordance with the IT Act and applicable law.</p>
            <p>9.7 Cross-border transfer of personal data (as opposed to content data covered by this Section 9) is governed by the Privacy Policy.</p>
            <p>9.8 Accounts subject to repeated valid intellectual property complaints may be suspended or terminated.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>10. Account Suspension and Termination</h2>
            <p>10.1 Skriibe reserves the right to suspend or terminate any account at its discretion, with or without prior notice, if:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The user or creator violates these Terms, Community Guidelines, or the Contract Between Fan and Creator.</li>
              <li>Fraudulent, deceptive, or abusive activity is detected on the account.</li>
              <li>Legal, regulatory, or compliance requirements necessitate it.</li>
              <li>The account poses a demonstrable risk to the Platform, other users, or creators.</li>
            </ul>
            <p>10.2 <strong>Upon termination of a creator account:</strong></p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Pending user messages in queue will be refunded to respective users.</li>
              <li>Legitimately earned but unpaid creator payouts will be reviewed and settled within <strong>30 days</strong>, subject to fraud investigation findings.</li>
            </ul>
            <p>10.3 <strong>Upon termination of a user account:</strong></p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Any pending paid interactions will be refunded if no creator response has been delivered at the time of termination.</li>
            </ul>
            <p>10.4 Users and creators may appeal account suspensions by writing to <strong>support@skriibe.com</strong> within <strong>14 days</strong> of the suspension notice with the subject line "Account Appeal – [USERNAME]". Appeals will be reviewed within <strong>7 business days</strong>.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>11. Limitation of Liability</h2>
            <p>11.1 Skriibe provides the Platform on an <strong>"as is" and "as available"</strong> basis. We do not guarantee uninterrupted, error-free, or fully secure operation at all times.</p>
            <p>11.2 To the maximum extent permitted by applicable law, Skriibe shall not be liable for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Any indirect, incidental, consequential, special, or punitive damages.</li>
              <li>Loss of data, revenue, profits, or business opportunities.</li>
              <li>The quality, accuracy, legality, or fitness for purpose of any creator response.</li>
              <li>Technical failures arising from third-party services including payment gateways, WhatsApp API providers, or email delivery services.</li>
              <li>Any harm arising from user-to-creator or creator-to-user interactions on the Platform.</li>
            </ul>
            <p>11.3 Without prejudice to any rights available to consumers under the <strong>Consumer Protection Act, 2019</strong>, Skriibe's total aggregate liability to any user or creator shall not exceed the greater of: (a) the amount paid by the user or earned by the creator in respect of the specific transaction giving rise to the claim; or (b) ₹5,000. This limitation does not apply to claims arising from Skriibe's own fraud, gross negligence, or willful misconduct.</p>
            <p>11.4 Nothing in these Terms shall exclude or limit liability in ways that are not permissible under Indian law.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>12. Dispute Resolution</h2>
            <p>12.1 <strong>User-Platform Disputes:</strong> Users who qualify as consumers under the <strong>Consumer Protection Act, 2019</strong> retain all rights to approach Consumer Disputes Redressal Commissions as provided by law. Such users are not required to submit consumer disputes to arbitration.</p>
            <p>12.2 <strong>Creator-Platform Disputes:</strong> Creators, operating as independent service providers and not as consumers, agree that any dispute, claim, or controversy arising out of or relating to this Agreement or the Platform shall be resolved through <strong>binding arbitration</strong> under the Arbitration and Conciliation Act, 1996 (as amended by the 2019 Amendment). The seat and venue of arbitration shall be <strong>Chandigarh, India</strong>. A sole arbitrator shall be appointed by mutual consent or, failing agreement within 15 days, by the competent court in Chandigarh. The arbitration shall be conducted in English and the award shall be final and binding.</p>
            <p>12.3 <strong>User-Creator Disputes:</strong> Skriibe may, at its discretion, facilitate mediation between users and creators but is not an adjudicating authority. Skriibe's refund and account decisions in such disputes are administrative determinations and do not constitute a legal judgment or award.</p>
            <p>12.4 <strong>Pre-Dispute Resolution:</strong> All parties agree to first attempt resolution through good-faith written negotiation within <strong>15 days</strong> of the dispute arising before initiating any formal proceedings.</p>
            <p>12.5 Notwithstanding the above, Skriibe may seek immediate injunctive or other equitable relief in any court of competent jurisdiction to prevent irreparable harm.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>13. Governing Law</h2>
            <p>These Terms are governed by and construed in accordance with the laws of the <strong>Republic of India</strong>. Subject to the arbitration and consumer forum provisions above, the courts of <strong>Chandigarh, India</strong> shall have exclusive jurisdiction over any disputes arising under these Terms.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>14. Force Majeure</h2>
            <p>Skriibe shall not be liable for any failure or delay in performance of its obligations under these Terms where such failure or delay results from causes beyond Skriibe's reasonable control, including but not limited to: acts of God, government orders or regulations, national emergencies, internet or telecommunications outages, cyberattacks or data breaches by third parties, payment gateway failures, or any other event outside Skriibe's reasonable control. Skriibe will make reasonable efforts to resume normal operations as soon as possible and will notify affected users or creators of such events.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>15. Electronic Contracts</h2>
            <p>You agree that your acceptance of these Terms — whether by clicking "I Agree", checking an acceptance box, or by continued use of the Platform — constitutes a valid, legally binding electronic contract ("clickwrap" acceptance) under <strong>Section 10A of the Information Technology Act, 2000</strong> and the <strong>Indian Contract Act, 1872</strong>. You waive any right to claim that these Terms are unenforceable solely on the grounds of being in electronic form.</p>
            <p>Skriibe may preserve logs, metadata, and records as required under applicable CERT-In directions and Indian cybersecurity laws.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>16. Amendments</h2>
            <p>Skriibe may update these Terms at any time. Users and creators will be notified via email or in-app notification at least <strong>7 days</strong> before material changes take effect. Continued use of the Platform after the effective date of revised Terms constitutes acceptance of the revised Terms. If you do not agree to revised Terms, you must cease using the Platform before the effective date.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>17. Severability</h2>
            <p>If any provision of these Terms is found to be invalid, illegal, or unenforceable under applicable law, that provision shall be modified to the minimum extent necessary to make it enforceable, or severed if modification is not possible, without affecting the validity or enforceability of the remaining provisions.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>18. Contact</h2>
            <p><strong>Edlern Innovations Private Limited</strong></p>
            <p>Legal: <a href="mailto:support@skriibe.com" className="text-[#3BA8D8] hover:underline">support@skriibe.com</a></p>
            <p>Support: <a href="mailto:support@skriibe.com" className="text-[#3BA8D8] hover:underline">support@skriibe.com</a></p>
            <p>Grievance Officer: Tarundeep Singh, Founder — <a href="mailto:founder@skriibe.com" className="text-[#3BA8D8] hover:underline">founder@skriibe.com</a></p>
            <p>If you wish to communicate with us about Skriibe or our Terms of Service, please email <a href="mailto:support@skriibe.com" className="text-[#3BA8D8] hover:underline">support@skriibe.com</a></p>
          </div>
        </div>
      </main>

      <Footer theme={theme} />
    </div>
  );
};

export default Terms;
