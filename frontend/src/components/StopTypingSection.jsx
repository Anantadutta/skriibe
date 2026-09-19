import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { getLiveCreators } from '../services/discoveryApi';
import { checkIfLiveNow } from '../utils/timeUtils';
import { getImageUrl } from '../utils/imageUtils';
import { useAuth } from '../context/AuthContext';

const FALLBACK_ONLINE_CREATORS = [
  { id: '1', name: 'AAkshaye', handle: 'aakshaye', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', rate: 5 },
  { id: '2', name: 'Babli', handle: 'babli', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80', rate: 5 },
  { id: '3', name: 'Sanaya', handle: 'sanaya', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80', rate: 5 },
  { id: '4', name: 'shrijee', handle: 'bhartiya_shrijee', avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80', rate: 5 },
  { id: '5', name: 'Gazetted', handle: 'gazetted', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80', rate: 5 },
  { id: '6', name: 'Mad', handle: 'mad', avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80', rate: 5 },
  { id: '7', name: 'Modassir', handle: 'modassir', avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80', rate: 5 },
  { id: '8', name: 'Nitin', handle: 'nitin', avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80', rate: 5 },
  { id: '9', name: 'Shreya', handle: 'shreya', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80', rate: 5 },
  { id: '10', name: 'Rina', handle: 'rina', avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80', rate: 5 },
  { id: '11', name: 'simran', handle: 'simran', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80', rate: 5 },
];

const StopTypingSection = ({ theme = 'dark' }) => {
  const isLight = theme === 'light';
  const navigate = useNavigate();
  const { roles, activeRole, isAuthenticated } = useAuth();
  const [showRoleConflictModal, setShowRoleConflictModal] = useState(false);
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleClaimClick = (e) => {
    if (isAuthenticated && (activeRole === 'creator' || (roles && roles.includes('creator')))) {
      e.preventDefault();
      setShowRoleConflictModal(true);
    }
  };

  // Helper to determine if a creator is currently live
  const isCreatorLiveNow = (creator) => {
    if (!creator || creator.isPaused) return false;
    if (creator.isLive === true) return true;
    return checkIfLiveNow(creator.liveChatTimeSlots || creator.scheduledTimeSlots);
  };

  useEffect(() => {
    let isMounted = true;

    const loadCreators = async () => {
      try {
        const data = await getLiveCreators();
        if (isMounted && data && data.success && Array.isArray(data.creators)) {
          setCreators(data.creators);
        }
      } catch (err) {
        console.error('StopTypingSection failed to fetch live creators:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    loadCreators();

    // Listen to real-time socket updates when any creator's status changes
    const socketUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api', '') 
      : 'http://localhost:5000';
    const socket = io(socketUrl);

    socket.on('creator-status-changed', ({ creatorId, isLive }) => {
      if (!isMounted) return;
      setCreators((prev) =>
        prev.map((c) =>
          c.id === creatorId || c._id === creatorId ? { ...c, isLive } : c
        )
      );
    });

    // Recheck scheduled time slots every 30 seconds
    const interval = setInterval(() => {
      if (!isMounted) return;
      setCreators((prev) => [...prev]);
    }, 30000);

    return () => {
      isMounted = false;
      socket.disconnect();
      clearInterval(interval);
    };
  }, []);

  const hasAvatar = (c) => {
    const pic = c.avatarUrl || c.profileUrl || c.photo || c.profilePicture;
    return !!(pic && pic !== 'null' && pic !== 'undefined' && !pic.includes('dicebear'));
  };

  // Actual live creators right now
  const liveCreators = creators.filter(isCreatorLiveNow);
  const liveCount = liveCreators.length;

  // All creators who have uploaded their profile picture
  const creatorsWithUploadedAvatar = creators.filter(hasAvatar);

  // Combine so all creators who uploaded photos are included and prioritized, with no duplicates
  const combined = [...creatorsWithUploadedAvatar, ...liveCreators].filter(
    (creator, index, self) => index === self.findIndex((t) => (t.id || t._id) === (creator.id || creator._id))
  );

  const displayCreators = combined.length > 0 ? combined : FALLBACK_ONLINE_CREATORS;

  const handleSeeWhosOnline = () => {
    const el = document.getElementById('whos-online');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/fan/explore');
    }
  };
  return (
    <>
    <section className="w-full mt-3 sm:mt-4 md:mt-5 mb-12 sm:mb-16 md:mb-20">
      <div
        className={`relative overflow-hidden rounded-[28px] sm:rounded-[36px] px-6 py-8 sm:px-10 sm:py-12 md:py-14 lg:py-16 border text-center transition-all duration-300 flex flex-col items-center justify-center ${
          isLight
            ? 'bg-gradient-to-br from-sky-50/70 via-white to-sky-100/40 border-sky-200/80 shadow-[0_8px_30px_rgba(59,168,216,0.08)]'
            : 'bg-gradient-to-br from-[#0c1622] via-[#0f141d] to-[#0a0d13] border-[#3BA8D8]/20 shadow-[0_8px_40px_rgba(59,168,216,0.1)]'
        }`}
      >
        {/* Ambient Glows */}
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-96 sm:w-[500px] h-96 sm:h-[500px] rounded-full blur-3xl pointer-events-none -mt-24 ${
            isLight ? 'bg-sky-200/30' : 'bg-[#3BA8D8]/10'
          }`}
        />
        <div
          className={`absolute bottom-0 right-0 w-72 sm:w-80 h-72 sm:h-80 rounded-full blur-3xl pointer-events-none -mr-20 -mb-20 ${
            isLight ? 'bg-blue-100/30' : 'bg-purple-900/10'
          }`}
        />

        <div className="relative z-10 max-w-5xl w-full mx-auto flex flex-col items-center">
          {/* Top Creators Online Badge / Counter */}
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-[0.18em] mb-6 sm:mb-8 border transition-all duration-300 ${
              isLight
                ? 'bg-sky-100/80 text-[#0284c7] border-sky-200'
                : 'bg-[#3BA8D8]/15 text-[#3BA8D8] border-[#3BA8D8]/30 shadow-[0_0_12px_rgba(59,168,216,0.25)]'
            }`}
          >
            {/* Live Green Indicator Dot */}
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${liveCount > 0 ? 'bg-emerald-400' : 'bg-[#3BA8D8]'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${liveCount > 0 ? 'bg-emerald-500' : 'bg-[#3BA8D8]'}`}></span>
            </span>
            <span>
              {loading
                ? '... CREATORS ONLINE'
                : `${liveCount.toLocaleString()} ${liveCount === 1 ? 'CREATOR' : 'CREATORS'} ONLINE`}
            </span>
          </div>

          {/* Headline in Website's Bebas Neue Font */}
          <h2
            className={`text-5xl sm:text-7xl md:text-8xl lg:text-[96px] xl:text-[104px] font-normal uppercase tracking-tight leading-[0.92] mb-8 sm:mb-10 ${
              isLight ? 'text-gray-950' : 'text-white'
            }`}
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            STOP TYPING<br />
            "HEY, QUICK Q" —<br />
            JUST ASK THEM.
          </h2>

          {/* Action Buttons Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full sm:w-auto mb-6 sm:mb-8">
            {/* Start my free chat */}
            <Link
              to="/fan/login"
              onClick={handleClaimClick}
              className={`w-full sm:w-auto px-7 sm:px-9 py-3.5 sm:py-4 rounded-full font-bold text-base sm:text-lg transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 text-center ${
                isLight
                  ? 'bg-[#3BA8D8] hover:bg-[#2d8ab8] text-white shadow-md hover:shadow-lg'
                  : 'bg-[#3BA8D8] hover:bg-[#4ab8d6] text-black shadow-[0_0_25px_rgba(59,168,216,0.35)] hover:shadow-[0_0_35px_rgba(59,168,216,0.5)]'
              }`}
            >
              Start my free chat
            </Link>

            {/* See who's online */}
            <button
              type="button"
              onClick={handleSeeWhosOnline}
              className={`w-full sm:w-auto px-7 sm:px-9 py-3.5 sm:py-4 rounded-full font-semibold text-base sm:text-lg transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 text-center border cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-gray-50 border-gray-300 text-gray-900 shadow-sm hover:border-gray-400'
                  : 'bg-white/[0.06] hover:bg-white/[0.12] border-white/20 text-white shadow-[0_2px_15px_rgba(0,0,0,0.2)] hover:border-white/30'
              }`}
            >
              See who's online
            </button>
          </div>

          {/* Bottom Subtext */}
          <p
            className={`text-xs sm:text-sm md:text-base tracking-normal font-medium ${
              isLight ? 'text-gray-600' : 'text-gray-400'
            }`}
          >
            first minutes free &middot; pay per minute after
          </p>

          {/* Online Creators in Circles (Matches Screenshot 1 & 2) */}
          <div className="-mx-6 sm:-mx-12 md:-mx-16 lg:-mx-24 !w-[calc(100%+3rem)] sm:!w-[calc(100%+6rem)] md:!w-[calc(100%+8rem)] lg:!w-[calc(100%+12rem)] mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-white/[0.08] relative">
            {/* Heading matching Screenshot 1 */}
            <div className="flex flex-wrap items-baseline justify-start text-left gap-2.5 sm:gap-3.5 mb-5 sm:mb-6 px-3 sm:px-4 md:px-5">
              <span
                className={`text-xl sm:text-2xl md:text-3xl font-normal uppercase tracking-wider ${
                  isLight ? 'text-gray-950' : 'text-white'
                }`}
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                ONLINE RIGHT NOW
              </span>
              <span
                className={`text-xs sm:text-sm md:text-base font-medium ${
                  isLight ? 'text-gray-600' : 'text-gray-400'
                }`}
              >
                tap anyone to start &mdash; first chat free
              </span>
            </div>

            {/* Edge-to-Edge Slow Rotating Marquee Track */}
            <div
              className="w-full overflow-hidden py-3 select-none"
              style={{
                maskImage: 'linear-gradient(to right, transparent, black 3%, black 97%, transparent)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 3%, black 97%, transparent)'
              }}
            >
              <div className="animate-marquee-slow flex w-max will-change-transform hover:[animation-play-state:paused]">
                {[...displayCreators, ...displayCreators].map((creator, idx) => {
                  const creatorName = creator.name || creator.handle || 'Creator';
                  const rate = creator.liveChatPrice || creator.rate || creator.price || 5;
                  const handle = (creator.handle || '').replace(/^@/, '');
                  const rawAvatar = creator.avatarUrl || creator.profileUrl || creator.photo || creator.profilePicture;
                  const hasValidAvatar = !!(rawAvatar && rawAvatar !== 'null' && rawAvatar !== 'undefined' && !rawAvatar.includes('dicebear'));
                  const avatarUrlResolved = hasValidAvatar ? getImageUrl(rawAvatar) : null;
                  const initials = (creatorName || 'C')
                    .split(' ')
                    .filter(Boolean)
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase() || 'C';

                  return (
                    <Link
                      key={`${creator.id || creator._id || creator.handle}-${idx}`}
                      to={handle ? `/creator/${handle}` : '/explore'}
                      className="flex flex-col items-center shrink-0 group/creator transition-transform duration-200 hover:-translate-y-1 cursor-pointer mx-3 sm:mx-4 md:mx-5"
                    >
                      {/* Circle Avatar with Cyan Glowing Border */}
                      <div className="relative w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full p-[2.5px] border-2 border-[#3BA8D8] shadow-[0_0_15px_rgba(59,168,216,0.35)] group-hover/creator:border-[#5ecaff] group-hover/creator:shadow-[0_0_22px_rgba(59,168,216,0.55)] transition-all duration-300">
                        <div className="w-full h-full rounded-full overflow-hidden bg-[#0c1622] flex items-center justify-center">
                          {avatarUrlResolved ? (
                            <img
                              src={avatarUrlResolved}
                              alt={creatorName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                if (e.currentTarget.nextElementSibling) {
                                  e.currentTarget.nextElementSibling.style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <span
                            className={`text-sm sm:text-base md:text-lg font-bold text-[#3BA8D8] tracking-wider ${
                              avatarUrlResolved ? 'hidden' : 'flex'
                            }`}
                          >
                            {initials}
                          </span>
                        </div>

                        {/* Green Live Indicator Dot */}
                        <span className="absolute bottom-0 right-0 sm:bottom-0.5 sm:right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#10B981] border-2 border-[#0c1622] shadow-[0_0_8px_#10B981] flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
                        </span>
                      </div>

                      {/* Creator Name */}
                      <span
                        className={`text-xs sm:text-sm font-semibold max-w-[76px] sm:max-w-[84px] truncate text-center mt-2 transition-colors ${
                          isLight
                            ? 'text-gray-900 group-hover/creator:text-[#0284c7]'
                            : 'text-white group-hover/creator:text-[#3BA8D8]'
                        }`}
                      >
                        {creatorName}
                      </span>

                      {/* Rate */}
                      <span className="text-[11px] sm:text-xs font-bold text-emerald-400 tracking-tight text-center mt-0.5">
                        ₹{rate}/min
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes marqueeSlowCreators {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-slow {
          display: flex;
          width: max-content;
          animation: marqueeSlowCreators 50s linear infinite;
        }
        .animate-marquee-slow:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>

    {/* Role Conflict Modal */}
    {showRoleConflictModal && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(4px)'
      }}>
        <div style={{
          background: '#1F2937',
          borderRadius: '24px',
          padding: '40px',
          maxWidth: '400px',
          width: '90%',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Gradient border top */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #F59E0B, #EF4444)'
          }} />
          
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>

          <h2 style={{ 
            margin: '0 0 12px', 
            fontSize: '22px', 
            fontWeight: '700',
            color: '#fff' 
          }}>
            Access Denied
          </h2>
          
          <p style={{ 
            margin: '0 0 24px', 
            color: '#9CA3AF',
            fontSize: '15px',
            lineHeight: '1.5'
          }}>
            You are signed in as a creator please sign up with a different account to be a fan
          </p>

          <button
            onClick={() => {
              setShowRoleConflictModal(false);
              navigate('/creator/dashboard');
            }}
            style={{
              width: '100%',
              padding: '14px',
              background: '#4B5563',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#374151'}
            onMouseOut={(e) => e.target.style.background = '#4B5563'}
          >
            Go to Creator Dashboard
          </button>
        </div>
      </div>
    )}
    </>
  );
};

export default StopTypingSection;
