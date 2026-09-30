import React, { useState } from 'react';
import TransparentLogo from '../../components/TransparentLogo';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { fanSignup } from '../../services/fanApi';
import { useAuth } from '../../context/AuthContext';

const FanSignup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const urlError = searchParams.get('error');

  const [error, setError] = useState(urlError && urlError !== 'CONFLICT_CREATOR' ? urlError : '');
  const [whatsappConsent, setWhatsappConsent] = useState(false);
  
  const [focusedName, setFocusedName] = useState(false);
  const [focusedEmail, setFocusedEmail] = useState(false);
  const [focusedPassword, setFocusedPassword] = useState(false);
  const [showRoleConflictModal, setShowRoleConflictModal] = useState(false);
  const [roleConflictMessage, setRoleConflictMessage] = useState('');

  React.useEffect(() => {
    if (urlError === 'CONFLICT_CREATOR') {
      setRoleConflictMessage('This Google/Meta account is already registered as a Creator. Please use the Creator login page, or use a different account to sign up as a Fan.');
      setShowRoleConflictModal(true);
    }
  }, [urlError]);
  
  const { setAuthData } = useAuth();
  
  console.log("FanSignup rendered");

  const checkPasswordStrength = (pwd) => {
    return pwd.length >= 8 && /[0-9\W]/.test(pwd);
  };

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError('Please fill out all fields');
      return;
    }

    if (!checkPasswordStrength(password)) {
      setError('Password must be at least 8 chars and contain a number/special char');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fanSignup(name, email, password, '', whatsappConsent);
      if (res.data.success) {
        localStorage.setItem('isReturningFan', 'true');
        // Redirect to email verification and let it log in after success
        const queryParams = new URLSearchParams(window.location.search);
        const nextRoute = queryParams.get('redirect') || '/discovery';
        navigate('/verify-email', { state: { email, nextRoute, nextState: {}, token: res.data.token } });
      }
    } catch (err) {
      console.error("Signup error:", err);
      if (err.response?.data?.isRoleConflict) {
        setRoleConflictMessage(err.response.data.message || 'You are signed in as a creator please sign up with a different account to be a fan');
        setShowRoleConflictModal(true);
      } else {
        setError(err.response?.data?.message || 'Signup failed. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isInvalid = !name || !email || !password || !checkPasswordStrength(password);

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
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes aurora-flow {
          0% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
          33% { transform: translate(20px, -30px) rotate(120deg) scale(1.05); }
          66% { transform: translate(-15px, 15px) rotate(240deg) scale(0.98); }
          100% { transform: translate(0px, 0px) rotate(360deg) scale(1); }
        }
        .gradient-action-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 0 20px rgba(124, 58, 237, 0.6), 0 0 30px rgba(6, 182, 212, 0.4) !important;
        }
        .gradient-action-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        input {
          transition: background-color 5000s ease-in-out 0s;
        }
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
          -webkit-text-fill-color: #ffffff !important;
          -webkit-background-clip: text !important;
          background-clip: text !important;
        }
      `}} />

      {/* Back Button */}
      <Link to="/" style={{
        position: 'absolute',
        top: '24px',
        left: '24px',
        color: '#94a3b8',
        textDecoration: 'none',
        fontSize: '24px',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        zIndex: 10
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = '#06b6d4';
        e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.3)';
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = '#94a3b8';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
      }}
      >
        ←
      </Link>

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
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <div style={{
                width: '120px',
                margin: '0 auto -28px',
                display: 'block'
              }}>
                <TransparentLogo src="/logo.png" alt="skriibe logo" style={{ width: '100%', height: 'auto', transform: 'scale(1.8)' }} />
              </div>
              <div style={{ color: '#ffffff', fontSize: '18px', fontFamily: 'var(--font-body)', fontWeight: '600', marginBottom: '8px' }}>
                Join as a <span style={{ color: '#6366f1' }}>Fan.</span> Connect with <span style={{ color: '#3b82f6' }}>creators</span>.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '32px', marginBottom: '24px' }}>
              <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google?role=fan`}
                 className="social-btn"
                 style={{
                   flex: 1,
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   gap: '8px',
                   padding: '14px',
                   background: 'rgba(255, 255, 255, 0.02)',
                   border: '1px solid rgba(59, 130, 246, 0.5)',
                   borderRadius: '9999px',
                   color: '#ffffff',
                   textDecoration: 'none',
                   fontSize: '13px',
                   fontWeight: '600',
                   transition: 'all 0.25s ease',
                   boxShadow: '0 0 15px rgba(59, 130, 246, 0.15)'
                 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </a>

              <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/facebook?role=fan`}
                 className="social-btn"
                 style={{
                   flex: 1,
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   gap: '8px',
                   padding: '14px',
                   background: 'rgba(255, 255, 255, 0.02)',
                   border: '1px solid rgba(59, 130, 246, 0.5)',
                   borderRadius: '9999px',
                   color: '#ffffff',
                   textDecoration: 'none',
                   fontSize: '13px',
                   fontWeight: '600',
                   transition: 'all 0.25s ease',
                   boxShadow: '0 0 15px rgba(59, 130, 246, 0.15)'
                 }}
              >
                <svg width="18" height="18" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M18.064 16.916C16.891 14.887 14.73 11.597 10.378 11.597C5.071 11.597 1 15.69 1 21.055C1 26.417 5.068 30.509 10.381 30.509C14.72 30.509 16.901 27.245 18.062 25.195C19.227 27.243 21.391 30.509 25.748 30.509C31.052 30.509 35.12 26.414 35.12 21.055C35.12 15.696 31.054 11.597 25.753 11.597C21.411 11.597 19.228 14.864 18.064 16.916ZM10.38 27.135C6.915 27.135 4.382 24.498 4.382 21.055C4.382 17.616 6.915 14.973 10.38 14.973C13.882 14.973 15.86 17.915 16.937 19.82C15.86 21.728 13.884 27.135 10.38 27.135ZM25.748 27.135C29.208 27.135 31.738 24.498 31.738 21.055C31.738 17.616 29.211 14.973 25.748 14.973C22.25 14.973 20.267 17.917 19.191 19.82C20.267 21.726 22.247 27.135 25.748 27.135Z" fill="#1877F2" />
                </svg>
                Meta
              </a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
              <div style={{ padding: '0 16px', color: '#94a3b8', fontSize: '13px' }}>or</div>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
            </div>

            <div style={{ marginTop: '0px' }}>
              {/* Email Field */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.03)',
                border: focusedEmail ? '1px solid #7c3aed' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                boxShadow: focusedEmail ? '0 0 15px rgba(124, 58, 237, 0.3)' : 'none',
                transition: 'all 0.25s ease',
                overflow: 'hidden',
                marginBottom: '16px'
              }}>
                <div style={{ padding: '0 0 0 16px', display: 'flex', alignItems: 'center', color: '#94a3b8' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <input
                  type="email"
                  placeholder="Email address"
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
                    padding: '16px 16px 16px 12px',
                    fontSize: '14px',
                    color: '#ffffff',
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.5px'
                  }}
                />
              </div>

              {/* Password Field */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.03)',
                border: focusedPassword ? '1px solid #7c3aed' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                boxShadow: focusedPassword ? '0 0 15px rgba(124, 58, 237, 0.3)' : 'none',
                transition: 'all 0.25s ease',
                overflow: 'hidden',
                marginBottom: '16px'
              }}>
                <div style={{ padding: '0 0 0 16px', display: 'flex', alignItems: 'center', color: '#94a3b8' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
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
                    padding: '16px 16px 16px 12px',
                    fontSize: '14px',
                    color: '#ffffff',
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.5px'
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
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>

              {/* Name Field */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.03)',
                border: focusedName ? '1px solid #7c3aed' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                boxShadow: focusedName ? '0 0 15px rgba(124, 58, 237, 0.3)' : 'none',
                transition: 'all 0.25s ease',
                overflow: 'hidden',
                marginBottom: '16px'
              }}>
                <div style={{ padding: '0 0 0 16px', display: 'flex', alignItems: 'center', color: '#94a3b8' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError('');
                  }}
                  onFocus={() => setFocusedName(true)}
                  onBlur={() => setFocusedName(false)}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    padding: '16px 16px 16px 12px',
                    fontSize: '14px',
                    color: '#ffffff',
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.5px'
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
                onClick={handleRegister}
                className="gradient-action-btn"
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '9999px',
                  background: 'linear-gradient(90deg, #7c3aed 0%, #06b6d4 100%)',
                  color: '#ffffff',
                  fontWeight: '600',
                  fontSize: '15px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '24px 0 0',
                  boxShadow: '0 4px 12px rgba(124, 58, 237, 0.2)'
                }}
              >
                {loading ? 'Registering...' : 'Create account →'}
              </button>
            </div>

            {/* LINK TO LOGIN */}
            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', paddingBottom: '0' }}>
              <span style={{ color: '#94a3b8' }}>Already have an account? </span>
              <Link to="/fan/login" style={{ color: '#06b6d4', textDecoration: 'none', fontWeight: '500' }}>Log in</Link>
            </div>
          </div>

          <div style={{
            textAlign: 'center',
            marginTop: '8px',
            color: '#94a3b8',
            fontSize: '13px',
            fontFamily: 'var(--font-mono)',
            lineHeight: '1.6'
          }}>
            by signing up and using skriibe, you agree to our<br />
            <Link to="/terms" style={{ color: '#06b6d4', textDecoration: 'none' }}>Terms of Service</Link> and <Link to="/privacy" style={{ color: '#06b6d4', textDecoration: 'none' }}>Privacy policy</Link>
            <div style={{ marginTop: '16px', opacity: 0.5, fontSize: '9px', letterSpacing: '1px' }}>
              MADE WITH 🤍 FROM SKRIIBE
            </div>
          </div>
        </div>
      </div>
      {showRoleConflictModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div
            style={{
              background: '#13161c',
              borderRadius: '24px',
              padding: '32px',
              width: '100%',
              maxWidth: '400px',
              border: '1px solid #1F2937',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, height: '4px',
              background: 'linear-gradient(90deg, #F59E0B, #EF4444)'
            }} />
            
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>

            <h2 style={{ 
              margin: '0 0 12px', 
              fontSize: '22px', 
              fontWeight: '700',
              color: '#fff' 
            }}>
              Access Denied
            </h2>
            
            <p style={{ 
              margin: '0 0 24px', 
              color: '#9CA3AF',
              fontSize: '15px',
              lineHeight: '1.5'
            }}>
              {roleConflictMessage || 'You are signed in as a creator please sign up with a different account to be a fan'}
            </p>

            <button
              onClick={() => {
                setShowRoleConflictModal(false);
                navigate('/fan/signup', { replace: true });
              }}
              style={{
                width: '100%',
                padding: '14px',
                background: '#374151',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = '#4B5563'}
              onMouseOut={(e) => e.target.style.background = '#374151'}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FanSignup;
