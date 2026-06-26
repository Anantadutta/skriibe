import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const SmartLoginRedirect = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('skriibe_token');
      
      try {
        const res = await api.get('/auth/status');
        const data = res.data;

        if (data.authenticated && data.isCreator) {
          const { isLive, handle } = data.creator;

          if (isLive) {
            navigate('/creator/dashboard', { replace: true });
          } else if (handle) {
            navigate('/onboard/pricing', { replace: true });
          } else {
            navigate('/onboard/profile', { replace: true });
          }
        } else {
          setLoading(false);
        }
      } catch (err) {
        setLoading(false);
      }
    };

    checkSession();
  }, [navigate]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(6, 182, 212, 0.1)',
          borderTop: '3px solid #06b6d4',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}} />
      </div>
    );
  }

  return <>{children}</>;
};

export default SmartLoginRedirect;
