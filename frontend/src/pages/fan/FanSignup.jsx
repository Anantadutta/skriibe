import React, { useState } from 'react';
import TransparentLogo from '../../components/TransparentLogo';
import { useNavigate, Link } from 'react-router-dom';
import { fanSignup } from '../../services/fanApi';

const FanSignup = () => {
  const [name, setName] = useState('');
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    const handleResize = () => {
      const formHeight = 950;
      if (window.innerHeight < formHeight) {
        setScale(window.innerHeight / formHeight);
      } else {
        setScale(1);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [whatsappConsent, setWhatsappConsent] = useState(false);
  
  const [focusedName, setFocusedName] = useState(false);
  const [focusedEmail, setFocusedEmail] = useState(false);
  const [focusedPassword, setFocusedPassword] = useState(false);
  const navigate = useNavigate();
  
  console.log("FanSignup rendered");

  const checkPasswordStrength = (pwd) => {
    return pwd.length >= 8 && /[0-9\\W]/.test(pwd);
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
        // Just redirect to explore page for now after successful signup
        const queryParams = new URLSearchParams(window.location.search);
        const redirect = queryParams.get('redirect');
        navigate(redirect || '/discovery');
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.response?.data?.message || 'Registration failed. Please check if your backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const isInvalid = !name || !email || !password || !checkPasswordStrength(password);

  return (
    <div style={{
      height: '100vh',
      background: '#0a0a0f',
      position: 'relative',
      overflow: 'hidden'
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

      <div style={{
        width: `${100 / scale}%`,
        maxWidth: `${480 / scale}px`,
        padding: '12px 16px',
        boxSizing: 'border-box',
        zIndex: 1,
        position: 'absolute',
        top: '48%',
        left: '50%',
        transform: `translate(-50%, -50%) scale(${scale})`,
        transformOrigin: 'center center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '24px',
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
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <div style={{
                width: '120px',
                margin: '0 auto -28px',
                display: 'block'
              }}>
                <TransparentLogo src="/logo.png" alt="skriibe logo" style={{ width: '100%', height: 'auto', transform: 'scale(1.8)' }} />
              </div>
              <div style={{ color: '#ffffff', fontSize: '18px', fontFamily: 'var(--font-body)', fontWeight: '600', marginBottom: '8px' }}>
                Join as a Fan. Connect with creators.
              </div>
              <div style={{ color: '#94a3b8', fontSize: '14px', fontFamily: 'var(--font-body)', fontWeight: '400' }}>
                Ask questions. Get personal replies.
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
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
                YOUR NAME
              </label>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.03)',
                border: focusedName ? '1px solid #7c3aed' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                boxShadow: focusedName ? '0 0 15px rgba(124, 58, 237, 0.3)' : 'none',
                transition: 'all 0.25s ease',
                overflow: 'hidden',
                marginBottom: '12px'
              }}>
                <div style={{ padding: '0 0 0 16px', display: 'flex', alignItems: 'center', color: '#94a3b8' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Jane Smith"
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
                YOUR EMAIL ID
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
                  placeholder="jane.smith@example.com"
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
                CREATE PASSWORD
              </label>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.03)',
                border: focusedPassword ? '1px solid #7c3aed' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                boxShadow: focusedPassword ? '0 0 15px rgba(124, 58, 237, 0.3)' : 'none',
                transition: 'all 0.25s ease',
                overflow: 'hidden',
                marginBottom: '12px'
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

              <div style={{ color: '#94a3b8', fontSize: '11px', fontFamily: 'var(--font-mono)', marginBottom: '24px', marginTop: '-4px' }}>
                Use 8+ characters with a mix of letters, numbers & symbols.
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
                  maxWidth: '280px',
                  padding: '14px 28px',
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
                  margin: '8px auto 0',
                  boxShadow: '0 4px 12px rgba(124, 58, 237, 0.2)'
                }}
              >
                {loading ? 'Registering...' : 'Join as a Fan →'}
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
            By signing up and using Skriibe, you agree to our<br />
            <Link to="/terms" style={{ color: '#06b6d4', textDecoration: 'none' }}>Terms of Service</Link> and <Link to="/privacy" style={{ color: '#06b6d4', textDecoration: 'none' }}>Privacy Policy</Link>.
            <div style={{ marginTop: '16px', opacity: 0.5, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Made with 🤍 from Skriibe
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FanSignup;
