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
