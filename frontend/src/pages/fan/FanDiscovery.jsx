import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import CreatorCard from '../../components/discovery/CreatorCard';
import FanNavbar from '../../components/fan/layout/FanNavbar';
import { getLiveCreators } from '../../services/discoveryApi';
import { io } from 'socket.io-client';



const categories = [
  { id: 'All', label: 'All creators', query: 'All creators' },
  { id: 'Tech', label: '💻 Tech', query: 'Tech' },
  { id: 'Finance', label: '💰 Finance', query: 'Finance' },
  { id: 'Fitness', label: '💪 Fitness', query: 'Fitness' },
  { id: 'Music', label: '🎧 Music', query: 'Music' },
  { id: 'Art', label: '🎨 Art', query: 'Art' },
  { id: 'Gaming', label: '🎮 Gaming', query: 'Gaming' },
  { id: 'SIP', label: '📈 SIP/Mutual Funds', query: 'SIP' },
  { id: 'Stock', label: '📊 Stock Trading', query: 'Stock Trading' },
  { id: 'Career', label: '🚀 Career Coaching', query: 'Career Coaching' },
  { id: 'Tax', label: '🧾 Tax Planning', query: 'Tax Planning' },
  { id: 'RealEstate', label: '🏠 Real Estate', query: 'Real Estate' }
];

const FanDiscovery = () => {
  const [creators, setCreators] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

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

  // filteredCreators is now just the creators state (filtered by backend)
  const filteredCreators = creators;

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
      <main style={{ flex: 1, padding: '40px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: '40px' }}>
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
          
          <h1 style={{ fontSize: '64px', fontWeight: '800', lineHeight: '1.1', margin: '0 0 16px 0', letterSpacing: '-2px' }}>
            Ask anyone.<br />
            <span style={{ 
              background: 'linear-gradient(90deg, #38bdf8 0%, #a78bfa 50%, #34d399 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Get a real answer.
            </span>
          </h1>
          
          <p style={{ color: '#94a3b8', fontSize: '18px', maxWidth: '460px', lineHeight: '1.5', margin: 0 }}>
            Skip the unread DMs. Pay your favourite creators to actually reply — usually within hours.
          </p>
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

          {/* Filter Chips */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button 
              onClick={toggleLiveFilter}
              style={{
              background: isLiveFilter ? '#10b981' : 'rgba(255,255,255,0.03)',
              color: isLiveFilter ? '#000' : '#94a3b8',
              border: isLiveFilter ? 'none' : '1px solid rgba(255,255,255,0.05)',
              borderRadius: '20px',
              padding: '10px 20px',
              fontWeight: '700',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}>
              <div style={{ width: '6px', height: '6px', background: isLiveFilter ? '#000' : '#10b981', borderRadius: '50%' }} />
              Live now
            </button>
            
            {categories.map(cat => (
              <button 
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                style={{
                  background: activeCategory === cat.id ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.03)',
                  border: '1px solid',
                  borderColor: activeCategory === cat.id ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.05)',
                  color: activeCategory === cat.id ? '#fff' : '#94a3b8',
                  borderRadius: '20px',
                  padding: '10px 20px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Right Now Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '16px', height: '16px', background: '#f43f5e', borderRadius: '50%', boxShadow: '0 0 12px rgba(244,63,94,0.6)' }} />
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>Live right now</h2>
          </div>
          <div style={{ color: '#94a3b8', fontSize: '14px' }}>
            {filteredCreators.length} creators
          </div>
        </div>

        {/* Creators Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px'
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
