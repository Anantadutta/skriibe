import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { createSocket } from '../utils/socket';
import { getLiveCreators } from '../services/discoveryApi';
import { getFanMe } from '../services/fanApi';
import { checkIfLiveNow } from '../utils/timeUtils';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ theme, toggleTheme, showBanner = true }) => {
  const [liveCount, setLiveCount] = useState(0);
  const [loadingLive, setLoadingLive] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, roles, clearAuthData } = useAuth();

  const [fanName, setFanName] = useState(() => localStorage.getItem('cachedFanName') || 'Fan');
  const [fanAvatar, setFanAvatar] = useState(() => localStorage.getItem('skriibe_fan_avatar') || null);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isAuthenticated || !roles?.includes('fan')) return;

    const fetchFanProfile = async () => {
      try {
        const res = await getFanMe();
        if (res.success && res.fan) {
          localStorage.setItem('isReturningFan', 'true');
          if (res.fan.name) {
            const firstName = res.fan.name.split(' ')[0];
            setFanName(firstName);
            localStorage.setItem('cachedFanName', firstName);
          } else {
            setFanName('Fan');
            localStorage.setItem('cachedFanName', 'Fan');
          }
          if (res.fan.avatarUrl) {
            setFanAvatar(res.fan.avatarUrl);
            localStorage.setItem('skriibe_fan_avatar', res.fan.avatarUrl);
          } else {
            setFanAvatar(null);
            localStorage.removeItem('skriibe_fan_avatar');
          }
        }
      } catch (err) {
        console.error('Failed to fetch fan profile in navbar', err);
      }
    };
    fetchFanProfile();

    const handleProfileUpdate = (e) => {
      const updatedName = e?.detail?.name || localStorage.getItem('cachedFanName') || 'Fan';
      const firstName = updatedName.split(' ')[0];
      setFanName(firstName);
      const updatedAvatar = e?.detail?.avatarUrl || localStorage.getItem('skriibe_fan_avatar');
      if (updatedAvatar) setFanAvatar(updatedAvatar);
    };

    window.addEventListener('fanProfileUpdated', handleProfileUpdate);
    window.addEventListener('storage', handleProfileUpdate);
    return () => {
      window.removeEventListener('fanProfileUpdated', handleProfileUpdate);
      window.removeEventListener('storage', handleProfileUpdate);
    };
  }, [isAuthenticated, roles]);

  const dropdownRef = React.useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
    const socket = createSocket();

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

  const isReturningCreator = localStorage.getItem('isReturningCreator') === 'true';
  const isReturningFan = localStorage.getItem('isReturningFan') === 'true';

  return (
    <header className="sticky top-0 z-50 w-full transition-colors">
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
          <Link to={location.pathname.startsWith('/creator') ? "/creator/dashboard" : "/"} className="flex items-center">
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
          </Link>
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
              target="_blank"
              rel="noopener noreferrer"
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

            {!isAuthenticated || !roles?.includes('fan') ? (
              <>
                {isReturningFan ? (
                  <Link
                    to="/fan/login"
                    className="text-xs sm:text-sm font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#3BA8D8] text-black hover:bg-[#3298c4] transition-all whitespace-nowrap shadow-[0_0_12px_rgba(59,168,216,0.3)] hover:shadow-[0_0_18px_rgba(59,168,216,0.5)]"
                  >
                    Login
                  </Link>
                ) : (
                  <Link
                    to="/explore"
                    className="text-xs sm:text-sm font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#3BA8D8] text-black hover:bg-[#3298c4] transition-all whitespace-nowrap shadow-[0_0_12px_rgba(59,168,216,0.3)] hover:shadow-[0_0_18px_rgba(59,168,216,0.5)]"
                  >
                    Start free chat
                  </Link>
                )}
                {!isReturningCreator && !isReturningFan && (
                  <Link
                    to="/creator/signup"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#3BA8D8] text-black hover:bg-[#3298c4] transition-all whitespace-nowrap shadow-[0_0_12px_rgba(59,168,216,0.3)] hover:shadow-[0_0_18px_rgba(59,168,216,0.5)]"
                  >
                    Join as a creator
                  </Link>
                )}
              </>
            ) : (
              <>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className={`p-2 sm:px-3 sm:py-2 rounded-full transition-all flex items-center justify-center border gap-2 ${
                      theme === 'light'
                        ? 'border-gray-200 hover:bg-gray-100 text-gray-700'
                        : 'border-white/10 hover:bg-white/10 text-gray-200'
                    }`}
                    title="Fan Menu"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xs overflow-hidden shrink-0">
                      {fanAvatar ? <img src={fanAvatar} alt={fanName} className="w-full h-full object-cover" /> : (fanName || 'F').charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-sm hidden sm:block max-w-[80px] truncate">{fanName}</span>
                  </button>
                  {isProfileDropdownOpen && (
                    <div className={`absolute right-0 mt-2 w-48 rounded-xl shadow-lg border overflow-hidden z-50 ${
                      theme === 'light'
                        ? 'bg-white border-gray-200 text-gray-800'
                        : 'bg-[#12121a] border-white/10 text-gray-200'
                    }`}>
                      <div className="flex flex-col py-1">
                        <Link to="/discovery" className={`px-4 py-2 text-sm font-semibold transition-colors ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`}>
                          Home
                        </Link>
                        <Link to="/fan/history" className={`px-4 py-2 text-sm font-semibold transition-colors ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`}>
                          Inbox
                        </Link>
                        <Link to="/fan/wallet" className={`px-4 py-2 text-sm font-semibold transition-colors ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`}>
                          Wallet
                        </Link>
                        <Link to="/fan/profile" className={`px-4 py-2 text-sm font-semibold transition-colors ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`}>
                          Settings
                        </Link>
                        <button onClick={() => { clearAuthData('fan'); window.location.href = '/'; }} className={`w-full text-left px-4 py-2 text-sm font-semibold text-red-500 transition-colors ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`}>
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
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
              target="_blank"
              rel="noopener noreferrer"
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
            {!isAuthenticated || !roles?.includes('fan') ? (
              <>
                {isReturningFan ? (
                  <Link
                    to="/fan/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-3 px-4 rounded-full bg-[#3BA8D8] text-black font-bold text-center text-sm hover:bg-[#3298c4] transition-all shadow-[0_0_12px_rgba(59,168,216,0.3)]"
                  >
                    Login
                  </Link>
                ) : (
                  <Link
                    to="/explore"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-3 px-4 rounded-full bg-[#3BA8D8] text-black font-bold text-center text-sm hover:bg-[#3298c4] transition-all shadow-[0_0_12px_rgba(59,168,216,0.3)]"
                  >
                    Start free chat
                  </Link>
                )}
                {!isReturningCreator && !isReturningFan && (
                  <Link
                    to="/creator/signup"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-full bg-[#3BA8D8] text-black font-bold text-center text-sm hover:bg-[#3298c4] transition-all shadow-[0_0_12px_rgba(59,168,216,0.3)]"
                  >
                    Join as a creator
                  </Link>
                )}
              </>
            ) : (
              <>
                <div className={`w-full rounded-2xl overflow-hidden border ${theme === 'light' ? 'border-gray-200 bg-gray-50' : 'border-white/10 bg-white/5'}`}>
                  <div className="w-full py-3 px-4 font-bold text-center text-sm flex items-center justify-center gap-2 text-gray-400 uppercase tracking-wider text-xs">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-[10px] overflow-hidden shrink-0">
                      {fanAvatar ? <img src={fanAvatar} alt={fanName} className="w-full h-full object-cover" /> : (fanName || 'F').charAt(0).toUpperCase()}
                    </div>
                    {fanName}
                  </div>
                  <div className={`h-px w-full ${theme === 'light' ? 'bg-gray-200' : 'bg-white/10'}`}></div>
                  <Link
                    to="/discovery"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block w-full py-3 px-4 font-bold text-center text-sm transition-colors ${theme === 'light' ? 'hover:bg-gray-100 text-gray-800' : 'hover:bg-white/5 text-gray-200'}`}
                  >
                    Home
                  </Link>
                  <Link
                    to="/fan/history"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block w-full py-3 px-4 font-bold text-center text-sm transition-colors ${theme === 'light' ? 'hover:bg-gray-100 text-gray-800' : 'hover:bg-white/5 text-gray-200'}`}
                  >
                    Inbox
                  </Link>
                  <Link
                    to="/fan/wallet"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block w-full py-3 px-4 font-bold text-center text-sm transition-colors ${theme === 'light' ? 'hover:bg-gray-100 text-gray-800' : 'hover:bg-white/5 text-gray-200'}`}
                  >
                    Wallet
                  </Link>
                  <Link
                    to="/fan/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block w-full py-3 px-4 font-bold text-center text-sm transition-colors ${theme === 'light' ? 'hover:bg-gray-100 text-gray-800' : 'hover:bg-white/5 text-gray-200'}`}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => { clearAuthData('fan'); window.location.href = '/'; }}
                    className={`block w-full py-3 px-4 font-bold text-center text-sm text-red-500 transition-colors ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/5'}`}
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;