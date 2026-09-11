import React from 'react';
import { Search, Zap, Wallet } from 'lucide-react';

const HowItWorksSection = ({ theme = 'dark' }) => {
  const isLight = theme === 'light';

  const steps = [
    {
      num: 1,
      icon: <Search className="w-4 h-4 sm:w-5 sm:h-5" />,
      iconBg: 'bg-[#3BA8D8]/10 text-[#3BA8D8] border-[#3BA8D8]/20',
      title: 'Find someone you already follow',
      description:
        'Search a handle or browse the creators. Every profile shows their live chat rate , wait time & no card needed for free minutes'
    },
    {
      num: 2,
      icon: <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />,
      iconBg: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
      title: 'Start the chat — online or not',
      description:
        "If they're on, you're texting in about 8 seconds. If they're off, send it anyway: It waits in their inbox and they reply once they're back."
    },
    {
      num: 3,
      icon: <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />,
      iconBg: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
      title: 'Pay only for minutes you use',
      description:
        "Recharge your wallet. The meter runs while you're chatting and stops the second you leave — no plans, no auto-renew."
    }
  ];

  return (
    <section className="w-full my-12 sm:my-16 md:my-20">
      {/* Section Header */}
      <div className="max-w-3xl mb-10 sm:mb-12">
        <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#FF5E62] mb-2 sm:mb-3">
          HOW IT WORKS
        </p>

        <h2
          className={`text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-extrabold tracking-tight leading-[1.08] ${
            isLight ? 'text-gray-900' : 'text-white'
          }`}
        >
          Three taps. No DMs left on read.
        </h2>

        <p
          className={`text-sm sm:text-base md:text-lg mt-3 sm:mt-4 leading-relaxed ${
            isLight ? 'text-gray-600' : 'text-gray-400'
          }`}
        >
          Your first chat with a creator is free, so you can vibe-check before a single minute leaves your wallet.
        </p>
      </div>

      {/* 3 Step Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-7">
        {steps.map((step) => (
          <div
            key={step.num}
            className={`rounded-[24px] p-6 sm:p-7 md:p-8 flex flex-col justify-between border transition-all duration-300 hover:-translate-y-1 ${
              isLight
                ? 'bg-white border-gray-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:border-[#3BA8D8]/60 hover:shadow-[0_8px_30px_rgba(59,168,216,0.15)]'
                : 'bg-[#13131A] border-[#1E1E28] shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:border-[#3BA8D8]/40 hover:shadow-[0_8px_30px_rgba(59,168,216,0.12)]'
            }`}
          >
            <div>
              {/* Badge & Icon Row */}
              <div className="flex items-center gap-2.5 mb-6">
                {/* Number Badge */}
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-[#FF5E62] to-[#FF9966] text-white font-black text-sm sm:text-base flex items-center justify-center shadow-md shadow-orange-500/25">
                  {step.num}
                </div>

                {/* Accompanying Icon */}
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center ${step.iconBg}`}
                >
                  {step.icon}
                </div>
              </div>

              {/* Title */}
              <h3
                className={`text-lg sm:text-xl font-bold mb-3 tracking-tight ${
                  isLight ? 'text-gray-900' : 'text-white'
                }`}
              >
                {step.title}
              </h3>

              {/* Description */}
              <p
                className={`text-xs sm:text-sm md:text-[14.5px] leading-relaxed ${
                  isLight ? 'text-gray-600' : 'text-gray-400'
                }`}
              >
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorksSection;
