import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CreatorCard from '../../components/discovery/CreatorCard';
import FanNavbar from '../../components/fan/layout/FanNavbar';
import FanBottomNav from '../../components/fan/layout/FanBottomNav';
import { getLiveCreators } from '../../services/discoveryApi';
import { getFanMe } from '../../services/fanApi';
import { io } from 'socket.io-client';

const FanDiscovery = () => {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fanName, setFanName] = useState('Fan');
  const navigate = useNavigate();

  const fetchCreators = async () => {
    setLoading(true);
    try {
      const data = await getLiveCreators({});
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
    fetchCreators();

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

  const topCreators = creators.filter(c => !c.isPaused).slice(0, 4);

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

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', marginTop: '32px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
            Trending creators
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          {topCreators.map(creator => (
            <CreatorCard key={creator.id || creator.handle} creator={creator} />
          ))}
          
          {topCreators.length === 0 && !loading && (
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
