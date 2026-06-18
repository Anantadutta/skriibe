import React, { useState } from 'react';
import TransparentLogo from '../../components/TransparentLogo';
import { Link } from 'react-router-dom';

const CreatorForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const [focusedEmail, setFocusedEmail] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const response = await fetch('/api/creators/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage(data.message);
      } else {
        setError(data.message || 'Something went wrong');
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
            <Link to="/creator/login" style={{
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
                Reset your creator password
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
                  marginBottom: '16px'
                }}>
                  <input
                    type="email"
                    placeholder=""
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
                  disabled={!email || loading}
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
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorForgotPassword;
