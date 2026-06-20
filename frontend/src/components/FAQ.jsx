import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const faqData = [
  {
    question: "What is Skriibe?",
    answer: "Skriibe is a platform where fans can pay to ask questions directly to creators and receive personalized answers."
  },
  {
    question: "How does Skriibe work?",
    answer: "Choose a creator, submit your question, make payment, and wait for their response."
  },
  {
    question: "How do I ask a question?",
    answer: "Simply select a creator, write your question, make the payment, and submit it. The creator will receive your question and can respond through Skriibe."
  },
  {
    question: "What happens if a creator doesn't answer my question?",
    answer: "Creators are expected to respond within 24 hours. If they don't, you may be eligible for a refund according to Skriibe's refund policy."
  },
  {
    question: "How much does it cost to ask a question?",
    answer: "Each creator sets their own price. The cost will be displayed before you submit your question."
  },
  {
    question: "Can I ask any creator on Skriibe?",
    answer: "You can ask questions to creators who have an active Skriibe profile and are currently accepting questions."
  },
  {
    question: "Can other users see my question or answer?",
    answer: "No. Questions and answers on Skriibe are only visible to the fan who asked the question and the creator who received it. They are not displayed publicly on the platform."
  },
  {
    question: "Can creators reject questions?",
    answer: "Yes. Creators can decline questions that violate guidelines or fall outside their expertise."
  },
  {
    question: "Will I be notified when my answer is ready?",
    answer: "Yes, you'll receive a notification as soon as the creator responds on Email and Skriibe Inbox "
  },
  {
    question: "How do refunds work?",
    answer: "If a creator doesn't respond within 24 hours, you may be eligible for a refund according to Skriibe's refund policy. If a response is submitted but is abusive, inappropriate, or clearly incomplete, you can raise a dispute for review by the Skriibe team."
  },
  {
    question: "Can I ask follow-up questions?",
    answer: "Yes, each follow-up is treated as a new question unless otherwise specified by the creator."
  },
  {
    question: "Is my payment secure?",
    answer: "Yes, all payments are processed through secure payment providers."
  },
  {
    question: "Can I edit or cancel my question after submitting it?",
    answer: "Once a question is submitted, it cannot be edited. Cancellation depends on whether the creator has already viewed or started responding to it."
  },
  {
    question: "Can I get a refund if I don't like the answer?",
    answer: "Refunds are not based on personal satisfaction. Refund eligibility is governed by Skriibe's refund policy."
  },
  {
    question: "What kind of questions can I ask?",
    answer: "You can ask for advice, opinions, guidance, feedback, recommendations, and creator insights."
  },
  {
    question: "Is there a limit to how many questions I can ask?",
    answer: "No. Fans can ask as many questions as they like, provided they complete the payment for each question."
  },
  {
    question: "How do I start earning on Skriibe?",
    answer: "Create your profile, set your pricing, and start accepting questions."
  },
  {
    question: "How much do creators earn from each question?",
    answer: "Creators earn 80% of the question price. Skriibe retains 20% as a platform fee. Payment processing fees are covered by Skriibe, so creators receive their full 80% share, subject to any applicable taxes or legal deductions."
  },
  {
    question: "When do creators get paid?",
    answer: "Earnings are transferred according to Skriibe's payout schedule. Payouts are processed every Tuesday. To be eligible, earnings must be at least 7 days old at the time of payout processing."
  },
  {
    question: "Can I decline a question?",
    answer: "Yes, if it violates guidelines or isn't something you're comfortable answering."
  },
  {
    question: "What happens if I miss the 24-hour response window?",
    answer: "The question may become eligible for a refund under Skriibe's refund policy."
  },
  {
    question: "Can I pause receiving questions?",
    answer: "Yes, you can temporarily stop accepting new questions."
  },
  {
    question: "Can I change my pricing anytime?",
    answer: "Yes. Pricing can be updated whenever you choose."
  },
  {
    question: "Can I report abusive users?",
    answer: "Yes, creators can report users who violate community standards."
  },
  {
    question: "Do I need a subscription to use Skriibe?",
    answer: "No. Fans pay per question, while creators can join and start receiving questions without requiring fans to purchase a subscription."
  },
  {
    question: "What if my payment succeeds but my question isn't submitted?",
    answer: "Our support team can help resolve payment-related issues at support@skriibe.com"
  }
];

const FAQ = ({ theme }) => {
  const [openIndex, setOpenIndex] = useState(null);
  const navigate = useNavigate();

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const visibleFaqs = faqData.slice(0, 5);

  return (
    <div className={`w-full ${theme === 'light' ? 'bg-[#f8fafc]' : 'bg-black'} py-20 px-4 flex flex-col items-center font-syne`}>
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <h2 className={`${theme === 'light' ? 'text-black' : 'text-white'} text-xl md:text-2xl font-bold tracking-[0.25em] uppercase mb-2`}>
            FAQS
          </h2>
          <h3 className="font-libre text-skriibe-blue text-5xl md:text-6xl font-normal">
            Good to know
          </h3>
        </div>

        <div className="flex flex-col gap-4">
          {visibleFaqs.map((faq, index) => (
            <div 
              key={index}
              className={`border ${theme === 'light' ? 'border-gray-200 bg-white' : 'border-[#38265c] bg-black'} rounded-2xl overflow-hidden transition-all duration-300`}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center px-6 py-5 text-left focus:outline-none"
              >
                <span className={`${theme === 'light' ? 'text-black' : 'text-white'} text-lg font-medium`}>{faq.question}</span>
                <span className={`${theme === 'light' ? 'text-gray-500' : 'text-[#a094ba]'} text-3xl font-light ml-4 transition-transform duration-300`} style={{ transform: openIndex === index ? 'rotate(45deg)' : 'rotate(0deg)' }}>
                  +
                </span>
              </button>
              
              <div 
                className={`px-6 ${theme === 'light' ? 'text-gray-600' : 'text-[#94a3b8]'} transition-all duration-300 ease-in-out ${openIndex === index ? 'pb-5 opacity-100 max-h-40' : 'max-h-0 opacity-0 overflow-hidden'}`}
              >
                {faq.answer}
              </div>
            </div>
          ))}
        </div>

        {faqData.length > 5 && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => navigate('/faqs')}
              className={`px-8 py-3 ${theme === 'light' ? 'bg-white border-gray-200 text-black hover:bg-gray-50' : 'bg-[#111] border-[#38265c] text-white hover:bg-[#1a1a1a]'} border rounded-full font-medium transition-colors duration-300 shadow-md`}
            >
              View more
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FAQ;
