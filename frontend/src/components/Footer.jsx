import React, { useState } from 'react';

const creatorFaqs = [
  { q: "How do I start earning on Skriibe?", a: "Create your profile, set your pricing, and start accepting questions." },
  { q: "How much do creators earn from each question?", a: "Creators earn 80% of the question price. Skriibe retains 20% as a platform fee. Payment processing fees are covered by Skriibe, so creators receive their full 80% share, subject to any applicable taxes or legal deductions." },
  { q: "When do creators get paid?", a: "Earnings are transferred according to Skriibe's payout schedule. Payouts are processed every Tuesday. To be eligible, earnings must be at least 7 days old at the time of payout processing." },
  { q: "Can I decline a question?", a: "Yes, if it violates guidelines or isn't something you're comfortable answering." },
  { q: "What happens if I miss the 24-hour response window?", a: "The question may become eligible for a refund under Skriibe's refund policy." },
  { q: "Can I pause receiving questions?", a: "Yes, you can temporarily stop accepting new questions." },
  { q: "Can I change my pricing anytime?", a: "Yes. Pricing can be updated whenever you choose." },
  { q: "Can I report abusive users?", a: "Yes, creators can report users who violate community standards." },
  { q: "Do I need a subscription to use Skriibe?", a: "No. Fans pay per question, while creators can join and start receiving questions without requiring fans to purchase a subscription." },
  { q: "What if my payment succeeds but my question isn't submitted?", a: "Our support team can help resolve payment-related issues at support@skriibe.com" },
  { q: "How do refunds work?", a: "If a creator doesn't respond within 24 hours, you may be eligible for a refund according to Skriibe's refund policy. If a response is submitted but is abusive, inappropriate, or clearly incomplete, you can raise a dispute for review by the Skriibe team." }
];

