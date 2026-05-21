/**
 * @file CreatorSignup.jsx
 * @description Creator signup screen with phone number input.
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sendOTP } from '../../services/creatorApi';
import { Button } from '../../components/ama/ui/Button';

const CreatorSignup = () => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Please enter a valid 10-digit number');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await sendOTP(phone);
      navigate('/creator/verify-otp', { state: { phone } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const isInvalid = phone.length !== 10 || !/^[6-9]/.test(phone);

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
          <div className="sparkle" style={{ top: '12%', left: '18%', animationDelay: '0s' }} />
          <div className="sparkle" style={{ top: '35%', left: '80%', animationDelay: '1.2s' }} />
          <div className="sparkle" style={{ top: '58%', left: '6%', animationDelay: '2.8s' }} />
          <div className="sparkle" style={{ top: '82%', left: '84%', animationDelay: '0.5s' }} />
          <div className="sparkle" style={{ top: '92%', left: '22%', animationDelay: '2s' }} />
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
        .gradient-action-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 0 20px rgba(124, 58, 237, 0.6), 0 0 30px rgba(6, 182, 212, 0.4) !important;
        }
        .gradient-action-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .social-btn:hover {
          background: rgba(255, 255, 255, 0.08) !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
          transform: translateY(-1.5px);
          box-shadow: 0 4px 15px rgba(6, 182, 212, 0.15) !important;
        }
      `}} />

      {/* Center 480px content area */}
      <div style={{
        width: '100%',
        maxWidth: '480px',
        padding: '0 16px',
        boxSizing: 'border-box',
        zIndex: 1,
        position: 'relative'
      }}>
        {/* Glassmorphic signup card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '32px 24px',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box'
        }}>
          {/* HEADER */}
          <div style={{
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            marginBottom: '20px'
          }}>
            <Link to="/" style={{
              position: 'absolute',
              left: 0,
              color: '#94a3b8',
              textDecoration: 'none',
              fontSize: '22px',
              transition: 'color 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#06b6d4';
              e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#94a3b8';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            }}
            >
              ←
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* LOGO SECTION */}
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <div style={{
                width: '120px',
                margin: '0 auto 8px',
                display: 'block'
              }}>
                <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 520.97">
                  <defs>
                    <style>
                      {`.cls-1{font-size:566.36px;fill:#ffffff;font-family:Syne;font-weight:700;}.cls-3{letter-spacing:-0.02em;}`}
                    </style>
                  </defs>
                  <text className="cls-1" transform="translate(33.52 457.72)">
                    skr
                    <tspan x="885.21" y="0" style={{ fill: '#06b6d4', filter: 'drop-shadow(0 0 8px #06b6d4)' }}>ii</tspan>
                    <tspan x="1184.24" y="0">b</tspan>
                    <tspan className="cls-3" x="1581.82" y="0">e</tspan>
                  </text>
                </svg>
              </div>
              <div style={{ color: '#94a3b8', fontSize: '14px', fontFamily: 'var(--font-body)', fontWeight: '500' }}>
                Get paid to reply.
              </div>
            </div>

            {/* INPUT SECTION */}
            <div style={{ marginTop: '40px' }}>
              <label style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                color: '#06b6d4',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '10px',
                letterSpacing: '1.5px',
                fontWeight: '600'
              }}>
                YOUR MOBILE NUMBER
              </label>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.03)',
                border: focused ? '1px solid #7c3aed' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                boxShadow: focused ? '0 0 15px rgba(124, 58, 237, 0.3)' : 'none',
                transition: 'all 0.25s ease',
                overflow: 'hidden'
              }}>
                <div style={{
                  padding: '16px 20px',
                  background: 'rgba(255, 255, 255, 0.01)',
                  borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                  fontFamily: 'var(--font-mono)',
                  color: '#94a3b8',
                  fontSize: '16px',
                  fontWeight: '600'
                }}>
                  +91
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setPhone(val);
                    if (error) setError('');
                  }}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    padding: '16px 20px',
                    fontSize: '16px',
                    color: '#ffffff',
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '1px'
                  }}
                />
              </div>

              {error && (
                <div style={{
                  color: '#ef4444',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  marginTop: '10px',
                  textAlign: 'center'
                }}>
                  ⚠️ {error}
                </div>
              )}

              <button
                disabled={isInvalid || loading}
                onClick={handleSendOTP}
                className="gradient-action-btn"
                style={{
                  width: '100%',
                  maxWidth: '280px',
                  padding: '14px 28px',
                  borderRadius: '9999px',
                  background: 'linear-gradient(90deg, #7c3aed 0%, #06b6d4 100%)',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '24px auto 0',
                  boxShadow: '0 4px 12px rgba(124, 58, 237, 0.2)'
                }}
              >
                {loading ? 'Sending...' : 'Send OTP →'}
              </button>
            </div>

            {/* PROMO BANNER */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderTop: '2px solid #06b6d4',
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center',
              marginTop: '32px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
            }}>
              <div style={{
                color: '#06b6d4',
                fontWeight: 800,
                fontSize: '15px',
                marginBottom: '6px',
                letterSpacing: '0.5px'
              }}>
                Free for first 3 months
              </div>
              <div style={{
                color: '#94a3b8',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)'
              }}>
                0% commission for first 100 creators · forever
              </div>
            </div>

            {/* SOCIAL LOGIN */}
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12px', marginBottom: '8px' }}>
                or continue with
              </div>
              
              <a href="http://localhost:5000/api/auth/google"
                 className="social-btn"
                 style={{
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   gap: '10px',
                   padding: '12px 24px',
                   background: 'rgba(255, 255, 255, 0.03)',
                   border: '1px solid rgba(255, 255, 255, 0.08)',
                   borderRadius: '9999px',
                   color: '#ffffff',
                   textDecoration: 'none',
                   fontSize: '14px',
                   fontWeight: '600',
                   maxWidth: '280px',
                   width: '100%',
                   margin: '0 auto',
                   transition: 'all 0.25s ease'
                 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </a>

              <a href="http://localhost:5000/api/auth/facebook"
                 className="social-btn"
                 style={{
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   gap: '10px',
                   padding: '12px 24px',
                   background: 'rgba(24, 119, 242, 0.1)',
                   border: '1px solid rgba(24, 119, 242, 0.2)',
                   borderRadius: '9999px',
                   color: '#ffffff',
                   textDecoration: 'none',
                   fontSize: '14px',
                   fontWeight: '600',
                   maxWidth: '280px',
                   width: '100%',
                   margin: '0 auto',
                   transition: 'all 0.25s ease'
                 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.98h-1.514c-1.49 0-1.956.935-1.956 1.895v2.246h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" fill="white"/>
                </svg>
                Continue with Meta
              </a>
            </div>
          </div>

          {/* FOOTER */}
          <div style={{
            textAlign: 'center',
            marginTop: '32px',
            color: '#94a3b8',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            lineHeight: '1.6'
          }}>
            By continuing you agree to our<br />
            <span style={{ color: '#06b6d4', cursor: 'pointer' }}>Terms & Privacy Policy</span>
            <div style={{ marginTop: '24px', opacity: 0.5, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Made with 🤍 for bold conversations
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorSignup;
