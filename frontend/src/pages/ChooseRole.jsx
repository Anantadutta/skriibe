import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { switchRole } from '../services/fanApi';
import { useAuth } from '../context/AuthContext';

const ChooseRole = () => {
  const navigate = useNavigate();
  const { setAuthData, roles } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSwitch = async (role) => {
    setLoading(true);
    try {
      const res = await switchRole(role);
      if (res.success) {
        setAuthData(roles, res.activeRole);
        if (role === 'creator') {
          navigate('/creator/dashboard');
        } else {
          navigate('/explore');
        }
      }
    } catch (err) {
      console.error('Failed to switch role', err);
      alert('Failed to switch role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      color: '#ffffff',
      fontFamily: 'var(--font-body)'
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '40px 30px',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          marginBottom: '10px',
          fontFamily: 'var(--font-heading)'
        }}>Welcome back! Who are you today?</h1>
        <p style={{
          color: '#94a3b8',
          fontSize: '14px',
          marginBottom: '40px'
        }}>
          Choose how you want to continue your session.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <button
            disabled={loading}
            onClick={() => handleSwitch('fan')}
            style={{
              padding: '20px',
              background: 'rgba(6, 182, 212, 0.1)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              borderRadius: '12px',
              color: '#06b6d4',
              fontSize: '18px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.background = 'rgba(6, 182, 212, 0.2)';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.background = 'rgba(6, 182, 212, 0.1)';
            }}
          >
            <span style={{ fontSize: '24px' }}>🎧</span> Continue as Fan
          </button>

          <button
            disabled={loading}
            onClick={() => handleSwitch('creator')}
            style={{
              padding: '20px',
              background: 'rgba(124, 58, 237, 0.1)',
              border: '1px solid rgba(124, 58, 237, 0.3)',
              borderRadius: '12px',
              color: '#c084fc',
              fontSize: '18px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.background = 'rgba(124, 58, 237, 0.2)';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.background = 'rgba(124, 58, 237, 0.1)';
            }}
          >
            <span style={{ fontSize: '24px' }}>🎬</span> Go to Creator Studio
          </button>
        </div>
        
        {loading && (
          <div style={{ marginTop: '20px', color: '#94a3b8', fontSize: '14px' }}>
            Switching...
          </div>
        )}
      </div>
    </div>
  );
};

export default ChooseRole;
