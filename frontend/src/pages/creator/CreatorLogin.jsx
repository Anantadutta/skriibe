/**
 * @file CreatorLogin.jsx
 * @description Creator login screen via email and password.
 */

import React, { useState } from 'react';
import TransparentLogo from '../../components/TransparentLogo';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { emailLogin } from '../../services/creatorApi';
import { Button } from '../../components/ama/ui/Button';
import { useAuth } from '../../context/AuthContext';

const CreatorLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const urlError = searchParams.get('error');
  
  const [error, setError] = useState(urlError || '');
  const [focusedEmail, setFocusedEmail] = useState(false);
  const [focusedPassword, setFocusedPassword] = useState(false);
  const navigate = useNavigate();
  const { setAuthData } = useAuth();
  const successMessage = location.state?.message;

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    // Clear stale bankLinked flag on new login attempt
    localStorage.removeItem('bankLinked');

    setLoading(true);
    setError('');
    try {
      const res = await emailLogin(email, password);
      const { creator, token } = res.data;
      
      // User has logged in, mark them as a returning creator
      localStorage.setItem('isReturningCreator', 'true');
      
      if (token) {
        setAuthData(['creator'], 'creator', token);
      }
      
      if (creator.isLive) {
        navigate('/creator/dashboard', { state: { creator } });
      } else {
        if (!creator.handle) {
          navigate('/onboard/profile', { state: { creator } });
        } else {
          navigate('/onboard/pricing', { state: { creator } });
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const isInvalid = !email || !password;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 0',
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
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          opacity: 0.035,
          mixBlendMode: 'overlay',
          pointerEvents: 'none'
        }} />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div className="sparkle" style={{ top: '12%', left: '18%', animationDelay: '0s' }} />
          <div className="sparkle" style={{ top: '35%', left: '80%', animationDelay: '1.2s' }} />
          <div className="sparkle" style={{ top: '58%', left: '6%', animationDelay: '2.8s' }} />
          <div className="sparkle" style={{ top: '82%', left: '84%', animationDelay: '0.5s' }} />
          <div className="sparkle" style={{ top: '92%', left: '22%', animationDelay: '2s' }} />
        </div>
      </div>

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

      <div style={{
        width: '100%',
        maxWidth: '480px',
        padding: '0 16px',
        margin: 'auto 0',
        boxSizing: 'border-box',
        zIndex: 1,
        position: 'relative'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box'
        }}>
          <div style={{
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            marginBottom: '12px'
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
            <div style={{ textAlign: 'center', marginTop: '0px' }}>
              <div style={{
                width: '120px',
                margin: '0 auto -28px',
                display: 'block'
              }}>
                <TransparentLogo src="/logo.png" alt="skriibe logo" style={{ width: '100%', height: 'auto', transform: 'scale(1.8)' }} />
              </div>
              <div style={{ color: '#94a3b8', fontSize: '14px', fontFamily: 'var(--font-body)', fontWeight: '500' }}>
                Welcome back. Log in to your account.
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              {successMessage && (
                <div style={{
                  color: '#22c55e',
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  padding: '12px',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  textAlign: 'center'
                }}>
                  ✅ {successMessage}
                </div>
              )}
              <label style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                color: '#06b6d4',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '6px',
                letterSpacing: '1.5px',
                fontWeight: '600'
              }}>
                EMAIL ID
              </label>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.03)',
                border: focusedEmail ? '1px solid #7c3aed' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                boxShadow: focusedEmail ? '0 0 15px rgba(124, 58, 237, 0.3)' : 'none',
                transition: 'all 0.25s ease',
                overflow: 'hidden',
                marginBottom: '12px'
              }}>
                <div style={{ padding: '0 0 0 16px', display: 'flex', alignItems: 'center', color: '#94a3b8' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <input
                  type="email"
                  placeholder="your@gmail.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  onFocus={() => setFocusedEmail(true)}
                  onBlur={() => setFocusedEmail(false)}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    padding: '12px 16px 12px 12px',
                    fontSize: '16px',
                    color: '#ffffff',
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '1px'
                  }}
                />
              </div>

              <label style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                color: '#06b6d4',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '6px',
                letterSpacing: '1.5px',
                fontWeight: '600'
              }}>
                 PASSWORD
              </label>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.03)',
                border: focusedPassword ? '1px solid #7c3aed' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                boxShadow: focusedPassword ? '0 0 15px rgba(124, 58, 237, 0.3)' : 'none',
                transition: 'all 0.25s ease',
                overflow: 'hidden'
              }}>
                <div style={{ padding: '0 0 0 16px', display: 'flex', alignItems: 'center', color: '#94a3b8' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  onFocus={() => setFocusedPassword(true)}
                  onBlur={() => setFocusedPassword(false)}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    padding: '12px 16px 12px 12px',
                    fontSize: '16px',
                    color: '#ffffff',
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '1px'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    padding: '0 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94a3b8',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>



              {error && (
                <div style={{
                  color: '#ef4444',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  marginTop: '16px',
                  textAlign: 'center'
                }}>
                  ⚠️ {error}
                </div>
              )}

              <button
                disabled={isInvalid || loading}
                onClick={handleLogin}
                className="gradient-action-btn"
                style={{
                  width: '100%',
                  maxWidth: '280px',
                  padding: '12px 24px',
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
                  margin: '12px auto 0',
                  boxShadow: '0 4px 12px rgba(124, 58, 237, 0.2)'
                }}
              >
                {loading ? 'Logging in...' : 'Login →'}
              </button>

              {/* LINK TO SIGNUP */}
              <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '13px' }}>
                <span style={{ color: '#94a3b8' }}>Don't have an account? </span>
                <Link to="/creator/signup" onClick={() => localStorage.removeItem('isReturningCreator')} style={{ color: '#06b6d4', textDecoration: 'none', fontWeight: '600' }}>Register here</Link>
              </div>
            </div>

            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12px', marginBottom: '8px' }}>
                or continue with
              </div>
              
              <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`}
                 className="social-btn"
                 style={{
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   gap: '10px',
                   padding: '10px 20px',
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

              <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/facebook`}
                 className="social-btn"
                 style={{
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   gap: '10px',
                   padding: '10px 20px',
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

          <div style={{
            textAlign: 'center',
            marginTop: '16px',
            color: '#94a3b8',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            lineHeight: '1.6'
          }}>
            By logging in and using Skriibe, you agree to our<br />
            <Link to="/terms" style={{ color: '#06b6d4', textDecoration: 'none' }}>Terms of Service</Link> and <Link to="/privacy" style={{ color: '#06b6d4', textDecoration: 'none' }}>Privacy Policy</Link>.
            <div style={{ marginTop: '8px', opacity: 0.5, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Made with 🤍 from Skriibe
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorLogin;
