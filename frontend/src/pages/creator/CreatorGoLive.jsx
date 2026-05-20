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
    // If no creator data, we should try to navigate back or to dashboard
    if (!creatorData) {
      navigate('/onboard/profile');
    }
  }, [creatorData, navigate]);

  const handleShare = async () => {
    const rawUrl = `skriibe.in/@${creatorData?.handle || 'creator'}`;
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

  // Generate 25 CSS confetti pieces
  const confettiColors = ['#3DD9FF', '#FF007A', '#FFD700', '#22C55E', '#AA00FF'];
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
      padding: '40px 20px',
      position: 'relative'
    }}>
      {/* CSS Confetti Keyframes and Animation */}
      <style>
        {`
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
        `}
      </style>

      {/* MONOSPACED LABEL OUTSIDE PHONE FRAME */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '13px',
        color: 'var(--g3)',
        letterSpacing: '0.1em',
        marginBottom: '20px',
        textTransform: 'uppercase',
        fontWeight: 'bold'
      }}>
        
      </div>

      <PhoneFrame>
        <div style={{
          padding: '40px 20px 80px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
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
                opacity: 0.8,
                animation: `confettiFall ${piece.duration}s linear ${piece.delay}s infinite`,
                pointerEvents: 'none',
                zIndex: 1
              }}
            />
          ))}

          {/* LARGE CHECKMARK ICON WITH ANIMATION */}
          <div style={{
            position: 'relative',
            zIndex: 2,
            marginTop: '20px',
            marginBottom: '24px'
          }}>
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
              <circle
                cx="36"
                cy="36"
                r="33"
                stroke="#3DD9FF"
                strokeWidth="4"
                style={{
                  opacity: 0.15
                }}
              />
              <circle
                cx="36"
                cy="36"
                r="33"
                stroke="#3DD9FF"
                strokeWidth="4"
                strokeDasharray="210"
                strokeDashoffset="210"
                style={{
                  animation: 'drawCheck 0.6s ease-out forwards'
                }}
              />
              <path
                d="M24 36 L32 44 L48 26"
                stroke="#3DD9FF"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="40"
                strokeDashoffset="40"
                style={{
                  animation: 'drawCheck 0.4s ease-out 0.4s forwards'
                }}
              />
            </svg>
          </div>

          {/* HEADING & SUBTEXT */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '24px',
              fontWeight: 700,
              color: 'var(--white)',
              margin: '0 0 8px'
            }}>
              You're live! 🎉
            </h1>
            <p style={{
              color: 'var(--g2)',
              fontSize: '12px',
              lineHeight: '1.5',
              margin: '0 0 32px'
            }}>
              Your skriibe page is now active
            </p>
          </div>

          {/* PROMINENT URL BLOCK */}
          <div style={{
            width: '100%',
            background: '#141420',
            border: '1px solid #2a2a3e',
            borderRadius: '14px',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '40px',
            position: 'relative',
            zIndex: 2
          }}>
            <span style={{
              color: 'var(--white)',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              fontWeight: 'bold',
              letterSpacing: '-0.02em'
            }}>
              skriibe.in/@{creatorData?.handle || 'creator'}
            </span>

            {/* LIVE Badge with LivePulse */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(34, 197, 94, 0.08)',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              borderRadius: '6px',
              padding: '2px 8px'
            }}>
              <LivePulse />
              <span style={{
                color: '#22C55E',
                fontSize: '9px',
                fontWeight: 'bold',
                fontFamily: 'var(--font-mono)'
              }}>
                LIVE
              </span>
            </div>
          </div>

          {/* STACKED ACTION BUTTONS */}
          <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            position: 'absolute',
            bottom: '16px',
            left: '20px',
            right: '20px',
            zIndex: 10
          }}>
            {/* Primary CTA */}
            <button
              onClick={handleGoToPage}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '14px',
                background: '#3DD9FF',
                color: '#000000',
                fontWeight: 500,
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'none'
              }}
            >
              Go to my page →
            </button>

            {/* Secondary CTA */}
            <button
              onClick={handleShare}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '14px',
                background: 'transparent',
                color: 'var(--white)',
                fontWeight: 500,
                fontSize: '14px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {copied ? 'Link Copied! ✓' : 'Share now'}
            </button>
          </div>
        </div>
      </PhoneFrame>
    </div>
  );
};

export default CreatorGoLive;
