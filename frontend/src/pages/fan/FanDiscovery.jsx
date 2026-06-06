import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import CreatorCard from '../../components/discovery/CreatorCard';
import FanNavbar from '../../components/fan/layout/FanNavbar';
import { getLiveCreators } from '../../services/discoveryApi';
import { getFanMe } from '../../services/fanApi';
import { io } from 'socket.io-client';



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

const FanDiscovery = () => {
  const [creators, setCreators] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [fanName, setFanName] = useState('Fan');

  const [isLiveFilter, setIsLiveFilter] = useState(false);

  // Debounce ref
  const debounceTimeout = useRef(null);

  const fetchCreators = async (query = '', cat = 'All creators', liveOnly = false) => {
    setLoading(true);
    try {
      const params = {};
      if (query) params.search = query;
      if (cat !== 'All') {
        const catObj = categories.find(c => c.id === cat);
        if (catObj) params.category = catObj.query;
      }
      if (liveOnly) params.live = 'true';

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
    // Initial fetch
    fetchCreators(searchQuery, activeCategory, isLiveFilter);

    // Fetch fan profile
    const fetchFanProfile = async () => {
      try {
        const res = await getFanMe();
        if (res.success && res.fan && res.fan.name) {
          setFanName(res.fan.name.split(' ')[0]);
        }
      } catch (err) {
        console.error('Failed to fetch fan profile', err);
      }
    };
    fetchFanProfile();

    // Socket.IO setup
    const socket = io('http://localhost:5000');
    socket.on('creator-status-changed', ({ creatorId, isLive }) => {
      setCreators(prev => prev.map(c => 
        c.id === creatorId ? { ...c, isLive } : c
      ));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Handle Search Input with Debounce (300ms)
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      fetchCreators(val, activeCategory, isLiveFilter);
    }, 300);
  };

  // Handle Category Click
  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    fetchCreators(searchQuery, cat, isLiveFilter);
  };

  // Handle Live Filter Toggle
  const toggleLiveFilter = () => {
    const newLive = !isLiveFilter;
    setIsLiveFilter(newLive);
    fetchCreators(searchQuery, activeCategory, newLive);
  };

  // Filter locally so socket updates instantly remove offline creators if filter is active
  const filteredCreators = isLiveFilter ? creators.filter(c => c.isLive) : creators;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      color: '#ffffff',
      fontFamily: 'Inter, var(--font-body, sans-serif)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Navbar */}
      <FanNavbar />

      {/* Main Content */}
      <main style={{ flex: 1, padding: 'min(40px, 5vw)', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: '16px' }}>
          
          {/* Personalized Fan Greeting Card */}
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
            {/* Purple glow on the left */}
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

            {/* Avatar */}
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
              zIndex: 1
            }}>
              {fanName.charAt(0).toUpperCase()}
            </div>

            {/* Greeting Text */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', zIndex: 1 }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Hey <span style={{ color: '#2DD4BF' }}>{fanName}</span> <span style={{ fontSize: '1.1rem' }}>👋</span>
              </div>
              <div style={{ fontSize: '0.85rem' }}>
                <span style={{ color: '#94a3b8' }}>On your mind today 💭: </span>
                <span style={{ color: '#64748b' }}>Need to consult on SIPs? 📈</span>
              </div>
            </div>
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            padding: '6px 16px',
            borderRadius: '20px',
            color: '#10b981',
            fontWeight: '700',
            fontSize: '12px',
            letterSpacing: '1px',
            marginBottom: '24px'
          }}>
            <div style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px #10b981' }} />
            {creators.length} CREATORS LIVE NOW
          </div>
          
          <h1 style={{ fontSize: '36px', fontWeight: '800', lineHeight: '1.1', margin: '0 0 16px 0', letterSpacing: '-2px', textAlign: 'left', width: 'fit-content', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
            Ask anyone.<br />
            <span style={{ 
              background: 'linear-gradient(90deg, #38bdf8 0%, #a78bfa 50%, #34d399 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              whiteSpace: 'nowrap'
            }}>
              Get a real answer.
            </span>
          </h1>
          

        </div>

        {/* Search & Filters */}
        <div style={{ marginBottom: '40px' }}>
          {/* Search Bar */}
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

          {/* Filter Chips / Dropdown */}
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
              {/* Custom arrow */}
              <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94a3b8', fontSize: '10px' }}>
                ▼
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Section Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isLiveFilter && <div style={{ width: '16px', height: '16px', background: '#f43f5e', borderRadius: '50%', boxShadow: '0 0 12px rgba(244,63,94,0.6)' }} />}
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
              {isLiveFilter ? 'Live right now' : (searchQuery ? 'Search results' : 'All creators')}
            </h2>
          </div>
          <div style={{ color: '#94a3b8', fontSize: '14px' }}>
            {filteredCreators.length} creators
          </div>
        </div>

        {/* Creators Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '20px'
        }}>
          {filteredCreators.map(creator => (
            <CreatorCard key={creator.id || creator.handle} creator={creator} />
          ))}
          
          {filteredCreators.length === 0 && (
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
    </div>
  );
};

export default FanDiscovery;
