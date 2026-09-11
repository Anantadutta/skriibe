import React from 'react';
import { Link } from 'react-router-dom';
import { Ban, RefreshCw, Ticket, MessageCircle } from 'lucide-react';

const NewFansOnly = ({ theme = 'dark' }) => {
  const isLight = theme === 'light';

  const benefits = [
    {
      id: 'no-card',
      icon: (
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center shrink-0">
          <Ban className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
        </div>
      ),
      text: 'No card needed to start',
    },
    {
      id: 'no-renew',
      icon: (
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 text-[#3BA8D8] flex items-center justify-center shrink-0">
          <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
        </div>
      ),
      text: 'Nothing auto-renews, ever',
    },
    {
      id: 'any-creator',
      icon: (
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
          <Ticket className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
        </div>
      ),
      text: 'Works with any creator you pick',
    },
    {
      id: 'chat-only',
      icon: (
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
        </div>
      ),
      text: 'Chat only — no calls to schedule',
    },
  ];

  return (
    <section className="w-full my-12 sm:my-16 md:my-20">
      <div
        className={`relative overflow-hidden rounded-[28px] sm:rounded-[36px] p-6 sm:p-10 lg:p-14 border transition-all duration-300 ${
          isLight
            ? 'bg-gradient-to-br from-sky-50/70 via-white to-sky-100/40 border-sky-200/80 shadow-[0_8px_30px_rgba(59,168,216,0.08)]'
            : 'bg-gradient-to-br from-[#0c1622] via-[#0f141d] to-[#0a0d13] border-[#3BA8D8]/20 shadow-[0_8px_40px_rgba(59,168,216,0.1)]'
        }`}
      >
        {/* Subtle Ambient Background Glow */}
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

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headline, Copy & CTA */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Pill Badge */}
            <div
              className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.16em] mb-4 sm:mb-5 border ${
                isLight
                  ? 'bg-sky-100 text-[#0284c7] border-sky-200'
                  : 'bg-[#3BA8D8]/15 text-[#3BA8D8] border-[#3BA8D8]/30 shadow-[0_0_12px_rgba(59,168,216,0.25)]'
              }`}
            >
              NEW FANS ONLY
            </div>

            {/* Main Title in Bebas Neue */}
            <h2
              className={`text-4xl sm:text-6xl md:text-7xl lg:text-[76px] xl:text-[84px] font-normal uppercase tracking-tight leading-[0.93] ${
                isLight ? 'text-gray-950' : 'text-white'
              }`}
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              FIRST CHAT'S<br />
              ON THE HOUSE.
            </h2>

            {/* Paragraph / Subtitle */}
            <p
              className={`text-sm sm:text-base md:text-[17px] leading-relaxed max-w-xl mt-4 sm:mt-5 ${
                isLight ? 'text-gray-600' : 'text-gray-300'
              }`}
            >
              2 free minutes with any creator on Skriibe. No card, no wallet top-up, no auto-renew waiting to bite you. If it's useful, keep going by the minute.
            </p>

            {/* Claim Free Chat Button */}
            <div className="mt-6 sm:mt-8">
              <Link
                to="/fan/login"
                className={`inline-flex items-center justify-center px-7 sm:px-8 py-3.5 sm:py-4 rounded-full font-bold text-sm sm:text-base transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 ${
                  isLight
                    ? 'bg-[#3BA8D8] hover:bg-[#2d8ab8] text-white shadow-md hover:shadow-lg'
                    : 'bg-[#3BA8D8] hover:bg-[#4ab8d6] text-black shadow-[0_0_25px_rgba(59,168,216,0.35)] hover:shadow-[0_0_35px_rgba(59,168,216,0.5)]'
                }`}
              >
                Claim my free chat
              </Link>
            </div>
          </div>

          {/* Right Column: 4 Rounded Benefits Pills */}
          <div className="lg:col-span-5 flex flex-col gap-3 sm:gap-3.5 w-full">
            {benefits.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-3.5 sm:gap-4 px-5 sm:px-6 py-3.5 sm:py-4 rounded-2xl sm:rounded-full border transition-all duration-200 hover:-translate-y-0.5 ${
                  isLight
                    ? 'bg-white/90 hover:bg-white border-gray-200/90 hover:border-sky-300 text-gray-900 shadow-[0_2px_12px_rgba(0,0,0,0.03)]'
                    : 'bg-white/[0.04] hover:bg-white/[0.07] border-white/10 hover:border-[#3BA8D8]/40 text-white shadow-[0_2px_15px_rgba(0,0,0,0.2)]'
                }`}
              >
                {item.icon}
                <span className="text-sm sm:text-base font-semibold tracking-normal">
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewFansOnly;
