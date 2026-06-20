import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CreatorCard from '../../components/discovery/CreatorCard';
import FanNavbar from '../../components/fan/layout/FanNavbar';
import FanBottomNav from '../../components/fan/layout/FanBottomNav';
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
  const [loading, setLoading] = useState(true);
  const [fanName, setFanName] = useState('Fan');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const debounceTimeout = useRef(null);
  const navigate = useNavigate();

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
          setFanName(res.fan.name.split(' ')[0]);
        }
      } catch (err) {
        console.error('Failed to fetch fan profile', err);
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

    return () => {
      socket.disconnect();
    };
  }, []);

  const filteredCreators = creators.filter(c => !c.isPaused);
  const isSearching = searchQuery !== '' || activeCategory !== 'All';
  const displayCreators = isSearching ? filteredCreators : filteredCreators.slice(0, 4);

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
              zIndex: 1
            }}>
              {fanName.charAt(0).toUpperCase()}
            </div>

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

        {/* Tips for a great question section */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#fff' }}>
            Tips for a great question
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Item 1 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#251b2e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>
                <span style={{ color: '#ef4444', fontWeight: '900' }}>?</span>
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px', color: '#fff' }}>Be clear and specific</div>
                <div style={{ fontSize: '14px', color: '#94a3b8' }}>Specific questions get better answers.</div>
              </div>
            </div>

            {/* Item 2 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#2e1921', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                ❤️
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px', color: '#fff' }}>Be respectful</div>
                <div style={{ fontSize: '14px', color: '#94a3b8' }}>Let's keep it kind and positive.</div>
              </div>
            </div>

            {/* Item 3 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#191f2e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                ✉️
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px', color: '#fff' }}>Message box</div>
                <div style={{ fontSize: '14px', color: '#94a3b8' }}>You can always ask another one!</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Categories Section */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.04)',
            borderRadius: '16px',
            padding: '12px 16px',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <span style={{ fontSize: '20px', marginRight: '12px' }}>🔍</span>
            <input
              type="text"
              placeholder="Search creators, @handles or topics..."
              value={searchQuery}
              onChange={handleSearchChange}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#ffffff',
                fontSize: '15px',
                fontFamily: 'var(--font-body)',
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '12px' }}>
            <div style={{ position: 'relative', width: '280px' }}>
              <select 
                value={activeCategory}
                onChange={(e) => handleCategoryClick(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.05)',
                  padding: '10px 40px 10px 16px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: '700',
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
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', marginTop: '32px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
            {isSearching ? 'Search results' : 'Trending creators'}
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          {displayCreators.map(creator => (
            <CreatorCard key={creator.id || creator.handle} creator={creator} />
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

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
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
    </div>
  );
};

export default FanDiscovery;
