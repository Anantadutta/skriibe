import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const fanFaqs = [
  {
    question: "What is Skriibe Live Chat?",
    answer: "Skriibe Live Chat lets you have a private, real-time 1-on-1 conversation with a creator. You pay according to the creator's displayed per-minute rate."
  },
  {
    question: "How do I start a Live Chat?",
    answer: "Open a creator's profile, check that Live Chat is available, review the creator's ₹/minute rate, make sure you have sufficient balance, and tap Start Chat."
  },
  {
    question: "When does billing start?",
    answer: "Billing starts when the Live Chat session actually begins, according to the session's billing rules."
  },
  {
    question: "Can I end the chat anytime?",
    answer: "Yes. You can end the Live Chat whenever you want. You are charged only for the billable time used in the session."
  },
  {
    question: "What happens if the creator does not accept my chat?",
    answer: "If the Live Chat does not start because the creator does not accept or is unavailable, you should not be charged for a live conversation."
  },
  {
    question: "Can I chat with an offline creator?",
    answer: "Live Chat is available when the creator is online and accepting chats. If the creator is unavailable, you may use another available feature such as AMA, if enabled."
  },
  {
    question: "What if my balance runs out during the chat?",
    answer: "The chat should end or be handled according to the platform's low-balance rules. The fan should not be charged beyond the available balance unless explicitly supported by the platform's payment flow."
  },
  {
    question: "Can I add balance before or during a chat?",
    answer: "Fans can add balance through the available Skriibe payment flow. The exact top-up options depend on the current wallet/payment implementation."
  },
  {
    question: "Is my conversation private?",
    answer: "Yes. Your Live Chat is a private conversation between you and the creator. It is not publicly displayed on Skriibe."
  },
  {
    question: "Can the creator share my conversation?",
    answer: "Skriibe treats the chat as private. Users should not share another person's private conversation or personal information without appropriate permission."
  },
  {
    question: "Can I get a refund?",
    answer: "If there is a problem with a Live Chat or an incorrect charge, contact Skriibe Support. Refund eligibility is assessed based on the issue, session status, billing record, and applicable Skriibe policy."
  },
  {
    question: "What should I do if I was charged incorrectly?",
    answer: "Contact Skriibe Support and provide the relevant chat/order ID, creator name, approximate time, and a short description of the issue. Support can verify the session and billing record."
  }
];

export const creatorFaqs = [
  {
    question: "What is Skriibe Live Chat for creators?",
    answer: "It allows creators to offer paid, real-time 1-on-1 conversations with fans at a creator-selected per-minute rate."
  },
  {
    question: "How do I enable Live Chat?",
    answer: "Complete your creator profile and enable Live Chat from the creator controls, subject to Skriibe's eligibility and onboarding requirements."
  },
  {
    question: "Can I choose my own rate?",
    answer: "Yes. Creators can choose from the pricing options made available by Skriibe and select the rate that best fits their audience and positioning."
  },
  {
    question: "How does creator availability work?",
    answer: "Creators can make themselves available for Live Chat when they are ready to receive real-time conversations. The product should clearly show whether the creator is available or away."
  },
  {
    question: "What happens when I go offline?",
    answer: "When you are not accepting Live Chats, fans should see that you are unavailable and should not be able to start a new live session with you."
  },
  {
    question: "How do I receive a chat request?",
    answer: "When a fan starts a Live Chat with you and you are available, the request/session appears in your creator interface. Follow the on-screen controls to accept, start, or end the session."
  },
  {
    question: "How am I paid?",
    answer: "Creator earnings are based on eligible billable Live Chat revenue generated through your sessions. Skriibe's platform fee/commission is deducted according to the creator agreement."
  },
  {
    question: "What is Skriibe's commission?",
    answer: "The current Skriibe business model provides creators 80% of eligible revenue and Skriibe retains 20%, subject to the applicable terms and exclusions."
  },
  {
    question: "When do I receive my payout?",
    answer: "Creator payouts are processed according to Skriibe's payout schedule and applicable minimum settlement period. The current planned schedule is Tuesday payouts with a minimum 7-day period."
  },
  {
    question: "What happens if a fan requests a refund?",
    answer: "Support/Admin reviews the session, billing record, reason for the request, and applicable refund policy. A refund may affect the creator's eligible earnings for that transaction."
  },
  {
    question: "What if I miss or cannot accept a chat?",
    answer: "If you cannot take a Live Chat, keep your status unavailable where possible. Repeated missed requests or poor response behaviour may affect creator quality metrics or account review."
  },
  {
    question: "How long should I stay available?",
    answer: "Creators should only switch to available when they are genuinely ready for a real-time conversation. This helps protect fan experience and creator response metrics."
  },
  {
    question: "Can I change my rate later?",
    answer: "Yes, if rate changes are enabled by Skriibe. Any rate change should apply to new sessions according to the product's pricing rules."
  },
  {
    question: "Can I see my Live Chat earnings?",
    answer: "Creator analytics should show relevant revenue, session, duration, and other Live Chat metrics available in the current dashboard."
  }
];

