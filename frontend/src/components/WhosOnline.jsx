import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CreatorCard from './discovery/CreatorCard';
import { getLiveCreators } from '../services/discoveryApi';
import { getFanMe } from '../services/fanApi';
import { checkIfLiveNow } from '../utils/timeUtils';
import { normalizeExpertiseList } from '../utils/expertiseConstants';

const CATEGORIES = [
  'All',
  'Fashion',
  'Fitness',
  'Beauty',
  'Gaming',
  'Food',
  'Music',
  'Travel',
  'Tech',
  'Finance',
  'Education',
  'Lifestyle',
  'Comedy',
  'Motivation',
  'Dating'
];

const WhosOnline = ({ theme = 'dark' }) => {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const catScrollRef = useRef(null);
  const [canScrollCatLeft, setCanScrollCatLeft] = useState(false);
  const [canScrollCatRight, setCanScrollCatRight] = useState(false);

  const isCreatorOnline = (c) => {
    if (!c || c.isPaused) return false;
    if (c.isLive === true) return true;
    return checkIfLiveNow(c.liveChatTimeSlots);
  };

  const matchesCategory = (creator, cat) => {
    if (!cat || cat === 'All') return true;
    const catLower = cat.toLowerCase();

    const rawExpertise = Array.isArray(creator.expertise)
      ? creator.expertise
      : (typeof creator.expertise === 'string' ? creator.expertise.split(',') : []);

    const normalized = normalizeExpertiseList(rawExpertise);

    // Direct match against raw strings
    if (rawExpertise.some((e) => e && e.toLowerCase().includes(catLower))) {
      return true;
    }

    // Direct match against normalized strings
    if (normalized.some((e) => e && e.toLowerCase() === catLower)) {
      return true;
    }

    // Handle aliases such as Fashion <-> Lifestyle
    if (catLower === 'fashion') {
      return (
        rawExpertise.some((e) => e && (e.toLowerCase().includes('fashion') || e.toLowerCase().includes('lifestyle'))) ||
        normalized.some((e) => e && (e.toLowerCase() === 'fashion' || e.toLowerCase() === 'lifestyle'))
      );
    }

    if (catLower === 'lifestyle') {
      return (
        rawExpertise.some((e) => e && (e.toLowerCase().includes('lifestyle') || e.toLowerCase().includes('fashion'))) ||
        normalized.some((e) => e && (e.toLowerCase() === 'lifestyle' || e.toLowerCase() === 'fashion'))
      );
    }

    return false;
  };

  const fetchCreators = async () => {
    try {
      const data = await getLiveCreators();
      if (data && data.success && Array.isArray(data.creators)) {
        setCreators(data.creators);
      }
    } catch (err) {
      console.error('Failed to fetch creators in WhosOnline:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreators();

    const fetchFanProfile = async () => {
      try {
        const res = await getFanMe();
        if (res.success && res.fan) {
          setIsFirstTimeUser(!res.fan.hasUsedFreeChat);
        } else {
          setIsFirstTimeUser(true);
        }
      } catch (err) {
        setIsFirstTimeUser(true);
      }
    };
    fetchFanProfile();

    // Real-time socket updates when a creator's live status changes
    const socketUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api', '') 
      : 'http://localhost:5000';
    const socket = io(socketUrl);

    socket.on('creator-status-changed', ({ creatorId, isLive }) => {
      setCreators((prev) =>
        prev.map((c) =>
          c.id === creatorId || c._id === creatorId ? { ...c, isLive } : c
        )
      );
    });

    // Recalculate scheduled time slot availability every 60 seconds
    const interval = setInterval(() => {
      setCreators((prev) => [...prev]);
    }, 60000);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, []);

  const checkCatScroll = () => {
    if (catScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = catScrollRef.current;
      setCanScrollCatLeft(scrollLeft > 5);
      setCanScrollCatRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    checkCatScroll();
    window.addEventListener('resize', checkCatScroll);
    return () => window.removeEventListener('resize', checkCatScroll);
  }, []);

  const handleCatScroll = (direction) => {
    if (catScrollRef.current) {
      const offset = direction === 'left' ? -220 : 220;
      catScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
      setTimeout(checkCatScroll, 250);
    }
  };

  const onlineCreators = creators.filter(isCreatorOnline);
  const filteredCreators = onlineCreators.filter((c) => matchesCategory(c, selectedCategory));
  const displayCreators = filteredCreators.slice(0, 4);
  const isLight = theme === 'light';

  return (
    <section id="whos-online" className="w-full my-8 sm:my-12 scroll-mt-24 relative">
      <div id="creators" className="absolute -top-24 left-0 pointer-events-none" />
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4 mb-2 sm:mb-3">
        <div className="flex items-center gap-3">
          {/* Pulsing Live Dot */}
          <span className="relative flex h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 bg-emerald-500 shadow-[0_0_10px_#10B981]"></span>
          </span>

          <h2
            className={`text-2xl sm:text-3xl md:text-4xl uppercase tracking-wider flex items-center gap-2.5 ${
              isLight ? 'text-gray-900' : 'text-white'
            }`}
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            WHO'S ONLINE
            <span
              className={`text-xs sm:text-sm font-sans font-bold tracking-normal px-2.5 py-0.5 rounded-full border ${
                isLight
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-emerald-950/70 border-emerald-500/30 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
              }`}
            >
              {loading ? '...' : `${onlineCreators.length} Live`}
            </span>
          </h2>
        </div>

        <Link
          to="/explore"
          className={`text-xs sm:text-sm font-semibold tracking-wide hover:underline transition-colors flex items-center gap-1 ${
            isLight ? 'text-[#0284c7]' : 'text-[#3BA8D8]'
          }`}
        >
          Explore all <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>

      {/* Subtitle Line with Instagram wordmark */}
      <p
        className={`mb-5 sm:mb-6 text-sm sm:text-base md:text-[17px] flex items-center flex-wrap gap-x-1.5 gap-y-0.5 font-medium ${
          isLight ? 'text-gray-600' : 'text-gray-300'
        }`}
      >
        <span>The same creator you already follow on</span>
        <svg
          viewBox="0 0 840 300"
          className="h-6 sm:h-7 md:h-8 w-auto inline-block select-none translate-y-[1px] sm:translate-y-[2px]"
          aria-label="Instagram"
          role="img"
        >
          <defs>
            <linearGradient id="ig-wordmark-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fbad50" />
              <stop offset="15%" stopColor="#fccc63" />
              <stop offset="35%" stopColor="#fa7e1e" />
              <stop offset="52%" stopColor="#d62976" />
              <stop offset="72%" stopColor="#962fbf" />
              <stop offset="100%" stopColor="#4f5bd5" />
            </linearGradient>
          </defs>
          <path
            fill="url(#ig-wordmark-gradient)"
            d="M64.76 49.108c-16.2 6.785-34.03 25.955-39.66 50.017-7.128 30.487 22.534 43.38 24.967 39.152 2.863-4.967-5.315-6.647-7-22.465-2.176-20.43 7.322-43.26 19.276-53.276 2.222-1.86 2.116.73 2.116 5.52l-.473 101.53c0 21.72-.897 28.58-2.508 35.356-1.633 6.868-4.257 11.51-2.268 13.296 2.222 2 11.71-2.757 17.2-10.422 6.586-9.193 8.89-20.233 9.305-32.223.5-14.453.48-37.387.5-50.47l-.2-68.25c-.1-5.18-14.468-10.615-21.248-7.775m575.627 101.653c-.523 11.292-3.022 20.117-6.124 26.343-6.005 12.052-18.467 15.794-23.758-1.53-2.883-9.444-3.018-25.216-.945-38.395 2.1-13.425 8.002-23.565 17.76-22.65 9.623.904 14.128 13.304 13.068 36.233zM478.15 220.81c-.13 18.762-3.083 35.212-9.415 40-8.98 6.775-21.052 1.693-18.552-11.998 2.212-12.115 12.67-24.487 27.993-39.604l-.025 11.612zm-2.453-70.165c-.55 10.284-3.215 20.616-6.124 26.454-6.004 12.052-18.556 15.82-23.758-1.53-3.557-11.855-2.705-27.198-.945-36.865 2.284-12.543 7.82-24.18 17.76-24.18 9.665 0 14.43 10.603 13.068 36.122zm-93.983-.157c-.59 10.892-2.714 19.998-6.124 26.61-6.17 11.97-18.375 15.765-23.758-1.53-3.88-12.472-2.56-29.477-.945-38.663 2.396-13.632 8.394-23.297 17.76-22.38 9.62.94 14.296 13.303 13.068 35.965zM812.42 163.21c-2.352 0-3.425 2.424-4.312 6.504-3.08 14.187-6.316 17.4-10.5 17.4-4.663 0-8.853-7.025-9.93-21.087-.846-11.057-.71-31.414.372-51.663.22-4.16-.927-8.277-12.086-12.33-4.802-1.744-11.782-4.31-15.257 4.078-9.82 23.7-13.66 42.517-14.565 50.16-.047.396-.532.476-.617-.448-.576-6.122-1.864-17.247-2.024-40.622-.03-4.56-.997-8.442-6.03-11.62-3.266-2.062-13.184-5.71-16.755-1.37-3.094 3.55-6.677 13.1-10.4 24.42l-5.134 15.425.076-34.243c.016-3.553-2.42-4.736-3.155-4.95-3.307-.96-9.823-2.564-12.6-2.564-3.413 0-4.248 1.908-4.248 4.687l-.54 55.287.01 3.19c-1.888 10.388-8.01 24.49-14.667 24.49-6.665 0-9.8-5.895-9.8-32.84 0-15.718.472-22.553.704-33.92l.38-12.718c-.05-3.5-6.1-5.263-8.916-5.915-2.83-.657-5.287-.912-7.207-.803-2.717.153-4.64 1.936-4.64 4.387l.015 3.814c-3.5-5.5-9.127-9.326-12.872-10.435-10.086-2.995-20.61-.34-28.55 10.767-6.31 8.826-10.113 18.823-11.6 33.186-1.094 10.5-.737 21.148 1.208 30.153-2.35 10.16-6.713 14.324-11.49 14.324-6.936 0-11.964-11.32-11.38-30.9.385-12.878 2.962-21.916 5.78-34.99 1.2-5.574.225-8.492-2.222-11.288-2.245-2.565-7.028-3.875-13.904-2.263-4.898 1.15-11.9 2.385-18.307 3.334 0 0 .387-1.542.704-4.262 1.666-14.26-13.83-13.104-18.775-8.55-2.95 2.72-4.96 5.927-5.723 11.694-1.21 9.152 6.255 13.468 6.255 13.468-2.45 11.2-8.452 25.854-14.65 36.44-3.32 5.672-5.86 9.876-9.137 14.344l-.027-4.983.377-48.8.383-12.584c-.037-2.56-1.532-3.526-4.64-4.75-2.75-1.082-6-1.832-9.37-2.093-4.255-.332-6.82 1.925-6.752 4.594.013.504.013 3.598.013 3.598-3.5-5.5-9.128-9.326-12.872-10.435-10.086-2.994-20.61-.34-28.55 10.767-6.308 8.826-10.44 21.212-11.6 33.076-1.1 11.058-.89 20.455.597 28.37-1.604 7.927-6.215 16.216-11.428 16.216-6.665 0-10.458-5.895-10.458-32.84 0-15.718.472-22.553.704-33.92l.38-12.718c-.05-3.5-6.1-5.263-8.916-5.916-2.946-.68-5.5-.932-7.443-.788-2.577.192-4.39 2.5-4.39 4.22v3.966c-3.5-5.5-9.127-9.326-12.872-10.435-10.086-2.994-20.552-.297-28.55 10.767-5.215 7.215-9.437 15.213-11.6 32.92-.628 5.117-.905 9.908-.87 14.387-2.08 12.718-11.264 27.376-18.778 27.376-4.397 0-8.584-8.528-8.584-26.702 0-24.21 1.498-58.677 1.752-62l11.33-.183c4.735-.052 9.024.06 15.33-.263 3.163-.16 6.21-11.514 2.946-12.92-1.48-.636-11.938-1.193-16.084-1.28-3.486-.08-13.19-.797-13.19-.797l1.073-25.295c.172-2.014-2.434-3.05-3.93-3.68-3.634-1.537-6.885-2.273-10.74-3.067-5.324-1.098-7.74-.024-8.212 4.47-.7 6.82-1.08 26.796-1.08 26.796-3.907 0-17.254-.764-21.162-.764-3.63 0-7.55 15.617-2.53 15.81l22.516.62-.285 49.187c-3.673 19.143-16.61 29.484-16.61 29.484 2.778-12.664-2.897-22.174-13.12-30.225-3.766-2.967-11.2-8.583-19.52-14.737 0 0 4.818-4.748 9.1-14.3 3.027-6.767 3.158-14.51-4.272-16.218-12.278-2.823-22.4 6.193-25.42 15.82-2.34 7.457-1.092 12.99 3.49 18.74.335.42.697.85 1.072 1.28-2.772 5.342-6.58 12.534-9.803 18.11-8.95 15.485-15.712 27.733-20.82 27.733-4.085 0-4.03-12.435-4.03-24.078 0-10.037.74-25.127 1.333-40.75.196-5.167-2.388-8.11-6.72-10.777-2.63-1.62-8.248-4.804-11.5-4.804-4.87 0-18.915.662-32.187 39.054-1.673 4.84-4.96 13.656-4.96 13.656l.283-46.167c0-1.082-.576-2.13-1.897-2.845-2.236-1.214-8.2-3.698-13.52-3.698-2.53 0-3.794 1.177-3.794 3.523l-.463 72.23c0 5.488.143 11.9.686 14.69s1.416 5.084 2.5 6.44 2.336 2.388 4.402 2.814c1.923.396 12.45 1.748 12.998-2.275.656-4.82.68-10.037 6.21-29.486 8.606-30.28 19.827-45.055 25.102-50.302.922-.917 1.975-.972 1.925.53l-1.55 37.32c-1.43 37.715 5.432 44.706 15.237 44.706 7.5 0 18.075-7.453 29.4-26.32l18.858-31.595 11.143 10.26c8.953 8.497 11.892 16.572 9.942 24.23-1.492 5.856-7.11 11.9-17.107 6.025-2.914-1.71-4.158-3.033-7.088-4.963-1.574-1.036-3.978-1.346-5.42-.26-3.743 2.822-5.884 6.412-7.107 10.857-1.19 4.325 3.142 6.61 7.632 8.6 3.866 1.72 12.175 3.28 17.474 3.458 20.647.7 37.186-9.97 48.7-37.465 2.06 23.746 10.833 37.184 26.072 37.184 10.19 0 20.404-13.17 24.87-26.126 1.282 5.28 3.18 9.874 5.632 13.757 11.743 18.606 34.524 14.6 45.967-1.198 3.538-4.882 4.077-6.636 4.077-6.636 1.67 14.918 13.683 20.13 20.56 20.13 7.704 0 15.658-3.642 21.233-16.193.653 1.362 1.366 2.663 2.145 3.896 11.743 18.606 34.524 14.6 45.967-1.198a72.9 72.9 0 0 0 1.417-2.017l.336 9.8-10.535 9.662c-17.637 16.18-31.047 28.457-32.034 42.753-1.266 18.23 13.517 25.003 24.702 25.89 11.878.943 22.05-5.62 28.3-14.8 5.5-8.082 9.098-25.478 8.834-42.658l-.415-25.004c6.2-7.2 13.183-16.297 19.614-26.947 7.008-11.606 14.52-27.192 18.364-39.322 0 0 6.525.056 13.49-.4 2.228-.145 2.867.31 2.456 1.942-.497 1.973-8.798 33.99-1.223 55.32 5.186 14.6 16.875 19.3 23.806 19.3 8.113 0 15.874-6.127 20.033-15.225.5 1.014 1.025 1.996 1.597 2.902 11.743 18.606 34.444 14.577 45.967-1.198 2.6-3.56 4.077-6.636 4.077-6.636 2.473 15.44 14.48 20.21 21.357 20.21 7.164 0 13.963-2.937 19.48-15.99.23 5.747.593 10.446 1.166 11.927.35.906 2.385 2.043 3.866 2.593 6.553 2.43 13.237 1.28 15.7.78 1.713-.347 3.05-1.72 3.23-5.27.48-9.318.185-24.974 3-36.61 4.742-19.527 9.165-27.1 11.263-30.85 1.174-2.1 2.5-2.448 2.548-.224.1 4.5.323 17.71 2.16 35.463 1.35 13.055 3.15 20.772 4.536 23.214 3.953 6.984 8.834 7.315 12.8 7.315 2.53 0 7.817-.7 7.344-5.143-.23-2.166.173-15.554 4.848-34.792 3.053-12.563 8.142-23.914 9.978-28.064.677-1.53.992-.324.98-.09-.387 8.652-1.254 36.95 2.27 52.427 4.778 20.967 18.6 23.313 23.415 23.313 10.282 0 18.69-7.82 21.524-28.4.683-4.953-.328-8.777-3.355-8.777"
          />
        </svg>
      </p>

      {/* Expertise Categories Pill Bar (Matches Uploaded Design) */}
      <div className="relative flex items-center mb-6 sm:mb-8 group">
        {/* Left Scroll Arrow */}
        {canScrollCatLeft && (
          <button
            onClick={() => handleCatScroll('left')}
            aria-label="Scroll categories left"
            className={`absolute left-0 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all shadow-lg backdrop-blur-sm -ml-2 sm:-ml-3 ${
              isLight
                ? 'bg-white/95 text-gray-800 border border-gray-200 hover:bg-gray-100'
                : 'bg-black/90 text-white border border-white/20 hover:bg-neutral-900 hover:border-white/40'
            }`}
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}

        {/* Scrollable Category Track */}
        <div
          ref={catScrollRef}
          onScroll={checkCatScroll}
          className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto py-1 px-1 no-scrollbar select-none scroll-smooth w-full"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? isLight
                      ? 'bg-black text-white shadow-md'
                      : 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.25)] font-bold'
                    : isLight
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                      : 'bg-white/[0.06] hover:bg-white/[0.12] text-white/90 border border-white/10 hover:border-white/20'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Right Scroll Arrow */}
        {canScrollCatRight && (
          <button
            onClick={() => handleCatScroll('right')}
            aria-label="Scroll categories right"
            className={`absolute right-0 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all shadow-lg backdrop-blur-sm -mr-2 sm:-mr-3 ${
              isLight
                ? 'bg-white/95 text-gray-800 border border-gray-200 hover:bg-gray-100'
                : 'bg-black/90 text-white border border-white/20 hover:bg-neutral-900 hover:border-white/40'
            }`}
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}
      </div>

      {/* Content: Creator Cards Grid */}
      {loading ? (
        /* Loading Skeleton Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 pb-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`h-[360px] rounded-[24px] border p-6 flex flex-col items-center justify-center animate-pulse ${
                isLight ? 'bg-gray-100 border-gray-200' : 'bg-[#13131A] border-[#1E1E28]'
              }`}
            >
              <div className="w-[76px] h-[76px] rounded-full bg-white/10 mb-4" />
              <div className="w-32 h-4 rounded bg-white/10 mb-2" />
              <div className="w-20 h-3 rounded bg-white/10 mb-6" />
              <div className="w-full h-10 rounded-xl bg-white/10 mt-auto" />
            </div>
          ))}
        </div>
      ) : onlineCreators.length === 0 ? (
        /* Empty State: No creators online at all */
        <div
          className={`w-full rounded-[24px] p-8 sm:p-10 text-center border transition-colors flex flex-col items-center justify-center gap-3 ${
            isLight
              ? 'bg-gray-50 border-gray-200 text-gray-700'
              : 'bg-[#13131A] border-[#1E1E28] text-gray-300'
          }`}
        >
          <div className="w-14 h-14 rounded-full bg-[#3BA8D8]/10 text-[#3BA8D8] flex items-center justify-center text-2xl">
            💬
          </div>
          <div>
            <h3
              className={`text-xl sm:text-2xl font-bold uppercase ${
                isLight ? 'text-gray-900' : 'text-white'
              }`}
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              No Creators Online Right Now
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 mt-1.5 max-w-md mx-auto">
              Our creators come online throughout the day. You can explore all creators and send questions anytime!
            </p>
          </div>
          <Link
            to="/explore"
            className="mt-2 px-6 py-2.5 rounded-xl bg-[#3BA8D8] hover:bg-[#3497c3] text-black text-xs sm:text-sm font-bold tracking-wide transition-colors shadow-[0_0_15px_rgba(59,168,216,0.3)]"
          >
            Explore All Creators
          </Link>
        </div>
      ) : filteredCreators.length === 0 ? (
        /* Empty State: Creators online in general, but none in this category */
        <div
          className={`w-full rounded-[24px] p-8 text-center border transition-colors flex flex-col items-center justify-center gap-3 ${
            isLight
              ? 'bg-gray-50 border-gray-200 text-gray-700'
              : 'bg-[#13131A] border-[#1E1E28] text-gray-300'
          }`}
        >
          <div className="text-3xl">🔍</div>
          <h3
            className={`text-lg sm:text-xl font-bold uppercase ${
              isLight ? 'text-gray-900' : 'text-white'
            }`}
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            No Creators Online in "{selectedCategory}" Right Now
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto">
            Try choosing a different expertise category or view all {onlineCreators.length} currently online creators!
          </p>
          <button
            onClick={() => setSelectedCategory('All')}
            className="mt-2 px-5 py-2 rounded-xl bg-[#3BA8D8] hover:bg-[#3497c3] text-black text-xs sm:text-sm font-bold tracking-wide transition-colors shadow-[0_0_15px_rgba(59,168,216,0.3)] cursor-pointer"
          >
            View All Online Creators ({onlineCreators.length})
          </button>
        </div>
      ) : (
        /* First 4 Creator Cards Grid with Explore More button */
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {displayCreators.map((creator) => (
              <CreatorCard
                key={creator.id || creator._id || creator.handle}
                creator={creator}
                isFirstTimeUser={isFirstTimeUser}
              />
            ))}
          </div>

          <div className="flex justify-center mt-8">
            <Link
              to={selectedCategory === 'All' ? '/explore' : `/explore?category=${selectedCategory}`}
              className="px-8 py-3 rounded-xl bg-[#3BA8D8] hover:bg-[#3497c3] text-black font-bold text-sm sm:text-base tracking-wide transition-all duration-200 shadow-[0_0_20px_rgba(59,168,216,0.35)] flex items-center gap-2 hover:scale-[1.02]"
            >
              Explore More {filteredCreators.length > 4 ? `(${filteredCreators.length - 4} more)` : ''}
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      )}
    </section>
  );
};

export default WhosOnline;
