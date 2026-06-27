/**
 * @file CreatorGoLive.jsx
 * @description Step 3 of onboarding: Go Live Confirmation (C5).
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PhoneFrame } from '../../components/ama/layout/PhoneFrame';
import { LivePulse } from '../../components/ama/ui/LivePulse';

const CreatorGoLive = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const creatorData = location.state?.creator;
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    // If no creator data, we should try to navigate back or to dashboard
    if (!creatorData) {
      navigate('/onboard/profile');
    }
  }, [creatorData, navigate]);

  const handleShare = async () => {
    const rawUrl = `skriibe.com/${creatorData?.handle || 'creator'}`;
    const fullUrl = `https://${rawUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'skriibe profile',
          text: 'Ask me anything on skriibe!',
          url: fullUrl
        });
      } catch (err) {
        // User cancelled or share failed, fallback to copy
        copyToClipboard(fullUrl);
      }
    } else {
      copyToClipboard(fullUrl);
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGoToPage = () => {
    navigate('/dashboard/share', { state: { creator: creatorData } });
  };

  // Generate 25 CSS confetti pieces using brand accent colors only (violet, cyan, hot pink)
  const confettiColors = ['#7c3aed', '#06b6d4', '#ff007a'];
  const confettiPieces = Array.from({ length: 25 }).map((_, index) => {
    const color = confettiColors[index % confettiColors.length];
    const left = `${Math.random() * 100}%`;
    const delay = Math.random() * 4; // seconds
    const duration = 3 + Math.random() * 3; // seconds
    const size = 6 + Math.random() * 6; // px
    return { color, left, delay, duration, size, id: index };
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Background Shader & Noise */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        background: '#0a0a0f',
        overflow: 'hidden',
        pointerEvents: 'none'
      }}>
        {/* Aurora purple, deep violet, electric blue waves */}
        <div style={{
          position: 'absolute',
          width: '180%',
          height: '180%',
          top: '-40%',
          left: '-40%',
          background: 'radial-gradient(circle at 30% 20%, rgba(124, 58, 237, 0.18) 0%, transparent 40%), radial-gradient(circle at 70% 80%, rgba(6, 182, 212, 0.18) 0%, transparent 40%), radial-gradient(circle at 50% 50%, rgba(147, 51, 234, 0.15) 0%, transparent 50%), radial-gradient(circle at 10% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 45%)',
          filter: 'blur(90px)',
          animation: 'aurora-flow 25s infinite alternate ease-in-out'
        }} />
        {/* Subtle noise/grain texture overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          opacity: 0.035,
          mixBlendMode: 'overlay',
          pointerEvents: 'none'
        }} />
        {/* Sparkle dots scattered */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div className="sparkle" style={{ top: '15%', left: '10%', animationDelay: '0s' }} />
          <div className="sparkle" style={{ top: '25%', left: '80%', animationDelay: '1.5s' }} />
          <div className="sparkle" style={{ top: '50%', left: '12%', animationDelay: '3s' }} />
          <div className="sparkle" style={{ top: '75%', left: '85%', animationDelay: '0.8s' }} />
          <div className="sparkle" style={{ top: '85%', left: '15%', animationDelay: '2.2s' }} />
        </div>
      </div>

      {/* CSS Keyframes and Animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes aurora-flow {
          0% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
          33% { transform: translate(20px, -30px) rotate(120deg) scale(1.05); }
          66% { transform: translate(-15px, 15px) rotate(240deg) scale(0.98); }
          100% { transform: translate(0px, 0px) rotate(360deg) scale(1); }
        }
        @keyframes sparkle-pulse {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2) rotate(45deg); }
        }
        .sparkle {
          position: absolute;
          width: 3px;
          height: 3px;
          background: #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 6px #06b6d4, 0 0 10px #7c3aed;
          animation: sparkle-pulse 4s infinite ease-in-out;
        }
        @keyframes confettiFall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(680px) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes drawCheck {
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes pulseCheck {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 8px rgba(124, 58, 237, 0.4)); }
          50% { transform: scale(1.06); filter: drop-shadow(0 0 16px rgba(124, 58, 237, 0.7)); }
        }
        @keyframes emoji-shake {
          0%, 100% { transform: rotate(-15deg) scale(1); }
          50% { transform: rotate(15deg) scale(1.15); }
        }
        .gradient-title {
          font-family: var(--font-heading);
          font-size: 26px;
          font-weight: 800;
          background: linear-gradient(90deg, #7c3aed 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .live-pulse-dot {
          width: 8px;
          height: 8px;
          background-color: #22c55e;
          border-radius: 50%;
          box-shadow: 0 0 8px #22c55e;
          animation: pulse-live 1.5s infinite ease-in-out;
        }
        @keyframes pulse-live {
          0%, 100% { opacity: 0.4; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.25); }
        }
         .primary-cta-btn {
          width: 100%;
          max-width: 280px;
          padding: 14px 28px;
          border-radius: 9999px;
          background: linear-gradient(90deg, #7c3aed 0%, #06b6d4 100%);
          color: #ffffff;
          font-weight: 700;
          font-size: 14px;
          border: none;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2);
        }
        .primary-cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 20px #7c3aed;
        }
        .primary-cta-btn:active {
          transform: translateY(0);
        }
        .secondary-cta-btn {
          width: 100%;
          max-width: 280px;
          padding: 13px 28px;
          border-radius: 9999px;
          background: transparent;
          color: #ffffff;
          font-weight: 700;
          font-size: 14px;
          border: 2px solid #7c3aed;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .secondary-cta-btn:hover {
          background: rgba(124, 58, 237, 0.1);
          box-shadow: 0 0 15px rgba(124, 58, 237, 0.3);
          transform: translateY(-2px);
        }
        .secondary-cta-btn:active {
          transform: translateY(0);
        }
      `}} />

      {/* Main Page Container */}
      <div style={{
        width: '100%',
        maxWidth: '480px',
        minHeight: '100vh',
        padding: '40px 16px',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 1
      }}>
        
        <PhoneFrame>
          <div style={{
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            textAlign: 'center',
            height: '100%',
            boxSizing: 'border-box',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Confetti Render inside PhoneFrame */}
            {confettiPieces.map(piece => (
              <div
                key={piece.id}
                style={{
                  position: 'absolute',
                  top: '-20px',
                  left: piece.left,
                  width: `${piece.size}px`,
                  height: `${piece.size * 1.5}px`,
                  background: piece.color,
                  borderRadius: '2px',
                  opacity: 0.85,
                  animation: `confettiFall ${piece.duration}s linear ${piece.delay}s infinite`,
                  pointerEvents: 'none',
                  zIndex: 1
                }}
              />
            ))}

            {/* LARGE CHECKMARK ICON WITH NEON VIOLET RING AND CYAN CHECK */}
            <div style={{
              position: 'relative',
              zIndex: 2,
              marginTop: '10px',
              marginBottom: '10px',
              animation: 'pulseCheck 3s infinite ease-in-out',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="80" height="80" viewBox="0 0 72 72" fill="none">
                {/* Glowing ring background */}
                <circle
                  cx="36"
                  cy="36"
                  r="33"
                  stroke="#7c3aed"
                  strokeWidth="4"
                  style={{
                    opacity: 0.25
                  }}
                />
                <circle
                  cx="36"
                  cy="36"
                  r="33"
                  stroke="#7c3aed"
                  strokeWidth="4"
                  strokeDasharray="210"
                  strokeDashoffset="210"
                  style={{
                    animation: 'drawCheck 0.7s ease-out forwards'
                  }}
                />
                <path
                  d="M24 36 L32 44 L48 26"
                  stroke="#06b6d4"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="40"
                  strokeDashoffset="40"
                  style={{
                    animation: 'drawCheck 0.4s ease-out 0.5s forwards'
                  }}
                />
              </svg>
            </div>

            {/* HEADING & SUBTEXT */}
            <div style={{ position: 'relative', zIndex: 10 }}>
              <h1 style={{
                margin: '0 0 10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                position: 'relative',
                zIndex: 10
              }}>
                <span className="gradient-title">You're live!</span>
                <span style={{
                  fontSize: '2em',
                  display: 'inline-block',
                  lineHeight: '1',
                  animation: 'emoji-shake 0.3s infinite ease-in-out'
                }}>
                  🎉
                </span>
              </h1>
              <p style={{
                color: '#94a3b8',
                fontSize: '13px',
                fontWeight: 500,
                lineHeight: '1.6',
                margin: '0'
              }}>
                Your skriibe page is now active
              </p>
            </div>

            {/* WRAPPER CONTAINING LIVE URL PILL, GO TO MY PAGE, AND SHARE NOW */}
            <div style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              position: 'relative',
              boxSizing: 'border-box',
              zIndex: 10
            }}>
              {/* PROMINENT URL BLOCK — Glassmorphism style */}
              <div style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '999px',
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative',
                boxSizing: 'border-box'
              }}>
                <span style={{
                  color: '#ffffff',
                  fontFamily: 'monospace, var(--font-mono)',
                  fontSize: '14px',
                  fontWeight: 800,
                  letterSpacing: '-0.02em'
                }}>
                  skriibe.com/{creatorData?.handle || 'creator'}
                </span>

                {/* LIVE Badge with pulse dot */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(34, 197, 94, 0.08)',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  borderRadius: '6px',
                  padding: '2px 8px'
                }}>
                  <div className="live-pulse-dot" />
                  <span style={{
                    color: '#22c55e',
                    fontSize: '9px',
                    fontWeight: 800,
                    fontFamily: 'monospace, var(--font-mono)'
                  }}>
                    LIVE
                  </span>
                </div>
              </div>

              {/* Primary CTA */}
              <button
                onClick={handleGoToPage}
                className="primary-cta-btn"
              >
                Go to my page →
              </button>

              {/* Secondary CTA */}
              <button
                onClick={handleShare}
                className="secondary-cta-btn"
              >
                {copied ? 'Link Copied! ✓' : 'Share now'}
              </button>
            </div>
          </div>
        </PhoneFrame>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          color: '#94a3b8',
          fontSize: '11px',
          fontFamily: 'var(--font-mono), monospace',
          marginTop: '24px',
          opacity: 0.75
        }}>
          Made with 🤍 from Skriibe
        </div>

      </div>
    </div>
  );
};

export default CreatorGoLive;
