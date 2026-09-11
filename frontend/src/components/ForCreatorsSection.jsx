import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, CheckCircle2, DollarSign, Calendar, ShieldCheck, ArrowRight } from 'lucide-react';

const ForCreatorsSection = ({ theme = 'dark' }) => {
  const isLight = theme === 'light';
  const navigate = useNavigate();
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  return (
    <>
      <section className="w-full mt-4 sm:mt-5 md:mt-6 mb-3 sm:mb-4 md:mb-5">
        <div
          className={`relative overflow-hidden rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 lg:p-10 border transition-all duration-300 ${
            isLight
              ? 'bg-gradient-to-br from-sky-50/70 via-white to-sky-100/40 border-sky-200/80 shadow-[0_8px_30px_rgba(59,168,216,0.08)]'
              : 'bg-gradient-to-br from-[#0c1622] via-[#0f141d] to-[#0a0d13] border-[#3BA8D8]/20 shadow-[0_8px_40px_rgba(59,168,216,0.1)]'
          }`}
        >
          {/* Subtle Ambient Background Glows */}
          <div
            className={`absolute top-0 right-0 w-80 sm:w-96 h-80 sm:h-96 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 ${
              isLight ? 'bg-sky-200/30' : 'bg-[#3BA8D8]/10'
            }`}
          />
          <div
            className={`absolute bottom-0 left-0 w-72 sm:w-80 h-72 sm:h-80 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20 ${
              isLight ? 'bg-blue-100/30' : 'bg-purple-900/10'
            }`}
          />

          <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
            {/* Category Label */}
            <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#FF5E62] mb-3 sm:mb-4">
              FOR CREATORS
            </p>

            {/* Main Headline in Website's Bebas Neue font */}
            <h2
              className={`text-4xl sm:text-6xl md:text-7xl lg:text-[76px] xl:text-[84px] font-normal uppercase tracking-tight leading-[0.93] ${
                isLight ? 'text-gray-950' : 'text-white'
              }`}
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              ARE YOU THE ONE<br />
              EVERYONE DMS?
            </h2>

            {/* Paragraph */}
            <p
              className={`text-sm sm:text-base md:text-[17px] leading-relaxed max-w-xl mt-4 sm:mt-5 ${
                isLight ? 'text-gray-600' : 'text-gray-300'
              }`}
            >
              Set your per-minute rate, flip yourself online when you feel like it.
            </p>

            {/* Join as a creator Button */}
            <div className="mt-6 sm:mt-8 w-full sm:w-auto flex justify-center">
              <Link
                to="/creator/signup"
                className={`inline-flex items-center justify-center w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 rounded-full font-bold text-base sm:text-lg transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 shadow-sm ${
                  isLight
                    ? 'bg-[#3BA8D8] hover:bg-[#2d8ab8] text-white shadow-md hover:shadow-lg'
                    : 'bg-[#3BA8D8] hover:bg-[#4ab8d6] text-black shadow-[0_0_25px_rgba(59,168,216,0.35)] hover:shadow-[0_0_35px_rgba(59,168,216,0.5)]'
                }`}
              >
                Join as a creator
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How Payouts Work Modal */}
      {showPayoutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-up"
          onClick={() => setShowPayoutModal(false)}
        >
          <div
            className={`relative w-full max-w-lg rounded-[28px] p-6 sm:p-8 border shadow-2xl transition-all ${
              isLight
                ? 'bg-white border-gray-200 text-gray-900'
                : 'bg-[#121620] border-white/10 text-white shadow-[0_10px_40px_rgba(0,0,0,0.8)]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowPayoutModal(false)}
              className={`absolute top-5 right-5 p-2 rounded-full transition-colors cursor-pointer ${
                isLight ? 'hover:bg-gray-100 text-gray-500' : 'hover:bg-white/10 text-gray-400'
              }`}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-[#3BA8D8]/15 text-[#3BA8D8] border border-[#3BA8D8]/30 flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold">How payouts work</h3>
                <p className={`text-xs sm:text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                  Simple, transparent, and direct to your account.
                </p>
              </div>
            </div>

            {/* Payout Features */}
            <div className="space-y-3.5 my-6">
              <div className={`p-3.5 rounded-2xl border flex items-start gap-3.5 ${
                isLight ? 'bg-gray-50/80 border-gray-100' : 'bg-white/[0.03] border-white/5'
              }`}>
                <Calendar className="w-5 h-5 text-[#3BA8D8] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold">Weekly Scheduled Payouts</h4>
                  <p className={`text-xs sm:text-sm mt-0.5 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                    Earnings are processed every Tuesday directly to your registered bank account or UPI.
                  </p>
                </div>
              </div>

              <div className={`p-3.5 rounded-2xl border flex items-start gap-3.5 ${
                isLight ? 'bg-gray-50/80 border-gray-100' : 'bg-white/[0.03] border-white/5'
              }`}>
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold">Direct Bank & UPI Transfers</h4>
                  <p className={`text-xs sm:text-sm mt-0.5 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                    Link your UPI ID or IFSC bank account in your creator settings with zero hassle.
                  </p>
                </div>
              </div>

              <div className={`p-3.5 rounded-2xl border flex items-start gap-3.5 ${
                isLight ? 'bg-gray-50/80 border-gray-100' : 'bg-white/[0.03] border-white/5'
              }`}>
                <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold">Live Dashboard Tracking</h4>
                  <p className={`text-xs sm:text-sm mt-0.5 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                    See your minute-by-minute earnings, session history, and pending payouts in real time.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => {
                  setShowPayoutModal(false);
                  navigate('/faqs');
                }}
                className={`flex-1 py-3 px-4 rounded-full text-center text-sm font-semibold border transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                  isLight
                    ? 'border-gray-300 hover:bg-gray-100 text-gray-700'
                    : 'border-white/10 hover:bg-white/5 text-gray-300'
                }`}
              >
                <span>Read Full FAQs</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                to="/creator/signup"
                onClick={() => setShowPayoutModal(false)}
                className={`flex-1 py-3 px-4 rounded-full text-center text-sm font-bold transition-all ${
                  isLight
                    ? 'bg-[#3BA8D8] text-white hover:bg-[#2d8ab8]'
                    : 'bg-[#3BA8D8] text-black hover:bg-[#4ab8d6]'
                }`}
              >
                Start Earning Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ForCreatorsSection;
