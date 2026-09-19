import React, { useState, useEffect, useRef } from 'react';
import CreatorCard from '../../components/discovery/CreatorCard';
import FanNavbar from '../../components/fan/layout/FanNavbar';
import FanBottomNav from '../../components/fan/layout/FanBottomNav';
import { getLiveCreators } from '../../services/discoveryApi';
import { getFanMe } from '../../services/fanApi';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const PREDEFINED_CATEGORIES = [
  'Lifestyle', 'Beauty', 'Fitness', 'Finance', 'Tech', 
  'Entrepreneurship', 'Education', 'Motivation', 'Dating', 
  'Food', 'Travel', 'Music', 'Gaming', 'Comedy'
];

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

const FanExplore = () => {
  const [creators, setCreators] = useState([]);
  const [fanCreatorHandle, setFanCreatorHandle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedCustomCategory, setSelectedCustomCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);
  const [visibleCount, setVisibleCount] = useState(20);
  const [showRoleConflictModal, setShowRoleConflictModal] = useState(false);
  const navigate = useNavigate();

  // Debounce ref
  const debounceTimeout = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.scrollTop = 0;
    }
  }, [searchQuery, activeCategory]);

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

  useEffect(() => {
    fetchCreators(searchQuery, activeCategory);

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

    const fetchFanProfile = async () => {
      try {
        const res = await getFanMe();
        if (res.success && res.fan && res.fan.creatorHandle) {
          setFanCreatorHandle(res.fan.creatorHandle);
        }
        if (res.success && res.fan) {
          setIsFirstTimeUser(!res.fan.hasUsedFreeChat);
        } else {
          setIsFirstTimeUser(true);
        }
      } catch (err) {
        setIsFirstTimeUser(true);
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

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setVisibleCount(20);
    
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      fetchCreators(val, activeCategory);
    }, 300);
  };

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    setSelectedCustomCategory(null);
    setVisibleCount(20);
    fetchCreators(searchQuery, cat);
  };

  const customCategories = React.useMemo(() => {
    if (activeCategory !== 'Others') return [];
    const allExpertise = creators.flatMap(c => c.expertise || []);
    const custom = allExpertise.filter(cat => !PREDEFINED_CATEGORIES.includes(cat) && cat !== 'Others');
    return [...new Set(custom)];
  }, [creators, activeCategory]);

  const filteredCreators = creators.filter(c => {
    if (fanCreatorHandle && c.handle && c.handle.toLowerCase() === fanCreatorHandle.toLowerCase()) return false;
    if (activeCategory === 'Others' && selectedCustomCategory) {
      return (c.expertise || []).includes(selectedCustomCategory);
    }
    return true;
  });

  const hasMore = visibleCount < filteredCreators.length;
  const paginatedCreators = filteredCreators.slice(0, visibleCount);

  return (
    <div className="fan-explore-root">
      <style>{`
        .fan-explore-root {
          min-height: 100vh;
          background: #0a0a0f;
          color: #ffffff;
          font-family: Inter, var(--font-body, sans-serif);
          display: flex;
          flex-direction: column;
        }

        .fan-explore-main {
          flex: 1;
          padding: 32px 24px 100px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
        }

        .fan-explore-search-section {
          margin-bottom: 28px;
        }

        .fan-explore-search-bar {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 14px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          transition: border-color 0.2s, background 0.2s;
        }
        .fan-explore-search-bar:focus-within {
          border-color: #38bdf8;
          background: rgba(255, 255, 255, 0.05);
        }

        .fan-explore-cat-container {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .fan-explore-cat-wrapper {
          position: relative;
          width: 280px;
        }

        .fan-explore-cat-select {
          background: rgba(255, 255, 255, 0.03);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 11px 38px 11px 18px;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 600;
          outline: none;
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
          width: 100%;
          font-family: inherit;
          transition: border-color 0.2s;
        }
        .fan-explore-cat-select:focus {
          border-color: #38bdf8;
        }

        .fan-explore-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          gap: 16px;
        }

        .fan-explore-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .fan-explore-title-group h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.3px;
        }

        .fan-explore-count-badge {
          color: #94a3b8;
          font-size: 14px;
          font-weight: 600;
        }

        .fan-explore-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 20px;
          padding-bottom: 24px;
        }

        .fan-explore-pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          margin-top: 20px;
          margin-bottom: 24px;
        }

        @media (max-width: 640px) {
          .fan-explore-main {
            padding: 16px 16px 95px !important;
          }

          .fan-explore-search-section {
            margin-bottom: 18px !important;
          }

          .fan-explore-search-bar {
            padding: 12px 16px !important;
            border-radius: 14px !important;
            margin-bottom: 12px !important;
          }

          .fan-explore-search-bar input {
            font-size: 15px !important;
          }

          .fan-explore-cat-container {
            width: 100% !important;
          }

          .fan-explore-cat-wrapper {
            width: 100% !important;
          }

          .fan-explore-cat-select {
            padding: 12px 38px 12px 16px !important;
          }

          .fan-explore-header-row {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
            margin-bottom: 18px !important;
          }

          .fan-explore-title-group {
            justify-content: space-between !important;
            width: 100% !important;
          }

          .fan-explore-title-group h2 {
            font-size: 20px !important;
          }

          .fan-explore-count-badge {
            font-size: 12px !important;
            background: rgba(255, 255, 255, 0.05) !important;
            border: 1px solid rgba(255, 255, 255, 0.08) !important;
            padding: 3px 10px !important;
            border-radius: 20px !important;
          }

          .fan-explore-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }
      `}</style>

      <FanNavbar />
      <main ref={gridRef} className="fan-explore-main">
        <div style={{ maxWidth: '768px', margin: '0 0 28px' }}>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(32px, 7vw, 56px)',
            fontWeight: 400,
            textTransform: 'uppercase',
            letterSpacing: '-0.02em',
            lineHeight: 0.92,
            color: '#ffffff',
            margin: 0
          }}>
            Direct 1-on-1 Access.<br />
            Zero Subscription Hassle.
          </h1>
          <p style={{
            fontSize: 'clamp(14px, 3.5vw, 18px)',
            lineHeight: 1.6,
            color: '#cbd5e1',
            margin: '16px 0 0'
          }}>
            Connect directly with your favourite creators. No DMs left on unread, no expensive long-term plans — just pay-per-minute private conversations.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="fan-explore-search-section">
          <div className="fan-explore-search-bar">
            <span style={{ fontSize: '20px' }}>🔍</span>
            <input 
              type="text"
              placeholder="Search creators, @handles or topics..."
              value={searchQuery}
              onChange={handleSearchChange}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '16px',
                width: '100%',
                outline: 'none'
              }}
            />
          </div>

          <div className="fan-explore-cat-container">
            <div className="fan-explore-cat-wrapper">
              <select 
                value={activeCategory}
                onChange={(e) => handleCategoryClick(e.target.value)}
                className="fan-explore-cat-select"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id} style={{ background: '#13131A' }}>{cat.label}</option>
                ))}
              </select>
              <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94a3b8', fontSize: '10px' }}>
                ▼
              </div>
            </div>
          </div>
          
          {activeCategory === 'Others' && customCategories.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
              {customCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCustomCategory(selectedCustomCategory === cat ? null : cat)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '600',
                    border: '1px solid',
                    borderColor: selectedCustomCategory === cat ? '#00ffa3' : 'rgba(255,255,255,0.1)',
                    background: selectedCustomCategory === cat ? 'rgba(0, 255, 163, 0.1)' : 'rgba(255,255,255,0.03)',
                    color: selectedCustomCategory === cat ? '#00ffa3' : '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="fan-explore-header-row">
          <div className="fan-explore-title-group">
            <h2>
              {searchQuery ? 'Search results' : 'Explore creators'}
            </h2>
            <span className="fan-explore-count-badge">
              {filteredCreators.length} found
            </span>
          </div>
        </div>

        <div className="fan-explore-grid">
          {paginatedCreators.map(creator => (
            <CreatorCard key={creator.id || creator.handle} creator={creator} isFirstTimeUser={isFirstTimeUser} />
          ))}
          
          {filteredCreators.length === 0 && !loading && (
            <div style={{ 
              gridColumn: '1 / -1', 
              textAlign: 'center', 
              padding: '64px 20px', 
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '20px',
              border: '1px dashed rgba(255,255,255,0.1)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <h3 style={{ fontSize: '20px', margin: '0 0 8px' }}>No creators found</h3>
              <p style={{ color: '#94a3b8', margin: 0 }}>Try adjusting your search or category filter.</p>
            </div>
          )}
        </div>

        {/* Load More Button at Bottom */}
        {filteredCreators.length > 0 && hasMore && (
          <div className="fan-explore-pagination">
            <button 
              onClick={() => setVisibleCount(prev => prev + 10)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                padding: '12px 32px',
                fontSize: '15px',
                fontWeight: '600',
                borderRadius: '24px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              View more +
            </button>
          </div>
        )}
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

export default FanExplore;
