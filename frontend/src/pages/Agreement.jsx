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
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#3BA8D8] to-[#7c3aed] mb-8 text-center">
            Contract Between Fan and Creator
          </h1>
          
          <div className={`text-base md:text-lg leading-relaxed space-y-6 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'} font-sans`}>
            <p className="font-semibold">Last Updated: June 2026</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>1. Introduction</h2>
            <p>This Contract Between Fan and Creator ("Agreement") governs each paid question submitted by a Fan to a Creator through Skriibe.</p>
            <p>By submitting a paid question, making payment, accepting a question, or providing a response through Skriibe, both the Fan and the Creator agree to be bound by this Agreement.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>2. Parties</h2>
            <p>This Agreement is entered into solely between:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The Fan submitting a paid question; and</li>
              <li>The Creator receiving and responding to that question.</li>
            </ul>
            <p>Skriibe, operated by Edlern Innovations Private Limited ("Skriibe"), provides the platform, payment processing, communication tools, and related services but is not a party to the individual question-and-answer transaction.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>3. Definitions</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Creator</strong> means a user approved by Skriibe to receive paid questions and provide answers.</li>
              <li><strong>Fan</strong> means a user who pays to submit a question to a Creator.</li>
              <li><strong>Question</strong> means a written question submitted through Skriibe.</li>
              <li><strong>Question Fee</strong> means the amount charged by a Creator for receiving and responding to a question, subject to the Creator's right to reject the question under Section 6.</li>
              <li><strong>Question Transaction</strong> means a paid interaction between a Fan and a Creator through Skriibe.</li>
              <li><strong>Answer</strong> means a Creator's written response delivered through Skriibe.</li>
              <li><strong>Creator Earnings</strong> means the portion of a Question Fee payable to a Creator after deduction of platform fees, taxes, refunds, chargebacks, and other applicable adjustments.</li>
            </ul>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>4. Nature of Service</h2>
            <p>A Question Transaction grants the Fan the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Submit one question directly to a Creator; and</li>
              <li>Receive a response within the platform-defined response window (currently 24 hours, as set out in the Refund & Cancellation Policy), or a full refund if the Creator neither responds nor validly rejects the question within that window.</li>
              <li>The only exception to this guarantee is where the Creator validly rejects the question for one of the reasons set out in Section 6. There is no curation, queue, or session — each paid question is considered and either answered or rejected on its own.</li>
            </ul>
            <p>Responses are delivered through the Fan's Skriibe Inbox.</p>
            <p>Skriibe may also send email notifications regarding question status updates and completed responses.</p>
            <p>The Fan is purchasing access to the Creator's time, expertise, knowledge, opinion, or experience. No particular outcome, result, recommendation, or benefit is guaranteed.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>5. Pricing and Payment</h2>
            <p>The Fan agrees to pay:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The Question Fee displayed at checkout; and</li>
              <li>Any applicable taxes.</li>
            </ul>
            <p>Payments are collected by Skriibe on behalf of the Creator.</p>
            <p>Skriibe is authorized to deduct platform fees, taxes, refunds, chargebacks, and other lawful deductions before releasing Creator Earnings.</p>
            <p>All payments are final except as provided in this Agreement or Skriibe's Refund Policy. The platform commission, Creator payout share, and payout cadence are set out in Skriibe's Refund & Cancellation Policy.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>6. Creator Obligations</h2>
            <p>The Creator agrees to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Respond honestly and professionally.</li>
              <li>Respond to, or validly reject, each accepted question within the platform-defined response window (currently 24 hours).</li>
              <li>Comply with Skriibe's Terms of Service and Community Guidelines.</li>
              <li>Ensure responses do not violate applicable laws.</li>
              <li>Maintain respectful communication.</li>
            </ul>
            <p>Creators may reject questions that:</p>
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
              <li>Submit lawful and respectful questions.</li>
              <li>Provide accurate information where required.</li>
              <li>Not engage in harassment, abuse, spam, or hate speech.</li>
              <li>Not request illegal services or activities.</li>
              <li>Not attempt payment fraud or abuse of refunds.</li>
              <li>Comply with all Skriibe policies.</li>
            </ul>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>8. Question Rejections</h2>
            <p>If a Creator rejects a question before providing an answer, the Fan may be eligible for a refund in accordance with Skriibe's Refund Policy.</p>
            <p>A Creator's decision to reject a question in accordance with this Agreement does not constitute a breach of this Agreement.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>9. Refund Policy</h2>
            <p>Refunds may be issued when:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>A Creator rejects a question because it falls outside their expertise, or is incomplete, misleading, or unclear.</li>
              <li>A Creator fails to respond to, or validly reject, a question within the response window.</li>
              <li>A duplicate payment occurs.</li>
              <li>Fraudulent activity is detected.</li>
              <li>Required by applicable law.</li>
            </ul>
            <p>Questions rejected due to violations of Skriibe's Terms of Service, Community Guidelines, abusive conduct, illegal requests, spam, harassment, or other inappropriate content are generally not eligible for a refund.</p>
            <p>Refunds will generally not be provided because:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The Fan disagrees with the Creator's opinion.</li>
              <li>The Fan is dissatisfied with the substance of the response.</li>
              <li>The Fan changes their mind after receiving a response.</li>
              <li>The Creator validly rejects the question under Section 6 (the Fan is instead refunded automatically through that route).</li>
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
              <li>Question submissions;</li>
              <li>Question acceptance or rejection;</li>
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
            <p>Failure to view a notification does not affect the validity of a completed Question Transaction.</p>

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
              <li>A Creator's maximum liability arising from any Question Transaction shall not exceed the Question Fee paid for that specific transaction.</li>
            </ul>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>16. Governing Law and Jurisdiction</h2>
            <p>This Agreement shall be governed by the laws of India.</p>
            <p>Any dispute arising from this Agreement shall be subject to the exclusive jurisdiction of the courts located in Chandigarh, India.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>17. Severability</h2>
            <p>If any provision of this Agreement is found to be invalid or unenforceable, the remaining provisions shall remain valid and enforceable.</p>

            <h2 className={`text-2xl font-bold mt-8 mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>18. Changes to this Agreement</h2>
            <p>Skriibe may modify this Agreement from time to time.</p>
            <p>Continued use of the platform following any modification constitutes acceptance of the updated Agreement.</p>
          </div>
        </div>
      </main>

      <Footer theme={theme} />
    </div>
  );
};

export default Agreement;
