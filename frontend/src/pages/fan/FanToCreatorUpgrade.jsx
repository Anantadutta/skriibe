import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { upgradeToCreator } from '../../services/fanApi';
import { useAuth } from '../../context/AuthContext';

const FanToCreatorUpgrade = () => {
  const navigate = useNavigate();
  const { setAuthData } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const doUpgrade = async () => {
      try {
        const res = await upgradeToCreator('', ' ', 'Others');
        if (res.success) {
          setAuthData(['fan', 'creator'], 'creator', res.token);
          navigate('/onboard/profile', { replace: true });
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Upgrade failed. Please try again.');
      }
    };
    doUpgrade();
  }, [navigate, setAuthData]);

  return (
    <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B0F19', color: '#fff' }}>
      {error ? (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#ef4444', marginBottom: '16px' }}>{error}</p>
          <button 
            onClick={() => navigate(-1)} 
            style={{ padding: '8px 16px', background: '#333', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}
          >
            Go Back
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '30px', height: '30px', border: '3px solid rgba(41, 197, 246, 0.3)', borderTopColor: '#29C5F6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <style>
            {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
          </style>
          <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500' }}>Preparing Creator Mode...</p>
        </div>
      )}
    </div>
  );
};

export default FanToCreatorUpgrade;
