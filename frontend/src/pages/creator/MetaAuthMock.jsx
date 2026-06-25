import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreatorOnboarding } from '../../context/CreatorOnboardingContext';

const MetaAuthMock = () => {
  const navigate = useNavigate();
  const { setIgData } = useCreatorOnboarding();

  // Detect when the user clicks "Back" from instagram.com
  useEffect(() => {
    if (sessionStorage.getItem('mock_ig_auth') === 'pending') {
      sessionStorage.removeItem('mock_ig_auth');
      
      const igDataObj = {
        name: 'Alex Johnson',
        handle: 'alexj_official',
        followers: 125400,
        bio: 'Creating content every day! 🌟',
        avatarUrl: '' // Can leave blank or add a valid image URL
      };
      
      setIgData(igDataObj);
      const encodedData = encodeURIComponent(JSON.stringify(igDataObj));
      navigate(`/onboard/profile?igData=${encodedData}`, { replace: true });
    }
  }, [navigate, setIgData]);

  const handleAllow = () => {
    // Set flag and redirect to real Instagram
    sessionStorage.setItem('mock_ig_auth', 'pending');
    window.location.href = 'https://www.instagram.com/';
  };

  const handleDeny = () => {
    navigate('/onboard/profile?instagram=error&reason=access_denied', { replace: true });
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#fafafa',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #dbdbdb',
        borderRadius: '8px',
        padding: '40px',
        maxWidth: '400px',
        width: '90%',
        boxSizing: 'border-box',
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
      }}>
        {/* Instagram Wordmark Logo */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
          <svg width="103" height="29" viewBox="0 0 103 29" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.15 15.35c-1.39 0-2.45-1.12-2.45-2.5 0-1.4.1.64-2.5 2.5 1.4-1.39 2.5-2.46 2.5s-1.1-2.5-2.5-2.5c0 1.4 1.11 2.5 2.5 2.5z" fill="#262626"/>
            <text x="0" y="22" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="bold" fill="#262626" letterSpacing="-1">Instagram</text>
          </svg>
        </div>

        {/* Skriibe App Context */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#a0a0a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dbdbdb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
          <div style={{ width: '60px', height: '60px', borderRadius: '16px', backgroundColor: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '10px', letterSpacing: '1px' }}>SKRIIBE</span>
          </div>
        </div>

        <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#262626', margin: '0 0 16px' }}>
          Skriibe wants to access your Instagram account
        </h2>
        
        <p style={{ fontSize: '14px', color: '#737373', margin: '0 0 24px', lineHeight: '1.5' }}>
          Skriibe is requesting access to your:
          <br /><br />
          <span style={{ display: 'block', textAlign: 'left', background: '#f8f8f8', padding: '12px', borderRadius: '8px', color: '#262626' }}>
            • Profile and username<br />
            • Follower count<br />
            • Account type (Business/Creator)
          </span>
        </p>

        <p style={{ fontSize: '12px', color: '#8e8e8e', margin: '0 0 24px', lineHeight: '1.5' }}>
          By clicking Allow, you authorize Skriibe to access your Instagram information in accordance with their Privacy Policy and Terms of Service.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            onClick={handleAllow}
            style={{
              backgroundColor: '#0095f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Allow
          </button>
          <button 
            onClick={handleDeny}
            style={{
              backgroundColor: 'transparent',
              color: '#0095f6',
              border: 'none',
              padding: '12px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
      
      <div style={{ marginTop: '32px', fontSize: '12px', color: '#8e8e8e' }}>
        from Meta
      </div>
    </div>
  );
};

export default MetaAuthMock;
