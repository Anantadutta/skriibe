import React, { useState, useEffect } from 'react';
import CreatorCard from '../../components/discovery/CreatorCard';
import FanNavbar from '../../components/fan/layout/FanNavbar';
import FanBottomNav from '../../components/fan/layout/FanBottomNav';
import { getLiveCreators } from '../../services/discoveryApi';
import { io } from 'socket.io-client';

const FanExplore = () => {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);

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
        <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: '700' }}>All creators</h2>
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
            </div>
          )}
        </div>
      </main>
      <FanBottomNav />
    </div>
  );
};

export default FanExplore;
