import React from 'react';
import { MessageCircle, Moon, Lock } from 'lucide-react';

const InsideChatSection = ({ theme = 'dark' }) => {
  const isLight = theme === 'light';

  return (
    <section className="w-full my-12 sm:my-16 md:my-20">
      {/* Section Header: Title on Left, Subtext on Right */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 sm:mb-12">
        <div className="max-w-2xl">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#FF5E62] mb-2 sm:mb-3">
            INSIDE A CHAT
          </p>

          <h2
            className={`text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-extrabold tracking-tight leading-[1.08] ${
              isLight ? 'text-gray-900' : 'text-white'
            }`}
          >
            Everything a comment section can't be.
          </h2>
        </div>

        <p
          className={`text-sm sm:text-base md:text-lg max-w-md leading-relaxed lg:text-right ${
            isLight ? 'text-gray-600' : 'text-gray-400'
          }`}
        >
          One private thread per creator. Text only, no plans, real conversations with real creators.
        </p>
      </div>

      {/* Grid: Featured Card on Left, Right Subgrid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
        {/* Left: Box 1 (Featured / Most Loved - Full Height) */}
        <div className="lg:col-span-7 flex">
          <div
            className={`w-full rounded-[24px] p-5 sm:p-6 lg:p-7 flex flex-col justify-between border transition-all duration-300 hover:-translate-y-1 ${
              isLight
                ? 'bg-gradient-to-br from-purple-50/70 via-white to-sky-50/50 border-purple-200/80 shadow-[0_4px_24px_rgba(147,51,234,0.08)] hover:border-purple-300 hover:shadow-[0_8px_30px_rgba(147,51,234,0.14)]'
                : 'bg-gradient-to-b from-[#1C142E] via-[#141220] to-[#111118] border-purple-900/40 shadow-[0_4px_30px_rgba(139,92,246,0.15)] hover:border-purple-500/50 hover:shadow-[0_8px_35px_rgba(139,92,246,0.25)]'
            }`}
          >
            <div>
              {/* Top Icon */}
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-8 sm:mb-10 shadow-sm">
                <MessageCircle className="w-5 h-5 fill-current" />
              </div>

              {/* Most Loved Pill Badge */}
              <span
                className={`inline-block text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-md mb-6 sm:mb-8 ${
                  isLight
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                }`}
              >
                MOST LOVED
              </span>

              {/* Title */}
              <h3
                className={`text-2xl sm:text-3xl lg:text-[32px] font-bold mb-6 sm:mb-8 tracking-tight leading-snug ${
                  isLight ? 'text-gray-900' : 'text-white'
                }`}
              >
                1-on-1 chat, by the minute
              </h3>

              {/* Description */}
              <p
                className={`text-sm sm:text-base lg:text-[17px] leading-relaxed mb-4 sm:mb-5 ${
                  isLight ? 'text-gray-600' : 'text-gray-300'
                }`}
              >
                A private thread that stays yours. Ask the question you've typed and deleted a hundred times — they reply themselves, verified, no manager, no bot. The meter starts when they join and stops the second the chat ends.
              </p>
            </div>

            {/* Bottom Pills for Box 1 */}
            <div className="flex flex-wrap gap-2.5 sm:gap-3 pt-2">
              <span
                className={`inline-block px-4 py-2 rounded-full text-sm sm:text-base font-semibold border ${
                  isLight
                    ? 'bg-gray-100 text-gray-800 border-gray-200'
                    : 'bg-white/10 text-white/90 border-white/10'
                }`}
              >
                first chat free
              </span>
              <span
                className={`inline-block px-4 py-2 rounded-full text-sm sm:text-base font-semibold border ${
                  isLight
                    ? 'bg-gray-100 text-gray-800 border-gray-200'
                    : 'bg-white/10 text-white/90 border-white/10'
                }`}
              >
                from ₹5/min
              </span>
              <span
                className={`inline-block px-4 py-2 rounded-full text-sm sm:text-base font-semibold border ${
                  isLight
                    ? 'bg-gray-100 text-gray-800 border-gray-200'
                    : 'bg-white/10 text-white/90 border-white/10'
                }`}
              >
                paid from wallet
              </span>
            </div>
          </div>
        </div>

        {/* Right: Subgrid for Box 2 and Box 3 */}
        <div className="lg:col-span-5 flex flex-col gap-4 justify-between">
          {/* Box 2: Message them offline */}
          <div
            className={`flex-1 rounded-[24px] p-5 sm:p-6 flex flex-col justify-between border transition-all duration-300 hover:-translate-y-1 ${
              isLight
                ? 'bg-white border-gray-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:border-[#3BA8D8]/60 hover:shadow-[0_8px_30px_rgba(59,168,216,0.15)]'
                : 'bg-[#13131A] border-[#1E1E28] shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:border-[#3BA8D8]/40 hover:shadow-[0_8px_30px_rgba(59,168,216,0.12)]'
            }`}
          >
            <div>
              {/* Top Icon */}
              <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center mb-3 sm:mb-4 shadow-sm">
                <Moon className="w-5 h-5 fill-current" />
              </div>

              {/* Title */}
              <h3
                className={`text-xl sm:text-2xl font-bold mb-2 sm:mb-3 tracking-tight ${
                  isLight ? 'text-gray-900' : 'text-white'
                }`}
              >
                Message them offline
              </h3>

              {/* Description */}
              <p
                className={`text-sm sm:text-base leading-relaxed mb-3 sm:mb-4 max-w-xl ${
                  isLight ? 'text-gray-600' : 'text-gray-400'
                }`}
              >
                Creator's not on? Send it anyway. It waits in their inbox and you’re pinged the moment they reply.
              </p>
            </div>

            {/* Bottom Pill */}
            <div className="pt-2">
              <span
                className={`inline-block px-4 py-2 rounded-full text-sm sm:text-base font-semibold border ${
                  isLight
                    ? 'bg-pink-50 text-pink-700 border-pink-200'
                    : 'bg-[#2A1525] text-[#FF85A2] border-[#4A2038]'
                }`}
              >
                Ask me Anything
              </span>
            </div>
          </div>

          {/* Box 3: Private forever */}
          <div
            className={`flex-1 rounded-[24px] p-5 sm:p-6 flex flex-col justify-between border transition-all duration-300 hover:-translate-y-1 ${
              isLight
                ? 'bg-white border-gray-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:border-[#3BA8D8]/60 hover:shadow-[0_8px_30px_rgba(59,168,216,0.15)]'
                : 'bg-[#13131A] border-[#1E1E28] shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:border-[#3BA8D8]/40 hover:shadow-[0_8px_30px_rgba(59,168,216,0.12)]'
            }`}
          >
            <div>
              {/* Top Icon */}
              <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center mb-3 sm:mb-4 shadow-sm">
                <Lock className="w-5 h-5" />
              </div>

              {/* Title */}
              <h3
                className={`text-xl sm:text-2xl font-bold mb-2 sm:mb-3 tracking-tight ${
                  isLight ? 'text-gray-900' : 'text-white'
                }`}
              >
                Private forever
              </h3>

              {/* Description */}
              <p
                className={`text-sm sm:text-base leading-relaxed mb-3 sm:mb-4 max-w-xl ${
                  isLight ? 'text-gray-600' : 'text-gray-400'
                }`}
              >
                Your conversations with creators stay private and secure.
              </p>
            </div>

            {/* Bottom Pill */}
            <div className="pt-2">
              <span
                className={`inline-block px-4 py-2 rounded-full text-sm sm:text-base font-semibold border ${
                  isLight
                    ? 'bg-pink-50 text-pink-700 border-pink-200'
                    : 'bg-[#2A1525] text-[#FF85A2] border-[#4A2038]'
                }`}
              >
                1-on-1 only
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InsideChatSection;
