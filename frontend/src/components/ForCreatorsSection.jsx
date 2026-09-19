import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, CheckCircle2, DollarSign, Calendar, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ForCreatorsSection = ({ theme }) => {
  const isLight = theme === 'light';
  const navigate = useNavigate();
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const { isAuthenticated, roles } = useAuth();

  return (
    <>
      <section className="w-full my-12 sm:my-16 md:my-24 overflow-visible px-4 sm:px-6 md:px-12 !w-[calc(100%+2rem)] sm:!w-[calc(100%+3rem)] md:!w-[calc(100%+6rem)] -mx-4 sm:-mx-6 md:-mx-12">
        <div className={`relative w-full rounded-[32px] sm:rounded-[40px] md:rounded-[48px] py-16 sm:py-20 md:py-24 px-6 sm:px-8 md:px-12 overflow-visible border shadow-2xl ${
          isLight
            ? 'bg-gradient-to-br from-gray-50 to-white border-gray-200'
            : 'bg-[#0f141e] border-white/10 shadow-[0_0_50px_rgba(255,94,98,0.15)]'
        }`}>
          
          <img
            src="/images/forcreators.png"
            alt="Creator earning mockups"
            className="absolute inset-0 w-full h-full object-cover object-[50%_15%] opacity-50 select-none pointer-events-none rounded-[32px] sm:rounded-[40px] md:rounded-[48px]"
          />
          <div 
            className="absolute inset-0 z-0 rounded-[32px] sm:rounded-[40px] md:rounded-[48px]"
            style={{
              background: isLight 
                ? 'linear-gradient(to top, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)'
                : 'linear-gradient(to top, rgba(15,20,30,0.95) 0%, rgba(15,20,30,0.8) 100%)'
            }}
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
                to={isAuthenticated ? (roles?.includes('creator') ? "/creator/dashboard" : "/creator/signup?error=CONFLICT_FAN") : "/creator/signup"}
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
              <div className="w-10 h-10 rounded-full bg-[#3BA8D8]/20 flex items-center justify-center border border-[#3BA8D8]/40">
                <DollarSign className="w-5 h-5 text-[#3BA8D8]" />
              </div>
              <div>
                <h3 className="text-xl font-bold">How You Get Paid</h3>
                <p className={`text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Simple, transparent, weekly.</p>
              </div>
            </div>

            {/* Content List */}
            <div className="space-y-4 mb-6">
              <div className={`flex gap-3 p-3.5 rounded-xl border ${isLight ? 'bg-gray-50 border-gray-100' : 'bg-white/5 border-white/10'}`}>
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Keep 80% of what you earn</p>
                  <p className={`text-xs mt-0.5 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>You set your price per minute. We only take 20% to cover servers and credit card fees.</p>
                </div>
              </div>

              <div className={`flex gap-3 p-3.5 rounded-xl border ${isLight ? 'bg-gray-50 border-gray-100' : 'bg-white/5 border-white/10'}`}>
                <Calendar className="w-5 h-5 text-[#3BA8D8] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Paid out every Tuesday</p>
                  <p className={`text-xs mt-0.5 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>All earnings clear instantly and are deposited straight into your bank account automatically every week.</p>
                </div>
              </div>

              <div className={`flex gap-3 p-3.5 rounded-xl border ${isLight ? 'bg-gray-50 border-gray-100' : 'bg-white/5 border-white/10'}`}>
                <ShieldCheck className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">No chargebacks, ever</p>
                  <p className={`text-xs mt-0.5 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Fans pay upfront. You are guaranteed the money for every minute you chat.</p>
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
                to={isAuthenticated ? "/creator/dashboard" : "/creator/signup"}
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
