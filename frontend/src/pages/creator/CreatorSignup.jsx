/**
 * @file CreatorSignup.jsx
 * @description Creator signup screen with phone number input.
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sendOTP } from '../../services/creatorApi';
import api from '../../services/creatorApi'; // For custom axios calls
import { useGoogleLogin } from '@react-oauth/google';
import { Button } from '../../components/ama/ui/Button';

const CreatorSignup = () => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      setGoogleLoading(true);
      setError('');
      // Send the access_token to the backend
      const response = await api.post('/api/auth/google-auth', {
        access_token: tokenResponse.access_token
      });
      if (response.data.success) {
        navigate('/creator/connect-instagram');
      }
    } catch (err) {
      console.error(err);
      setError('Google Login failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: (error) => setError('Google Login was cancelled or failed.')
  });

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
        padding: '32px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* HEADER */}
        <div style={{
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          marginBottom: '20px'
        }}>
          <Link to="/" style={{
            position: 'absolute',
            left: 0,
            color: 'var(--white)',
            textDecoration: 'none',
            fontSize: '20px'
          }}>
            ←
          </Link>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '20px',
            color: 'var(--white)',
            margin: 0
          }}>
          </h1>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* LOGO SECTION */}
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <div style={{
              width: '120px',
              margin: '0 auto 8px',
              display: 'block'
            }}>
              <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 520.97">
                <defs>
                  <style>
                    {`.cls-1{font-size:566.36px;fill:var(--white);font-family:Garet-Book, Garet;}.cls-2{fill:var(--blue);}.cls-3{letter-spacing:-0.02em;}`}
                  </style>
                </defs>
                <text class="cls-1" transform="translate(33.52 457.72)">skr<tspan class="cls-2" x="885.21" y="0">ii</tspan><tspan x="1184.24" y="0">b</tspan><tspan class="cls-3" x="1581.82" y="0">e</tspan></text>
              </svg>
            </div>
            <div style={{ color: 'var(--g2)', fontSize: '14px' }}>
              Get paid to reply.
            </div>
          </div>

          {/* INPUT SECTION */}
          <div style={{ marginTop: '40px' }}>
            <label style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              color: 'var(--g3)',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '10px'
            }}>
              YOUR MOBILE NUMBER
            </label>

            <div style={{ display: 'flex' }}>
              <div style={{
                background: 'var(--ink3)',
                border: '1px solid var(--ink5)',
                borderRight: 'none',
                borderRadius: 'var(--radius-md) 0 0 var(--radius-md)',
                padding: '15px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--g2)',
                fontSize: '16px'
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
                style={{
                  flex: 1,
                  background: 'var(--ink3)',
                  border: '1px solid var(--ink5)',
                  borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                  padding: '15px',
                  fontSize: '16px',
                  color: 'var(--white)',
                  outline: 'none',
                  transition: 'border-color 0.15s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--blue)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--ink5)'}
              />
            </div>

            {error && (
              <div style={{
                color: 'var(--red)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                marginTop: '10px'
              }}>
                {error}
              </div>
            )}

            <div style={{ marginTop: '24px' }}>
              <Button
                disabled={isInvalid || loading}
                onClick={handleSendOTP}
              >
                {loading ? 'Sending...' : 'Send OTP →'}
              </Button>
            </div>
          </div>

          {/* PROMO BANNER */}
          <div style={{ 
            background: 'rgba(59, 168, 216, 0.05)', 
            border: '1px solid rgba(59, 168, 216, 0.2)', 
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            textAlign: 'center',
            marginTop: '32px'
          }}>
            <div style={{ 
              color: 'var(--blue)', 
              fontWeight: 700, 
              fontSize: '15px',
              marginBottom: '4px'
            }}>
              Free for first 3 months
            </div>
            <div style={{ 
              color: 'var(--g3)', 
              fontSize: '11px',
              fontFamily: 'var(--font-mono)'
            }}>
              0% commission for first 100 creators · forever
            </div>
          </div>
          {/* SOCIAL LOGIN */}
          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ textAlign: 'center', color: 'var(--g3)', fontSize: '12px', marginBottom: '8px' }}>
              or continue with
            </div>
            <button onClick={() => loginWithGoogle()} disabled={googleLoading} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '14px',
              background: 'var(--ink3)',
              border: '1px solid var(--ink5)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--white)',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background 0.2s',
              cursor: googleLoading ? 'wait' : 'pointer'
            }}
            onMouseEnter={(e) => { if (!googleLoading) e.currentTarget.style.background = 'var(--ink4)'; }}
            onMouseLeave={(e) => { if (!googleLoading) e.currentTarget.style.background = 'var(--ink3)'; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {googleLoading ? 'Connecting...' : 'Continue with Google'}
            </button>
            <a href="http://localhost:5000/api/auth/facebook" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '14px',
              background: '#1877F2',
              border: '1px solid #1877F2',
              borderRadius: 'var(--radius-md)',
              color: 'var(--white)',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.98h-1.514c-1.49 0-1.956.935-1.956 1.895v2.246h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" fill="white"/>
              </svg>
              Continue with Meta
            </a>
          </div>
        </div>

        {/* FOOTER TRUST */}
        <div style={{
          textAlign: 'center',
          marginTop: '40px',
          color: 'var(--g3)',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          lineHeight: 1.5
        }}>
          By continuing you agree to our<br />Terms & Privacy Policy
        </div>
      </div>
    </div>
  );
};

export default CreatorSignup;
