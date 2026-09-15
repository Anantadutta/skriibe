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

const Footer = ({ theme, showTalkDirectly = true }) => {
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showCreatorFaqs, setShowCreatorFaqs] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  return (
    <footer className={`${theme === 'light' ? 'bg-[#f8fafc] text-black border-gray-200' : 'bg-[#0b0b0b] text-white border-[#1a1a1a]'} pt-10 sm:pt-14 pb-8 px-6 md:px-12 font-syne border-t relative`}>
      {/* Big #TALKDIRECTLY Banner */}
      {showTalkDirectly && (
        <div className="w-full text-center select-none overflow-hidden mb-8 sm:mb-10">
          <h2
            className={`text-6xl sm:text-8xl md:text-9xl lg:text-[130px] xl:text-[160px] font-normal uppercase tracking-tight leading-none ${
              theme === 'light' ? 'text-black' : 'text-[#F5EDE8]'
            }`}
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            #TALKDIRECTLY
          </h2>
        </div>
      )}
      {/* How it Works Modal */}
      {showHowItWorks && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#090b1a] border-[#38265c]'} border rounded-2xl p-8 max-w-md w-full shadow-2xl relative animate-fade-up`}>
            <button 
              onClick={() => setShowHowItWorks(false)} 
              className={`absolute top-4 right-4 ${theme === 'light' ? 'text-gray-500 hover:text-black' : 'text-gray-400 hover:text-white'} text-xl`}
            >
              ✕
            </button>
            <h3 className={`text-2xl font-bold mb-6 ${theme === 'light' ? 'text-black' : 'text-white'}`}>How does Skriibe work?</h3>
            
            <div className="space-y-6 text-left">
              <div>
                <h4 className={`${theme === 'light' ? 'text-black' : 'text-white'} font-semibold mb-2 text-lg`}>For Fans</h4>
                <p className={`${theme === 'light' ? 'text-gray-600' : 'text-[#94a3b8]'} leading-relaxed text-sm`}>
                  Tap Start Chat - connect in seconds with the creator or influencers you already follow. First chat free.
                </p>
              </div>

              <div>
                <h4 className={`${theme === 'light' ? 'text-black' : 'text-white'} font-semibold mb-2 text-lg`}>For Creators</h4>
                <ul className={`${theme === 'light' ? 'text-gray-600' : 'text-[#94a3b8]'} leading-relaxed text-sm list-disc pl-4 space-y-2`}>
                  <li>Sign up, set your rate, go live or enable AMA.</li>
                  <li>Drop your Skriibe link in your Instagram bio.</li>
                  <li>Fans chat with you live - or leave a paid question for later.</li>
                  <li>You reply. You earn. Every Tuesday, automatically.</li>
                </ul>
              </div>
            </div>

            <button 
              onClick={() => setShowHowItWorks(false)}
              className="mt-8 w-full py-3 bg-[#3BA8D8] text-white rounded-xl font-medium hover:bg-opacity-90 transition-all"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Creator FAQs Modal */}
      {showCreatorFaqs && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#090b1a] border-[#38265c]'} border rounded-2xl p-6 md:p-8 max-w-2xl w-full shadow-2xl relative animate-fade-up max-h-[85vh] flex flex-col`}>
            <button 
              onClick={() => setShowCreatorFaqs(false)} 
              className={`absolute top-4 right-4 ${theme === 'light' ? 'text-gray-500 hover:text-black' : 'text-gray-400 hover:text-white'} text-xl z-10`}
            >
              ✕
            </button>
            <h3 className={`text-2xl font-bold mb-6 ${theme === 'light' ? 'text-black' : 'text-white'}`}>Creator FAQs</h3>
            
            <div className="overflow-y-auto pr-2 flex-1 space-y-3 custom-scrollbar">
              {creatorFaqs.map((faq, index) => (
                <div key={index} className={`border ${theme === 'light' ? 'border-gray-200 bg-gray-50' : 'border-[#1e1533] bg-[#0c0f22]'} rounded-xl overflow-hidden transition-all`}>
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    className="w-full flex justify-between items-center p-4 text-left focus:outline-none"
                  >
                    <span className={`${theme === 'light' ? 'text-black' : 'text-white'} font-medium pr-4`}>{faq.q}</span>
                    <span className={`${theme === 'light' ? 'text-gray-500' : 'text-[#a094ba]'} text-2xl font-light transition-transform duration-300`} style={{ transform: openFaqIndex === index ? 'rotate(45deg)' : 'rotate(0deg)' }}>
                      +
                    </span>
                  </button>
                  <div className={`px-4 ${theme === 'light' ? 'text-gray-600' : 'text-[#94a3b8]'} text-sm transition-all duration-300 ease-in-out ${openFaqIndex === index ? 'pb-4 opacity-100 max-h-40' : 'max-h-0 opacity-0 overflow-hidden'}`}>
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

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-6 gap-12 mb-16">
        {/* Logo and Description */}
        <div className="col-span-1 md:col-span-2 flex flex-col gap-6">
          <div className="flex items-start">
            <a href="/">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 2000 520.97"
                className={`h-10 w-auto transition-colors ${theme === 'light' ? 'text-black' : 'text-white'} overflow-visible -ml-2`}
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
            </a>
          </div>
          <p className={`${theme === 'light' ? 'text-gray-600' : 'text-[#a3a3a3]'} text-[15px] leading-relaxed max-w-sm mt-2`}>
            Skriibe Live Chat lets you have a private, real-time 1-on-1 conversation with a creator. You pay according to the creator's displayed per-minute rate.
          </p>
          <div className="flex gap-5 mt-2">
            {/* Instagram */}
            <a href="https://www.instagram.com/skriibeofficial?igsh=MTQ2bTY5bXE4eTV4Ng%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className={`${theme === 'light' ? 'text-gray-600 hover:text-black' : 'text-[#a3a3a3] hover:text-white'} transition-colors`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 7.5h.01M12 15a3 3 0 100-6 3 3 0 000 6z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25v7.5a2.25 2.25 0 01-2.25 2.25h-10.5a2.25 2.25 0 01-2.25-2.25v-7.5a2.25 2.25 0 012.25-2.25h10.5A2.25 2.25 0 0119.5 8.25z" />
              </svg>
            </a>
            {/* LinkedIn */}
            <a href="https://www.linkedin.com/company/skriibe/" target="_blank" rel="noopener noreferrer" className={`${theme === 'light' ? 'text-gray-600 hover:text-black' : 'text-[#a3a3a3] hover:text-white'} transition-colors`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2 9h4v12H2z" />
                <circle cx="4" cy="4" r="2" stroke="currentColor" fill="none"/>
              </svg>
            </a>
            {/* Email */}
            <a href="mailto:support@skriibe.com" className={`${theme === 'light' ? 'text-gray-600 hover:text-black' : 'text-[#a3a3a3] hover:text-white'} transition-colors`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </a>
          </div>
        </div>

        {/* Links Columns */}
        <div className="col-span-1 flex flex-col gap-5">
          <div className="flex flex-col gap-4">
            <h4 className={`${theme === 'light' ? 'text-black' : 'text-white'} font-bold tracking-widest text-xs uppercase mb-1`}>Company</h4>
            <a href="/about" className={`${theme === 'light' ? 'text-gray-600 hover:text-black' : 'text-[#a3a3a3] hover:text-white'} transition-colors text-sm`}>About Us</a>
            <a href="/mission" className={`${theme === 'light' ? 'text-gray-600 hover:text-black' : 'text-[#a3a3a3] hover:text-white'} transition-colors text-sm`}>Mission</a>
            <a href="/vision" className={`${theme === 'light' ? 'text-gray-600 hover:text-black' : 'text-[#a3a3a3] hover:text-white'} transition-colors text-sm`}>Vision</a>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <h4
              className={`${theme === 'light' ? 'text-black' : 'text-white'} font-bold tracking-widest text-xs uppercase`}
            >
              Contact Us
            </h4>
            <a
              href="/raise-query"
              className={`${theme === 'light' ? 'text-gray-600 hover:text-black' : 'text-[#a3a3a3] hover:text-white'} transition-colors text-sm`}
            >
              Raise a Query
            </a>
            <a
              href="mailto:support@skriibe.com"
              className={`${theme === 'light' ? 'text-gray-600 hover:text-black' : 'text-[#a3a3a3] hover:text-white'} transition-colors text-sm`}
            >
              Email : support@skriibe.com
            </a>
          </div>
        </div>

        <div className="col-span-1 flex flex-col gap-5">
          <h4 className={`${theme === 'light' ? 'text-black' : 'text-white'} font-bold tracking-widest text-xs uppercase mb-2`}>Product</h4>
          <a href="#" onClick={(e) => { e.preventDefault(); setShowHowItWorks(true); }} className={`${theme === 'light' ? 'text-gray-600 hover:text-black' : 'text-[#a3a3a3] hover:text-white'} transition-colors text-sm`}>How it Works</a>
          <a href="/faqs" className={`${theme === 'light' ? 'text-gray-600 hover:text-black' : 'text-[#a3a3a3] hover:text-white'} transition-colors text-sm`}>FAQs</a>
          <a href="/affiliate" className={`${theme === 'light' ? 'text-gray-600 hover:text-black' : 'text-[#a3a3a3] hover:text-white'} transition-colors text-sm`}>Refer & Earn Affiliate</a>
        </div>

        <div className="col-span-1 flex flex-col gap-5">
          <h4 className={`${theme === 'light' ? 'text-black' : 'text-white'} font-bold tracking-widest text-xs uppercase mb-2`}>Legal</h4>
          <a href="/terms" className={`${theme === 'light' ? 'text-gray-600 hover:text-black' : 'text-[#a3a3a3] hover:text-white'} transition-colors text-sm`}>Terms of Service</a>
          <a href="/privacy" className={`${theme === 'light' ? 'text-gray-600 hover:text-black' : 'text-[#a3a3a3] hover:text-white'} transition-colors text-sm`}>Privacy Policy</a>
          <a href="/refunds" className={`${theme === 'light' ? 'text-gray-600 hover:text-black' : 'text-[#a3a3a3] hover:text-white'} transition-colors text-sm`}>Refund And Cancellation Policy</a>
          <a href="/agreement" className={`${theme === 'light' ? 'text-gray-600 hover:text-black' : 'text-[#a3a3a3] hover:text-white'} transition-colors text-sm`}>Creator & Fan Agreement</a>
          <a href="/guidelines" className={`${theme === 'light' ? 'text-gray-600 hover:text-black' : 'text-[#a3a3a3] hover:text-white'} transition-colors text-sm`}>Community Guidelines</a>
          <a href="/cookies" className={`${theme === 'light' ? 'text-gray-600 hover:text-black' : 'text-[#a3a3a3] hover:text-white'} transition-colors text-sm`}>Cookie Policy</a>
        </div>

        {/* Secure Section */}
        <div className="col-span-1 flex flex-col gap-5">
          <h4 className={`${theme === 'light' ? 'text-black' : 'text-white'} font-bold tracking-widest text-xs uppercase mb-2`}>Secure</h4>
          
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${theme === 'light' ? 'bg-[#f1f5f9]' : 'bg-[#1a1a1a]'} flex-shrink-0`}>
              <svg className={`w-5 h-5 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <span className={`${theme === 'light' ? 'text-gray-600' : 'text-[#a3a3a3]'} text-sm font-medium leading-tight`}>Private & Confidential</span>
          </div>

          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${theme === 'light' ? 'bg-[#f1f5f9]' : 'bg-[#1a1a1a]'} flex-shrink-0`}>
              <svg className={`w-5 h-5 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <span className={`${theme === 'light' ? 'text-gray-600' : 'text-[#a3a3a3]'} text-sm font-medium leading-tight`}>Secure Payments</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={`max-w-7xl mx-auto pt-8 border-t ${theme === 'light' ? 'border-gray-200' : 'border-[#1a1a1a]'} flex flex-col md:flex-row justify-between items-center gap-4 text-sm`}>
        <div className={`${theme === 'light' ? 'text-gray-600' : 'text-[#556987]'}`}>
          © 2026 Skriibe. All rights reserved.<br />
          A product of EdLern Innovations Private Limited.
        </div>
      </div>
    </footer>
  );
};

export default Footer;