/**
 * @file CreatorOnboardPricing.jsx
 * @description Step 2 of onboarding: Pricing selection (C4).
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { savePricing } from '../../services/creatorApi';
import { PhoneFrame } from '../../components/ama/layout/PhoneFrame';

const CreatorOnboardPricing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const creatorData = location.state?.creator;

  const [price, setPrice] = useState(99);
  const [dailyCap, setDailyCap] = useState(50);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If we don't have creatorData, redirect back to profile setup
    if (!creatorData) {
      navigate('/onboard/profile');
    }
  }, [creatorData, navigate]);

  const pricingOptions = [
    { value: 49, label: 'Starter', desc: 'Testing the waters' },
    { value: 99, label: 'Most popular', desc: 'Sweet spot', badge: 'popular' },
    { value: 199, label: 'Premium', desc: '30K–100K followers' },
    { value: 499, label: 'Expert', desc: 'Strong authority' }
  ];

  const handleActivate = async () => {
    setLoading(true);
    try {
      await savePricing({ price, dailyCap });
      navigate('/onboard/live', { state: { creator: { ...creatorData, price, dailyCap } } });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to activate page');
    } finally {
      setLoading(false);
    }
  };

  // Monthly Earnings = Price * 100 questions (1% of 10k followers) * 0.9 (excluding 10% platform commission)
  const estimatedEarnings = Math.round(price * 100 * 0.9);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px'
    }}>
      {/* MONOSPACED LABEL OUTSIDE PHONE FRAME */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '13px',
        color: 'var(--g3)',
        letterSpacing: '0.1em',
        marginBottom: '20px',
        textTransform: 'uppercase',
        fontWeight: 'bold'
      }}>
        
      </div>

      <PhoneFrame>
        <div style={{
          padding: '16px 20px 80px',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          boxSizing: 'border-box'
        }}>
          {/* HEADER WITH BACK CHEVRON */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            height: '24px',
            marginBottom: '10px'
          }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                position: 'absolute',
                left: 0,
                background: 'none',
                border: 'none',
                color: 'var(--white)',
                fontSize: '18px',
                cursor: 'pointer',
                padding: 0
              }}
            >
              ←
            </button>
            <div style={{
              margin: '0 auto',
              fontFamily: 'var(--font-heading)',
              fontSize: '15px',
              fontWeight: 700,
              color: 'var(--white)'
            }}>
              Set your price
            </div>
          </div>

          {/* PROGRESS BAR: BOTH SEGMENTS ACTIVE */}
          <div style={{
            display: 'flex',
            width: '100%',
            height: '4px',
            background: 'var(--ink5)',
            borderRadius: '2px',
            overflow: 'hidden',
            marginBottom: '18px'
          }}>
            <div style={{ flex: 1, background: '#3DD9FF' }} />
            <div style={{ flex: 1, background: '#3DD9FF' }} />
          </div>

          {/* SCROLL CONTAINER */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            paddingRight: '4px',
            marginBottom: '20px'
          }}>
            <span style={{
              color: 'var(--g2)',
              fontSize: '12px',
              display: 'block',
              marginBottom: '14px'
            }}>
              Choose your Ask Me Anything price:
            </span>

            {/* PRICING OPTIONS STACK */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              marginBottom: '20px',
              padding: '8px',
              overflow: 'hidden'
            }}>
              {pricingOptions.map(opt => {
                const isSelected = price === opt.value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => setPrice(opt.value)}
                    style={{
                      background: isSelected ? '#0d1f2b' : '#141420',
                      border: `1px solid ${isSelected ? '#3DD9FF' : '#2a2a3e'}`,
                      borderRadius: '14px',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transform: isSelected ? 'scale(1.02)' : 'none',
                      boxShadow: isSelected ? '0 4px 20px rgba(61,217,255,0.15)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {/* Radio button indicator */}
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: `1.5px solid ${isSelected ? '#3DD9FF' : '#2a2a3e'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'transparent',
                        boxShadow: isSelected ? '0 0 0 3px rgba(61,217,255,0.2)' : 'none'
                      }}>
                        {isSelected && (
                          <div style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: '#3DD9FF'
                          }} />
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            color: 'var(--white)',
                            fontSize: '13px',
                            fontWeight: 500
                          }}>
                            {opt.label}
                          </span>
                          {opt.badge && (
                            <span style={{
                              background: 'rgba(34,197,94,0.1)',
                              color: '#22C55E',
                              fontSize: '9px',
                              fontWeight: 700,
                              padding: '1px 6px',
                              borderRadius: '8px',
                              fontFamily: 'var(--font-mono)',
                              textTransform: 'uppercase',
                              transform: 'rotate(-2deg)',
                              display: 'inline-block'
                            }}>
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        <span style={{
                          color: 'var(--g3)',
                          fontSize: '11px',
                          marginTop: '1px'
                        }}>
                          {opt.desc}
                        </span>
                      </div>
                    </div>
                    <span style={{
                      color: isSelected ? '#3DD9FF' : 'var(--white)',
                      fontSize: '16px',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)'
                    }}>
                      ₹{opt.value}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* DAILY QUESTION CAP */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <label style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9px',
                  color: 'var(--g3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em'
                }}>
                  DAILY QUESTION CAP
                </label>
                <span style={{
                  color: 'var(--white)',
                  fontSize: '13px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)'
                }}>
                  {dailyCap} / day
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={dailyCap}
                onChange={(e) => setDailyCap(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: '#3DD9FF',
                  cursor: 'pointer',
                  height: '4px',
                  borderRadius: '2px',
                  background: 'var(--ink5)'
                }}
              />
            </div>

            {/* ESTIMATED EARNINGS CARD */}
            <div style={{
              background: '#0a1a0f',
              border: '1px solid #1a3a20',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center'
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '8px',
                color: '#3a7a3a',
                letterSpacing: '0.08em',
                display: 'block',
                fontWeight: 500
              }}>
                ESTIMATED MONTHLY EARNINGS
              </span>
              <div style={{
                color: '#4ade80',
                fontSize: '32px',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                margin: '8px 0 4px'
              }}>
                ₹{estimatedEarnings.toLocaleString('en-IN')}
              </div>
              <p style={{
                color: 'var(--g3)',
                fontSize: '10px',
                margin: 0
              }}>
                Based on 1% conversion · 10K followers
              </p>
            </div>
          </div>

          {/* BOTTOM CTA */}
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '20px',
            right: '20px',
            zIndex: 10
          }}>
            <button
              onClick={handleActivate}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '14px',
                background: '#3DD9FF',
                color: '#000000',
                fontWeight: 500,
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'none'
              }}
            >
              {loading ? 'Activating...' : 'Activate my page →'}
            </button>
          </div>
        </div>
      </PhoneFrame>
    </div>
  );
};

export default CreatorOnboardPricing;
