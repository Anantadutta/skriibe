import React, { useState, useEffect, useRef } from 'react';
import CreatorCard from '../../components/discovery/CreatorCard';
import FanNavbar from '../../components/fan/layout/FanNavbar';
import FanBottomNav from '../../components/fan/layout/FanBottomNav';
import { getLiveCreators } from '../../services/discoveryApi';
import { io } from 'socket.io-client';

const PREDEFINED_CATEGORIES = [
  'Career & Finance', 'Health & Fitness', 'Tech & Skills', 
  'Fashion & Lifestyle', 'Daily Vlogs & Entertainment', 
  'Education', 'Business & Entrepreneurship', 'Relationships & Life', 
  'Spirituality'
];

const categories = [
  { id: 'All', label: 'All Categories', query: 'All creators' },
  { id: 'Career', label: 'Career & Finance', query: 'Career & Finance' },
  { id: 'Health', label: 'Health & Fitness', query: 'Health & Fitness' },
  { id: 'Tech', label: 'Tech & Skills', query: 'Tech & Skills' },
  { id: 'Fashion', label: 'Fashion & Lifestyle', query: 'Fashion & Lifestyle' },
  { id: 'Vlogs', label: 'Daily Vlogs & Entertainment', query: 'Daily Vlogs & Entertainment' },
  { id: 'Education', label: 'Education', query: 'Education' },
  { id: 'Business', label: 'Business & Entrepreneurship', query: 'Business & Entrepreneurship' },
  { id: 'Relationships', label: 'Relationships & Life', query: 'Relationships & Life' },
  { id: 'Spirituality', label: 'Spirituality', query: 'Spirituality' },
  { id: 'Others', label: 'Others', query: 'Others' }
];

const FanExplore = () => {
  const [creators, setCreators] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedCustomCategory, setSelectedCustomCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  // Debounce ref
  const debounceTimeout = useRef(null);

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

    return () => {
      socket.disconnect();
    };
  }, []);

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
    setSelectedCustomCategory(null);
    fetchCreators(searchQuery, cat);
  };

  const customCategories = React.useMemo(() => {
    if (activeCategory !== 'Others') return [];
    const allExpertise = creators.flatMap(c => c.expertise || []);
    const custom = allExpertise.filter(cat => !PREDEFINED_CATEGORIES.includes(cat) && cat !== 'Others');
    return [...new Set(custom)];
  }, [creators, activeCategory]);

  const filteredCreators = creators.filter(c => {
    if (c.isPaused) return false;
    if (activeCategory === 'Others' && selectedCustomCategory) {
      return (c.expertise || []).includes(selectedCustomCategory);
    }
    return true;
  });

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
      <main style={{ flex: 1, padding: 'min(40px, 5vw)', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
        
        {/* Search & Filters */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px'
          }}>
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

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '280px' }}>
              <select 
                value={activeCategory}
                onChange={(e) => handleCategoryClick(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.05)',
                  padding: '10px 40px 10px 20px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  outline: 'none',
                  cursor: 'pointer',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  width: '100%',
                  fontFamily: 'inherit'
                }}
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

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
              {searchQuery ? 'Search results' : 'Explore creators'}
            </h2>
          </div>
          <div style={{ color: '#94a3b8', fontSize: '14px' }}>
            {filteredCreators.length} creators
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '20px'
        }}>
          {filteredCreators.map(creator => (
            <CreatorCard key={creator.id || creator.handle} creator={creator} />
          ))}
          
          {filteredCreators.length === 0 && !loading && (
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
              <p style={{ color: '#94a3b8', margin: 0 }}>Try adjusting your search or category filter.</p>
            </div>
          )}
        </div>
      </main>
      <FanBottomNav />
    </div>
  );
};

export default FanExplore;
