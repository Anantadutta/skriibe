import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HowItWorksSection from '../components/HowItWorksSection';
import InsideChatSection from '../components/InsideChatSection';

const HowItWorksPage = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    if (theme === 'light') {
      document.body.classList.add('light');
      document.documentElement.classList.add('light');
    } else {
      document.body.classList.remove('light');
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isLight = theme === 'light';

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isLight ? 'bg-white text-black' : 'bg-black text-white'
      } flex flex-col`}
    >
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <main className="flex-grow w-full px-4 sm:px-6 md:px-12 py-8 sm:py-12 max-w-7xl mx-auto flex flex-col">
        {/* Back Navigation Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className={`inline-flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer ${
              isLight ? 'text-gray-600 hover:text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Page Hero Header */}
        <div className="max-w-3xl mb-4 sm:mb-8">
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs sm:text-sm font-semibold mb-4 ${
              isLight
                ? 'bg-sky-50 border-[#3BA8D8] text-[#0284c7]'
                : 'bg-[#08131e] border-[#3BA8D8] text-[#3BA8D8] shadow-[0_0_15px_rgba(59,168,216,0.2)]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>How Skriibe Works</span>
          </div>

          <h1
            className={`text-4xl sm:text-6xl md:text-7xl font-normal uppercase tracking-tight leading-[0.92] ${
              isLight ? 'text-black' : 'text-white'
            }`}
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Direct 1-on-1 Access.<br />
            Zero Subscription Hassle.
          </h1>

          <p
            className={`text-base sm:text-lg md:text-xl mt-4 leading-relaxed ${
              isLight ? 'text-gray-600' : 'text-gray-300'
            }`}
          >
            Connect directly with your favourite creators. No DMs left on unread, no expensive long-term plans — just pay-per-minute private conversations.
          </p>
        </div>

        {/* The 3 Steps Component */}
        <HowItWorksSection theme={theme} />

        {/* Inside A Chat Feature Breakdown */}
        <InsideChatSection theme={theme} />

        {/* Bottom Call to Action */}
        <div
          className={`w-full rounded-3xl p-8 sm:p-12 my-8 sm:my-12 text-center border transition-all ${
            isLight
              ? 'bg-gradient-to-br from-sky-50 via-white to-sky-100/50 border-sky-200 shadow-sm'
              : 'bg-gradient-to-br from-[#0c1622] via-[#0f141d] to-[#0a0d13] border-[#3BA8D8]/20 shadow-[0_8px_40px_rgba(59,168,216,0.15)]'
          }`}
        >
          <h3
            className={`text-3xl sm:text-5xl font-normal uppercase tracking-tight ${
              isLight ? 'text-black' : 'text-white'
            }`}
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Ready to start chatting?
          </h3>
          <p
            className={`text-sm sm:text-base max-w-xl mx-auto mt-3 mb-6 ${
              isLight ? 'text-gray-600' : 'text-gray-300'
            }`}
          >
            Your first 2 minutes with any creator are on us — no credit card needed.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm sm:text-base bg-[#3BA8D8] text-black hover:bg-[#3298c4] transition-all shadow-[0_0_18px_rgba(59,168,216,0.35)]"
            >
              Start Free Chat
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/creator/signup"
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm sm:text-base border transition-all ${
                isLight
                  ? 'border-gray-300 text-gray-800 hover:border-black bg-white'
                  : 'border-white/20 text-white hover:border-white bg-white/5'
              }`}
            >
              Join as a creator
            </Link>
          </div>
        </div>
      </main>

      <Footer theme={theme} />
    </div>
  );
};

export default HowItWorksPage;
