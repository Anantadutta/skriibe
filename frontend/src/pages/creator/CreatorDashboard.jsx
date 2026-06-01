/**
 * @file CreatorDashboard.jsx
 * @description Home dashboard placeholder page.
 */

import React, { useState, useEffect } from 'react';
import { PhoneFrame } from '../../components/ama/layout/PhoneFrame';
import { BottomNav } from '../../components/ama/layout/BottomNav';
import api from '../../services/api';

const CreatorDashboard = () => {
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/creator/me');
        if (res.data && res.data.creator) {
          setIsLive(res.data.creator.isLive || false);
        }
      } catch (err) {
        console.error('Failed to fetch creator profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const toggleLiveStatus = async () => {
    const newStatus = !isLive;
    setIsLive(newStatus); // optimistic update
    try {
      await api.patch('/creator/live-status', { isLive: newStatus });
    } catch (err) {
      console.error('Failed to update live status', err);
      setIsLive(!newStatus); // revert on error
    }
  };
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0B0B10',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative'
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '13px',
        color: 'var(--g3)',
        letterSpacing: '0.1em',
        marginBottom: '20px',
        textTransform: 'uppercase',
        fontWeight: 'bold'
      }}>
        C6 — DASHBOARD — HOME
      </div>

      <PhoneFrame>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: '20px',
          boxSizing: 'border-box',
          position: 'relative'
        }}>
          <span style={{ fontSize: '40px', marginBottom: '16px' }}>🏠</span>
          <h2 style={{ color: '#ffffff', fontSize: '18px', fontWeight: 'bold', margin: '0 0 8px' }}>
            Home Dashboard
          </h2>
          <p style={{ color: 'var(--g3)', fontSize: '12px', margin: '0 0 24px' }}>
            Manage your live presence
          </p>

          {!loading && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '24px',
              borderRadius: '16px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{ 
                color: isLive ? '#22c55e' : 'var(--g3)', 
                fontWeight: 'bold',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {isLive && <span style={{
                  width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e',
                  boxShadow: '0 0 10px #22c55e'
                }} />}
                {isLive ? 'YOU ARE LIVE' : 'YOU ARE OFFLINE'}
              </div>
              
              <button
                onClick={toggleLiveStatus}
                style={{
                  background: isLive ? 'rgba(255,255,255,0.1)' : 'linear-gradient(90deg, #F93026, #FF6F00)',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '100px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  width: '100%',
                  transition: '0.2s ease'
                }}
              >
                {isLive ? 'Go Offline' : 'Go LIVE Now'}
              </button>
            </div>
          )}

          <BottomNav activeTab="home" />
        </div>
      </PhoneFrame>
    </div>
  );
};

export default CreatorDashboard;
