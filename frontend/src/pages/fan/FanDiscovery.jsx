import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CreatorCard from '../../components/discovery/CreatorCard';
import FanNavbar from '../../components/fan/layout/FanNavbar';
import FanBottomNav from '../../components/fan/layout/FanBottomNav';
import { getLiveCreators } from '../../services/discoveryApi';
import { getFanMe, switchRole } from '../../services/fanApi';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';
import { getThoughtOfTheDay } from '../../utils/dailyThoughts';
import { checkIfLiveNow } from '../../utils/timeUtils';
import { motion, AnimatePresence } from 'framer-motion';

const categories = [
  { id: 'All', label: 'All Categories', query: 'All creators' },
  { id: 'Lifestyle', label: 'Lifestyle', query: 'Lifestyle' },
  { id: 'Beauty', label: 'Beauty', query: 'Beauty' },
  { id: 'Fitness', label: 'Fitness', query: 'Fitness' },
  { id: 'Finance', label: 'Finance', query: 'Finance' },
  { id: 'Tech', label: 'Tech', query: 'Tech' },
  { id: 'Entrepreneurship', label: 'Entrepreneurship', query: 'Entrepreneurship' },
  { id: 'Education', label: 'Education', query: 'Education' },
  { id: 'Motivation', label: 'Motivation', query: 'Motivation' },
  { id: 'Dating', label: 'Dating', query: 'Dating' },
  { id: 'Food', label: 'Food', query: 'Food' },
  { id: 'Travel', label: 'Travel', query: 'Travel' },
  { id: 'Music', label: 'Music', query: 'Music' },
  { id: 'Gaming', label: 'Gaming', query: 'Gaming' },
  { id: 'Comedy', label: 'Comedy', query: 'Comedy' },
  { id: 'Others', label: 'Others', query: 'Others' }
];

