import React, { useState } from 'react';
import TransparentLogo from '../../components/TransparentLogo';
import { useParams, useNavigate, Link } from 'react-router-dom';

const FanResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const [focusedPassword, setFocusedPassword] = useState(false);
  const [focusedConfirmPassword, setFocusedConfirmPassword] = useState(false);

  const checkPasswordStrength = (pwd) => {
    return pwd.length >= 8 && /[0-9\W]/.test(pwd);
  };

  const handleSubmit = async () => {
    if (!password || !confirmPassword) {
      setError('Please fill out all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!checkPasswordStrength(password)) {
      setError('Password must be at least 8 chars and contain a number/special char');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/fan-auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage('Password reset successful. You can now log in.');
        setTimeout(() => navigate('/fan/login'), 3000);
      } else {
        setError(data.message || 'Reset failed');
      }
    } catch (err) {
      setError('Network error, please try again.');
    } finally {
      setLoading(false);
    }
  };

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
      </div>

      <div style={{
        width: '100%',
        maxWidth: '480px',
        padding: '0 16px',
        boxSizing: 'border-box',
        zIndex: 1,
        position: 'relative',
        margin: '40px 0'
      }}>
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
          <div style={{
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            marginBottom: '20px'
          }}>
            <Link to="/fan/login" style={{
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
            }}>
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
              <div style={{ color: '#94a3b8', fontSize: '14px', fontFamily: 'var(--font-body)', fontWeight: '500', marginBottom: '24px' }}>
                Create a new password
              </div>
            </div>

            {message ? (
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                color: '#10b981',
                padding: '16px',
                borderRadius: '12px',
                marginTop: '10px',
                textAlign: 'center',
                fontSize: '14px',
                fontFamily: 'var(--font-mono)'
              }}>
                {message}
              </div>
            ) : (
              <>
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
                  NEW PASSWORD
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
                  marginBottom: '16px'
                }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder=""
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
                      padding: '16px 20px',
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

                {password && !checkPasswordStrength(password) && (
                  <div style={{ color: '#ef4444', fontSize: '10px', fontFamily: 'var(--font-mono)', marginBottom: '16px', marginTop: '-8px' }}>
                    Must be at least 8 chars with 1 number/special char.
                  </div>
                )}

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
                  CONFIRM NEW PASSWORD
                </label>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: focusedConfirmPassword ? '1px solid #7c3aed' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  boxShadow: focusedConfirmPassword ? '0 0 15px rgba(124, 58, 237, 0.3)' : 'none',
                  transition: 'all 0.25s ease',
                  overflow: 'hidden',
                  marginBottom: '16px'
                }}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder=""
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError('');
                    }}
                    onFocus={() => setFocusedConfirmPassword(true)}
                    onBlur={() => setFocusedConfirmPassword(false)}
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
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                    {showConfirmPassword ? (
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

                {password && confirmPassword && password !== confirmPassword && (
                  <div style={{ color: '#ef4444', fontSize: '10px', fontFamily: 'var(--font-mono)', marginBottom: '16px', marginTop: '-8px' }}>
                    Passwords do not match
                  </div>
                )}

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
                  disabled={!password || !confirmPassword || loading}
                  onClick={handleSubmit}
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
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FanResetPassword;