const Footer = ({ theme }) => {
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showCreatorFaqs, setShowCreatorFaqs] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  return (
    <footer className="bg-[#0b0b0b] text-white pt-16 pb-8 px-6 md:px-12 font-syne border-t border-[#1a1a1a] relative">
      {/* How it Works Modal */}
      {showHowItWorks && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#090b1a] border border-[#38265c] rounded-2xl p-8 max-w-md w-full shadow-2xl relative animate-fade-up">
            <button 
              onClick={() => setShowHowItWorks(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-white mb-3">How does Skriibe work?</h3>
            <p className="text-[#94a3b8] leading-relaxed">
              Choose a creator, submit your question, make payment, and wait for their response.
            </p>
            <button 
              onClick={() => setShowHowItWorks(false)}
              className="mt-6 w-full py-3 bg-[#3BA8D8] text-white rounded-xl font-medium hover:bg-opacity-90 transition-all"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Creator FAQs Modal */}
      {showCreatorFaqs && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#090b1a] border border-[#38265c] rounded-2xl p-6 md:p-8 max-w-2xl w-full shadow-2xl relative animate-fade-up max-h-[85vh] flex flex-col">
            <button 
              onClick={() => setShowCreatorFaqs(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl z-10"
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold text-white mb-6">Creator FAQs</h3>
            
            <div className="overflow-y-auto pr-2 flex-1 space-y-3 custom-scrollbar">
              {creatorFaqs.map((faq, index) => (
                <div key={index} className="border border-[#1e1533] bg-[#0c0f22] rounded-xl overflow-hidden transition-all">
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    className="w-full flex justify-between items-center p-4 text-left focus:outline-none"
                  >
                    <span className="text-white font-medium pr-4">{faq.q}</span>
                    <span className="text-[#a094ba] text-2xl font-light transition-transform duration-300" style={{ transform: openFaqIndex === index ? 'rotate(45deg)' : 'rotate(0deg)' }}>
                      +
                    </span>
                  </button>
                  <div className={`px-4 text-[#94a3b8] text-sm transition-all duration-300 ease-in-out ${openFaqIndex === index ? 'pb-4 opacity-100 max-h-40' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    {faq.a}
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setShowCreatorFaqs(false)}
              className="mt-6 w-full py-3 bg-[#3BA8D8] text-white rounded-xl font-medium hover:bg-opacity-90 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
        {/* Logo and Description */}
        <div className="col-span-1 md:col-span-2 flex flex-col gap-6">
          <div className="flex items-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 2000 520.97"
              className="h-10 w-auto transition-colors text-white overflow-visible -ml-2"
            >
              <text
                x="0"
                y="457.72"
                textAnchor="start"
                fontSize="566.36px"
                fontFamily="Garet, sans-serif"
                fontWeight="400"
                fill="currentColor"
              >
                skr<tspan fill="#3BA8D8">ii</tspan>be
              </text>
            </svg>
          </div>
          <p className="text-[#a3a3a3] text-[15px] leading-relaxed max-w-sm mt-2">
            A creator monetization platform that lets creators get paid to answer their followers' questions — turning free DMs into guaranteed, paid conversations delivered within 24 hours.
          </p>
          <div className="flex gap-5 mt-2">
            {/* Instagram */}
            <a href="#" className="text-[#a3a3a3] hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 7.5h.01M12 15a3 3 0 100-6 3 3 0 000 6z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25v7.5a2.25 2.25 0 01-2.25 2.25h-10.5a2.25 2.25 0 01-2.25-2.25v-7.5a2.25 2.25 0 012.25-2.25h10.5A2.25 2.25 0 0119.5 8.25z" />
              </svg>
            </a>
            {/* LinkedIn */}
            <a href="#" className="text-[#a3a3a3] hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2 9h4v12H2z" />
                <circle cx="4" cy="4" r="2" stroke="currentColor" fill="none"/>
              </svg>
            </a>
            {/* Email */}
            <a href="mailto:support@skriibe.com" className="text-[#a3a3a3] hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </a>
          </div>
        </div>

        {/* Links Columns */}
        <div className="col-span-1 flex flex-col gap-5">
          <h4 className="text-white font-bold tracking-widest text-xs uppercase mb-2">Company</h4>
          <a href="/about" className="text-[#a3a3a3] hover:text-white transition-colors text-sm">About Us</a>
          <a href="/mission" className="text-[#a3a3a3] hover:text-white transition-colors text-sm">Mission</a>
          <a href="/vision" className="text-[#a3a3a3] hover:text-white transition-colors text-sm">Vision</a>
        </div>

        <div className="col-span-1 flex flex-col gap-5">
          <h4 className="text-white font-bold tracking-widest text-xs uppercase mb-2">Creators</h4>
          <a href="#" onClick={(e) => { e.preventDefault(); setShowHowItWorks(true); }} className="text-[#a3a3a3] hover:text-white transition-colors text-sm">How it Works</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setShowCreatorFaqs(true); }} className="text-[#a3a3a3] hover:text-white transition-colors text-sm">FAQs</a>
        </div>

        <div className="col-span-1 flex flex-col gap-5">
          <h4 className="text-white font-bold tracking-widest text-xs uppercase mb-2">Legal</h4>
          <a href="/terms" className="text-[#a3a3a3] hover:text-white transition-colors text-sm">Terms of Service</a>
          <a href="/privacy" className="text-[#a3a3a3] hover:text-white transition-colors text-sm">Privacy Policy</a>
          <a href="/refunds" className="text-[#a3a3a3] hover:text-white transition-colors text-sm">Refund Policy</a>
          <a href="/agreement" className="text-[#a3a3a3] hover:text-white transition-colors text-sm">Creator & Fan Agreement</a>
          <a href="/guidelines" className="text-[#a3a3a3] hover:text-white transition-colors text-sm">Community Guidelines</a>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-[#1a1a1a] flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
        <div className="text-[#556987]">© 2026 skriibe · Made in India · For India</div>
        <div className="text-[#737373]">
          Instagram brings the audience. <span className="text-[#3BA8D8]">skriibe brings the money.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;