/**
 * @file CreatorVerifyOTP.jsx
 * @description OTP verification screen for creator login.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { verifyOTP, sendOTP } from '../../services/creatorApi';
import { useAuth } from '../../context/AuthContext';

const CreatorVerifyOTP = () => {
  const navigate = useNavigate();
  const { setAuthData } = useAuth();
  const location = useLocation();
  const phone = location.state?.phone;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(30);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!phone) {
      navigate('/creator/signup');
      return;
    }
    inputRefs.current[0].focus();
  }, [phone, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);

    if (val && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    if (newOtp.every(digit => digit !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData.getData('text').slice(0, 6).split('');
    const newOtp = [...otp];
    data.forEach((digit, i) => {
      if (i < 6 && !isNaN(digit)) newOtp[i] = digit;
    });
    setOtp(newOtp);
    if (newOtp.every(digit => digit !== '')) {
      handleVerify(newOtp.join(''));
    } else {
      const nextIndex = newOtp.findIndex(d => d === '');
      if (nextIndex !== -1) inputRefs.current[nextIndex].focus();
    }
  };

  const handleVerify = async (otpString) => {
    setLoading(true);
    setError('');
    try {
      const res = await verifyOTP(phone, otpString);
      const { creator, token } = res.data;
      if (token) {
        setAuthData(['creator'], 'creator', token);
      }
      if (creator.handle) {
        navigate('/creator/dashboard', { state: { creator }, replace: true });
      } else {
        navigate('/onboard/profile', { state: { creator }, replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    try {
      await sendOTP(phone);
      setCountdown(30);
      setError('');
    } catch (err) {
      setError('Failed to resend OTP');
    }
  };

  return (
    <div className="creator-theme" style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Background Blobs */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '10%',
        width: '250px',
        height: '250px',
        borderRadius: '50%',
        background: '#3DD9FF',
        filter: 'blur(50px)',
        opacity: 0.15,
        pointerEvents: 'none',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: '15%',
        right: '10%',
        width: '280px',
        height: '280px',
        borderRadius: '50%',
        background: '#7c3aed',
        filter: 'blur(50px)',
        opacity: 0.15,
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div className="card-redesign" style={{
        width: '100%',
        maxWidth: '480px',
        background: '#141420',
        borderRadius: '14px',
        border: '1px solid #2a2a3e',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 1
      }}>
        {/* HEADER */}
        <div style={{
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <Link to="/creator/signup" style={{
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
            fontSize: '18px',
            color: 'var(--white)',
            margin: 0
          }}>
            Verify your number
          </h1>
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <p style={{ color: 'var(--g2)', fontSize: '14px', marginBottom: '32px' }}>
            We sent a code to <span style={{ color: 'var(--white)' }}>+91 {phone}</span>
          </p>

          {/* OTP INPUTS */}
          <div style={{
            display: 'flex',
            gap: '8px',
            justifyContent: 'center',
            marginBottom: '32px'
          }}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => inputRefs.current[i] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                onPaste={handlePaste}
                disabled={loading}
                style={{
                  width: '44px',
                  height: '52px',
                  background: '#141420',
                  border: `1px solid ${digit ? '#3DD9FF' : '#1e1e2e'}`,
                  borderRadius: '12px',
                  textAlign: 'center',
                  fontFamily: 'var(--font-body)',
                  fontSize: '24px',
                  color: 'var(--white)',
                  outline: 'none',
                  transition: 'all 0.15s ease',
                  boxShadow: digit ? '0 0 0 3px rgba(61, 217, 255, 0.2)' : 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3DD9FF';
                  e.target.style.boxShadow = '0 0 0 3px rgba(61, 217, 255, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = digit ? '#3DD9FF' : '#1e1e2e';
                  e.target.style.boxShadow = digit ? '0 0 0 3px rgba(61, 217, 255, 0.2)' : 'none';
                }}
              />
            ))}
          </div>

          {loading && (
            <div style={{ color: 'var(--blue)', fontSize: '14px', marginBottom: '16px' }}>
              Verifying...
            </div>
          )}

          {error && (
            <div className="warning-pill" style={{
              background: '#1a0f00',
              border: '1px solid #3a2000',
              color: '#f5a623',
              borderRadius: '20px',
              padding: '8px 16px',
              display: 'inline-block',
              fontSize: '12px',
              marginBottom: '16px',
              fontFamily: 'var(--font-body)',
              textAlign: 'center'
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* RESEND */}
          <div style={{ marginTop: '20px' }}>
            {countdown > 0 ? (
              <span style={{ color: 'var(--g3)', fontSize: '13px' }}>
                Resend OTP in {countdown}s
              </span>
            ) : (
              <button
                onClick={handleResend}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--blue)',
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                Resend OTP
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorVerifyOTP;
