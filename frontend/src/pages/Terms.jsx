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
            <p className="font-semibold">LAST UPDATED:&nbsp; September 2026</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>1. Introduction</h2>
            <p>Welcome to Skriibe ("Platform"). Skriibe is a creator monetization platform that connects users with creators through three interaction models: (1) Live Chat — real-time, pay-per-minute conversations with online creators; (2) AMA (Ask Me Anything) — paid asynchronous question/messages sent to an offline creator, responded to at the creator's discretion; and (3) Tips — voluntary gratuities sent by fans to creators after a completed Live Chat. New users are also eligible for a one-time free 2-minute Live Chat trial, as described in Section 3.4. These Terms &amp; Conditions ("Terms"), together with our Privacy Policy, Contract Between Fan and Creator, Refund &amp; Cancellation Policy, and Community Guidelines, form the complete legal agreement between you and Skriibe.</p>
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
            <p>3.1 Skriibe provides a digital environment for the following interaction types:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Live Chat:</strong> A real-time text-based interaction between a user and an online creator, charged on a pay-per-minute basis at the creator's declared rate. Billing commences when both parties are connected and ends when either party ends the session. Only minutes actually used are charged. See Section 4.1 for detailed rules.</li>
              <li><strong>3.1.2 AMA (Ask Me Anything):</strong> A paid asynchronous feature available when a creator is offline. The user pays a flat fee set by the creator to submit a written question/message. The creator responds at their discretion with no fixed response deadline. If the creator does not respond within 15 days of submission, and the submitted question/message did not itself violate Skriibe's Community Guidelines, Skriibe will initiate a 100% refund to the user's Skriibe Wallet balance within 48 hours of the 15-day window closing. If the question/message violated Community Guidelines, no refund is issued even after 15 days. For all other concerns — including any issue with a creator's response, suspected misconduct, technical problems, or any other dispute — the user must raise a query through the Skriibe Support section with relevant details. Skriibe will review and respond within 48 hours. Any approved refund will be added to the user's Skriibe Wallet balance at Skriibe's sole discretion (full or partial). See Section 4.2 and the Refund &amp; Cancellation Policy for full details.</li>
              <li><strong>3.1.3 Tip:</strong> A voluntary, non-refundable monetary gratuity that a user may send to a creator upon or after completion of a Live Chat session. Tips are entirely discretionary and confer no additional rights, obligations, or entitlements on either party. See Section 4.3 for detailed rules.</li>
              <li><strong>3.4 First Free Chat Trial:</strong> New users are entitled to a one-time complimentary Live Chat trial of up to 2 minutes with any creator of their choice. A "new user" is defined as an individual whose mobile number and device ID have not previously been registered on Skriibe. The free trial is strictly limited to one per unique user, one time ever — it does not reset and cannot be claimed again under a different account or device. No payment method is required to commence the trial, but the user must register an account. Minutes beyond the free 2-minute window are charged at the creator's standard per-minute rate; the user will be prompted to add a payment method if they wish to continue past the free period. Skriibe reserves the right to withdraw or modify the free trial offer at any time for new users, without affecting trials already in progress.</li>
            </ul>
            <p>3.2 All interactions on Skriibe are <strong>digital-only</strong>. No physical goods, in-person meetings, physical events, or offline services are facilitated, arranged, or implied through the Platform.</p>
            <p>3.3 Skriibe operates as an <strong>intermediary platform</strong> under the Information Technology Act, 2000. We provide the technology infrastructure that connects users and creators. Skriibe is not a party to the underlying interaction between a user and a creator, and does not endorse, verify, or guarantee the professional qualifications, expertise, identity claims, or advice provided by any creator.</p>
            <p>3.5 While Skriibe does not proactively monitor all user-generated content, we maintain a grievance redressal mechanism and will act on lawful takedown requests and complaints as required by the IT (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021. Skriibe's liability protection under Section 79 of the IT Act is contingent on adherence to applicable intermediary obligations.</p>
            <p>3.5 Users must not misuse the Platform, attempt to bypass payment systems, create false impressions of identity, or engage in any activity that disrupts Platform integrity or harms other users or creators.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>4. Paid Messaging Rules</h2>
            <p>4.1 <strong>Live Chat Rules:</strong> Live Chat sessions are billed per minute at the creator's declared rate. A valid payment method is required before initiating a paid Live Chat. Billing begins when both parties are connected and ceases when either party ends or disconnects from the session. Only elapsed minutes are charged; partial minutes are rounded up to the nearest full minute. Skriibe does not guarantee that a creator will accept any incoming Live Chat request. If a user has any concern about a Live Chat session — including technical failure, creator disconnect, conduct issues, or billing — the user must raise a query through the Skriibe Support section with relevant details within <strong>24 hours</strong> of the session ending. Skriibe will review the query, verify against platform logs where applicable, and respond within 48 hours with a decision at Skriibe's sole discretion. Any approved refund (full or partial) will be added to the user's Skriibe Wallet balance. Tips sent after a Live Chat session are governed by Section 4.3.</p>
            <p>4.2 <strong>AMA Rules:</strong> AMA question/messages/messages are submitted when the creator is offline. The user pays a flat fee to submit a written question/message. There is no fixed response deadline. If the creator has not responded within 15 days of submission, and the submitted question/message did not violate Skriibe's Community Guidelines, Skriibe will initiate a 100% refund to the user's Skriibe Wallet balance within 48 hours of the 15-day window closing. If the question/message violated Community Guidelines, no refund is issued even after 15 days. For all other AMA concerns, the user must raise a query through the Skriibe Support section with relevant details. Skriibe will review and respond within 48 hours. Any approved refund (full or partial) is credited to the Skriibe Wallet at Skriibe's sole discretion. Users may submit one question/message per AMA transaction.</p>
            <p>4.3 <strong>Tip Rules:</strong> Tips are voluntary gratuities a user may send to a creator after completing a Live Chat. Tips are processed immediately and are non-refundable once sent. No portion of a Tip is guaranteed to be returned regardless of circumstances. Tips do not entitle users to any additional service, extended access, preferential treatment, or continued interaction. Skriibe's platform commission applies to Tips in the same proportion as other transactions.</p>
            <p>4.5 Users must not submit messages that:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Contain requests for illegal services or activities.</li>
              <li>Are sexually explicit, abusive, threatening, or harassing in nature.</li>
              <li>Attempt to solicit a creator's personal contact information.</li>
              <li>Are designed to spam or flood a creator's inbox.</li>
              <li>Violate any provision of these Terms or the Community Guidelines.</li>
            </ul>
            <p>4.6 <strong>AMA Question/messages/messages — Non-Response:</strong> Skriibe does not provide a rejection mechanism for AMA question/messages. Creators either respond to a submitted question/message or do not respond. If a creator does not respond within 15 days of submission, and the submitted question/message did not violate Skriibe's Community Guidelines, Skriibe will initiate a 100% refund to the user's Skriibe Wallet balance within 48 hours of the 15-day window closing. If the question/message violated Community Guidelines, no refund is initiated. For any other concern about an AMA response or creator conduct, users may raise a query through the Skriibe Support section — see Section 8.2.</p>
            <p>4.8 Skriibe employs impersonation detection and will remove accounts found impersonating public figures, celebrities, or other creators. Users should independently verify creator authenticity.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>5. Creator Responsibilities</h2>
            <p>5.1 Creators are independent individuals or entities who onboard Skriibe to offer paid digital interactions. They are <strong>not employees, agents, partners, or representatives</strong> of Skriibe.</p>
            <p>5.2 Creators are responsible for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Responding to Live Chat sessions in real time and to AMA messages within the 15-day window described in these Terms.</li>
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
            <p className="font-semibold mt-4">6.1 Content Prohibitions:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sexually explicit, pornographic, or adult content of any nature.</li>
              <li>Content promoting violence, self-harm, suicide, terrorism, or extremism.</li>
              <li>Content that defames, harasses, threatens, or intimidates any individual.</li>
              <li>Misinformation, fraudulent claims, impersonation, or false identity.</li>
              <li>Content that infringes any third-party intellectual property rights.</li>
              <li>Content involving or exploiting minors in any harmful manner.</li>
              <li>Content promoting or normalizing casteism, communalism, or religious hate.</li>
            </ul>
            <p className="font-semibold mt-4">6.2 Behavioural Prohibitions:</p>
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
            <p>7.2 For AMA and Tips, payment is collected from the user at the time of submission or tip confirmation. For Live Chat, an authorisation hold may be placed at session start; the actual charge is calculated based on session duration and settled post-session. All funds are processed by Razorpay in accordance with RBI regulations.</p>
            <p>7.3 Skriibe facilitates payments through Razorpay, a duly authorised Payment Aggregator under RBI Master Directions on Payment Aggregators and Payment Gateways (2020). Skriibe itself does not hold, pool, or aggregate user funds. All payment collection, settlement, and fund-flow functions are performed by Razorpay. Skriibe acts solely as a technology platform facilitating the introduction of users and creators.</p>
            <p>7.4 Skriibe charges a <strong>platform commission</strong> on every transaction (Live Chat, AMA, and Tips), as set out in the Refund &amp; Cancellation Policy. The net amount (after commission and applicable TDS deductions) is credited to the creator's registered bank account. Tips are subject to the same commission structure.</p>
            <p>7.5 All transaction fees displayed on the Platform are <strong>inclusive of applicable Goods and Services Tax (GST)</strong> unless explicitly stated otherwise. Skriibe will issue GST-compliant digital receipts for all user transactions. Creators are responsible for their own GST compliance on earnings received.</p>
            <p>7.6 Users are responsible for ensuring sufficient funds in their payment method. Failed transactions do not result in message delivery and are refunded per the Refund &amp; Cancellation Policy.</p>
            <p>7.7 Skriibe is not a banking institution and does not accept deposits. We do not hold user funds as deposits and are not a payment aggregator for regulatory purposes beyond the gateway relationship described above.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>8. Refund &amp; Cancellation Policy</h2>
            <p>8.1 Refunds are governed by the <strong>Refund &amp; Cancellation Policy</strong>, which forms an integral part of these Terms.</p>
            <p>8.2 <strong>Refund Process — All Models:</strong> Skriibe operates a support-based refund review process. For AMA non-response, Skriibe will initiate a refund within 48 hours of the 15-day window closing (see below). All other refund requests for Live Chat and AMA must be raised through the Skriibe Support section with relevant details. Skriibe will review and respond within 48 hours. All approved refunds are added to the user's Skriibe Wallet balance at Skriibe's sole discretion (full or partial). In summary by model:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Live Chat:</strong> No automatic refunds. User raises query at Support within 24 hours of session end with relevant details (e.g. technical failure, creator disconnect, conduct issue). Skriibe reviews and decides within 48 hours. Any approved refund (full or partial) to Skriibe Wallet.</li>
              <li><strong>AMA — Skriibe-initiated refund:</strong> If creator does not respond within 15 days AND the submitted question/message did not violate Community Guidelines &rarr; Skriibe initiates 100% refund to Skriibe Wallet balance within 48 hours of day 15. If the question/message violated Community Guidelines, no refund. For all other AMA concerns &rarr; user raises query at Support &rarr; Skriibe reviews and decides within 48 hours &rarr; approved refund (full or partial) to Skriibe Wallet.</li>
              <li><strong>Tips:</strong> Non-refundable under all circumstances once confirmed.</li>
              <li>Failed or duplicate payment transactions: 100% refund processed within 5–7 business days to the original payment method.</li>
            </ul>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>9. Intellectual Property</h2>
            <p>9.1 All Platform content including the Skriibe name, logo, interface design, underlying technology, and branding is the exclusive intellectual property of <strong>Edlern Innovations Private Limited</strong> and is protected under applicable Indian IP laws.</p>
            <p>9.2 Users and creators <strong>retain full ownership</strong> of the original content they create and submit on the Platform.</p>
            <p>9.3 By submitting content on Skriibe, users and creators grant Skriibe a <strong>non-exclusive, royalty-free, worldwide, sub-licensable licence</strong> to display, store, transmit, and process such content solely for the purpose of operating, maintaining, and displaying the Platform's services.</p>
            <p>9.4 Skriibe will not sell, license, or commercially exploit user-generated or creator-generated content beyond Platform operations without prior written consent from the respective content owner.</p>
            <p>9.5 Any feedback, suggestions, or ideas voluntarily submitted to Skriibe may be used by us freely without obligation, compensation, or attribution.</p>
            <p>9.6 Skriibe respects third-party intellectual property rights. Users or creators who believe their IP has been infringed on the Platform may submit a takedown request to <a href="mailto:Support@skriibe.com" className="text-[#3BA8D8] hover:underline">Support@skriibe.com</a>. Skriibe will process valid takedown requests in accordance with the IT Act and applicable law.</p>
            <p>9.7 Cross-border transfers of personal data are governed by Skriibe's Privacy Policy.</p>
            <p>9.8 Accounts subject to repeated valid intellectual property complaints may be suspended or terminated</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>10. Account Suspension and Termination</h2>
            <p>10.1 Skriibe reserves the right to suspend or terminate any account at its discretion, with or without prior notice, if:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The user or creator violates these Terms, Community Guidelines, or Creator Agreement.</li>
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
            <p>10.4 Users and creators may appeal account suspensions by writing to <a href="mailto:Support@skriibe.com" className="text-[#3BA8D8] hover:underline">Support@skriibe.com</a> within <strong>14 days</strong> of the suspension notice with the subject line "Account Appeal – [USERNAME]". Appeals will be reviewed within <strong>7 business days</strong>.</p>

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
            <p>You agree that your acceptance of these Terms — whether by clicking "I Agree", checking an acceptance box, or by continued use of the Platform — constitutes a valid, legally binding electronic contract under the <strong>Information Technology Act, 2000</strong> and the <strong>Indian Contract Act, 1872</strong>. You waive any right to claim that these Terms are unenforceable solely on the grounds of being in electronic form.</p>
            <p>Skriibe may preserve logs, metadata, and records as required under applicable CERT-In directions and Indian cybersecurity laws</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>16. Amendments</h2>
            <p>Skriibe may update these Terms at any time. Users and creators will be notified via email or in-app notification at least <strong>7 days</strong> before material changes take effect. Continued use of the Platform after the effective date of revised Terms constitutes acceptance of the revised Terms. If you do not agree to revised Terms, you must cease using the Platform before the effective date.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>17. Severability</h2>
            <p>If any provision of these Terms is found to be invalid, illegal, or unenforceable under applicable law, that provision shall be modified to the minimum extent necessary to make it enforceable, or severed if modification is not possible, without affecting the validity or enforceability of the remaining provisions.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>18. Grievance Redressal Policy</h2>
            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>18.1 Purpose</h3>
            <p>This Grievance Redressal Policy sets out how Skriibe (operated by Edlern Innovations Private Limited) handles complaints, grievances, and reports submitted by users and creators of the Skriibe platform. It is published in compliance with Rule 3(1)(b)(xii) and Rule 3A of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 ("IT Rules 2021"), the Digital Personal Data Protection Act, 2023, and the Consumer Protection Act, 2019.</p>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>18.2 Grievance Officer</h3>
            <p>Skriibe has appointed a Grievance Officer, resident in India, who is responsible for receiving and processing all grievances submitted to Skriibe.</p>

            <div className="overflow-x-auto my-6">
              <table className={`w-full border-collapse border text-sm md:text-base ${theme === 'light' ? 'border-gray-300 bg-white' : 'border-gray-700 bg-white/[0.02]'}`}>
                <tbody>
                  <tr className={`border-b ${theme === 'light' ? 'border-gray-300' : 'border-gray-700'}`}>
                    <td className={`w-1/3 sm:w-1/4 px-4 py-3 font-semibold border-r ${theme === 'light' ? 'bg-[#f0f4fa] text-gray-900 border-gray-300' : 'bg-white/[0.06] text-white border-gray-700'}`}>
                      Name
                    </td>
                    <td className={`px-4 py-3 ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                      Tarundeep Singh
                    </td>
                  </tr>
                  <tr className={`border-b ${theme === 'light' ? 'border-gray-300' : 'border-gray-700'}`}>
                    <td className={`w-1/3 sm:w-1/4 px-4 py-3 font-semibold border-r ${theme === 'light' ? 'bg-[#f0f4fa] text-gray-900 border-gray-300' : 'bg-white/[0.06] text-white border-gray-700'}`}>
                      Designation
                    </td>
                    <td className={`px-4 py-3 ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                      Founder, Edlern Innovations Private Limited
                    </td>
                  </tr>
                  <tr className={`border-b ${theme === 'light' ? 'border-gray-300' : 'border-gray-700'}`}>
                    <td className={`w-1/3 sm:w-1/4 px-4 py-3 font-semibold border-r ${theme === 'light' ? 'bg-[#f0f4fa] text-gray-900 border-gray-300' : 'bg-white/[0.06] text-white border-gray-700'}`}>
                      Email
                    </td>
                    <td className={`px-4 py-3 ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                      <a href="mailto:Founder@skriibe.com" className="text-[#3BA8D8] hover:underline font-medium">
                        Founder@skriibe.com
                      </a>
                    </td>
                  </tr>
                  <tr className={`border-b ${theme === 'light' ? 'border-gray-300' : 'border-gray-700'}`}>
                    <td className={`w-1/3 sm:w-1/4 px-4 py-3 font-semibold border-r ${theme === 'light' ? 'bg-[#f0f4fa] text-gray-900 border-gray-300' : 'bg-white/[0.06] text-white border-gray-700'}`}>
                      Address
                    </td>
                    <td className={`px-4 py-3 ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                      Chandigarh – 160019, India
                    </td>
                  </tr>
                  <tr>
                    <td className={`w-1/3 sm:w-1/4 px-4 py-3 font-semibold border-r ${theme === 'light' ? 'bg-[#f0f4fa] text-gray-900 border-gray-300' : 'bg-white/[0.06] text-white border-gray-700'}`}>
                      Availability
                    </td>
                    <td className={`px-4 py-3 ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                      Monday to Friday, 10:00 AM – 6:00 PM IST (excluding public holidays)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p>Grievances may be submitted by email to the above address at any time. The Grievance Officer will acknowledge receipt within 24 hours and work to resolve the grievance within 15 days of receipt, as required by IT Rules 2021.</p>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>18.3 Types of Grievances Accepted</h3>
            <p>Skriibe's grievance mechanism covers the following categories:</p>

            <h4 className={`text-lg font-semibold mt-4 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>18.3.1 Content-Related Grievances</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>Illegal content (including content relating to terrorism, child sexual abuse material, financial fraud, or other criminal activity)</li>
              <li>Content that violates Skriibe's Community Guidelines</li>
              <li>Content that is defamatory, obscene, or harassing</li>
              <li>Copyright or intellectual property infringement</li>
              <li>Impersonation of a real person, brand, or public figure</li>
              <li>Misinformation or deliberately false content</li>
            </ul>

            <h4 className={`text-lg font-semibold mt-4 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>18.3.2 Privacy &amp; Data Grievances</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>Unauthorised collection, use, or disclosure of your personal data</li>
              <li>Request to exercise data principal rights under the DPDPA 2023 (access, correction, erasure, withdrawal of consent)</li>
              <li>Concerns about how Skriibe handles your personal information</li>
              <li>Data breach notification queries</li>
            </ul>

            <h4 className={`text-lg font-semibold mt-4 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>18.3.3 Account &amp; Transaction Grievances</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>Account suspension or termination disputes</li>
              <li>Billing errors or incorrect charges</li>
              <li>Payout disputes (creators only)</li>
              <li>Refund decision disputes not resolved through the Support process</li>
              <li>Creator strike or enforcement action disputes</li>
            </ul>

            <h4 className={`text-lg font-semibold mt-4 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>18.3.4 Platform Conduct Grievances</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>Harassment, abuse, or threats from another user or creator</li>
              <li>Scam or fraud attempts on the platform</li>
              <li>Sexual harassment or exploitation</li>
              <li>Any other concern about the conduct of a platform participant</li>
            </ul>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>18.4 How to Submit a Grievance</h3>
            <p>Grievances must be submitted in writing (email is acceptable) to the Grievance Officer at <a href="mailto:Support@skriibe.com" className="text-[#3BA8D8] hover:underline font-medium">Support@skriibe.com</a> with the following information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your full name and registered email address or phone number</li>
              <li>A clear description of the grievance</li>
              <li>The category of grievance (content, privacy, account, conduct)</li>
              <li>Any supporting evidence (screenshots, transaction IDs, dates, usernames)</li>
              <li>The outcome you are seeking (e.g. content removal, refund, account reinstatement)</li>
            </ul>
            <p>Anonymous grievances may be accepted for serious content violations (e.g. CSAM reports) at Skriibe's discretion, but Skriibe cannot guarantee a personalised response to anonymous submissions.</p>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>18.5 Grievance Resolution Timelines</h3>

            <div className="overflow-x-auto my-6">
              <table className={`w-full border-collapse border text-sm md:text-base ${theme === 'light' ? 'border-gray-300 bg-white' : 'border-gray-700 bg-white/[0.02]'}`}>
                <thead>
                  <tr className={`border-b ${theme === 'light' ? 'border-gray-300 bg-[#f0f4fa]' : 'border-gray-700 bg-white/[0.06]'}`}>
                    <th className={`w-1/2 px-4 py-3 text-left font-bold border-r ${theme === 'light' ? 'text-gray-900 border-gray-300' : 'text-white border-gray-700'}`}>
                      Step
                    </th>
                    <th className={`w-1/2 px-4 py-3 text-left font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                      Timeline
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={`border-b ${theme === 'light' ? 'border-gray-300' : 'border-gray-700'}`}>
                    <td className={`px-4 py-3 border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      Acknowledgement of receipt
                    </td>
                    <td className={`px-4 py-3 ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                      Within 24 hours of submission
                    </td>
                  </tr>
                  <tr className={`border-b ${theme === 'light' ? 'border-gray-300' : 'border-gray-700'}`}>
                    <td className={`px-4 py-3 border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      Initial review and response
                    </td>
                    <td className={`px-4 py-3 ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                      Within 7 days of submission
                    </td>
                  </tr>
                  <tr className={`border-b ${theme === 'light' ? 'border-gray-300' : 'border-gray-700'}`}>
                    <td className={`px-4 py-3 border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      Full resolution
                    </td>
                    <td className={`px-4 py-3 ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                      Within 15 days of submission (per IT Rules 2021)
                    </td>
                  </tr>
                  <tr className={`border-b ${theme === 'light' ? 'border-gray-300' : 'border-gray-700'}`}>
                    <td className={`px-4 py-3 border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      CSAM / child safety content takedown
                    </td>
                    <td className={`px-4 py-3 ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                      Immediately upon identification / valid report
                    </td>
                  </tr>
                  <tr>
                    <td className={`px-4 py-3 border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      Court order or government directive compliance
                    </td>
                    <td className={`px-4 py-3 ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                      As directed by the order / directive
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p>If a grievance cannot be resolved within 15 days due to its complexity, Skriibe will inform you of the reason for the delay and the expected resolution date.</p>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>18.6 CSAM and Child Safety Reporting</h3>
            <p>Reports of child sexual abuse material (CSAM) or any content that sexually exploits or endangers minors will be treated as the highest priority. On receipt of a credible CSAM report:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The reported content is immediately removed or access-restricted pending investigation.</li>
              <li>The report is escalated to the Grievance Officer within 1 hour of receipt.</li>
              <li>Skriibe will report the matter to the National Cybercrime Reporting Portal (cybercrime.gov.in) and CERT-In as required under law.</li>
              <li>The relevant creator account is suspended immediately pending investigation.</li>
            </ul>
            <p>Skriibe has zero tolerance for CSAM. Non-compliance with POCSO 2012 and related laws is reported to law enforcement without exception.</p>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>18.7 Law Enforcement &amp; Government Requests</h3>
            <p>Skriibe cooperates fully with lawful requests from Indian courts, law enforcement agencies, and government authorities. Skriibe will comply with:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Court orders requiring disclosure of user data or removal of content.</li>
              <li>Government directions under Section 69A of the IT Act, 2000 (blocking of content or access).</li>
              <li>Directions from CERT-In under the Cyber Security Directions, 2022.</li>
              <li>Any other lawful directive from a competent authority.</li>
            </ul>
            <p>Skriibe may not always be able to notify users when responding to law enforcement requests, particularly where disclosure is prohibited by the relevant order.</p>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>18.8 Escalation — External Remedies</h3>
            <p>If you are not satisfied with the resolution of your grievance by Skriibe's Grievance Officer, you may escalate your complaint to:</p>
            <h4 className={`text-lg font-semibold mt-4 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>18.8.1 Consumer Disputes</h4>
            <p>The Consumer Disputes Redressal Commission under the Consumer Protection Act, 2019, with jurisdiction based on your location or the value of the transaction. You do not need to exhaust Skriibe's internal grievance process before approaching a consumer forum.</p>
            <h4 className={`text-lg font-semibold mt-4 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>18.8.2 Privacy / Data Disputes</h4>
            <p>The Data Protection Board of India, once operationalised under the Digital Personal Data Protection Act, 2023, for complaints relating to violations of your data principal rights.</p>
            <h4 className={`text-lg font-semibold mt-4 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>18.8.3 Content / Online Safety</h4>
            <p>The Grievance Appellate Committee (GAC) established by the Ministry of Electronics and Information Technology (MeitY) under IT Rules 2021, for appeals against Skriibe's content moderation decisions.</p>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>18.9 No Retaliation</h3>
            <p>Skriibe will not suspend, terminate, or take any adverse action against a user solely on the basis that they have submitted a genuine grievance, even if the grievance is ultimately not upheld. Retaliatory action by any Skriibe user or creator against a person who has submitted a grievance may itself be treated as a conduct violation.</p>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>18.10 Updates to This Policy</h3>
            <p>This Grievance Redressal Policy may be updated to reflect changes in applicable law, including any notified changes to IT Rules 2021 or DPDPA Rules. Material changes will be communicated with at least 7 days' advance notice via email or in-app notification.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>19. Creator Terms &amp; Conditions</h2>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>19.1 Introduction &amp; Acceptance</h3>
            <p>These Creator Terms &amp; Conditions ("Creator Terms") govern your use of Skriibe as a Creator — a person who offers paid interactions to fans through the platform. These Creator Terms are supplementary to Skriibe's main Terms of Service, Community Guidelines, Refund &amp; Cancellation Policy, and Contract Between Fan and Creator, all of which form part of your legal agreement with Skriibe. By completing creator onboarding, you agree to all of these documents.</p>
            <p>Skriibe is operated by Edlern Innovations Private Limited, a company registered under the Companies Act, 2013, with its registered office at Sector 27 D, Chandigarh – 160019, India.</p>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>19.2 Creator Eligibility</h3>
            <h4 className={`text-lg font-semibold mt-4 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>19.2.1 Minimum Age</h4>
            <p>You must be at least 18 years of age to register as a Creator on Skriibe. By registering, you represent and warrant that you are 18 or older. Skriibe may request proof of age at any time and will suspend or permanently remove any account found to belong to someone under 18.</p>
            <h4 className={`text-lg font-semibold mt-4 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>19.2.2 Residency and Legal Capacity</h4>
            <p>You must be resident in India and legally capable of entering into a binding contract under the Indian Contract Act, 1872. Skriibe is currently available to India-based Creators only. International creator registration is not yet supported.</p>
            <h4 className={`text-lg font-semibold mt-4 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>19.2.3 Account Limit</h4>
            <p>Each Creator may maintain only one active creator account. Operating multiple accounts is a violation of these Creator Terms and will result in suspension of all associated accounts.</p>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>19.3 Identity Verification &amp; KYC</h3>
            <h4 className={`text-lg font-semibold mt-4 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>19.3.1 Mandatory KYC</h4>
            <p>Before receiving any payout, Creators must complete Skriibe's Know Your Customer (KYC) process. KYC is required by law in connection with Skriibe's obligations under the Income Tax Act, 1961 (Section 194-O TDS deduction) and applicable RBI payment guidelines. KYC completion is not optional — payouts will not be released until verification is complete.</p>
            <h4 className={`text-lg font-semibold mt-4 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>19.3.2 Documents Required</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>PAN Card:</strong> Mandatory. Your PAN number is required for TDS deduction under Section 194-O. Without a valid PAN, TDS will be deducted at 5% instead of the standard rate of 0.1%.</li>
              <li><strong>Bank Account Details:</strong> A valid Indian bank account (account number and IFSC code) in your own name, for receiving payouts via NEFT/RTGS/IMPS through Razorpay.</li>
              <li><strong>Aadhaar-Linked Mobile Number:</strong> Used for identity verification and account security. Your Aadhaar number itself is not stored by Skriibe.</li>
              <li>Additional documents (e.g. address proof, government-issued photo ID) may be requested at Skriibe's discretion for fraud prevention or regulatory compliance.</li>
            </ul>
            <h4 className={`text-lg font-semibold mt-4 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>19.3.3 Accuracy of Information</h4>
            <p>All KYC information must be accurate and belong to you personally. Submitting false, altered, or another person's documents is a criminal offence under the Indian Penal Code (as amended by the Bharatiya Nyaya Sanhita, 2023) and will result in permanent removal from Skriibe and referral to law enforcement.</p>
            <h4 className={`text-lg font-semibold mt-4 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>19.3.4 Changes to KYC Details</h4>
            <p>If any KYC information changes (name, bank account, PAN), you must notify Skriibe within 7 days by contacting <a href="mailto:Support@skriibe.com" className="text-[#3BA8D8] hover:underline font-medium">Support@skriibe.com</a>. Payouts may be suspended during verification of updated details.</p>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>19.4 Independent Contractor Status</h3>
            <p>You are an independent contractor and not an employee, agent, partner, joint venture partner, or legal representative of Skriibe. Nothing in these Creator Terms or any other Skriibe document creates an employment relationship, agency, or partnership between you and Skriibe.</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You set your own rates, schedule your own availability, and choose which interactions to undertake.</li>
              <li>You are solely responsible for the quality, content, and accuracy of your responses and interactions.</li>
              <li>You are solely responsible for your own tax obligations, including income tax, GST (where applicable), and any other statutory levies on your Creator Earnings.</li>
              <li>Skriibe does not provide you with equipment, office space, or tools beyond the Skriibe platform itself.</li>
              <li>Skriibe does not direct, control, or supervise the content of your responses, subject only to compliance with these Creator Terms and Community Guidelines.</li>
            </ul>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>19.5 Creator Obligations</h3>
            <h4 className={`text-lg font-semibold mt-4 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>19.5.1 Live Chat</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>Be present and available during any Live Chat session you accept.</li>
              <li>Engage meaningfully with the fan for the duration of the session.</li>
              <li>Do not abruptly disconnect from an active session without a genuine technical reason. Repeated unjustified disconnections will be treated as a conduct violation and may result in a strike.</li>
              <li>Do not use session time for advertising, directing fans off-platform, or soliciting additional payments outside Skriibe.</li>
            </ul>
            <h4 className={`text-lg font-semibold mt-4 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>19.5.2 AMA (Ask Me Anything)</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>Skriibe does not provide a rejection mechanism for AMA messages. You either respond to a submitted question or you do not respond.</li>
              <li>If you do not respond within 15 days of an AMA question being submitted (and the question does not violate Community Guidelines), Skriibe will initiate a full refund to the fan within 48 hours of the 15-day window closing.</li>
              <li>Skriibe strongly encourages prompt responses. Creator Health Scores (see Section 19.10) reflect response behaviour.</li>
              <li>Do not provide responses that are abusive, harassing, sexually explicit, defamatory, illegal, or in violation of Community Guidelines.</li>
            </ul>
            <h4 className={`text-lg font-semibold mt-4 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>19.5.3 Tips</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>Tips are voluntary gratuities sent by fans after Live Chat sessions. You may not solicit, demand, or condition your service on receiving a tip.</li>
              <li>Tips are non-refundable once sent. The platform commission applies to tips as it does to all transactions.</li>
            </ul>
            <h4 className={`text-lg font-semibold mt-4 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>19.5.4 General Conduct</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>Comply with all applicable Indian laws, including but not limited to the IT Act 2000, IT Rules 2021, DPDPA 2023, consumer protection legislation, and the Bharatiya Nyaya Sanhita 2023.</li>
              <li>Do not impersonate any person, brand, or entity.</li>
              <li>Do not provide medical, legal, or financial advice that could expose fans to harm. Always recommend professional consultation for such topics.</li>
              <li>Do not create, share, or facilitate access to CSAM or any content prohibited by the Protection of Children from Sexual Offences Act, 2012 (POCSO). This is a zero-tolerance provision — violation results in immediate permanent removal and referral to law enforcement.</li>
            </ul>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>19.6 Off-Platform Solicitation — Prohibited</h3>
            <p>You must not solicit or accept payment from fans outside the Skriibe platform for interactions that originate on Skriibe. This includes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Asking fans to pay you directly via UPI, bank transfer, or any other method for Skriibe-originated interactions.</li>
              <li>Directing fans to contact you privately (WhatsApp, Instagram, email) to avoid Skriibe's commission.</li>
              <li>Offering discounts or incentives to fans who agree to transact off-platform.</li>
            </ul>
            <p>If a fan initiates off-platform contact independently and you respond personally — outside any Skriibe interaction — that is outside Skriibe's jurisdiction. However, using Skriibe's platform to establish that contact for the purpose of circumventing commission is prohibited.</p>
            <p>Violation of this section may result in immediate account suspension, forfeiture of pending earnings, and a permanent ban from Skriibe.</p>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>19.7 Platform Commission</h3>
            <p>Skriibe charges a platform commission of 20% on all Creator transactions processed through the platform, including Live Chat session fees, AMA fees, and Tips. You receive 80% of the transaction amount, subject to applicable TDS deductions and Razorpay gateway fees (see Section 19.8).</p>
            <p>The commission rate may be revised from time to time. Skriibe will provide at least 30 days' notice of any change to the commission rate via email to your registered address.</p>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>19.8 Payouts &amp; TDS</h3>
            <h4 className={`text-lg font-semibold mt-4 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>19.8.1 Payout Schedule</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>Skriibe processes Creator payouts on a weekly basis, on every Tuesday.</li>
              <li>Payouts include all earnings cleared during the preceding week, after deduction of platform commission, applicable TDS, Razorpay fees, and any amounts reversed due to approved refunds or chargebacks.</li>
              <li>Payouts are transferred to your verified bank account via NEFT/RTGS/IMPS through Razorpay.</li>
              <li>Minimum payout threshold: ₹500. If your cleared earnings in a given week are below ₹500, the balance is carried forward to the next payout cycle.</li>
            </ul>
            <h4 className={`text-lg font-semibold mt-4 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>19.8.2 TDS under Section 194-O</h4>
            <p>As an e-commerce operator facilitating your transactions, Skriibe is required by law to deduct Tax Deducted at Source (TDS) under Section 194-O of the Income Tax Act, 1961 on Creator Earnings:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Rate with valid PAN: 0.1% (effective 1 October 2024)</li>
              <li>Rate without valid PAN: 5% (under Section 206AA)</li>
              <li>TDS is deposited with the Central Government and reflected in your Form 26AS. Skriibe will issue Form 16A on a quarterly basis.</li>
              <li>The ₹5 lakh annual threshold for TDS deduction under Section 194-O applies — TDS is not deducted on earnings below this threshold. However, you remain responsible for filing your income tax return regardless of whether TDS has been deducted.</li>
            </ul>
            <h4 className={`text-lg font-semibold mt-4 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>19.8.3 GST on Creator Earnings</h4>
            <p>If your aggregate annual turnover exceeds ₹20 lakh (₹10 lakh for special category states), you are required to register for GST under the GST Act, 2017 and comply with all GST obligations including filing returns and issuing tax invoices. Skriibe's platform commission is subject to 18% GST charged by Skriibe — this is reflected in your earnings statement.</p>
            <h4 className={`text-lg font-semibold mt-4 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>19.8.4 Earnings Reversal</h4>
            <p>Your Creator Earnings may be reduced or reversed in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>A refund is approved by Skriibe following a fan support query — your earnings are reversed proportionally to the refund amount approved.</li>
              <li>A chargeback is filed by a fan's bank and upheld — your earnings are reversed for the relevant transaction. Chargeback processing fees charged by Razorpay are also deducted from your earnings where the chargeback arises from your conduct.</li>
              <li>A Skriibe 15-day non-response AMA refund is initiated — full earnings for that transaction are reversed.</li>
            </ul>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>19.9 Chargeback Liability</h3>
            <p>Chargebacks are disputes initiated by fans with their bank or payment provider, asking for a transaction reversal. Skriibe will contest chargebacks on your behalf where platform records confirm that the session or response was delivered and no valid support query was raised within the applicable window.</p>
            <p>Where a chargeback arises primarily from Creator conduct (e.g. abusive response, unjustified session abandonment, off-platform conduct), Skriibe reserves the right to reverse your Creator Earnings for that transaction and deduct any associated chargeback processing fees from your account.</p>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>19.10 Creator Health Score</h3>
            <p>Skriibe maintains a Creator Health Score for each creator account, visible on your Creator Dashboard. The score reflects your reliability and conduct on the platform. It is calculated from the following factors:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Response timeliness: whether you respond to AMA messages within the 15-day window.</li>
              <li>Support dispute rate: the proportion of your transactions that result in fan support queries.</li>
              <li>Strike history: strikes issued under the Creator Enforcement Policy (see Section 19.11).</li>
            </ul>
            <p>A higher Health Score improves your visibility in Skriibe's search and discovery features. A lower score reduces visibility. Strike 1 does not affect your Health Score. Strike 2 and above reduce the score progressively; consistent clean conduct gradually recovers it.</p>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>19.11 Creator Enforcement Policy — Strikes</h3>
            <p>Skriibe may issue strikes against your account for verified conduct violations, including abusive responses, mid-session Live Chat disconnection without cause, Community Guidelines breaches, or other misconduct as determined by Skriibe at its sole discretion.</p>

            <div className="overflow-x-auto my-6">
              <table className={`w-full border-collapse border text-sm md:text-base ${theme === 'light' ? 'border-gray-300 bg-white' : 'border-gray-700 bg-white/[0.02]'}`}>
                <thead>
                  <tr className={`border-b ${theme === 'light' ? 'border-gray-300 bg-[#f0f4fa]' : 'border-gray-700 bg-white/[0.06]'}`}>
                    <th className={`w-1/6 px-4 py-3 text-left font-bold border-r ${theme === 'light' ? 'text-gray-900 border-gray-300' : 'text-white border-gray-700'}`}>
                      Strike
                    </th>
                    <th className={`w-1/3 px-4 py-3 text-left font-bold border-r ${theme === 'light' ? 'text-gray-900 border-gray-300' : 'text-white border-gray-700'}`}>
                      Trigger
                    </th>
                    <th className={`w-1/2 px-4 py-3 text-left font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                      Consequence
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={`border-b ${theme === 'light' ? 'border-gray-300' : 'border-gray-700'}`}>
                    <td className={`px-4 py-3 font-semibold border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      Strike 1
                    </td>
                    <td className={`px-4 py-3 border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      First verified violation
                    </td>
                    <td className={`px-4 py-3 ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                      Email + notification. Formal record. No profile or Health Score impact.
                    </td>
                  </tr>
                  <tr className={`border-b ${theme === 'light' ? 'border-gray-300' : 'border-gray-700'}`}>
                    <td className={`px-4 py-3 font-semibold border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      Strike 2
                    </td>
                    <td className={`px-4 py-3 border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      Second violation within 90 days
                    </td>
                    <td className={`px-4 py-3 ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                      48-hour account suspension. Removed from discovery.
                    </td>
                  </tr>
                  <tr className={`border-b ${theme === 'light' ? 'border-gray-300' : 'border-gray-700'}`}>
                    <td className={`px-4 py-3 font-semibold border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      Strike 3
                    </td>
                    <td className={`px-4 py-3 border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      Third violation within 90 days
                    </td>
                    <td className={`px-4 py-3 ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                      7-day account suspension. Payouts frozen. Existing paid AMA must still be answered.
                    </td>
                  </tr>
                  <tr>
                    <td className={`px-4 py-3 font-semibold border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      Strike 4
                    </td>
                    <td className={`px-4 py-3 border-r ${theme === 'light' ? 'text-gray-800 border-gray-300' : 'text-gray-200 border-gray-700'}`}>
                      Fourth violation within 90 days
                    </td>
                    <td className={`px-4 py-3 ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                      Permanent removal. Earnings held 30 days. Phone + email blacklisted.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p>Strike decay: Strikes 1, 2, and 3 decay after 90 consecutive clean days — all strikes reset to zero. Strike 4 is permanent and does not decay.</p>
            <p>You may appeal a strike within 48 hours of issuance by emailing <a href="mailto:Support@skriibe.com" className="text-[#3BA8D8] hover:underline font-medium">Support@skriibe.com</a> with the subject line "Strike Appeal — [your username]". Skriibe will review and respond within 48 hours. Skriibe's decision on appeal is final.</p>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>19.12 Content Ownership &amp; Licence</h3>
            <p>You retain full ownership of the content you create on Skriibe, including your Live Chat responses, AMA answers, profile content, and any other material you post.</p>
            <p>By posting content, you grant Skriibe a non-exclusive, royalty-free, worldwide licence to display, store, transmit, and process your content solely for the purpose of operating, maintaining, and displaying Skriibe's platform services. This licence does not permit Skriibe to use your content in external marketing, advertising, or commercial contexts without your prior written consent.</p>
            <p>You represent and warrant that your content: (a) is original or you have the right to use it; (b) does not infringe any third party's intellectual property rights; (c) does not contain CSAM, hate speech, or content prohibited under applicable law; and (d) does not constitute professional medical, legal, or financial advice unless your profile explicitly states your verified credentials.</p>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>19.13 Confidentiality</h3>
            <p>Fan interactions on Skriibe are private and confidential. You must not share, publish, screenshot, or disclose the content of any fan's paid messages or Live Chat sessions — either during or after the interaction — without that fan's explicit prior consent.</p>
            <p>Violations of this section may give rise to civil and criminal liability under the Information Technology Act, 2000, the Digital Personal Data Protection Act, 2023, and the Bharatiya Nyaya Sanhita, 2023.</p>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>19.14 Suspension &amp; Termination</h3>
            <h4 className={`text-lg font-semibold mt-4 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>19.14.1 Suspension by Skriibe</h4>
            <p>Skriibe may suspend your creator account immediately and without prior notice if:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You receive Strike 2, Strike 3, or Strike 4 under the Creator Enforcement Policy.</li>
              <li>You are found to have submitted false KYC documents.</li>
              <li>You are found to have solicited off-platform transactions.</li>
              <li>You are the subject of a law enforcement investigation or court order relating to your Skriibe activity.</li>
              <li>Skriibe determines, at its sole discretion, that your continued access poses a risk to fans, other creators, or the platform.</li>
            </ul>

            <h4 className={`text-lg font-semibold mt-4 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>19.14.2 Termination by Creator</h4>
            <p>You may close your creator account at any time by contacting <a href="mailto:Support@skriibe.com" className="text-[#3BA8D8] hover:underline font-medium">Support@skriibe.com</a>. Termination does not affect any obligations that arose before closure. Outstanding cleared earnings will be paid out at the next Tuesday cycle following account closure.</p>

            <h4 className={`text-lg font-semibold mt-4 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>19.14.3 Effect of Termination</h4>
            <p>On termination of your creator account: pending earnings are held for 30 days pending any fan disputes, then released minus any disputed amounts; your creator profile is deactivated; your historical responses remain accessible to fans who received them (for their records); and Skriibe may retain data as required by law or the Privacy Policy.</p>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>19.15 Limitation of Liability</h3>
            <p>Skriibe's total aggregate liability to you as a Creator — including for any claim arising under these Creator Terms, the main Terms of Service, or any other Skriibe document — shall not exceed the total Creator Earnings received by you in the 30 days preceding the event giving rise to the claim.</p>
            <p>Skriibe is not liable for any indirect, consequential, special, incidental, or punitive damages arising from your use of the platform, including loss of earnings, loss of data, or reputational harm. This limitation does not apply to liability arising from Skriibe's fraud or gross negligence.</p>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>19.16 Indemnification</h3>
            <p>You agree to defend, indemnify, and hold harmless Skriibe, Edlern Innovations Private Limited, and its officers, directors, employees, and agents from and against any and all claims, losses, damages, fines, penalties, and expenses (including reasonable legal fees) arising from:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your content, responses, or conduct on the platform.</li>
              <li>Your violation of these Creator Terms, the main Terms of Service, Community Guidelines, or applicable law.</li>
              <li>Any false or misleading information you provide to fans.</li>
              <li>Any intellectual property infringement by your content.</li>
              <li>Any tax or regulatory liability arising from your Creator Earnings.</li>
            </ul>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>19.17 Governing Law &amp; Disputes</h3>
            <p>These Creator Terms are governed by the laws of India. Any dispute arising from or relating to these Creator Terms that cannot be resolved amicably between the parties shall be submitted to binding arbitration under the Arbitration and Conciliation Act, 1996, with the seat of arbitration in Chandigarh, India. The language of arbitration shall be English. Nothing in this section prevents you from approaching the Consumer Disputes Redressal Commission under the Consumer Protection Act, 2019 if applicable.</p>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>19.18 Changes to Creator Terms</h3>
            <p>Skriibe may modify these Creator Terms from time to time. Material changes will be communicated with at least 30 days' advance notice via email to your registered address or via in-app notification. Your continued use of the Skriibe creator platform after the effective date of any modification constitutes acceptance of the updated Creator Terms.</p>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>19.19 Contact</h3>
            <p>For any query about these Creator Terms, KYC, payouts, or disputes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Email: <a href="mailto:Support@skriibe.com" className="text-[#3BA8D8] hover:underline font-medium">Support@skriibe.com</a></li>
              <li>Grievance Officer: Tarundeep Singh, Founder — <a href="mailto:Support@skriibe.com" className="text-[#3BA8D8] hover:underline font-medium">Support@skriibe.com</a></li>
              <li>Address: Edlern Innovations Private Limited, Sector 27 D, Chandigarh – 160019, India</li>
              <li>Response within 24 hours (acknowledgement); 15 days (resolution)</li>
            </ul>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>20. Skriibe Wallet Terms</h2>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>20.1 What is the Skriibe Wallet?</h3>
            <p>The Skriibe Wallet is an internal Wallet balance associated with your Skriibe account. It holds refund amounts issued to you by Skriibe under the Refund &amp; Cancellation Policy. The Skriibe Wallet is not a bank account, prepaid payment instrument, or a facility for depositing your own money. You cannot add funds to the Wallet yourself — Wallet balance is increased only by Skriibe as approved refunds.</p>
            <p>The Skriibe Wallet is not a Prepaid Payment Instrument (PPI) as defined under the Reserve Bank of India's Master Directions on Prepaid Payment Instruments, 2021, because: (a) it does not accept user-deposited value; (b) it holds only platform-issued refund amounts; and (c) Wallet balance can be used only against future transactions on the Skriibe platform. Skriibe does not hold your funds or operate as a payment system.</p>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>20.2 How Your Wallet Balance is Increased</h3>
            <p>Skriibe increases your Wallet balance only in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Skriibe approves a full or partial refund following a fan support query for a Live Chat or AMA transaction.</li>
              <li>Skriibe initiates a 15-day non-response AMA refund on your behalf (within 48 hours of the 15-day window closing, where the question did not violate Community Guidelines).</li>
            </ul>
            <p>Your Wallet balance is not increased for any other reason. Skriibe does not offer cashback, loyalty rewards, referral bonuses, or promotional wallet top-ups at this time.</p>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>20.3 How Your Wallet Balance can be Used</h3>
            <p>Skriibe Wallet balance can be applied against the cost of any future transaction on the Skriibe platform — including Live Chat session fees, AMA question fees, or any other paid feature Skriibe may introduce.</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your Wallet balance is applied automatically at checkout when you initiate a new transaction.</li>
              <li>If your Wallet balance is less than the transaction amount, the remaining amount is charged to your saved payment method.</li>
              <li>If your Wallet balance exceeds the transaction amount, the surplus remains in your Wallet for future use.</li>
              <li>Your Wallet balance cannot be transferred to another user's account.</li>
            </ul>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>20.4 No Cash Withdrawal</h3>
            <p>Skriibe Wallet balance cannot be withdrawn as cash or transferred to a bank account. Your Wallet balance represents a right to receive future Skriibe platform services of equivalent value, not a monetary claim against Skriibe.</p>
            <p>If you believe a refund should be returned to your original payment method rather than held as Wallet balance, please contact <a href="mailto:Support@skriibe.com" className="text-[#3BA8D8] hover:underline font-medium">Support@skriibe.com</a> within 7 days of the refund being credited. Skriibe will review such requests at its discretion and may, in exceptional circumstances, initiate a refund to the original payment method.</p>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>20.5 Expiry of Wallet Balance</h3>
            <p>Skriibe Wallet balance does not expire while your account is active and in good standing. Your Wallet balance will remain available for use indefinitely, subject to Section 20.7 (Account Closure &amp; Wallet Balance).</p>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>20.6 No Interest</h3>
            <p>No interest, return, or yield accrues on Skriibe Wallet balance. Your Wallet balance represents a future right to platform services, not a financial instrument.</p>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>20.7 Account Closure &amp; Wallet Balance</h3>
            <p>If your Skriibe account is closed voluntarily by you:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Any Wallet balance remaining at account closure will be held for 30 days after account closure.</li>
              <li>During this 30-day period, you may contact <a href="mailto:Support@skriibe.com" className="text-[#3BA8D8] hover:underline font-medium">Support@skriibe.com</a> to request a refund of your Wallet balance to your original payment method. Skriibe will review the request and, where the Wallet balance is traceable to a verified refund transaction, will process the refund within 7 business days.</li>
              <li>After the 30-day period, any unclaimed Wallet balance is forfeited.</li>
            </ul>
            <p>If your account is suspended or terminated by Skriibe for a Community Guidelines or Terms of Service violation:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Wallet balance may be frozen pending investigation.</li>
              <li>Wallet balance amounts relating to outstanding fan disputes may be reversed.</li>
              <li>Skriibe will assess the remaining balance and, at its discretion, may release verified legitimate refund to your Wallet balance after resolution of any disputes.</li>
            </ul>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>20.8 Fraudulent or Disputed Wallet Balance</h3>
            <p>If Skriibe determines that Wallet balance was increased as a result of fraudulent activity, abuse of the dispute process, or a technical error, Skriibe reserves the right to reverse or adjust that balance at any time, including after the balance has been applied to a transaction. Where Wallet balance was increased in error, Skriibe will notify you and provide a reasonable opportunity to dispute the reversal before it takes effect.</p>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>20.9 Wallet Balance Display</h3>
            <p>Your current Wallet balance is displayed on your Skriibe account dashboard. If you believe your Wallet balance is incorrect, contact <a href="mailto:Support@skriibe.com" className="text-[#3BA8D8] hover:underline font-medium">Support@skriibe.com</a> within 30 days of the transaction in question.</p>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>20.10 Changes to Wallet Terms</h3>
            <p>Skriibe may update these Wallet Terms from time to time. Material changes will be communicated with at least 7 days' advance notice via email or in-app notification. Continued use of the Skriibe Wallet after the effective date of any change constitutes acceptance of the updated terms.</p>

            <h3 className={`text-xl font-bold mt-6 mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>20.11 Contact</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Email: <a href="mailto:Support@skriibe.com" className="text-[#3BA8D8] hover:underline font-medium">Support@skriibe.com</a></li>
              <li>Grievance Officer: Tarundeep Singh, Founder — <a href="mailto:Support@skriibe.com" className="text-[#3BA8D8] hover:underline font-medium">Support@skriibe.com</a></li>
              <li>Address: Edlern Innovations Private Limited, Sector 27 D, Chandigarh – 160019, India</li>
            </ul>
          </div>
        </div>
      </main>

      <Footer theme={theme} />
    </div>
  );
};

export default Terms;
