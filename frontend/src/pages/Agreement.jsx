import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Agreement = () => {
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
            Contract Between Fan and Creator
          </h1>
          
          <div className={`text-base md:text-lg leading-relaxed space-y-6 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'} font-sans`}>
            <p className="font-semibold">Last Updated: September 2026</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>1. Introduction</h2>
            <p>This Contract Between Fan and Creator ("Agreement") governs all paid interactions between a Fan and a Creator through Skriibe, including: (1) Live Chat — real-time pay-per-minute conversations; (2) AMA (Ask Me Anything) — paid asynchronous question/messages sent when the creator is offline, responded to at the creator's discretion with no fixed deadline; and (3) Tips — voluntary non-refundable gratuities sent after a Live Chat.</p>
            <p>By initiating a Live Chat, submitting a paid AMA question/message, sending a Tip, accepting an interaction, or providing a response through Skriibe, both the Fan and the Creator agree to be bound by this Agreement.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>2. Parties</h2>
            <p>This Agreement is entered into solely between:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The Fan submitting a paid question/message; and</li>
              <li>The Creator receiving and responding to that question/message.</li>
            </ul>
            <p>Skriibe, operated by Edlern Innovations Private Limited ("Skriibe"), provides the platform, payment processing, communication tools, and related services but is not a party to the individual question/message-and-answer transaction.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>3. Definitions</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Creator</strong> means a user approved by Skriibe to receive paid question/messages and provide answers.</li>
              <li><strong>Fan</strong> means a user who pays to submit a question/message to a Creator.</li>
              <li><strong>Question/message</strong> means a written question/message submitted through Skriibe.</li>
              <li><strong>Question/message Fee</strong> means the flat fee charged by a Creator for an AMA question/message, or the per-minute rate charged for a Live Chat session.</li>
              <li><strong>Question/message Transaction</strong> means a paid interaction between a Fan and a Creator through Skriibe.</li>
              <li><strong>Answer</strong> means a Creator's written response delivered through Skriibe.</li>
              <li><strong>Creator Earnings</strong> means the portion of a Question/message Fee payable to a Creator after deduction of platform fees, taxes, refunds, chargebacks, and other applicable adjustments.</li>
            </ul>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>4. Nature of Service</h2>
            <p>A transaction under this Agreement is one of three types: (1) Live Chat — grants the Fan real-time access to a Creator for the duration of the session, billed per minute; (2) AMA — grants the Fan the right to submit one written question/message to an offline Creator, responded to at the Creator's discretion with no fixed deadline; or (3) Tip — a voluntary gratuity the Fan may send after a Live Chat, conferring no additional rights on either party.</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The Fan is purchasing access to the Creator's time, expertise, knowledge, opinion, or experience across the applicable interaction model. No particular outcome, result, recommendation, or benefit is guaranteed.</li>
            </ul>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>5. Pricing and Payment</h2>
            <p>The Fan agrees to pay:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The Question/message Fee displayed at checkout; and</li>
              <li>Any applicable taxes.</li>
            </ul>
            <p>Payments are collected by Skriibe on behalf of the Creator.</p>
            <p>Skriibe is authorized to deduct platform fees, taxes, refunds, chargebacks, and other lawful deductions before releasing Creator Earnings.</p>
            <p>All payments are final except as set out in this Agreement and Skriibe’s Refund &amp; Cancellation Policy.</p>
            <p>If the creator does not respond within 15 days of submission and the question/message did not violate Skriibe’s Community Guidelines, Skriibe will initiate a 100% refund to the Fan’s Skriibe Wallet balance within 48 hours of the 15-day window closing. If the question/message violated Community Guidelines, no refund is issued even after 15 days. For all other concerns — including Live Chat technical failures, creator disconnect, abusive or irrelevant responses, billing anomalies, or unwarranted rejection of an AMA question/message — the Fan must raise a query at <a href="mailto:Support@skriibe.com" className="text-[#3BA8D8] hover:underline font-medium">Support@skriibe.com</a> with the transaction ID and details of the concern. Skriibe will review and respond within 48 hours. Any approved refund (full or partial) is added to the Fan’s Skriibe Wallet balance at Skriibe’s sole discretion. Tips are non-refundable in all circumstances. The Creator is an independent contractor and not an employee, agent, partner, or legal representative of Skriibe. The Creator is solely responsible for the payment of all applicable taxes (including income tax, GST where applicable, and any other statutory levies) on Creator Earnings received through the platform.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>6. Creator Obligations</h2>
            <p>The Creator agrees to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Respond honestly and professionally.</li>
              <li>For Live Chat: be present and engaged for the duration of the active session. For AMA: respond to the question/message at the Creator’s discretion — there is no fixed response deadline. Skriibe does not provide a rejection mechanism; creators either respond or do not respond. If the creator does not respond within 15 days, Skriibe will initiate a refund to the Fan’s Skriibe Wallet within 48 hours of day 15 (where the question/message did not violate Community Guidelines).</li>
              <li>Comply with Skriibe's Terms of Service and Community Guidelines.</li>
              <li>Ensure responses do not violate applicable laws.</li>
              <li>Maintain respectful communication.</li>
            </ul>
            <p className="mt-4 font-semibold">Creators must not respond in any manner that:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violate platform policies.</li>
              <li>Are abusive, threatening, or harassing.</li>
              <li>Request illegal activities.</li>
              <li>Fall outside the Creator's expertise.</li>
              <li>Are incomplete, misleading, or unclear.</li>
            </ul>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>7. Fan Obligations</h2>
            <p>The Fan agrees to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Submit lawful and respectful question/messages.</li>
              <li>Provide accurate information where required.</li>
              <li>Not engage in harassment, abuse, spam, or hate speech.</li>
              <li>Not request illegal services or activities.</li>
              <li>Not attempt payment fraud or abuse of refunds.</li>
              <li>Comply with all Skriibe policies.</li>
            </ul>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>8. AMA Question/messages — Non-Response and Creator Conduct</h2>
            <p>Skriibe does not provide a rejection mechanism for AMA question/messages. Creators either respond to a submitted AMA question/message or do not respond. If the creator does not respond within 15 days of submission, Skriibe will initiate a 100% refund to the Fan’s Skriibe Wallet balance within 48 hours of the 15-day window closing, provided the submitted question/message did not violate Skriibe’s Community Guidelines. If a creator’s AMA response, or their conduct during a Live Chat, violates Community Guidelines or these Terms, the Fan may raise a query at <a href="mailto:Support@skriibe.com" className="text-[#3BA8D8] hover:underline font-medium">Support@skriibe.com</a> within 7 days of the interaction — Skriibe will review and decide at its discretion.</p>
            <p>A Creator’s failure to respond to an AMA question/message within the 15-day window will result in Skriibe initiating a refund as described in this Agreement and the Refund &amp; Cancellation Policy, and constitutes a breach of this Agreement.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>9. Refund Policy</h2>
            <p>Refunds may be issued when:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>AMA</strong> — no creator response within 15 days of submission AND the question/message did not violate Community Guidelines → Skriibe will initiate a 100% refund to the Fan’s Skriibe Wallet balance within 48 hours of day 15 (no Fan action needed).</li>
              <li><strong>All other concerns</strong> (Live Chat: within 24 hours; AMA: within 7 days of response) → raise query at <a href="mailto:Support@skriibe.com" className="text-[#3BA8D8] hover:underline font-medium">Support@skriibe.com</a> → Skriibe reviews within 48 hours → approved refund (full or partial) to Skriibe Wallet at Skriibe's sole discretion.</li>
              <li><strong>Duplicate payment</strong> due to gateway error → refunded to original payment method within 5–7 business days.</li>
              <li>Fraudulent activity is detected.</li>
              <li>Required by applicable law.</li>
            </ul>
            <p>Where a Fan submits an AMA question/message that violates Skriibe’s Community Guidelines or applicable law (including abusive, illegal, sexually explicit, or harassing content), Skriibe will not initiate the 15-day non-response refund even if the creator does not respond. Skriibe may remove such question/messages from the platform without notice.</p>
            <p className="mt-4 font-semibold">Refunds will generally not be provided because:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The Fan disagrees with the Creator's opinion.</li>
              <li>The Fan is dissatisfied with the substance of the response.</li>
              <li>Change of mind after payment for any model.</li>
              <li>AMA: non-response within the 15-day window where the submitted question/message violated Community Guidelines.</li>
              <li>AMA: delay within the 15-day window (delay alone is not a refund ground).</li>
              <li>Response dissatisfaction or disagreement with the creator’s opinion or advice.</li>
              <li>Live Chat: session completed normally, regardless of user satisfaction.</li>
              <li>User-side network or device failure, or user-initiated session end.</li>
              <li>Tips: non-refundable in all circumstances once sent.</li>
            </ul>
            <p>Skriibe reserves the final right to determine refund eligibility.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>10. Ownership and Use of Responses</h2>
            <p>Creators retain ownership of their responses and original content.</p>
            <p>Fans receive a limited, personal, non-exclusive, non-transferable right to access and view responses delivered through Skriibe.</p>
            <p>Unless otherwise permitted by law or authorized by the Creator, Fans may not:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sell responses;</li>
              <li>Republish responses;</li>
              <li>Commercially distribute responses; or</li>
              <li>Claim ownership of Creator content.</li>
            </ul>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>11. No Professional Advice</h2>
            <p>Unless expressly stated otherwise, Creator responses are provided for informational, educational, and entertainment purposes only.</p>
            <p>Responses should not be considered legal, medical, financial, tax, investment, psychological, or other regulated professional advice.</p>
            <p>Fans are responsible for obtaining independent professional advice where appropriate.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>12. Platform Role</h2>
            <p>Skriibe acts solely as a technology platform facilitating communication and transactions between Fans and Creators.</p>
            <p>Skriibe does not:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Endorse any Creator.</li>
              <li>Guarantee the quality, accuracy, or usefulness of any response.</li>
              <li>Verify every Creator's qualifications, expertise, or credentials.</li>
              <li>Accept responsibility for opinions expressed by Creators.</li>
            </ul>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>13. Notifications and Communication</h2>
            <p>Skriibe may send notifications regarding:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Question/message submissions;</li>
              <li>Whether and when to respond to AMA question/messages;</li>
              <li>Creator responses;</li>
              <li>Refunds;</li>
              <li>Account activity; and</li>
              <li>Other platform-related updates.</li>
            </ul>
            <p>Notifications may be delivered through:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The Skriibe Inbox;</li>
              <li>Email; or</li>
              <li>Other communication channels introduced by Skriibe in the future.</li>
            </ul>
            <p>Failure to view a notification does not affect the validity of a completed Question/message Transaction.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>14. Account Restrictions and Termination</h2>
            <p>Fans and Creators must comply with Skriibe's Terms of Service, Community Guidelines, and applicable laws.</p>
            <p>Violations may result in:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Warnings;</li>
              <li>Reduced visibility;</li>
              <li>Temporary suspension;</li>
              <li>Payout holds;</li>
              <li>Account termination; or</li>
              <li>Other enforcement actions deemed appropriate by Skriibe.</li>
            </ul>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>15. Limitation of Liability</h2>
            <p>To the maximum extent permitted by applicable law:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Skriibe shall not be liable for indirect, incidental, special, consequential, or punitive damages arising from use of the platform.</li>
              <li>A Creator's maximum liability arising from any Question/message Transaction shall not exceed the Question/message Fee paid for that specific transaction.</li>
            </ul>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>16. Governing Law and Jurisdiction</h2>
            <p>This Agreement shall be governed by the laws of India.</p>
            <p>Any dispute arising from this Agreement shall be subject to the exclusive jurisdiction of the courts located in Chandigarh, India.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>17. Severability</h2>
            <p>If any provision of this Agreement is found to be invalid or unenforceable, the remaining provisions shall remain valid and enforceable.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>18. Changes to this Agreement</h2>
            <p>Skriibe may modify this Agreement from time to time. Material changes will be notified with at least 7 days’ advance notice via email or in-app notification.</p>
            <p>Continued use of the platform after the effective date of any modification constitutes acceptance of the updated Agreement.</p>
          </div>
        </div>
      </main>

      <Footer theme={theme} />
    </div>
  );
};

export default Agreement;
