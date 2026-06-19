/**
 * @file CreatorSettings.jsx
 * @description Settings placeholder page.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhoneFrame } from '../../components/ama/layout/PhoneFrame';
import { BottomNav } from '../../components/ama/layout/BottomNav';
import { getMe } from '../../services/creatorApi';

const CreatorSettings = () => {
  const navigate = useNavigate();
  const [creator, setCreator] = useState(null);

  useEffect(() => {
    getMe().then(res => {
      if (res.success && res.creator) {
        setCreator(res.creator);
      }
    }).catch(console.error);
  }, []);

  const username = creator?.username || creator?.handle || '';

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
        C11 — SETTINGS
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
          position: 'relative',
          gap: '24px'
        }}>
          <div>
            <span style={{ fontSize: '40px', marginBottom: '16px', display: 'block' }}>⚙️</span>
            <h2 style={{ color: '#ffffff', fontSize: '18px', fontWeight: 'bold', margin: '0 0 8px' }}>
              Account Settings
            </h2>
            <p style={{ color: 'var(--g3)', fontSize: '12px', margin: 0 }}>
              Your settings management is coming soon
            </p>
          </div>

          <button 
            onClick={() => {
              if (username) navigate(`/${username}?preview=true`);
            }}
            style={{
              background: 'linear-gradient(90deg, #7c3aed 0%, #06b6d4 100%)',
              border: 'none',
              borderRadius: '9999px',
              padding: '16px 40px',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 4px 20px rgba(124, 58, 237, 0.3)',
              transition: 'transform 0.2s',
              marginTop: '16px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span style={{ fontSize: '18px', fontWeight: '800' }}>Preview Page</span>
            <span style={{ fontSize: '16px', fontWeight: '800' }}>→</span>
          </button>

          <BottomNav activeTab="settings" />
        </div>
      </PhoneFrame>
    </div>
  );
};

export default CreatorSettings;