export const allFaqs = [...fanFaqs, ...creatorFaqs];

const FAQ = ({ theme = 'dark' }) => {
  const [openIndex, setOpenIndex] = useState(null);
  const navigate = useNavigate();

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Only show the first 5 FAQs on the landing page
  const visibleFaqs = fanFaqs.slice(0, 5);
  const isLight = theme === 'light';

  return (
    <section className="w-full mt-12 sm:mt-16 md:mt-20 mb-4 sm:mb-5 md:mb-6">
      <div className="max-w-3xl mx-auto w-full">
        <div className="text-center mb-10 sm:mb-12">
          <p className="text-lg sm:text-xl md:text-2xl font-bold uppercase tracking-[0.25em] text-[#FF5E62] mb-4 sm:mb-6">
            FAQS
          </p>
          <h2
            className={`text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight ${
              isLight ? 'text-gray-900' : 'text-white'
            }`}
          >
            The Questions Everyone DM Us
          </h2>
          <p
            className={`text-sm sm:text-base mt-3 ${
              isLight ? 'text-gray-600' : 'text-gray-400'
            }`}
          >
            Everything you need to know about starting conversations on Skriibe.
          </p>
        </div>

        <div className="flex flex-col gap-3.5">
          {visibleFaqs.map((faq, index) => (
            <div
              key={index}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isLight
                  ? 'bg-white border-gray-200/90 shadow-sm'
                  : 'bg-[#13131A] border-[#1E1E28]'
              }`}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center px-6 py-4.5 sm:py-5 text-left focus:outline-none cursor-pointer"
              >
                <span
                  className={`text-base sm:text-lg md:text-xl font-semibold pr-4 ${
                    isLight ? 'text-gray-900' : 'text-white'
                  }`}
                >
                  {faq.question}
                </span>
                <span
                  className={`text-2xl font-light shrink-0 transition-transform duration-300 ${
                    isLight ? 'text-gray-500' : 'text-[#3BA8D8]'
                  }`}
                  style={{
                    transform: openIndex === index ? 'rotate(45deg)' : 'rotate(0deg)'
                  }}
                >
                  +
                </span>
              </button>

              <div
                className={`px-6 transition-all duration-300 ease-in-out ${
                  isLight ? 'text-gray-600' : 'text-gray-400'
                } ${
                  openIndex === index
                    ? 'pb-5 opacity-100 max-h-48'
                    : 'max-h-0 opacity-0 overflow-hidden'
                }`}
              >
                <p className="text-sm sm:text-[15px] leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Show More Button navigating to /faqs page */}
        <div className="mt-6 sm:mt-8 flex justify-center">
          <button
            onClick={() => navigate('/faqs')}
            className="px-8 py-3 rounded-xl bg-[#3BA8D8] hover:bg-[#3497c3] text-black font-bold text-sm sm:text-base tracking-wide transition-all duration-200 shadow-[0_0_20px_rgba(59,168,216,0.3)] flex items-center gap-2 hover:scale-[1.02] cursor-pointer"
          >
            Show more
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
