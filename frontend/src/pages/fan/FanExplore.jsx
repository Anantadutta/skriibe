import React, { useState, useEffect, useRef } from 'react';
import CreatorCard from '../../components/discovery/CreatorCard';
import FanNavbar from '../../components/fan/layout/FanNavbar';
import FanBottomNav from '../../components/fan/layout/FanBottomNav';
import { getLiveCreators } from '../../services/discoveryApi';
import { getFanMe } from '../../services/fanApi';
import { io } from 'socket.io-client';
import { checkIfLiveNow } from '../../utils/timeUtils';
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
  const [currentPage, setCurrentPage] = useState(1);
  const creatorsPerPage = 12;

  // Debounce ref
  const debounceTimeout = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.scrollTop = 0;
    }
  }, [currentPage]);

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
    setCurrentPage(1);
    
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      fetchCreators(val, activeCategory);
    }, 300);
  };

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    setSelectedCustomCategory(null);
    setCurrentPage(1);
    fetchCreators(searchQuery, cat);
  };

  const customCategories = React.useMemo(() => {
    if (activeCategory !== 'Others') return [];
    const allExpertise = creators.flatMap(c => c.expertise || []);
    const custom = allExpertise.filter(cat => !PREDEFINED_CATEGORIES.includes(cat) && cat !== 'Others');
    return [...new Set(custom)];
  }, [creators, activeCategory]);

  const [creatorFilter, setCreatorFilter] = useState('All');

  const isCreatorOnline = (c) => {
    if (c.isPaused) return false;
    if (c.isLive === true) return true;
    return checkIfLiveNow(c.liveChatTimeSlots);
  };

  const baseFilteredCreators = creators.filter(c => {
    if (fanCreatorHandle && c.handle && c.handle.toLowerCase() === fanCreatorHandle.toLowerCase()) return false;
    if (activeCategory === 'Others' && selectedCustomCategory) {
      return (c.expertise || []).includes(selectedCustomCategory);
    }
    return true;
  });

  const onlineCount = baseFilteredCreators.filter(isCreatorOnline).length;
  const offlineCount = baseFilteredCreators.filter(c => !isCreatorOnline(c)).length;
  const allCount = baseFilteredCreators.length;

  const filteredCreators = baseFilteredCreators.filter(c => {
    const online = isCreatorOnline(c);
    if (creatorFilter === 'Online' && !online) return false;
    if (creatorFilter === 'Offline' && online) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredCreators.length / creatorsPerPage);
  const paginatedCreators = filteredCreators.slice((currentPage - 1) * creatorsPerPage, currentPage * creatorsPerPage);

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

        .fan-explore-filter-pills {
          display: inline-flex;
          background: #13161C;
          border-radius: 14px;
          padding: 4px;
          gap: 4px;
          border: 1px solid #1F2937;
        }

        .fan-explore-filter-btn {
          padding: 6px 16px;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background 0.2s;
          user-select: none;
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

          .fan-explore-filter-pills {
            display: flex !important;
            width: 100% !important;
            box-sizing: border-box !important;
            border-radius: 12px !important;
          }

          .fan-explore-filter-btn {
            flex: 1 !important;
            justify-content: center !important;
            padding: 8px 4px !important;
            border-radius: 9px !important;
            gap: 5px !important;
          }

          .fan-explore-filter-btn span {
            font-size: 12.5px !important;
          }

          .fan-explore-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }
      `}</style>

      <FanNavbar />
      <main ref={gridRef} className="fan-explore-main">
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
          
          <div className="fan-explore-filter-pills">
            {['All', 'Online', 'Offline'].map(filter => (
              <div 
                key={filter}
                className="fan-explore-filter-btn"
                onClick={() => { setCreatorFilter(filter); setCurrentPage(1); }}
                style={{
                  background: creatorFilter === filter ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: creatorFilter === filter ? '700' : '500', color: creatorFilter === filter ? '#ffffff' : '#94a3b8' }}>{filter}</span>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#38bdf8' }}>
                  {filter === 'All' ? allCount : filter === 'Online' ? onlineCount : offlineCount}
                </span>
              </div>
            ))}
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

        {/* Pagination Controls at Bottom */}
        {filteredCreators.length > 0 && (
          <div className="fan-explore-pagination">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                onClick={() => {
                  setCurrentPage(p => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={currentPage === 1}
                style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  border: 'none', 
                  color: '#fff', 
                  fontSize: '18px', 
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  transition: 'background 0.2s',
                  opacity: currentPage === 1 ? 0.3 : 1
                }}
                onMouseEnter={e => { if(currentPage > 1) e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
                onMouseLeave={e => { if(currentPage > 1) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              >
                &lt;
              </button>
              <button 
                onClick={() => {
                  setCurrentPage(p => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={currentPage === totalPages || totalPages === 0}
                style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  border: 'none', 
                  color: '#fff', 
                  fontSize: '18px', 
                  cursor: (currentPage === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  transition: 'background 0.2s',
                  opacity: (currentPage === totalPages || totalPages === 0) ? 0.3 : 1
                }}
                onMouseEnter={e => { if(currentPage < totalPages) e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
                onMouseLeave={e => { if(currentPage < totalPages) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              >
                &gt;
              </button>
            </div>
            <div style={{ color: '#94a3b8', fontSize: '14px' }}>
              Page {currentPage} of {Math.max(1, totalPages)} • {filteredCreators.length} creators
            </div>
          </div>
        )}
      </main>
      <FanBottomNav />
    </div>
  );
};

export default FanExplore;
