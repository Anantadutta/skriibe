import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import TransparentLogo from '../../components/TransparentLogo';
import { useAuth } from '../../context/AuthContext';
import { emailSignup, emailLogin } from '../../services/creatorApi';

const CreatorAuth = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialMode = location.pathname.includes('login') ? 'login' : 'signup';
  const urlError = searchParams.get('error');

  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(urlError === 'CONFLICT_FAN' ? '' : (urlError || ''));
  const [focusedName, setFocusedName] = useState(false);
  const [focusedEmail, setFocusedEmail] = useState(false);
  const [focusedPassword, setFocusedPassword] = useState(false);
  
  const [showRoleConflictModal, setShowRoleConflictModal] = useState(false);
  const [roleConflictMessage, setRoleConflictMessage] = useState('');
  
  const navigate = useNavigate();
  const { roles, setAuthData, isAuthenticated, clearAuthData } = useAuth();
  const [showAlreadyCreatorModal, setShowAlreadyCreatorModal] = useState(false);
  
  const successMessage = location.state?.message;

  const isSubmittingRef = React.useRef(false);

  useEffect(() => {
    if (isSubmittingRef.current) return;
    if (roles?.includes('creator') && isAuthenticated) {
      const urlParams = new URLSearchParams(location.search);
      if (urlParams.get('ref')) {
        setShowAlreadyCreatorModal(true);
        return;
      } else {
        navigate('/creator/dashboard', { replace: true });
        return;
      }
    } else if (isAuthenticated && roles && !roles.includes('creator')) {
      if (typeof clearAuthData === 'function') {
        clearAuthData();
      } else {
        localStorage.removeItem('skriibe_token');
        localStorage.removeItem('auth_roles');
        localStorage.removeItem('auth_activeRole');
      }
      document.cookie = 'skriibe_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'creator_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'fan_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
  }, [navigate, roles, location.search, isAuthenticated, clearAuthData]);

  useEffect(() => {
    if (urlError === 'CONFLICT_FAN') {
      setRoleConflictMessage('This Google/Meta account is already registered as a Fan. Please use the Fan login page, or use a different account to sign up as a Creator.');
      setShowRoleConflictModal(true);
    }
  }, [urlError]);

  const checkPasswordStrength = (pwd) => {
    return pwd.length >= 8 && /[0-9\W]/.test(pwd);
  };

  const handleSubmit = async () => {
    isSubmittingRef.current = true;
    if (isLogin) {
      if (!email || !password) {
        setError('Please enter both email and password');
        isSubmittingRef.current = false;
        return;
      }
      
      localStorage.removeItem('bankLinked');
      setLoading(true);
      setError('');
      try {
        const res = await emailLogin(email, password);
        const { creator, token } = res.data;
        
        localStorage.setItem('isReturningCreator', 'true');
        
        if (token) {
          setAuthData(['creator'], 'creator', token);
        }
        
        if (creator.handle) {
          navigate('/creator/dashboard', { state: { creator }, replace: true });
        } else {
          navigate('/onboard/profile', { state: { creator }, replace: true });
        }
      } catch (err) {
        isSubmittingRef.current = false;
        if (err.response?.data?.isRoleConflict) {
          setRoleConflictMessage('This email is already registered as a Fan. Please use the Fan login page, or use a different email to sign up as a Creator.');
          setShowRoleConflictModal(true);
        } else {
          setError(err.response?.data?.message || 'Login failed. Try again.');
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    // SIGNUP LOGIC
    if (!name || !email || !password) {
      setError('Please fill out all fields');
      isSubmittingRef.current = false;
      return;
    }

    if (!checkPasswordStrength(password)) {
      setError('Password must be at least 8 chars and contain a number/special char');
      isSubmittingRef.current = false;
      return;
    }

    setLoading(true);
    setError('');
    try {
      const urlParams = new URLSearchParams(location.search);
      const ref = urlParams.get('ref');
      const res = await emailSignup(email, password, ref);
      if (res.data.success) {
        localStorage.setItem('isReturningCreator', 'true');
        localStorage.removeItem('bankLinked');
        
        const isExisting = res.data.isExisting;
        
        if (res.data.token && res.data.creator) {
          setAuthData(['creator'], 'creator', res.data.token);
        }
        
        if (isExisting) {
          if (res.data.creator.handle) {
            navigate('/creator/dashboard', { state: { creator: res.data.creator }, replace: true });
          } else {
            navigate('/onboard/profile', { state: { creator: res.data.creator }, replace: true });
          }
        } else {
          const nextRoute = (res.data.token && res.data.creator) ? '/onboard/profile' : '/creator/login';
          const nextState = (res.data.token && res.data.creator) ? { creator: res.data.creator } : { message: 'Registration successful! Please log in.' };
          navigate('/verify-email', { state: { email, nextRoute, nextState } });
        }
      }
    } catch (err) {
      console.error("Signup error:", err);
      isSubmittingRef.current = false;
      if (err.response?.data?.isRoleConflict) {
        setRoleConflictMessage('This email is already registered as a Fan. Please use the Fan login page, or use a different email to sign up as a Creator.');
        setShowRoleConflictModal(true);
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please check if your backend server is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isInvalid = isLogin ? (!email || !password) : (!name || !email || !password || !checkPasswordStrength(password));

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setPassword('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 0',
      position: 'relative',
      overflowX: 'hidden',
      color: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
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
        ::placeholder {
          color: #64748b;
          opacity: 1;
        }
      `}} />

      {/* Already Creator Modal */}
      {showAlreadyCreatorModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            background: '#0E0E0E', border: '1px solid #1F2937', borderRadius: '16px',
            padding: '32px', width: '100%', maxWidth: '400px', textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>👋</div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.4rem', color: '#fff', fontWeight: 800 }}>
              You're already a Creator!
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.5 }}>
              You are currently logged into your Skriibe account. You cannot refer yourself or create a new account while logged in.
            </p>
            <button
              onClick={() => navigate('/creator/dashboard')}
              style={{
                width: '100%', padding: '12px', background: '#38BDF8', color: '#0E0E0E',
                border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '1rem',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = '#0EA5E9'}
              onMouseOut={(e) => e.target.style.background = '#38BDF8'}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}

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
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{
                width: '120px',
                margin: '0 auto',
                display: 'block'
              }}>
                <TransparentLogo src="/logo.png" alt="skriibe logo" style={{ width: '100%', height: 'auto', transform: 'scale(1.8)' }} />
              </div>
              
              {isLogin ? (
                <>
                  <h1 style={{ color: '#ffffff', fontSize: '24px', fontWeight: '500', margin: '24px 0 8px 0', fontFamily: 'var(--font-heading)' }}>
                    Welcome back
                  </h1>
                  <div style={{ color: '#94a3b8', fontSize: '14px', fontFamily: 'var(--font-body)' }}>
                    Log into your Creator account
                  </div>
                </>
              ) : (
                <>
                  <div style={{ color: '#ffffff', fontSize: '18px', fontFamily: 'var(--font-body)', fontWeight: '600', marginBottom: '8px' }}>
                    Join as a <span style={{ color: '#3b82f6' }}>Creator.</span> Connect with <span style={{ color: '#3b82f6' }}>fans</span>.
                  </div>
                </>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google${new URLSearchParams(location.search).get('ref') ? `?ref=${new URLSearchParams(location.search).get('ref')}` : ''}`}
                 className="social-btn"
                 style={{
                   flex: 1,
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   gap: '10px',
                   padding: '12px',
                   background: 'rgba(255, 255, 255, 0.03)',
                   border: '1px solid rgba(255, 255, 255, 0.08)',
                   borderRadius: '9999px',
                   color: '#ffffff',
                   textDecoration: 'none',
                   fontSize: '14px',
                   fontWeight: '600',
                   transition: 'all 0.25s ease'
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

              <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/facebook${new URLSearchParams(location.search).get('ref') ? `?ref=${new URLSearchParams(location.search).get('ref')}` : ''}`}
                 className="social-btn"
                 style={{
                   flex: 1,
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   gap: '10px',
                   padding: '12px',
                   background: 'rgba(255, 255, 255, 0.03)',
                   border: '1px solid rgba(255, 255, 255, 0.08)',
                   borderRadius: '9999px',
                   color: '#ffffff',
                   textDecoration: 'none',
                   fontSize: '14px',
                   fontWeight: '600',
                   transition: 'all 0.25s ease'
                 }}
              >
                <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M28.094 11.25c-2.313 0-4.469 1.094-5.875 3.031L22.188 14.344l-2.75 3.844-3.031-4.25c-1.406-1.938-3.563-3.031-5.875-3.031-4.125 0-7.5 3.375-7.5 7.5s3.375 7.5 7.5 7.5c2.313 0 4.469-1.094 5.875-3.031l.031-.031 2.75-3.844 3.031 4.25c1.406 1.938 3.563 3.031 5.875 3.031 4.125 0 7.5-3.375 7.5-7.5s-3.375-7.5-7.5-7.5zm0 11.25c-1.344 0-2.594-.656-3.375-1.781l-3.313-4.656 3.313-4.656c.781-1.125 2.031-1.781 3.375-1.781 2.469 0 4.5 2.031 4.5 4.5s-2.031 4.5-4.5 4.5zm-17.563 0c-2.469 0-4.5-2.031-4.5-4.5s2.031-4.5 4.5-4.5c1.344 0 2.594.656 3.375 1.781l3.313 4.656-3.313 4.656c-.781 1.125-2.031 1.781-3.375 1.781z" fill="#0668E1"/>
                </svg>
                Meta
              </a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }}></div>
              <span style={{ padding: '0 16px', color: '#64748b', fontSize: '13px' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }}></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {successMessage && isLogin && (
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

              {!isLogin && (
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
                      fontSize: '15px',
                      color: '#ffffff',
                      fontFamily: 'var(--font-body)'
                    }}
                  />
                </div>
              )}

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
                    fontSize: '15px',
                    color: '#ffffff',
                    fontFamily: 'var(--font-body)'
                  }}
                />
              </div>

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
                  placeholder={isLogin ? "Password" : "Create a password"}
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
                    fontSize: '15px',
                    color: '#ffffff',
                    fontFamily: 'var(--font-body)'
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

              {isLogin && (
                <div style={{ textAlign: 'right', marginTop: '12px', paddingRight: '4px' }}>
                  <Link to="/creator/forgot-password" style={{ color: '#06b6d4', textDecoration: 'none', fontSize: '13px', fontWeight: '500' }}>
                    Forgot password?
                  </Link>
                </div>
              )}

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
                onClick={handleSubmit}
                className="gradient-action-btn"
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  borderRadius: '9999px',
                  background: 'linear-gradient(90deg, #7c3aed 0%, #06b6d4 100%)',
                  color: '#ffffff',
                  fontWeight: '600',
                  fontSize: '15px',
                  border: 'none',
                  cursor: (isInvalid || loading) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.25s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '24px',
                  boxShadow: '0 4px 12px rgba(124, 58, 237, 0.2)'
                }}
              >
                {loading ? (isLogin ? 'Logging in...' : 'Registering...') : (isLogin ? 'Log In' : 'Sign Up')}
              </button>

              <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px' }}>
                <span style={{ color: '#94a3b8' }}>{isLogin ? "Don't have an account? " : "Already have an account? "}</span>
                <span onClick={toggleMode} style={{ color: '#06b6d4', textDecoration: 'none', fontWeight: '500', cursor: 'pointer' }}>
                  {isLogin ? "Sign up" : "Log in"}
                </span>
              </div>
            </div>
          </div>

          <div style={{
            textAlign: 'center',
            marginTop: '24px',
            color: '#94a3b8',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            lineHeight: '1.6'
          }}>
            {isLogin ? 'by logging and using skriibe, you agree to our' : 'by signing up and using skriibe, you agree to our'} <br />
            <Link to="/terms" style={{ color: '#06b6d4', textDecoration: 'none' }}>Terms of Service</Link> and <Link to="/privacy" style={{ color: '#06b6d4', textDecoration: 'none' }}>Privacy policy</Link>
            <div style={{ marginTop: '12px', opacity: 0.6, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              MADE WITH 🤍 FROM SKRIIBE
            </div>
          </div>
        </div>
      </div>

      {showRoleConflictModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: '#1a1a24',
            padding: '24px',
            borderRadius: '12px',
            maxWidth: '320px',
            width: '90%',
            textAlign: 'center',
            border: '1px solid #ef4444'
          }}>
            <h3 style={{ color: '#ef4444', marginTop: 0 }}>Access Denied</h3>
            <p style={{ color: '#ffffff', fontSize: '14px', lineHeight: '1.5' }}>
              {roleConflictMessage}
            </p>
            <button
              onClick={() => {
                setShowRoleConflictModal(false);
                navigate('/fan/login', { replace: true });
              }}
              style={{
                marginTop: '16px',
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                width: '100%'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorAuth;
