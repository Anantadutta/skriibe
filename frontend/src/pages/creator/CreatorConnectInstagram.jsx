import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCreatorOnboarding } from '../../context/CreatorOnboardingContext';
import { Button } from '../../components/ama/ui/Button';

const CreatorConnectInstagram = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setInstagramSkipped, setIgData } = useCreatorOnboarding();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const instagramStatus = params.get('instagram');
    const reason = params.get('reason');
    const err = params.get('error');

    if (instagramStatus === 'success') {
      const username = params.get('username');
      const followers = params.get('followers');
      const pic = params.get('pic');
      const name = params.get('name');
      
      const igDataObj = {
        handle: username,
        followers: followers ? parseInt(followers, 10) : 0,
        avatarUrl: pic ? decodeURIComponent(pic) : '',
        name: name ? decodeURIComponent(name) : ''
      };
      
      setIgData(igDataObj);
      
      // Redirect to profile with igData in URL so it can pre-fill
      const encodedData = encodeURIComponent(JSON.stringify(igDataObj));
      navigate(`/onboard/profile?igData=${encodedData}`, { state: { creator: location.state?.creator }, replace: true });
    } else if (instagramStatus === 'error' || err) {
      setError(`Failed to connect Instagram. Please try again. ${reason ? `(${reason})` : ''}`);
    }
  }, [location, navigate, setIgData]);

  const handleConnect = () => {
    setLoading(true);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const stateToken = localStorage.getItem('creator_token') || '';
    window.location.href = `${apiUrl}/auth/instagram?state=${stateToken}`;
  };

  const handleSkip = () => {
    setInstagramSkipped(true);
    navigate('/onboard/profile', { state: { creator: location.state?.creator } });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--ink)',
      display: 'flex',
      justifyContent: 'center',
      padding: '40px 20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        background: 'var(--ink2)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--ink5)',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        
        <div style={{ marginBottom: '32px' }}>
          {loading ? (
            <div style={{ 
              width: 64, 
              height: 64, 
              borderRadius: '50%', 
              border: '4px solid var(--ink5)', 
              borderTopColor: '#E1306C', 
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto'
            }} />
          ) : (
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '16px',
              background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2.162c3.204 0 3.584.012 4.849.07 1.366.062 2.633.344 3.608 1.612.975 1.267 1.258 2.535 1.32 3.9.058 1.265.07 1.645.07 4.849 0 3.204-.012 3.584-.07 4.849-.062 1.366-.344 2.633-1.612 3.608-1.267.975-2.535 1.258-3.9 1.32-1.265.058-1.645.07-4.849.07-3.204 0-3.584-.012-4.849-.07-1.366-.062-2.633-.344-3.608-1.612-.975-1.267-1.258-2.535-1.32-3.9-.058-1.265-.07-1.645-.07-4.849 0-3.204.012-3.584.07-4.849.062-1.366.344-2.633 1.612-3.608 1.267-.975 2.535-1.258 3.9-1.32 1.265-.058 1.645-.07 4.849-.07zm0-2.162C8.74 0 8.332.013 7.052.072 5.776.13 4.63.398 3.6 1.155c-1.03.757-1.848 1.838-2.378 3.125C.695 5.568.427 6.713.37 7.99.31 9.268.298 9.676.298 12.88c0 3.204.013 3.612.072 4.89.057 1.277.325 2.422 1.082 3.45.757 1.03 1.838 1.848 3.125 2.378 1.278.528 2.422.795 3.698.853 1.28.059 1.688.072 4.892.072 3.204 0 3.612-.013 4.89-.072 1.277-.058 2.422-.325 3.45-1.082 1.03-.757 1.848-1.838 2.378-3.125.528-1.278.795-2.422.853-3.698.059-1.28.072-1.688.072-4.892 0-3.204-.013-3.612-.072-4.89-.058-1.277-.325-2.422-1.082-3.45-.757-1.03-1.838-1.848-3.125-2.378-1.278-.528-2.422-.795-3.698-.853-1.28-.059-1.688-.072-4.892-.072z" fill="white"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm3.97-10.662a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" fill="white"/>
              </svg>
            </div>
          )}
        </div>

        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '24px',
          color: 'var(--white)',
          marginBottom: '16px'
        }}>
          Connect Instagram
        </h1>
        
        <p style={{
          fontSize: '15px',
          color: 'var(--g2)',
          lineHeight: '1.5',
          marginBottom: '40px'
        }}>
          Sync your profile to auto-fill your details and show your follower count. Build trust with your audience instantly.
        </p>

        {error && (
          <div style={{ color: 'var(--red)', fontSize: '13px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button 
            onClick={handleConnect}
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
              color: 'var(--white)',
              border: 'none',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.8 : 1,
              transition: 'opacity 0.2s'
            }}
          >
            {loading ? 'Connecting...' : 'Connect Instagram'}
          </button>
          
          <button 
            onClick={handleSkip}
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'transparent',
              color: 'var(--g3)',
              border: '1px solid var(--ink5)',
              fontSize: '15px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if(!loading) {
                e.currentTarget.style.color = 'var(--white)';
                e.currentTarget.style.borderColor = 'var(--g2)';
              }
            }}
            onMouseLeave={(e) => {
              if(!loading) {
                e.currentTarget.style.color = 'var(--g3)';
                e.currentTarget.style.borderColor = 'var(--ink5)';
              }
            }}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatorConnectInstagram;
