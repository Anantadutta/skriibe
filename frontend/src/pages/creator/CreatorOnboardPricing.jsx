/**
 * @file CreatorOnboardPricing.jsx
 * @description Step 2 of onboarding: Pricing selection (C4).
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { savePricing } from '../../services/creatorApi';
import { PhoneFrame } from '../../components/ama/layout/PhoneFrame';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

const CreatorOnboardPricing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [creatorData, setCreatorData] = useState(location.state?.creator || null);

  const [price, setPrice] = useState(10);
  const [dailyCap, setDailyCap] = useState(50);
  const [weeklyGoal, setWeeklyGoal] = useState(1500);
  const [loading, setLoading] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [enableAMA, setEnableAMA] = useState(true);

  const getCurrencySymbol = (phoneStr) => {
    if (!phoneStr) return '₹';
    const parsed = parsePhoneNumberFromString(phoneStr.startsWith('+') ? phoneStr : '+' + phoneStr);
    if (parsed && parsed.country) {
      switch (parsed.country) {
        case 'US': return '$';
        case 'CA': return 'C$';
        case 'GB': return '£';
        case 'AE': return 'AED ';
        case 'IN': return '₹';
        default: return '₹';
      }
    }
    return '₹';
  };

  const currencySymbol = getCurrencySymbol(creatorData?.phone);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!creatorData) {
      import('../../services/creatorApi').then(({ getMe }) => {
        getMe().then(res => {
          if (res.success && res.creator) {
            setCreatorData(res.creator);
          } else {
            navigate('/onboard/profile');
          }
        }).catch(() => {
          navigate('/onboard/profile');
        });
      });
    } else {
      if (creatorData.price !== undefined) {
        if (creatorData.price === 0) {
          setPrice(0);
          setEnableAMA(false);
        } else {
          setEnableAMA(true);
          const presets = [10, 20, 30, 40, 50];
          if (presets.includes(creatorData.price)) {
            setPrice(creatorData.price);
          } else {
            setPrice(10);
          }
        }
      }
    }
  }, [creatorData, navigate]);

  const pricingOptions = [
    { value: 10, label: 'Starter', desc: 'Get more messages' },
    { value: 20, label: 'Most popular', desc: 'Most creators start here' },
    { value: 30, label: 'Premium', desc: 'Higher value responses' },
    { value: 40, label: 'Expert', desc: 'Strong authority' },
    { value: 50, label: 'Master', desc: 'Top tier' }
  ];

  const handleActivate = async () => {
    setLoading(true);
    try {
      await savePricing({ price: Number(price), dailyCap, weeklyGoal });
      if (location.state?.returnTo) {
        navigate(location.state.returnTo, {
          state: {
            creator: { ...creatorData, price: Number(price), dailyCap, weeklyGoal }
          }
        });
      } else {
        navigate('/dashboard/share', {
          state: {
            isNewlyLive: true,
            creator: { ...creatorData, price: Number(price), dailyCap, weeklyGoal }
          }
        });
      }
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
            padding: '16px 20px 100px',
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
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
                <div style={{ fontSize: '14px', color: '#fff', fontWeight: 600, marginBottom: '16px' }}>
                  Do you want to set up Ask me anything? <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <button
                    onClick={() => { setEnableAMA(true); if (price === 0) setPrice(10); }}
                    style={{
                      flex: 1, padding: '12px', borderRadius: '12px',
                      background: enableAMA === true ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${enableAMA === true ? '#06b6d4' : 'rgba(255, 255, 255, 0.1)'}`,
                      color: '#fff', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >Yes</button>
                  <button
                    onClick={() => { setEnableAMA(false); setPrice(0); }}
                    style={{
                      flex: 1, padding: '12px', borderRadius: '12px',
                      background: enableAMA === false ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${enableAMA === false ? '#06b6d4' : 'rgba(255, 255, 255, 0.1)'}`,
                      color: '#fff', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >No</button>
                </div>

                {enableAMA && (
                  <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500, marginBottom: '16px', lineHeight: '1.5' }}>
                      When you are offline, fans see an AMA option on your profile. They pay and submit a question it waits in your queue until you come back online and reply. Optional.
                    </div>
                
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '32px', fontWeight: 800, color: '#fff' }}>{currencySymbol}{price || 0}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '20px', flexWrap: 'wrap' }}>
                      {pricingOptions.map(opt => (
                        <button 
                          key={opt.value} 
                          onClick={() => setPrice(opt.value)}
                          style={{
                            flex: 1,
                            padding: '12px 0',
                            background: price === opt.value ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                            border: `1px solid ${price === opt.value ? '#06b6d4' : 'rgba(255, 255, 255, 0.1)'}`,
                            borderRadius: '12px',
                            color: '#fff',
                            fontWeight: 600,
                            fontFamily: 'monospace, var(--font-mono)',
                            fontSize: '14px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: price === opt.value ? '0 0 10px rgba(6, 182, 212, 0.3)' : 'none'
                          }}
                        >
                          {currencySymbol}{opt.value}
                        </button>
                      ))}
                    </div>
                    
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '16px', lineHeight: '1.5' }}>
                      Most creators start around {currencySymbol}10. You can change this later.
                    </div>
                  </div>
                )}
              </div>


            </div>

            {/* BOTTOM CTA */}
            <div style={{
              marginTop: '8px',
              marginBottom: '40px',
              padding: '0 20px',
              boxSizing: 'border-box',
              zIndex: 10
            }}>
              <button
                onClick={handleActivate}
                disabled={loading}
                className="activate-btn"
              >
                {loading ? 'Activating...' : (location.state?.returnTo ? 'Save Changes' : 'Activate my page →')}
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
          Made with 🤍 from Skriibe
        </div>

      </div>
    </div>
  );
};

export default CreatorOnboardPricing;
