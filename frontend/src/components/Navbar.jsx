import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { io } from 'socket.io-client';
import { getLiveCreators } from '../services/discoveryApi';
import { checkIfLiveNow } from '../utils/timeUtils';

const Navbar = ({ theme, toggleTheme, showBanner = true }) => {
  const [liveCount, setLiveCount] = useState(0);
  const [loadingLive, setLoadingLive] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Helper to determine if a creator is currently live at the current viewing time
  const isCreatorLiveNow = (creator) => {
    if (!creator || creator.isPaused) return false;
    if (creator.isLive === true) return true;
    return checkIfLiveNow(creator.liveChatTimeSlots);
  };

  useEffect(() => {
    let isMounted = true;
    let creatorCache = [];

    const recalculateCount = (list) => {
      if (!isMounted) return;
      const count = list.filter(isCreatorLiveNow).length;
      setLiveCount(count);
    };

    const fetchCreators = async () => {
      try {
        const data = await getLiveCreators();
        if (data && data.success && Array.isArray(data.creators)) {
          creatorCache = data.creators;
          recalculateCount(creatorCache);
        }
      } catch (err) {
        console.error('Navbar failed to fetch live creators:', err);
      } finally {
        if (isMounted) {
          setLoadingLive(false);
        }
      }
    };

    fetchCreators();

    // Listen to real-time socket updates when a creator's status changes
    const socketUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api', '') 
      : 'http://localhost:5000';
    const socket = io(socketUrl);

    socket.on('creator-status-changed', ({ creatorId, isLive }) => {
      creatorCache = creatorCache.map((c) =>
        c.id === creatorId || c._id === creatorId ? { ...c, isLive } : c
      );
      recalculateCount(creatorCache);
    });

    // Automatically recalculate based on scheduled time-slots every 30 seconds
    const interval = setInterval(() => {
      recalculateCount(creatorCache);
    }, 30000);

    return () => {
      isMounted = false;
      socket.disconnect();
      clearInterval(interval);
    };
  }, []);

  const handleScroll = (id) => (e) => {
    const targetId = id === 'creators' && !document.getElementById('creators') ? 'whos-online' : id;
    const el = document.getElementById(targetId);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLiveClick = (e) => {
    const el = document.getElementById('whos-online') || document.getElementById('creators');
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 transition-colors">
      {/* Top Announcement Banner */}
      {showBanner && (
        <div
          className="w-full py-2.5 px-4 text-center border-b border-black/10 transition-all flex items-center justify-center gap-2.5 text-xs sm:text-sm font-medium text-white shadow-sm select-none"
          style={{
            background: 'linear-gradient(90deg, #ff5e36 0%, #ea2a6f 35%, #b427b0 70%, #7522bf 100%)'
          }}
        >
          <span className="inline-flex items-center justify-center px-2 py-0.5 text-[10px] sm:text-[11px] font-bold rounded-full uppercase tracking-wider bg-black/25 text-white backdrop-blur-sm shadow-sm">
            NEW
          </span>
          <span className="tracking-normal font-medium drop-shadow-sm">
            First chat free with any creator are on us — no card needed
          </span>
        </div>
      )}

      {/* Main Navbar */}
      <nav
        className={`flex items-center justify-between px-4 sm:px-6 md:px-12 py-3.5 border-b backdrop-blur-md transition-colors ${
          theme === 'light'
            ? 'bg-white/90 text-black border-gray-200'
            : 'bg-black/90 text-white border-white/10'
        }`}
      >
        {/* Left: Skriibe Logo */}
        <div className="flex items-center shrink-0">
          <a href="/" className="flex items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 2800 520.97" 
              className={`h-7 sm:h-8 w-auto transition-colors ${theme === 'light' ? 'text-black' : 'text-white'}`}
            >
              <text 
                transform="translate(33.52 457.72)" 
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

        {/* Right: Nav items, CTAs, and theme toggle */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8 text-base lg:text-lg font-semibold">
            <Link
              to="/how-it-works"
              className={`transition-colors ${
                theme === 'light'
                  ? 'text-gray-600 hover:text-black hover:text-[#3BA8D8]'
                  : 'text-gray-300 hover:text-white hover:text-[#3BA8D8]'
              }`}
            >
              How it works
            </Link>
            <Link
              to="/fan/login"
              className={`transition-colors ${
                theme === 'light'
                  ? 'text-gray-600 hover:text-black hover:text-[#3BA8D8]'
                  : 'text-gray-300 hover:text-white hover:text-[#3BA8D8]'
              }`}
            >
              Login
            </Link>
            <Link
              to="/faqs"
              className={`transition-colors ${
                theme === 'light'
                  ? 'text-gray-600 hover:text-black hover:text-[#3BA8D8]'
                  : 'text-gray-300 hover:text-white hover:text-[#3BA8D8]'
              }`}
            >
              FAQs
            </Link>
            <Link
              to="/affiliate"
              className={`transition-colors ${
                theme === 'light'
                  ? 'text-gray-600 hover:text-black hover:text-[#3BA8D8]'
                  : 'text-gray-300 hover:text-white hover:text-[#3BA8D8]'
              }`}
            >
              Affiliate
            </Link>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden lg:flex items-center gap-2 sm:gap-3">
            {/* LIVE Badge / Option */}
            <Link
              to="/#whos-online"
              onClick={handleLiveClick}
              className={`text-xs sm:text-sm font-bold px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full border flex items-center gap-1.5 sm:gap-2 transition-all whitespace-nowrap select-none cursor-pointer ${
                theme === 'light'
                  ? 'border-emerald-500/70 bg-emerald-50/90 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-600 shadow-sm'
                  : 'border-emerald-500/60 bg-black/80 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.25)]'
              }`}
              title="Browse live creators"
            >
              <span className="relative flex h-2 sm:h-2.5 w-2 sm:w-2.5 shrink-0">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    theme === 'light' ? 'bg-emerald-500' : 'bg-emerald-400'
                  }`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-2 sm:h-2.5 w-2 sm:w-2.5 ${
                    theme === 'light'
                      ? 'bg-emerald-600'
                      : 'bg-emerald-500 shadow-[0_0_8px_#10B981]'
                  }`}
                ></span>
              </span>
              <span>{loadingLive ? '... live' : `${liveCount.toLocaleString()} live`}</span>
            </Link>

            <Link
              to="/explore"
              className="text-xs sm:text-sm font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#3BA8D8] text-black hover:bg-[#3298c4] transition-all whitespace-nowrap shadow-[0_0_12px_rgba(59,168,216,0.3)] hover:shadow-[0_0_18px_rgba(59,168,216,0.5)]"
            >
              Start free chat
            </Link>
            <Link
              to="/creator/signup"
              className="text-xs sm:text-sm font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#3BA8D8] text-black hover:bg-[#3298c4] transition-all whitespace-nowrap shadow-[0_0_12px_rgba(59,168,216,0.3)] hover:shadow-[0_0_18px_rgba(59,168,216,0.5)]"
            >
              Join as a creator
            </Link>
          </div>

          {/* Mobile Live Badge */}
          <Link
            to="/#whos-online"
            onClick={handleLiveClick}
            className={`lg:hidden text-xs font-bold px-2.5 py-1.5 rounded-full border flex items-center gap-1.5 transition-all whitespace-nowrap select-none cursor-pointer ${
              theme === 'light'
                ? 'border-emerald-500/70 bg-emerald-50/90 text-emerald-800 shadow-sm'
                : 'border-emerald-500/60 bg-black/80 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
            }`}
            title="Browse live creators"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  theme === 'light' ? 'bg-emerald-500' : 'bg-emerald-400'
                }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  theme === 'light'
                    ? 'bg-emerald-600'
                    : 'bg-emerald-500 shadow-[0_0_8px_#10B981]'
                }`}
              ></span>
            </span>
            <span>{loadingLive ? '... live' : `${liveCount.toLocaleString()} live`}</span>
          </Link>

          {/* Theme Toggle (Visible on all screen sizes) */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-colors shrink-0 ${
              theme === 'light'
                ? 'hover:bg-gray-100 bg-gray-100 text-gray-800'
                : 'hover:bg-white/10 bg-white/5 text-white'
            }`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-[#3BA8D8]" />}
          </button>

          {/* Mobile Hamburger Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className={`lg:hidden p-2 rounded-xl transition-colors shrink-0 border ${
              theme === 'light'
                ? 'bg-gray-100/80 hover:bg-gray-200/80 border-gray-200 text-gray-900'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
            }`}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div
          className={`lg:hidden w-full border-b px-5 py-5 transition-all shadow-2xl ${
            theme === 'light'
              ? 'bg-white/95 backdrop-blur-md border-gray-200 text-black'
              : 'bg-[#0c0c12]/95 backdrop-blur-md border-white/10 text-white'
          }`}
        >
          {/* Navigation Links */}
          <div className="flex flex-col space-y-1 pb-4 border-b border-white/10">
            <Link
              to="/how-it-works"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-lg font-semibold px-3 py-2.5 rounded-xl transition-colors ${
                theme === 'light'
                  ? 'text-gray-800 hover:bg-gray-100'
                  : 'text-gray-200 hover:bg-white/10'
              }`}
            >
              How it works
            </Link>
            <Link
              to="/fan/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-lg font-semibold px-3 py-2.5 rounded-xl transition-colors ${
                theme === 'light'
                  ? 'text-gray-800 hover:bg-gray-100'
                  : 'text-gray-200 hover:bg-white/10'
              }`}
            >
              Login
            </Link>
            <Link
              to="/faqs"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-lg font-semibold px-3 py-2.5 rounded-xl transition-colors ${
                theme === 'light'
                  ? 'text-gray-800 hover:bg-gray-100'
                : 'text-gray-200 hover:bg-white/10'
              }`}
            >
              FAQs
            </Link>
            <Link
              to="/affiliate"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-lg font-semibold px-3 py-2.5 rounded-xl transition-colors ${
                theme === 'light'
                  ? 'text-gray-800 hover:bg-gray-100'
                  : 'text-gray-200 hover:bg-white/10'
              }`}
            >
              Affiliate
            </Link>
            <Link
              to="/#whos-online"
              onClick={(e) => {
                handleLiveClick(e);
                setIsMobileMenuOpen(false);
              }}
              className={`text-base font-medium px-3 py-2.5 rounded-xl flex items-center justify-between transition-colors ${
                theme === 'light'
                  ? 'text-emerald-700 hover:bg-emerald-50'
                  : 'text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              <span>Who's Online</span>
              <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {loadingLive ? '... live' : `${liveCount.toLocaleString()} live`}
              </span>
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4">
            <Link
              to="/explore"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-3 px-4 rounded-full bg-[#3BA8D8] text-black font-bold text-center text-sm hover:bg-[#3298c4] transition-all shadow-[0_0_12px_rgba(59,168,216,0.3)]"
            >
              Start free chat
            </Link>
            <Link
              to="/creator/signup"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-3 px-4 rounded-full bg-[#3BA8D8] text-black font-bold text-center text-sm hover:bg-[#3298c4] transition-all shadow-[0_0_12px_rgba(59,168,216,0.3)]"
            >
              Join as a creator
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;