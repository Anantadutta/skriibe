import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ChooseRole = () => {
  const navigate = useNavigate();
  const { setAuthData, roles } = useAuth();
  const [loading, setLoading] = useState(false);

  const switchRole = async (role) => {
    setLoading(true);
    try {
      const res = await api.post('/fan-auth/switch-role', { role });
      if (res.data.success) {
        setAuthData(roles, role, res.data.token);
      }
      if (role === 'creator') {
        navigate('/creator/dashboard');
      } else {
        navigate('/discovery');
      }
    } catch (error) {
      console.error('Failed to switch role', error);
      // Fallback navigation if API fails
      if (role === 'creator') {
        navigate('/creator/dashboard');
      } else {
        navigate('/discovery');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #0B0E14, #050608)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      color: 'white'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '24px',
        padding: '32px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow effect */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '200px',
          height: '100px',
          background: 'linear-gradient(180deg, rgba(6, 182, 212, 0.15) 0%, rgba(6, 182, 212, 0) 100%)',
          filter: 'blur(30px)',
          pointerEvents: 'none'
        }} />

        <div style={{
          width: '64px',
          height: '64px',
          background: 'rgba(6, 182, 212, 0.1)',
          border: '1px solid rgba(6, 182, 212, 0.2)',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          fontSize: '28px'
        }}>
          👋
        </div>

        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          margin: '0 0 12px 0',
          fontFamily: 'var(--font-heading)'
        }}>Welcome back!</h1>
        
        <p style={{
          color: '#94a3b8',
          fontSize: '15px',
          lineHeight: '1.6',
          margin: '0 0 32px 0'
        }}>
          How would you like to continue today?
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button 
            onClick={() => switchRole('fan')}
            disabled={loading}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '16px',
              borderRadius: '16px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <span style={{ fontSize: '20px' }}>🌟</span>
            Continue as Fan
          </button>

          <button 
            onClick={() => switchRole('creator')}
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              border: 'none',
              padding: '16px',
              borderRadius: '16px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 15px rgba(6, 182, 212, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(6, 182, 212, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(6, 182, 212, 0.3)';
            }}
          >
            <span style={{ fontSize: '20px' }}>🎨</span>
            Go to Creator Studio
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChooseRole;
