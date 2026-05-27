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
  const [isCustom, setIsCustom] = useState(false);
  const [customPrice, setCustomPrice] = useState('');

  useEffect(() => {
    // If we don't have creatorData, redirect back to profile setup
    if (!creatorData) {
      navigate('/onboard/profile');
    }
  }, [creatorData, navigate]);

  const pricingOptions = [
    { value: 49, label: 'Starter', desc: 'Testing the waters' },
    { value: 99, label: 'Most popular', desc: 'Sweet spot' },
    { value: 199, label: 'Premium', desc: '30K–100K followers' },
    { value: 499, label: 'Expert', desc: 'Strong authority' }
  ];

  const handleActivate = async () => {
    setLoading(true);
    try {
      await savePricing({ price: Number(price), dailyCap });
      navigate('/dashboard/share', {
        state: {
          isNewlyLive: true,
          creator: { ...creatorData, price: Number(price), dailyCap }
        }
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to activate page');
    } finally {
      setLoading(false);
    }
  };

  // Monthly Earnings = Price * 100 questions (1% of 10k followers) * 0.9 (excluding 10% platform commission)
  const estimatedEarnings = Math.round((Number(price) || 0) * 100 * 0.9);
  const selectedPrice = Number(price) || 0;
  const min = 10;
  const max = 100;

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
      {/* Background Shader & Noise */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        background: '#0a0a0f',
        overflow: 'hidden',
        pointerEvents: 'none'
      }}>
        {/* Aurora purple, deep violet, electric blue waves */}
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
        {/* Subtle noise/grain texture overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          opacity: 0.035,
          mixBlendMode: 'overlay',
          pointerEvents: 'none'
        }} />
        {/* Sparkle dots scattered */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div className="sparkle" style={{ top: '10%', left: '15%', animationDelay: '0s' }} />
          <div className="sparkle" style={{ top: '30%', left: '82%', animationDelay: '1.8s' }} />
          <div className="sparkle" style={{ top: '55%', left: '5%', animationDelay: '3.2s' }} />
          <div className="sparkle" style={{ top: '78%', left: '88%', animationDelay: '1s' }} />
          <div className="sparkle" style={{ top: '90%', left: '20%', animationDelay: '2.5s' }} />
        </div>
      </div>

      {/* CSS Keyframes and Animation */}
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
        .gradient-title {
          font-family: var(--font-heading);
          font-size: 20px;
          font-weight: 800;
          background: linear-gradient(90deg, #7c3aed 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .activate-btn {
          width: 100%;
          max-width: 280px;
          padding: 14px 28px;
          border-radius: 9999px;
          background: linear-gradient(90deg, #7c3aed 0%, #06b6d4 100%);
          color: #ffffff;
          font-weight: 700;
          font-size: 14px;
          border: none;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2);
        }
        .activate-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 0 20px #7c3aed;
        }
        .activate-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .activate-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        input[type=range].cyan-slider {
          -webkit-appearance: none;
          width: 100%;
          background: rgba(255, 255, 255, 0.08);
          height: 6px;
          border-radius: 999px;
          outline: none;
        }
        input[type=range].cyan-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #06b6d4;
          cursor: pointer;
          box-shadow: 0 0 8px #06b6d4, 0 0 12px #7c3aed;
          transition: transform 0.15s ease;
        }
        input[type=range].cyan-slider::-webkit-slider-thumb:hover {
          transform: scale(1.25);
        }
      `}} />

      {/* Main Page Container */}
      <div style={{
        width: '100%',
        maxWidth: '480px',
        minHeight: '100vh',
        padding: '24px 16px 100px', // comfortable padding on sides
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 1
      }}>
        
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
              height: '32px',
              marginBottom: '16px'
            }}>
              <button
                onClick={() => navigate(-1)}
                style={{
                  position: 'absolute',
                  left: 0,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '50%',
                  color: '#ffffff',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  padding: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'translateX(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                ←
              </button>
              <div className="gradient-title" style={{ margin: '0 auto' }}>
                Set your price
              </div>
            </div>

            {/* PROGRESS BAR: 100% COMPLETE, VIOLET TO CYAN GRADIENT */}
            <div style={{
              width: '100%',
              height: '4px',
              background: 'linear-gradient(90deg, #7c3aed 0%, #06b6d4 100%)',
              borderRadius: '999px',
              marginBottom: '20px'
            }} />

            {/* SCROLL CONTAINER */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              paddingRight: '4px',
              marginBottom: '24px'
            }}>
              <span style={{
                color: '#94a3b8',
                fontSize: '13px',
                display: 'block',
                marginBottom: '16px',
                fontWeight: 500,
                textAlign: 'left'
              }}>
                Choose your Ask Me Anything price:
              </span>

              {/* PRICING OPTIONS STACK */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginBottom: '24px'
              }}>
                {pricingOptions.map(opt => {
                  const isSelected = !isCustom && price === opt.value;
                  return (
                    <div
                      key={opt.value}
                      onClick={() => {
                        setIsCustom(false);
                        setPrice(opt.value);
                      }}
                      style={{
                        background: isSelected ? 'rgba(124, 58, 237, 0.06)' : 'rgba(255, 255, 255, 0.04)',
                        backdropFilter: 'blur(12px)',
                        border: isSelected ? '1px solid #7c3aed' : '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '16px',
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transform: isSelected ? 'scale(1.02)' : 'none',
                        boxShadow: isSelected ? '0 0 18px rgba(124,58,237,0.25)' : 'none',
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        {/* Radio button indicator */}
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: isSelected ? '1.5px solid #06b6d4' : '1.5px solid rgba(255, 255, 255, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'transparent',
                          boxShadow: isSelected ? '0 0 8px rgba(6,182,212,0.25)' : 'none'
                        }}>
                          {isSelected && (
                            <div style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              background: '#06b6d4'
                            }} />
                          )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              color: '#ffffff',
                              fontSize: '14px',
                              fontWeight: 700
                            }}>
                              {opt.label}
                            </span>
                            {opt.badge && (
                              <span style={{
                                background: 'linear-gradient(90deg, #7c3aed 0%, #06b6d4 100%)',
                                color: '#ffffff',
                                fontSize: '9px',
                                fontWeight: 800,
                                padding: '2px 8px',
                                borderRadius: '999px',
                                fontFamily: 'monospace, var(--font-mono)',
                                textTransform: 'uppercase',
                                display: 'inline-block'
                              }}>
                                {opt.badge}
                              </span>
                            )}
                          </div>
                          <span style={{
                            color: '#94a3b8',
                            fontSize: '11px',
                            marginTop: '2px'
                          }}>
                            {opt.desc}
                          </span>
                        </div>
                      </div>
                      <span style={{
                        color: '#06b6d4',
                        fontSize: '18px',
                        fontWeight: 800,
                        fontFamily: 'monospace, var(--font-mono)'
                      }}>
                        ₹{opt.value}
                      </span>
                    </div>
                  );
                })}

                {/* Custom Price Option */}
                {(() => {
                  const isSelected = isCustom;
                  return (
                    <div
                      onClick={() => {
                        setIsCustom(true);
                        setPrice(customPrice ? Number(customPrice) : '');
                      }}
                      style={{
                        background: isSelected ? 'rgba(124, 58, 237, 0.06)' : 'rgba(255, 255, 255, 0.04)',
                        backdropFilter: 'blur(12px)',
                        border: isSelected ? '1px solid #7c3aed' : '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '16px',
                        padding: '16px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: isSelected ? '12px' : '0px',
                        cursor: 'pointer',
                        transform: isSelected ? 'scale(1.02)' : 'none',
                        boxShadow: isSelected ? '0 0 18px rgba(124,58,237,0.25)' : 'none',
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          {/* Radio button indicator */}
                          <div style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            border: isSelected ? '1.5px solid #06b6d4' : '1.5px solid rgba(255, 255, 255, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'transparent',
                            boxShadow: isSelected ? '0 0 8px rgba(6,182,212,0.25)' : 'none'
                          }}>
                            {isSelected && (
                              <div style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                background: '#06b6d4'
                              }} />
                            )}
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                            <span style={{
                              color: '#ffffff',
                              fontSize: '14px',
                              fontWeight: 700
                            }}>
                              Custom Price
                            </span>
                            <span style={{
                              color: '#94a3b8',
                              fontSize: '11px',
                              marginTop: '2px'
                            }}>
                              Set your own rate
                            </span>
                          </div>
                        </div>

                        {!isSelected && (
                          <span style={{
                            color: '#06b6d4',
                            fontSize: '18px',
                            fontWeight: 800,
                            fontFamily: 'monospace, var(--font-mono)'
                          }}>
                            ₹—
                          </span>
                        )}
                        {isSelected && customPrice && (
                          <span style={{
                            color: '#06b6d4',
                            fontSize: '18px',
                            fontWeight: 800,
                            fontFamily: 'monospace, var(--font-mono)'
                          }}>
                            ₹{customPrice}
                          </span>
                        )}
                      </div>

                      {isSelected && (
                        <div 
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            paddingLeft: '32px',
                            width: '100%',
                            boxSizing: 'border-box'
                          }}
                        >
                          <span style={{
                            color: '#06b6d4',
                            fontSize: '16px',
                            fontWeight: 800,
                            fontFamily: 'monospace, var(--font-mono)'
                          }}>
                            ₹
                          </span>
                          <input
                            type="number"
                            placeholder="Enter amount"
                            autoFocus
                            value={customPrice}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '' || /^\d+$/.test(val)) {
                                setCustomPrice(val);
                                setPrice(val ? Number(val) : '');
                              }
                            }}
                            style={{
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              color: '#ffffff',
                              fontSize: '14px',
                              fontWeight: 700,
                              outline: 'none',
                              width: '100%',
                              maxWidth: '140px',
                              boxSizing: 'border-box',
                              fontFamily: 'monospace, var(--font-mono)'
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* DAILY QUESTION CAP */}
              <div style={{ marginBottom: '24px', textAlign: 'left' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px'
                }}>
                  <label style={{
                    fontFamily: 'monospace, var(--font-mono)',
                    fontSize: '10px',
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontWeight: 700
                  }}>
                    DAILY QUESTION CAP
                  </label>
                  <span style={{
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: 700,
                    fontFamily: 'monospace, var(--font-mono)'
                  }}>
                    {dailyCap} / day
                  </span>
                </div>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step="5"
                  value={dailyCap}
                  onChange={(e) => setDailyCap(Number(e.target.value))}
                  className="cyan-slider"
                  style={{ background: `linear-gradient(to right, #7c3aed 0%, #06b6d4 ${((dailyCap - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) ${((dailyCap - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) 100%)` }}
                />
              </div>

              {/* ESTIMATED EARNINGS CARD */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderLeft: '4px solid #10b981',
                borderRadius: '16px',
                padding: '20px 16px',
                textAlign: 'center',
                backdropFilter: 'blur(12px)'
              }}>
                <span style={{
                  fontFamily: 'monospace, var(--font-mono)',
                  fontSize: '9px',
                  color: '#10b981',
                  letterSpacing: '0.08em',
                  display: 'block',
                  fontWeight: 700
                }}>
                  ESTIMATED MONTHLY EARNINGS
                </span>
                <div style={{
                  color: '#10b981',
                  fontSize: '34px',
                  fontWeight: 800,
                  fontFamily: 'monospace, var(--font-mono)',
                  margin: '8px 0 4px',
                  textShadow: '0 0 10px rgba(16, 185, 129, 0.25)'
                }}>
                  ₹{(dailyCap * selectedPrice * 0.01 * 30).toLocaleString('en-IN')}
                </div>
                <p style={{
                  color: '#94a3b8',
                  fontSize: '11px',
                  margin: 0
                }}>
                  Based on 1% conversion · 10K followers
                </p>
              </div>
            </div>

            {/* BOTTOM CTA */}
            <div style={{
              position: 'absolute',
              bottom: '16px',
              left: 0,
              right: 0,
              zIndex: 10,
              padding: '0 20px',
              boxSizing: 'border-box'
            }}>
              <button
                onClick={handleActivate}
                disabled={loading || (isCustom && (customPrice === '' || Number(customPrice) < 10))}
                className="activate-btn"
              >
                {loading ? 'Activating...' : 'Activate my page →'}
              </button>
            </div>
          </div>
        </PhoneFrame>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          color: '#94a3b8',
          fontSize: '11px',
          fontFamily: 'var(--font-mono), monospace',
          marginTop: '24px',
          opacity: 0.75
        }}>
          Made with 🤍 for bold conversations
        </div>

      </div>
    </div>
  );
};

export default CreatorOnboardPricing;