const FanDiscovery = () => {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fanName, setFanName] = useState(() => localStorage.getItem('skriibe_fan_name') || '');
  const [fanAvatar, setFanAvatar] = useState(() => localStorage.getItem('skriibe_fan_avatar') || null);
  const [fanCreatorHandle, setFanCreatorHandle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [creatorFilter, setCreatorFilter] = useState('Online'); // 'Online', 'Offline'
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [showRoleConflictModal, setShowRoleConflictModal] = useState(false);
  const debounceTimeout = useRef(null);
  const navigate = useNavigate();
  const { roles, setAuthData } = useAuth();

  const handleSwitchToCreatorMode = async () => {
    if (roles.includes('creator')) {
      try {
        const res = await switchRole('creator');
        if (res.success) {
          setAuthData(roles, 'creator', res.token);
          window.location.href = '/creator/dashboard';
        }
      } catch (err) {
        console.error('Failed to switch to creator mode', err);
      }
    } else {
      navigate('/fan/upgrade');
    }
  };

  const fetchCreators = async (query = '', cat = 'All') => {
    setLoading(true);
    try {
      const params = {};
      if (query) params.search = query;
      if (cat !== 'All') {
        const catObj = categories.find(c => c.id === cat);
        if (catObj) params.category = catObj.query;
      }
      const data = await getLiveCreators(params);
      if (data.success && data.creators) {
        setCreators(data.creators);
      } else {
        setCreators([]);
      }
    } catch (err) {
      console.error('Failed to fetch creators', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      fetchCreators(val, activeCategory);
    }, 300);
  };

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    fetchCreators(searchQuery, cat);
  };

  useEffect(() => {
    fetchCreators(searchQuery, activeCategory);

    const fetchFanProfile = async () => {
      try {
        const res = await getFanMe();
        if (res.success && res.fan && res.fan.name) {
          const firstName = res.fan.name.split(' ')[0];
          setFanName(firstName);
          localStorage.setItem('skriibe_fan_name', firstName);
          if (res.fan.avatarUrl) {
            setFanAvatar(res.fan.avatarUrl);
            localStorage.setItem('skriibe_fan_avatar', res.fan.avatarUrl);
          }
          if (res.fan.creatorHandle) {
            setFanCreatorHandle(res.fan.creatorHandle);
          }
          setIsFirstTimeUser(!res.fan.hasUsedFreeChat);
        }
      } catch (err) {
        console.error('Failed to fetch user profile', err);
        // If fan fetch fails, they might be a creator trying to access fan pages
        try {
          const { default: api } = await import('../../services/api');
          const cRes = await api.get('/creators/me');
          if (cRes.data?.creator) {
            setShowRoleConflictModal(true);
          }
        } catch (e) {
          // not logged in at all
        }
      }
    };
    fetchFanProfile();

    const socketUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
    const socket = io(socketUrl);
    socket.on('creator-status-changed', ({ creatorId, isLive }) => {
      setCreators(prev => prev.map(c =>
        c.id === creatorId ? { ...c, isLive } : c
      ));
    });

    const setInSession = (creatorId, inSession) => {
      setCreators(prev => prev.map(c =>
        String(c.id) === String(creatorId) ? { ...c, inSession } : c
      ));
    };
    socket.on('creator_joined', ({ creatorId }) => setInSession(creatorId, true));
    socket.on('chat-session-ended', ({ creatorId }) => setInSession(creatorId, false));

    const handleProfileUpdate = (e) => {
      const updated = e?.detail?.firstName || localStorage.getItem('skriibe_fan_name') || '';
      if (updated) setFanName(updated);
    };
    window.addEventListener('fanProfileUpdated', handleProfileUpdate);

    return () => {
      socket.disconnect();
      window.removeEventListener('fanProfileUpdated', handleProfileUpdate);
    };
  }, []);

  const baseFilteredCreators = creators.filter(c => {
    if (fanCreatorHandle && c.handle && c.handle.toLowerCase() === fanCreatorHandle.toLowerCase()) return false;
    return true;
  });

  const isCreatorOnline = (c) => {
    if (c.isPaused) return false;
    if (c.isLive === true) return true;
    return checkIfLiveNow(c.liveChatTimeSlots);
  };

  const onlineCount = baseFilteredCreators.filter(isCreatorOnline).length;
  const offlineCount = baseFilteredCreators.filter(c => !isCreatorOnline(c)).length;
  const allCount = baseFilteredCreators.length;

  const filteredCreators = baseFilteredCreators.filter(c => {
    const online = isCreatorOnline(c);
    if (creatorFilter === 'Online' && !online) return false;
    if (creatorFilter === 'Offline' && online) return false;
    return true;
  });

  const isSearching = searchQuery !== '' || activeCategory !== 'All';
  const displayCreators = isSearching ? filteredCreators : filteredCreators.slice(0, 4);

  const onlineCreators = baseFilteredCreators.filter(isCreatorOnline);
  const recentCreator = onlineCreators.length > 0 
    ? [...onlineCreators].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0]
    : null;
  const recentCreatorName = recentCreator?.name?.split(' ')[0] || 'A creator';
  const recentCreatorHandle = recentCreator?.handle || '';

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      color: '#ffffff',
      fontFamily: 'Inter, var(--font-body, sans-serif)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <FanNavbar />

      <main style={{ flex: 1, padding: 'min(40px, 5vw) min(40px, 5vw) 90px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
        
        <div style={{ marginBottom: '16px' }}>
          
          <div style={{
            background: '#13161C',
            border: '1px solid #1F2937',
            borderRadius: '16px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '32px',
            width: '100%',
            maxWidth: '400px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '4px',
              height: '100%',
              background: '#8B5CF6',
              boxShadow: '0 0 12px #8B5CF6'
            }} />
            <div style={{
              position: 'absolute',
              top: 0,
              left: '4px',
              width: '40px',
              height: '100%',
              background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.1) 0%, transparent 100%)',
              pointerEvents: 'none'
            }} />

            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '1.4rem',
              color: '#000',
              zIndex: 1,
              overflow: 'hidden'
            }}>
              {fanAvatar ? (
                <img src={fanAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                fanName.charAt(0).toUpperCase()
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', zIndex: 1 }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Hey {fanName && <span style={{ color: '#2DD4BF' }}>{fanName}</span>} <span style={{ fontSize: '1.1rem' }}>👋</span>
              </div>
              <div style={{ fontSize: '0.85rem' }}>
                <span style={{ color: '#64748b' }}>{getThoughtOfTheDay()}</span>
              </div>
            </div>
          </div>

          {/* Free Chat Box */}
          {isFirstTimeUser && (
            <div style={{
            background: 'linear-gradient(135deg, #a78bfa 0%, #f472b6 100%)',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '400px',
            position: 'relative',
            color: '#fff',
            boxShadow: '0 4px 20px rgba(236, 72, 153, 0.2)',
            marginBottom: '32px',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ 
                background: 'rgba(0, 0, 0, 0.25)', 
                padding: '6px 14px', 
                borderRadius: '20px', 
                fontSize: '11px', 
                fontWeight: '800', 
                letterSpacing: '0.5px' 
              }}>
                FREE CHAT AVAILABLE
              </div>
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' }}>
              You have 1 free chat left today
            </h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '14px', fontWeight: '500', opacity: 0.95, lineHeight: '1.4' }}>
              {recentCreatorName} is online right now — it costs you nothing.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => recentCreatorHandle ? navigate(`/creator/${recentCreatorHandle}`) : null}
                style={{
                  width: '100%',
                  background: '#1C1F26',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px',
                  fontWeight: '700',
                  fontSize: '15px',
                  cursor: 'pointer'
                }}>
                Start free chat
              </button>
            </div>
          </div>
          )}
        </div>



        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', marginTop: '32px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
            {isSearching ? 'Search results' : 'Online now'}
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          {displayCreators.map(creator => (
            <CreatorCard key={creator.id || creator.handle} creator={creator} isFirstTimeUser={isFirstTimeUser} />
          ))}
          
          {displayCreators.length === 0 && !loading && (
            <div style={{ 
              gridColumn: '1 / -1', 
              textAlign: 'center', 
              padding: '64px',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '20px',
              border: '1px dashed rgba(255,255,255,0.1)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <h3 style={{ fontSize: '20px', margin: '0 0 8px' }}>No creators found</h3>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '40px' }}>
          <button 
            onClick={() => navigate('/explore')}
            style={{
              background: 'linear-gradient(90deg, #7c3aed, #06b6d4)',
              border: 'none',
              color: '#ffffff',
              padding: '16px 32px',
              fontSize: '16px',
              fontWeight: 800,
              borderRadius: '16px',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(124, 58, 237, 0.3)',
              transition: 'transform 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '300px',
              gap: '8px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Explore more creators <span>→</span>
          </button>


        </div>

      </main>
      <FanBottomNav />

      {/* Role Conflict Modal */}
      <AnimatePresence>
        {showRoleConflictModal && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '20px'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              style={{
                background: '#13161c',
                borderRadius: '24px',
                padding: '32px',
                width: '100%',
                maxWidth: '400px',
                border: '1px solid #1F2937',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, height: '4px',
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
                  background: '#374151',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#4B5563'}
                onMouseOut={(e) => e.target.style.background = '#374151'}
              >
                Go to Creator Dashboard
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FanDiscovery;
