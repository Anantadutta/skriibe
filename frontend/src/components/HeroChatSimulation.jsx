import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HeroChatSimulation = ({ theme = 'dark' }) => {
  const isLight = theme === 'light';

  // 120 seconds = 2 minutes
  const [timeLeft, setTimeLeft] = useState(120);
  const [step, setStep] = useState(0);
  const [typingSide, setTypingSide] = useState('creator'); // 'creator' | 'buyer'
  const [resetKey, setResetKey] = useState(0);
  const [isResetting, setIsResetting] = useState(false);
  const chatScrollRef = useRef(null);

  // Auto scroll to bottom of chat whenever step or typing changes
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [step, typingSide]);

  // Handle countdown timer (2 minutes, counting down to 00:00, then restarting)
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time is up! Trigger smooth reset back to 2 minutes
          handleTimerEnd();
          return 120;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [resetKey]);

  const handleTimerEnd = () => {
    setIsResetting(true);
    setTimeout(() => {
      setIsResetting(false);
      setResetKey((k) => k + 1);
    }, 900);
  };

  const manualRestart = () => {
    setTimeLeft(120);
    setIsResetting(true);
    setTimeout(() => {
      setIsResetting(false);
      setResetKey((k) => k + 1);
    }, 300);
  };

  // Step sequence with 2-second gaps and typing indicators on respective sides:
  // t = 0.0s: step 0 -> Tiny.crafts is typing... on left
  // t = 2.0s: step 1 -> Message 1 pops in, Ishita (buyer) is typing... on right
  // t = 4.0s: step 2 -> Message 2 pops in, Tiny.crafts is typing... on left
  // t = 6.0s: step 3 -> Message 3 pops in, Ishita is typing... on right
  // t = 8.0s: step 4 -> Message 4 pops in, typing finishes
  useEffect(() => {
    setStep(0);
    setTypingSide('creator');
    const timeouts = [];

    // After 2.0s: Message 1 pops; Ishita is typing on right side
    timeouts.push(
      setTimeout(() => {
        setStep(1);
        setTypingSide('buyer');
      }, 2000)
    );

    // After 4.0s (2.0s gap): Message 2 pops; Tiny.crafts is typing on left side
    timeouts.push(
      setTimeout(() => {
        setStep(2);
        setTypingSide('creator');
      }, 4000)
    );

    // After 6.0s (2.0s gap): Message 3 pops; Ishita is typing on right side
    timeouts.push(
      setTimeout(() => {
        setStep(3);
        setTypingSide('buyer');
      }, 6000)
    );

    // After 8.0s (2.0s gap): Message 4 pops; Ishita finishes typing
    timeouts.push(
      setTimeout(() => {
        setStep(4);
        setTypingSide(null);
      }, 8000)
    );

    return () => {
      timeouts.forEach((t) => clearTimeout(t));
    };
  }, [resetKey]);

  // Format seconds into MM:SS
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="relative flex flex-col items-center select-none py-2">
      {/* Inline styles to completely hide any scrollbars inside the phone */}
      <style>{`
        .phone-chat-scroll {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        .phone-chat-scroll::-webkit-scrollbar {
          display: none !important;
          width: 0px !important;
          height: 0px !important;
        }
      `}</style>

      {/* Ambient decorative glow behind phone */}
      <div
        className="absolute -inset-4 sm:-inset-6 rounded-[50px] opacity-45 pointer-events-none blur-3xl transition-opacity duration-700"
        style={{
          background: isLight
            ? 'radial-gradient(circle at 50% 40%, rgba(59,168,216,0.3), rgba(236,72,153,0.15), transparent 70%)'
            : 'radial-gradient(circle at 50% 40%, rgba(59,168,216,0.35), rgba(168,85,247,0.22), transparent 70%)',
        }}
      />

      {/* Floating Motion Wrapper */}
      <motion.div
        animate={{
          y: [-7, 7, -7],
        }}
        transition={{
          duration: 5.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative z-10"
      >
        {/* Outer Phone Mockup Chassis */}
        <div
          className={`relative w-[310px] xs:w-[335px] sm:w-[355px] md:w-[365px] h-[590px] sm:h-[625px] rounded-[44px] p-2.5 sm:p-3 transition-all duration-300 ${
            isLight
              ? 'bg-[#181822] border-[4px] border-[#2c2c3a] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3),0_0_35px_rgba(59,168,216,0.2)] ring-1 ring-black/10'
              : 'bg-[#13131b] border-[4px] border-[#292938] shadow-[0_25px_65px_-15px_rgba(0,0,0,0.95),0_0_35px_rgba(59,168,216,0.2)] ring-1 ring-white/10'
          }`}
        >
          {/* Subtle phone frame side reflections / buttons */}
          <div className="absolute -left-[5px] top-24 w-[3px] h-9 bg-neutral-600 rounded-l-sm" />
          <div className="absolute -left-[5px] top-36 w-[3px] h-9 bg-neutral-600 rounded-l-sm" />
          <div className="absolute -right-[5px] top-28 w-[3px] h-14 bg-neutral-600 rounded-r-sm" />

          {/* Inner Phone Screen */}
          <div className="w-full h-full rounded-[34px] bg-[#0d0c14] text-white flex flex-col overflow-hidden relative border border-white/10 shadow-inner">
            
            {/* Top Dynamic Island / Notch */}
            <div className="w-full pt-1.5 pb-0.5 flex justify-center items-center shrink-0 z-30">
              <div className="w-24 h-4 bg-black rounded-full flex items-center justify-end px-2 gap-1.5 shadow-sm border border-white/5">
                <div className="w-2 h-2 rounded-full bg-[#171725] border border-white/10" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#1b2b48]" />
              </div>
            </div>

            {/* Chat Header: Tiny.crafts */}
            <div className="px-3.5 py-2 flex items-center justify-between border-b border-white/5 bg-[#12111b]/90 backdrop-blur-md z-20 shrink-0">
              <div className="flex items-center gap-2.5">
                {/* Back Chevron */}
                <button
                  type="button"
                  onClick={manualRestart}
                  title="Restart demo"
                  className="text-white/60 hover:text-white transition-colors p-0.5"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>

                {/* Avatar with Gradient (Initial 'T') */}
                <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-[#f97316] via-[#ec4899] to-[#8b5cf6] p-[1.5px] shrink-0 shadow-sm">
                  <div className="w-full h-full rounded-full bg-[#14131d] flex items-center justify-center text-white font-extrabold text-xs">
                    T
                  </div>
                  {/* Small online badge dot */}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0d0c14]" />
                </div>

                {/* Name & Status */}
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1 leading-tight">
                    <span className="font-bold text-[13px] text-white tracking-tight">
                      Tiny.crafts
                    </span>
                    {/* Blue Verified Badge */}
                    <div className="w-3.5 h-3.5 rounded-full bg-[#0095f6] flex items-center justify-center shrink-0">
                      <svg className="w-2.5 h-2.5 text-white stroke-[3.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10.5px] leading-tight text-emerald-400 font-medium">
                    <span>Online · ₹29/min</span>
                  </div>
                </div>
              </div>

              {/* Chat Info Action */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={manualRestart}
                  title="Replay chat simulation"
                  className="px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/15 text-white/70 text-[10.5px] font-medium border border-white/10 transition-all flex items-center gap-1 active:scale-95"
                >
                  <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.19" />
                  </svg>
                  <span>Info</span>
                </button>
              </div>
            </div>

            {/* Sub-bar: Free Trial Countdown Timer & Wallet */}
            <div
              className={`px-3.5 py-1.5 flex items-center justify-between border-b border-white/5 z-20 shrink-0 transition-colors duration-300 ${
                timeLeft <= 15
                  ? 'bg-rose-950/60 text-rose-300'
                  : 'bg-[#1a0f16]/90 text-rose-200/90'
              }`}
            >
              {/* Timer Left */}
              <div className="flex items-center gap-1.5 text-[11px] font-medium">
                <span className="text-white/60">Free trial ·</span>
                <motion.span
                  key={timeLeft}
                  initial={{ scale: 1.05 }}
                  animate={{ scale: 1 }}
                  className={`font-bold font-mono tracking-wide ${
                    timeLeft <= 15 ? 'text-rose-400 animate-pulse' : 'text-rose-200'
                  }`}
                >
                  {formatTime(timeLeft)} left
                </motion.span>
              </div>

              {/* Wallet Right */}
              <div className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/90 text-[10.5px] font-semibold flex items-center gap-1 border border-white/5">
                <span>Wallet ₹240</span>
              </div>
            </div>

            {/* Chat Area with Messages Appearing with 0.5s gaps */}
            <div
              ref={chatScrollRef}
              className="phone-chat-scroll flex-1 px-3.5 py-3 flex flex-col gap-3 overflow-y-auto scroll-smooth"
              style={{
                backgroundImage: 'radial-gradient(circle at 50% 20%, rgba(255,255,255,0.02) 0%, transparent 60%)',
              }}
            >
              {/* Connected Timestamp Divider */}
              <div className="w-full flex justify-center my-1">
                <span className="text-[9.5px] uppercase tracking-widest text-white/35 font-semibold">
                  CONNECTED 2 MIN AGO
                </span>
              </div>

              {/* Message 1 (Screenshot 2: from Tiny.crafts) */}
              <AnimatePresence>
                {step >= 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                    className="flex flex-col items-start max-w-[85%] self-start"
                  >
                    <div className="bg-[#191924] text-white/95 rounded-2xl rounded-tl-xs px-3.5 py-2.5 text-[12.5px] leading-relaxed border border-white/5 shadow-sm">
                      omg hiii 🫶 saw you&apos;ve been on my lives since March. what do you wanna know?
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Message 2 (Screenshot 3: from Buyer / Ishita - Gradient Bubble on Right) */}
              <AnimatePresence>
                {step >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                    className="flex flex-col items-end max-w-[85%] self-end ml-auto"
                  >
                    <div className="bg-gradient-to-r from-[#ff6842] via-[#ea3c7d] to-[#b023ff] text-white rounded-2xl rounded-tr-xs px-3.5 py-2.5 text-[12.5px] leading-relaxed shadow-md font-normal">
                      how do you come up with such cute edits 😭 teach me !!
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Message 3 (Screenshot 4: from Tiny.crafts) */}
              <AnimatePresence>
                {step >= 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                    className="flex flex-col items-start max-w-[85%] self-start"
                  >
                    <div className="bg-[#191924] text-white/95 rounded-2xl rounded-tl-xs px-3.5 py-2.5 text-[12.5px] leading-relaxed border border-white/5 shadow-sm">
                      okay so I shoot everything handheld and cut on the beat — sending you the exact preset I use 👇
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Message 4: from Buyer / Ishita - Gradient Bubble on Right */}
              <AnimatePresence>
                {step >= 4 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                    className="flex flex-col items-end max-w-[85%] self-end ml-auto"
                  >
                    <div className="bg-gradient-to-r from-[#ff6842] via-[#ea3c7d] to-[#b023ff] text-white rounded-2xl rounded-tr-xs px-3.5 py-2.5 text-[12.5px] leading-relaxed shadow-md font-normal">
                      Thank You !! ❤️
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Typing Indicators on either side */}
              <AnimatePresence mode="wait">
                {/* When the Buyer / Ishita is typing on the RIGHT side */}
                {typingSide === 'buyer' && (
                  <motion.div
                    key="buyer-typing"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-2 self-end text-xs px-1 py-0.5 ml-auto"
                  >
                    <span className="text-[11px] text-[#ff7a59] font-medium">Ishita is typing...</span>
                    <span className="flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff7a59] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff7a59] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff7a59] animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  </motion.div>
                )}

                {/* When Tiny.crafts is typing on the LEFT side */}
                {typingSide === 'creator' && (
                  <motion.div
                    key="creator-typing"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-2 self-start text-white/60 text-xs px-1 py-0.5"
                  >
                    <span className="flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                    <span className="text-[11px] text-white/45 font-medium">tiny.crafts is typing...</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Reset Overlay notification when timer completes */}
              <AnimatePresence>
                {isResetting && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="mt-2 py-1.5 px-3 rounded-xl bg-[#3BA8D8]/20 border border-[#3BA8D8]/40 text-center"
                  >
                    <span className="text-[11px] font-semibold text-[#3BA8D8]">
                      Free trial cycle restarted (2 mins)
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Input Area */}
            <div className="px-3 py-2.5 bg-[#111019] border-t border-white/5 flex items-center gap-2 shrink-0 z-20">
              {/* Input Capsule */}
              <div className="flex-1 bg-[#1c1b26] rounded-full px-3.5 py-2 text-[12px] text-white/40 border border-white/5 flex items-center justify-between shadow-inner">
                <span>Message Tiny.crafts..</span>
              </div>

              {/* Send Button */}
              <button
                type="button"
                onClick={manualRestart}
                title="Send / Restart"
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#ff6842] to-[#ea3c7d] flex items-center justify-center text-white shadow-[0_2px_10px_rgba(234,60,125,0.4)] hover:scale-105 active:scale-95 transition-transform shrink-0"
              >
                <svg className="w-3.5 h-3.5 translate-x-px" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>

          </div>
        </div>
      </motion.div>

    </div>
  );
};

export default HeroChatSimulation;
