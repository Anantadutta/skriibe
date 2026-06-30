import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Refunds = () => {
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

  const TableHeader = ({ children }) => (
    <th className={`px-4 py-3 text-left font-bold ${theme === 'light' ? 'bg-gray-100 text-gray-800' : 'bg-[#1a1c29] text-gray-200'} border-b ${theme === 'light' ? 'border-gray-200' : 'border-gray-700'}`}>
      {children}
    </th>
  );

  const TableCell = ({ children }) => (
    <td className={`px-4 py-3 border-b ${theme === 'light' ? 'border-gray-200 text-gray-700' : 'border-gray-700 text-gray-300'}`}>
      {children}
    </td>
  );

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
            Refund Policy
          </h1>
          
          <div className={`text-base md:text-lg leading-relaxed space-y-6 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'} font-sans`}>
            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>1. Overview</h2>
            <p>Skriibe is a paid Ask Me Anything (AMA) platform connecting creators with their audiences. Buyers pay a fee set by the Creator to submit a question and receive a response within 24 hours, or a full refund, unless the Creator validly rejects the question (see Section 3.1). All payments are processed via authorised payment gateway partners including Razorpay. This policy explains when and how refunds are issued.</p>
            <p>Skriibe facilitates creator response obligations and provides refund remedies where obligations are not fulfilled.</p>
            <div className={`p-4 rounded-xl font-medium border-l-4 border-[#3BA8D8] ${theme === 'light' ? 'bg-[#e0f2fe] text-gray-800' : 'bg-[#0c4a6e] text-gray-100'}`}>
              <strong>Core Guarantee:</strong> If a Creator does not reply within 24 hours of a confirmed payment, and has not validly rejected the question, the Buyer receives a full 100% refund.
            </div>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>2. How Payments Work</h2>
            <p>Every transaction follows this sequence:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Buyer submits a question and pays via UPI, card, or net banking through Razorpay.</li>
              <li>Payment is held in escrow by Razorpay. Creator is notified via Email & Skriibe Notification Inbox. Payments are processed and settled through authorised payment partners in accordance with applicable RBI regulations.</li>
              <li>Within 24 hours, the Creator responds to the question, or validly rejects it under Section 3.1. If answered, the Buyer receives the Answer via Email & Skriibe Notification Inbox.</li>
              <li>A 24-hour dispute window opens for Buyers who received an Answer. Buyer can raise a dispute if unsatisfied (see Section 5).</li>
              <li>If no dispute is raised within the 24-hour window, payment for that Answer is released to the Creator on the next Tuesday payout cycle following expiry of the window.</li>
              <li>If the Creator validly rejects the question under Section 3.1 instead of responding, the Buyer is refunded automatically and there is no Answer to dispute.</li>
            </ul>

            <h3 className={`text-xl font-bold mt-6 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>Revenue Split</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <TableHeader>Component</TableHeader>
                    <TableHeader>Amount</TableHeader>
                    <TableHeader>Notes</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <TableCell>Buyer pays</TableCell>
                    <TableCell>Price set by Creator (e.g. Rs.99)</TableCell>
                    <TableCell>Collected upfront via Razorpay</TableCell>
                  </tr>
                  <tr>
                    <TableCell>Platform fee (Skriibe)</TableCell>
                    <TableCell>20% of transaction</TableCell>
                    <TableCell>Deducted before Creator payout</TableCell>
                  </tr>
                  <tr>
                    <TableCell>Creator receives</TableCell>
                    <TableCell>80% of transaction</TableCell>
                    <TableCell>e.g. Rs.79.20 on a Rs.99 question</TableCell>
                  </tr>
                  <tr>
                    <TableCell>Razorpay gateway fee</TableCell>
                    <TableCell>2% + 18% GST on fee</TableCell>
                    <TableCell>Absorbed by Skriibe. Not charged to Creator or Buyer.</TableCell>
                  </tr>
                  <tr>
                    <TableCell>Creator payout day</TableCell>
                    <TableCell>Every Tuesday</TableCell>
                    <TableCell>Auto bank transfer via Razorpay</TableCell>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>3. When You Get a Refund</h2>
            <h3 className={`text-xl font-bold mt-6 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>3.1 Automatic Refunds (No Action Needed)</h3>
            <p>A full refund is automatically triggered in these cases:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Creator does not reply within the 24-hour Response Window, and has not validly rejected the question.</li>
              <li>Creator explicitly declines or rejects the submitted question (for example, because it falls outside their expertise, or is incomplete, misleading, or unclear), as permitted under the Contract Between Fan and Creator.</li>
              <li>Creator account is suspended after payment but before a response is delivered.</li>
              <li>A technical error on the platform prevents question delivery or response receipt.</li>
              <li>Buyer is charged more than once for the same question due to a payment gateway error.</li>
            </ul>

            <h3 className={`text-xl font-bold mt-6 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>3.2 Dispute-Based Refunds (Buyer Must Raise)</h3>
            <p>Within 24-hour of receiving a response, Buyers may raise a dispute and request a refund if:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Irrelevant Answer</strong> – the response was vague and off-topic.</li>
              <li><strong>Abusive / Vulgar</strong> – the response contained abusive, offensive, hateful, or vulgar content.</li>
            </ul>

            <h3 className={`text-xl font-bold mt-6 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>3.3 No Refund in These Cases</h3>
            <p>Refunds will not be issued if:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The Buyer is unhappy with a response that genuinely addressed their question.</li>
              <li>The Buyer changes their mind after payment is completed.</li>
              <li>The dispute is raised after the 7-day window has expired.</li>
              <li>The question violated Skriibe's Terms of Service.</li>
              <li>The refund request is submitted outside the platform (e.g. by WhatsApp or third-party email).</li>
            </ul>
            <p className="italic text-sm">Actual credit timelines may vary depending on banking networks and payment providers.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>4. Refund Timeline</h2>
            <p>Skriibe initiates all refunds through Razorpay. Two timelines apply: (a) how fast Skriibe acts, and (b) how fast the money reaches your account.</p>

            <h3 className={`text-xl font-bold mt-6 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>4.1 Skriibe Acts Within</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <TableHeader>Refund Type</TableHeader>
                    <TableHeader>Skriibe Initiates Within</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <TableCell>SLA breach (no reply in 24h)</TableCell>
                    <TableCell>24-hour window expiring</TableCell>
                  </tr>
                  <tr>
                    <TableCell>Creator rejection</TableCell>
                    <TableCell>24-hour of Creator declining</TableCell>
                  </tr>
                  <tr>
                    <TableCell>Dispute ruled in Buyer's favour</TableCell>
                    <TableCell>48-hours of Admin decision</TableCell>
                  </tr>
                  <tr>
                    <TableCell>Payment error / double charge</TableCell>
                    <TableCell>24-hours of detection</TableCell>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className={`text-xl font-bold mt-6 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>4.2 Money Reaches Your Account (Post-Initiation by Razorpay)</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <TableHeader>Payment Method</TableHeader>
                    <TableHeader>Typical</TableHeader>
                    <TableHeader>Maximum</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  <tr><TableCell>UPI (GPay, PhonePe, Paytm)</TableCell><TableCell>2-3 business days</TableCell><TableCell>5 business days</TableCell></tr>
                  <tr><TableCell>Debit Card</TableCell><TableCell>5-7 business days</TableCell><TableCell>10 business days</TableCell></tr>
                  <tr><TableCell>Credit Card</TableCell><TableCell>5-7 business days</TableCell><TableCell>10 business days</TableCell></tr>
                  <tr><TableCell>Net Banking</TableCell><TableCell>3-5 business days</TableCell><TableCell>7 business days</TableCell></tr>
                  <tr><TableCell>Razorpay / Paytm Wallet</TableCell><TableCell>1-2 business days</TableCell><TableCell>3 business days</TableCell></tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 font-medium">Total worst case: Skriibe initiates within 24 hours + Razorpay processes within 5 business days = maximum 6 business days. Most refunds resolve in 3-4 business days. Business days exclude weekends and national holidays.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>5. How to Raise a Dispute</h2>
            <p>To raise a dispute, follow these steps within 7 days of receiving the Creator's response:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Log in to skriibe.com and go to your Message History.</li>
              <li>Find the relevant message and tap "Flag this answer."</li>
              <li>Select a reason: “Irrelevant Answer” or “Abusive / Vulgar” (see Section 5.1 below for definitions).</li>
              <li>Add a brief explanation (minimum 50 characters).</li>
              <li>Submit. You will receive a confirmation on your account</li>
              <li>Skriibe Admin reviews within 48 hours and communicates the decision via Email.</li>
            </ul>

            <h3 className={`text-xl font-bold mt-6 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>Dispute Outcomes</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <TableHeader>Outcome</TableHeader>
                    <TableHeader>Buyer</TableHeader>
                    <TableHeader>Creator</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  <tr><TableCell>Ruled in Buyer's favour</TableCell><TableCell>Full refund within 48 hours</TableCell><TableCell>Payment cancelled. Strike issued.</TableCell></tr>
                  <tr><TableCell>Ruled in Creator's favour</TableCell><TableCell>No refund</TableCell><TableCell>Payment released next Tuesday</TableCell></tr>
                  <tr><TableCell>Inconclusive</TableCell><TableCell>Partial refund (Admin discretion)</TableCell><TableCell>Partial payment. No strike.</TableCell></tr>
                  <tr><TableCell>Creator ignores dispute (&gt;24h)</TableCell><TableCell>Full auto-refund</TableCell><TableCell>Strike issued automatically</TableCell></tr>
                </tbody>
              </table>
            </div>

            <h3 className={`text-xl font-bold mt-6 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>5.1 Reasons a Buyer May Report a Creator</h3>
            <p>When flagging a response in Question History, the Buyer selects one of the following reasons:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Irrelevant Answer</strong> – The response was vague and off-topic.</li>
              <li><strong>Abusive / Vulgar</strong> – The response contained abusive, offensive, hateful, or vulgar content.</li>
            </ul>

            <h3 className={`text-xl font-bold mt-6 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>5.2 Reasons a Creator May Flag a Fan</h3>
            <p>Creators may flag an incoming question for the following reasons. A flagged question is not answered and is escalated to Skriibe Admin for review; the Buyer is refunded if the flag is upheld.</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Nudity / Sexual Content</strong> – The question contains nudity or sexual content.</li>
              <li><strong>Abusive Language</strong> – The question contains insults, threats, hate speech, or harassment.</li>
            </ul>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>6. Creator Strike Policy</h2>
            <p>Skriibe operates a strike system to maintain platform quality. Strikes are issued when refunds are triggered by Creator failures.</p>

            <h3 className={`text-xl font-bold mt-6 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>Creator Health Score</h3>
            <p>The Creator Health Score is an internal rating, visible to the Creator on their dashboard, that reflects a Creator’s overall reliability on Skriibe. It is calculated from response timeliness (replies within the 24-hour window), dispute rate (the share of answered questions that result in a Buyer dispute), and strike history. A higher score improves visibility in search and discovery; a lower score reduces it. The score is reduced when a strike is issued and gradually recovers with consistent on-time, dispute-free responses.</p>

            <h3 className={`text-xl font-bold mt-6 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>Strike Ladder</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <TableHeader>Strike</TableHeader>
                    <TableHeader>Consequence</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <TableCell>Strike 1 – Guidelines Warning</TableCell>
                    <TableCell>Formal warning issued. Creator Health Score reduced (see Health Score definition above).</TableCell>
                  </tr>
                  <tr>
                    <TableCell>Strike 2 (within 60 days) – Admin Review</TableCell>
                    <TableCell>Account flagged for Admin Review. Search visibility and platform discovery may be reduced.</TableCell>
                  </tr>
                  <tr>
                    <TableCell>Strike 3 (within 90 days) – 7-Day Account Pause + Payout Hold</TableCell>
                    <TableCell>Creator page paused for 7 days. Pending payouts held until the pause is lifted.</TableCell>
                  </tr>
                  <tr>
                    <TableCell>Strike 4 (within 90 days) – Permanent Ban + Payout Freeze</TableCell>
                    <TableCell>Account permanently removed from Skriibe. All pending and held earnings are frozen and reviewed before any release.</TableCell>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4">Strikes decay after 90 days of clean behaviour. Creators may appeal within 48 hours of issuance by emailing <a href="mailto:founder@skriibe.com" className="text-[#3BA8D8] hover:underline">founder@skriibe.com</a>.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>7. Chargebacks</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Buyers are encouraged to use Skriibe's dispute process (Section 5) before initiating a chargeback with their bank.</li>
              <li>Skriibe reserves the right to contest chargebacks where platform records confirm a response was delivered within the 24-hour window and no valid dispute was raised within the 7-day dispute window.</li>
              <li>Filing a fraudulent chargeback where a valid response was received and the dispute window has expired constitutes a Terms of Service violation and may result in account suspension.</li>
              <li>All chargeback investigations are concluded within 15 business days per Razorpay and RBI guidelines.</li>
            </ul>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>8. GST & Tax</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>GST is collected and remitted on the platform fee component of each transaction under the GST Act, 2017. On a refund, the GST component is also reversed.</li>
              <li>TDS under Section 194-O of the Income Tax Act, 1961 is deducted on Creator payouts at 0.1% (with PAN, effective 1 October 2024) or 5% (without PAN, per Section 206AA). TDS is deposited with the Government and reflected in Form 26AS.</li>
              <li>Transaction receipts are available on the platform for all completed payments.</li>
            </ul>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>9. Contact & Grievance Officer</h2>
            <p>For refund queries or disputes not resolved through the platform:</p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <TableHeader>Contact Details</TableHeader>
                    <TableHeader></TableHeader>
                  </tr>
                </thead>
                <tbody>
                  <tr><TableCell>Email</TableCell><TableCell><a href="mailto:founder@skriibe.com" className="text-[#3BA8D8] hover:underline">founder@skriibe.com</a></TableCell></tr>
                  <tr><TableCell>Platform</TableCell><TableCell>Dispute button on any question page at skriibe.com</TableCell></tr>
                  <tr><TableCell>Response time</TableCell><TableCell>Acknowledged within 24 hours. Resolved within 48-72 hours.</TableCell></tr>
                  <tr><TableCell>Grievance Officer</TableCell><TableCell>Tarundeep Singh, Founder — <a href="mailto:founder@skriibe.com" className="text-[#3BA8D8] hover:underline">founder@skriibe.com</a></TableCell></tr>
                  <tr><TableCell>Legal resolution</TableCell><TableCell>15 days (acknowledged within 24 hours) per Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021</TableCell></tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4">Consumer rights under the Consumer Protection Act, 2019 are not limited by this policy. Users may approach the Consumer Disputes Redressal Commission at the appropriate level.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>10. Governing Law & Amendments</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>This policy is governed by the laws of India. Disputes not resolved through the platform are subject to the exclusive jurisdiction of the courts of Chandigarh, India.</li>
              <li>Skriibe may amend this policy at any time. Material changes will be communicated 7 days in advance via email and in-app notification.</li>
              <li>Continued use of the platform after an amendment takes effect constitutes acceptance of the revised policy.</li>
              <li>The latest version of this policy is always available at skriibe.com/refund-policy.</li>
              <li>If any provision is found unenforceable, the remaining provisions continue in full effect.</li>
            </ul>
          </div>
        </div>
      </main>

      <Footer theme={theme} />
    </div>
  );
};

export default Refunds;
