/**
 * @file CreatorVerifyOTP.jsx
 * @description OTP verification screen for creator login.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { verifyOTP, sendOTP } from '../../services/creatorApi';

const CreatorVerifyOTP = () => {
  const navigate = useNavigate();
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
      const { creator } = res.data;
      if (creator.ama_enabled) {
        navigate('/creator/dashboard', { state: { creator } });
      } else {
        navigate('/creator/connect-instagram', { state: { creator } });
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
                  background: 'var(--ink3)',
                  border: `1px solid ${digit ? 'rgba(59,168,216,0.3)' : 'var(--ink5)'}`,
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '24px',
                  color: 'var(--white)',
                  outline: 'none',
                  transition: 'all 0.15s ease',
                  ...(digit && { borderColor: 'var(--blue)' })
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--blue)'}
                onBlur={(e) => e.target.style.borderColor = digit ? 'var(--blue)' : 'var(--ink5)'}
              />
            ))}
          </div>

          {loading && (
            <div style={{ color: 'var(--blue)', fontSize: '14px', marginBottom: '16px' }}>
              Verifying...
            </div>
          )}

          {error && (
            <div style={{ color: 'var(--red)', fontSize: '12px', marginBottom: '16px' }}>
              {error}
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
