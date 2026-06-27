import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Button } from '../../components/ama/ui/Button';

const CreatorShare = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const creatorData = location.state?.creator;
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!creatorData) {
      navigate('/creator/dashboard');
      return;
    }

    // Trigger confetti
    var duration = 3 * 1000;
    var animationEnd = Date.now() + duration;
    var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    var interval = setInterval(function() {
      var timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      var particleCount = 50 * (timeLeft / duration);
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);

    return () => clearInterval(interval);
  }, [creatorData, navigate]);

  const profileUrl = `skriibe.com/${creatorData?.handle || 'creator'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'rgba(59, 168, 216, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px'
        }}>
          <span style={{ fontSize: '32px' }}>🎉</span>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '28px',
          color: 'var(--white)',
          marginBottom: '16px'
        }}>
          You're live!
        </h1>
        
        <p style={{
          fontSize: '15px',
          color: 'var(--g2)',
          lineHeight: '1.5',
          marginBottom: '40px'
        }}>
          Your creator page is ready. Share this link on your Instagram bio to start getting paid questions.
        </p>

        <div style={{
          width: '100%',
          padding: '16px',
          background: 'var(--ink3)',
          border: '1px solid var(--ink5)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ color: 'var(--white)', fontFamily: 'var(--font-mono)', fontSize: '15px' }}>
            {profileUrl}
          </span>
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Button onClick={handleCopy}>
            {copied ? 'Copied! ✓' : 'Copy Link'}
          </Button>
          
          <button 
            onClick={() => navigate('/creator/dashboard')}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'transparent',
              color: 'var(--g3)',
              border: '1px solid var(--ink5)',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--white)';
              e.currentTarget.style.borderColor = 'var(--g2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--g3)';
              e.currentTarget.style.borderColor = 'var(--ink5)';
            }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatorShare;
