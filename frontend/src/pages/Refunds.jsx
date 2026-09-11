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
            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>1. OVERVIEW</h2>
            <p>Skriibe is a creator monetization and fan-engagement platform operated by EdLern Innovations Private Limited ("Skriibe", "we", "us", or "our").</p>
            <p>Skriibe enables users ("Fans", "Users", "you", or "your") to interact with creators through paid interaction services, including:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li><strong>Live Chat</strong> – real-time, one-to-one conversations billed on a per-minute basis at the rate displayed by the Creator;</li>
              <li><strong>AMA (Ask Me Anything)</strong> – paid questions or messages submitted to a Creator for an asynchronous response; and</li>
              <li><strong>Tips</strong> – voluntary payments made by a Fan to a Creator in appreciation of the Creator's content, interaction, or service.</li>
            </ol>
            <p>This Refund &amp; Cancellation Policy explains when a payment may be cancelled, refunded, or otherwise reviewed by Skriibe.</p>
            <p>Skriibe operates a combination of automatic refunds and support-based refund reviews. Except where an automatic refund is expressly provided under this Policy, a refund is not guaranteed and will be assessed based on the circumstances of the transaction, applicable platform records, Creator activity, and applicable law.</p>
            <p>Nothing in this Policy limits any rights available to a User under applicable law.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>2. HOW PAYMENTS WORK</h2>
            <h3 className={`text-xl font-bold mt-6 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>2.1 Live Chat</h3>
            <p>For Live Chat:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The Fan selects a Creator and views the Creator's applicable per-minute rate before initiating the conversation.</li>
              <li>Billing begins when the Live Chat connection is successfully established.</li>
              <li>The Fan is charged based on the applicable billing mechanism and actual billable interaction time displayed by Skriibe.</li>
              <li>The Fan may end the Live Chat at any time.</li>
              <li>Once a Live Chat has been successfully connected and the corresponding service has been delivered, the amount relating to the completed portion of the session is generally non-refundable, except where a refund is approved under this Policy.</li>
            </ul>

            <h3 className={`text-xl font-bold mt-6 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>2.2 AMA</h3>
            <p>For AMA:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The Fan selects a Creator and submits a question/message after viewing the applicable price.</li>
              <li>Payment is collected at the time the AMA is submitted.</li>
              <li>The Creator is notified through Skriibe and/or the registered notification channels.</li>
              <li>There is no fixed response deadline for AMA. If the Creator does not respond within 15 calendar days of submission, the refund provisions in Section 4.1 apply.</li>
              <li>If the Creator does not respond within the automatic refund period specified in Section 4, the applicable amount will be automatically refunded to the Fan's Skriibe Wallet, subject to the conditions of this Policy.</li>
            </ul>

            <h3 className={`text-xl font-bold mt-6 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>2.3 Tips</h3>
            <p>Tips are voluntary payments made by Fans to Creators.</p>
            <p>Once a Tip has been successfully submitted, it is non-refundable, except where the transaction itself was duplicated or incorrectly processed due to a payment-system error.</p>
            <p>A Tip is not a payment for a guaranteed response, outcome, advice, or future service.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>3. CANCELLATION</h2>
            <h3 className={`text-xl font-bold mt-6 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>3.1 Live Chat Cancellation</h3>
            <p>A Fan may end an ongoing Live Chat at any time.</p>
            <p>Ending a Live Chat does not automatically result in a refund. The Fan will generally be charged for the billable portion of the session already completed.</p>
            <p>If a Fan believes that the Live Chat was affected by a technical failure, incorrect billing, unauthorized interruption, or Creator misconduct, the Fan may raise a support request in accordance with Section 5.</p>

            <h3 className={`text-xl font-bold mt-6 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>3.2 AMA Cancellation</h3>
            <p>Once an AMA has been submitted and payment processed, a change of mind does not create a right to a refund. The refund provisions in Section 4.1 apply where the Creator does not respond within 15 calendar days.</p>

            <h3 className={`text-xl font-bold mt-6 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>3.3 Tips</h3>
            <p>Tips cannot be cancelled after successful submission.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>4. WHEN YOU MAY RECEIVE A REFUND</h2>
            <h3 className={`text-xl font-bold mt-6 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>4.1 Automatic Refunds</h3>
            <p>Skriibe will automatically initiate a refund in the following circumstances:</p>
            <p className="font-semibold mt-4">A. AMA — Creator Does Not Respond</p>
            <p>If:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>the Fan has successfully submitted and paid for an AMA;</li>
              <li>the submitted question/message does not violate Skriibe's Terms, Community Guidelines, or applicable law; and</li>
              <li>the Creator has not responded within 15 calendar days from the date of submission,</li>
            </ul>
            <p className="mt-2">Skriibe will initiate a refund within 48 hours of the 15-day window closing — no separate request required to the Fan's Skriibe Wallet.</p>
            <p>No separate refund request is required.</p>
            <p>If the AMA is found to violate Skriibe's Terms, Community Guidelines, or applicable law, no automatic refund will be issued solely because the Creator did not respond.</p>

            <p className="font-semibold mt-4">B. Duplicate Payment</p>
            <p>Where the same transaction is successfully charged more than once due to a verified payment gateway or technical error, the duplicate transaction amount will be refunded.</p>
            <p>Where reasonably possible, the duplicate payment will be refunded to the original payment method used for the transaction.</p>

            <h3 className={`text-xl font-bold mt-6 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>4.2 Support-Based Refund Review</h3>
            <p>For issues that do not qualify for an automatic refund, the Fan may submit a refund or dispute request through Skriibe Support.</p>
            <p className="font-semibold mt-4">Refund requests may include, without limitation:</p>
            <p className="font-medium mt-2">Live Chat</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Verified Skriibe technical failure;</li>
              <li>Creator disconnecting unexpectedly during a session;</li>
              <li>Incorrect or excessive billing;</li>
              <li>Billing continuing after the session has ended;</li>
              <li>Material service interruption caused by Skriibe;</li>
              <li>Creator conduct that violates Skriibe's Community Guidelines or Terms;</li>
              <li>Other verified circumstances where the paid service was materially not delivered.</li>
            </ul>

            <p className="font-medium mt-4">AMA</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Creator response is materially unrelated to the submitted question/message;</li>
              <li>Creator response is not delivered because of a verified platform issue;</li>
              <li>Creator conduct violates Skriibe's Community Guidelines or Terms;</li>
              <li>Incorrect billing or duplicate charging;</li>
              <li>Other verified circumstances where the paid service was materially not delivered.</li>
            </ul>
            <p className="mt-4">Skriibe may approve a full refund, partial refund, or no refund, depending on the circumstances.</p>
            <p>Where appropriate, Skriibe may use platform records, transaction records, session logs, timestamps, messages, Creator activity, and other relevant information to review the request.</p>

            <h3 className={`text-xl font-bold mt-6 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>4.3 NO REFUND IN THESE CASES</h3>
            <p>Except where required by applicable law, Skriibe will generally not approve refunds for:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Change of mind after an AMA has been submitted;</li>
              <li>Dissatisfaction with a Creator's opinion, personality, response, advice, style, or viewpoint where the Creator has delivered the service and has not violated Skriibe's policies;</li>
              <li>A Fan simply disagreeing with or disliking a Creator's response;</li>
              <li>A successfully completed Live Chat where the billed service was delivered correctly;</li>
              <li>A Tip after successful submission;</li>
              <li>Incorrect, incomplete, misleading, or outdated information provided by the Fan;</li>
              <li>A Fan failing to remain available, connected, or responsive during a Live Chat;</li>
              <li>Internet, device, network, or connectivity issues that are outside Skriibe's control, unless otherwise determined by Skriibe;</li>
              <li>An AMA containing illegal, abusive, sexually explicit, threatening, harassing, discriminatory, or otherwise prohibited content;</li>
              <li>A refund request submitted after the applicable support period;</li>
              <li>A Creator's response not meeting a Fan's subjective expectation where the response was otherwise delivered and compliant;</li>
              <li>Any attempt to obtain a refund through fraudulent, misleading, or abusive means.</li>
            </ol>
            <p className="italic text-sm">The above list is illustrative and does not limit Skriibe's right to assess individual cases.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>5. REFUND REQUESTS AND SUPPORT</h2>
            <p>Except for automatic refunds, Users must raise refund or dispute requests through the official Skriibe Support channel.</p>
            <h3 className={`text-xl font-bold mt-6 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>5.1 Live Chat</h3>
            <p>A refund or dispute relating to a Live Chat must generally be raised within 24 hours of the end of the Live Chat.</p>
            <h3 className={`text-xl font-bold mt-6 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>5.2 AMA</h3>
            <p>A refund or dispute relating to an AMA response must generally be raised within 7 calendar days of receiving the response.</p>
            <p>If the Creator has not responded, the Fan does not need to submit a separate request where the automatic 15-day refund under Section 4.1 applies.</p>
            <h3 className={`text-xl font-bold mt-6 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>5.3 Required Information</h3>
            <p>The Fan should provide:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Registered email address or phone number;</li>
              <li>Transaction ID;</li>
              <li>Chat/AMA ID, where applicable;</li>
              <li>Date and approximate time of the transaction;</li>
              <li>Description of the issue;</li>
              <li>Relevant screenshots or other supporting evidence, where available.</li>
            </ul>
            <p className="mt-2">Skriibe may request additional information where reasonably necessary to investigate the matter.</p>
            <h3 className={`text-xl font-bold mt-6 mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>5.4 Review Period</h3>
            <p>Skriibe will aim to acknowledge support requests within 24 hours and communicate a decision or further update generally within 48 hours.</p>
            <p>Complex matters may require additional time for investigation.</p>
            <p>Skriibe may review platform records and other relevant information before making a decision.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>6. REFUND METHOD</h2>
            <p>Unless otherwise required by applicable law or determined by Skriibe, approved refunds may be credited to the Fan's Skriibe Wallet.</p>
            <p>The refunded amount may then be used for eligible services available on Skriibe.</p>
            <p>Where Skriibe determines that a refund should be returned to the original payment method, the refund will be processed through the applicable payment gateway or payment partner.</p>
            <p>The actual time taken for the amount to appear in the original payment account may depend on the relevant bank, card network, UPI provider, payment gateway, or other financial institution.</p>
            <p>Skriibe is not responsible for delays caused solely by external payment providers or banking networks.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>7. REFUND AMOUNT</h2>
            <p>Where a refund is approved, Skriibe may determine whether the appropriate refund is:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Full;</li>
              <li>Partial; or</li>
              <li>Limited to the affected portion of the transaction.</li>
            </ul>
            <p className="mt-4">For Live Chat disputes, the refund may be calculated based on the verified portion of the session affected by the relevant issue.</p>
            <p>Where permitted by applicable law, non-recoverable payment processing, gateway, transaction, or other charges actually incurred by Skriibe may be considered when determining the refundable amount.</p>
            <p>No deduction will be made where applicable law requires the full amount to be refunded.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>8. CREATOR EARNINGS AND REFUNDS</h2>
            <p>Skriibe operates a revenue-sharing model under which the Creator receives the applicable Creator share of eligible transactions.</p>
            <p>Where a refund is approved for a transaction from which Creator earnings have already been calculated or credited:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>the corresponding Creator earnings may be reversed or adjusted;</li>
              <li>the adjustment may be applied against future Creator payouts or other amounts payable to the Creator;</li>
              <li>where the Creator is determined to have caused or materially contributed to the issue, Skriibe may take additional action under its Creator Terms and Community Guidelines.</li>
            </ul>
            <p className="mt-4">A refund decision to a Fan does not automatically mean that a Creator has violated Skriibe's policies. Each matter may be reviewed separately.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>9. CREATOR FLAGGING AND PROHIBITED CONTENT</h2>
            <p>Creators may flag AMA questions/messages or other Fan activity that they believe contains:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Illegal content;</li>
              <li>Sexually explicit content;</li>
              <li>Abusive or threatening language;</li>
              <li>Harassment;</li>
              <li>Hate or discriminatory content;</li>
              <li>Content that violates Skriibe's Community Guidelines or Terms.</li>
            </ul>
            <p className="mt-4">Flagged content may be reviewed by Skriibe.</p>
            <p>If an AMA question/message is determined to violate applicable Skriibe policies, Skriibe may:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>refuse or restrict the interaction;</li>
              <li>suspend or terminate the User's account;</li>
              <li>withhold or reverse applicable Creator earnings; and/or</li>
              <li>determine that the User is not eligible for a refund where the payment relates to prohibited content.</li>
            </ul>
            <p className="mt-4">Nothing in this section limits any rights available to a User under applicable law.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>10. TECHNICAL FAILURES</h2>
            <p>Skriibe will make reasonable efforts to maintain the availability and functionality of its platform. However, Skriibe is not responsible for technical problems caused solely by:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>the User's device;</li>
              <li>User's internet connection;</li>
              <li>third-party network failure;</li>
              <li>mobile carrier issues;</li>
              <li>banking or payment-provider outages;</li>
              <li>force majeure events; or</li>
              <li>other circumstances outside Skriibe's reasonable control.</li>
            </ul>
            <p className="mt-4">Where a technical issue is determined to have been caused by Skriibe and materially affected a paid service, Skriibe may provide an appropriate full or partial refund based on the circumstances.</p>
            <p>For Live Chat, Skriibe may use its technical logs and session records to determine the duration of the session and whether a platform-side interruption occurred.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>11. PAYMENT ERRORS AND DOUBLE CHARGES</h2>
            <p>If a User experiences a payment failure, the User should first verify whether the payment has actually been debited from the relevant bank account or payment instrument before attempting another payment.</p>
            <p>If the User has been charged more than once for the same transaction due to a verified payment or technical error, the duplicate amount will be refunded.</p>
            <p>Skriibe may request transaction details or supporting evidence to verify the duplicate charge.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>12. CHARGEBACKS</h2>
            <p>Users are encouraged to contact Skriibe Support and use the dispute process under this Policy before initiating a chargeback with their bank or payment provider.</p>
            <p>Where a chargeback is initiated, Skriibe may provide relevant transaction records, session information, timestamps, payment information, and other platform records to the payment provider or financial institution as permitted by law.</p>
            <p>Where Skriibe's records establish that a paid service was delivered and the applicable refund/dispute period has expired, Skriibe may contest the chargeback.</p>
            <p>Fraudulent or abusive chargeback activity may result in suspension or termination of the User's Skriibe account, subject to applicable law.</p>
            <p>Chargeback timelines are determined by the relevant payment provider, bank, card network, UPI provider, or other financial institution and may be outside Skriibe's control.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>13. TAXES AND REFUNDS</h2>
            <p>Where applicable, taxes collected by Skriibe in connection with a transaction will be handled in accordance with applicable tax laws and regulations.</p>
            <p>Where a refund requires reversal or adjustment of applicable taxes, Skriibe may make the corresponding adjustment in accordance with applicable law and tax requirements.</p>
            <p>Transaction records and receipts may be made available to Users through the Skriibe platform or applicable payment provider.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>14. FRAUDULENT OR ABUSIVE REFUND REQUESTS</h2>
            <p>Skriibe reserves the right to investigate refund requests that appear to involve:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fraud;</li>
              <li>Misrepresentation;</li>
              <li>Repeated or abusive refund requests;</li>
              <li>Manipulation of platform functionality;</li>
              <li>False complaints;</li>
              <li>Unauthorized use of payment instruments; or</li>
              <li>Attempts to obtain services without payment.</li>
            </ul>
            <p className="mt-4">Where appropriate and permitted by law, Skriibe may suspend or restrict an account while investigating such activity.</p>
            <p>A User whose account is terminated for violating Skriibe's Terms or Community Guidelines may not be eligible for a refund of amounts associated with prohibited or fraudulent activity, subject to applicable law.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>15. CONSUMER RIGHTS</h2>
            <p>This Policy is intended to establish Skriibe's standard refund and cancellation process.</p>
            <p>Nothing contained in this Policy is intended to exclude, restrict, or waive any rights or remedies that a User may have under applicable Indian law, including rights available under the Consumer Protection Act, 2019, where applicable.</p>
            <p>Users may approach the appropriate consumer dispute redressal mechanism or other competent authority where permitted by law.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>16. GRIEVANCE AND SUPPORT CONTACT</h2>
            <p>For refund-related questions, Users should contact Skriibe through the official Support channel.</p>
            <p><strong>Support Email:</strong> <a href="mailto:support@skriibe.com" className="text-[#3BA8D8] hover:underline font-medium">support@skriibe.com</a></p>
            <p><strong>Subject:</strong> Refund Query — [Transaction ID]</p>
            <p>Users should include their registered contact details, transaction ID, date of transaction, nature of the issue, and supporting information.</p>

            <div className="overflow-x-auto my-6">
              <table className={`w-full border-collapse border text-sm md:text-base ${theme === 'light' ? 'border-gray-300 bg-white' : 'border-gray-700 bg-white/[0.02]'}`}>
                <tbody>
                  <tr className={`border-b ${theme === 'light' ? 'border-gray-300' : 'border-gray-700'}`}>
                    <td className={`w-1/3 sm:w-1/4 px-4 py-3 font-semibold border-r ${theme === 'light' ? 'bg-[#f0f4fa] text-gray-900 border-gray-300' : 'bg-white/[0.06] text-white border-gray-700'}`}>
                      Grievance Officer
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
                      Founder
                    </td>
                  </tr>
                  <tr>
                    <td className={`w-1/3 sm:w-1/4 px-4 py-3 font-semibold border-r ${theme === 'light' ? 'bg-[#f0f4fa] text-gray-900 border-gray-300' : 'bg-white/[0.06] text-white border-gray-700'}`}>
                      Email
                    </td>
                    <td className={`px-4 py-3 ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                      <a href="mailto:founder@skriibe.com" className="text-[#3BA8D8] hover:underline font-medium">
                        founder@skriibe.com
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p>Skriibe will acknowledge complaints within a reasonable period and endeavour to resolve them within the timelines specified in this Policy, subject to the complexity of the matter and applicable law.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>17. GOVERNING LAW AND JURISDICTION</h2>
            <p>This Policy shall be governed by and interpreted in accordance with the laws of India.</p>
            <p>Subject to any mandatory rights available to consumers or other Users under applicable law, disputes arising in connection with this Policy or the use of Skriibe shall be subject to the jurisdiction of the competent courts at Chandigarh, India.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>18. AMENDMENTS</h2>
            <p>Skriibe may modify, update, or amend this Refund &amp; Cancellation Policy from time to time.</p>
            <p>Where material changes are made, Skriibe will endeavour to communicate such changes at least 7 days before they take effect. Skriibe may communicate such changes through the platform, email, notification, or other reasonable means.</p>
            <p>The latest version of this Policy will be made available through the Skriibe platform.</p>
            <p>If any provision of this Policy is determined to be invalid or unenforceable, the remaining provisions will continue to remain in effect to the extent permitted by applicable law.</p>
          </div>
        </div>
      </main>

      <Footer theme={theme} />
    </div>
  );
};

export default Refunds;
