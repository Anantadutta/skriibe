/**
 * @file CreatorOnboardPricing.jsx
 * @description Step 2 of onboarding: Pricing and activation.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { savePricing } from '../../services/creatorApi';
import { Button } from '../../components/ama/ui/Button';

const CreatorOnboardPricing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const creatorData = location.state?.creator;

  const [price, setPrice] = useState(99);
  const [dailyCap, setDailyCap] = useState(50);
  const [customPrice, setCustomPrice] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!creatorData) {
      navigate('/creator/signup');
    }
  }, [creatorData, navigate]);

  const priceOptions = [
    { value: 49, label: 'Accessible' },
    { value: 99, label: 'Popular ⭐' },
    { value: 199, label: 'Premium' }
  ];

  const handlePriceSelect = (val) => {
    setPrice(val);
    setIsCustom(false);
  };

  const handleCustomSelect = () => {
    setIsCustom(true);
    if (customPrice) setPrice(parseInt(customPrice));
  };

  const handleActivate = async () => {
    setLoading(true);
    try {
      await savePricing({ price, dailyCap });
      navigate('/creator/dashboard', { state: { message: 'Page activated successfully!' } });
    } catch (err) {
      alert('Failed to activate page');
    } finally {
      setLoading(false);
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
        <div style={{ textAlign: 'center', padding: '0 0 24px' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', color: 'var(--white)', margin: '0 0 8px' }}>
            Set your price
          </h1>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--blue)' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--blue)' }} />
            <span style={{ color: 'var(--g3)', fontSize: '10px', fontFamily: 'var(--font-mono)', marginLeft: '4px' }}>STEP 2 OF 2</span>
          </div>
        </div>

        {/* PRICE SELECTION */}
        <div style={{ marginBottom: '32px' }}>
          <label style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--g3)', textTransform: 'uppercase', display: 'block', marginBottom: '16px' }}>
            HOW MUCH PER QUESTION?
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {priceOptions.map(opt => (
              <div
                key={opt.value}
                onClick={() => handlePriceSelect(opt.value)}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  background: !isCustom && price === opt.value ? 'var(--bdim)' : 'var(--ink3)',
                  border: `1px solid ${!isCustom && price === opt.value ? 'var(--blue)' : 'var(--ink5)'}`,
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '24px',
                  fontWeight: 700,
                  color: !isCustom && price === opt.value ? 'var(--blue)' : 'var(--white)'
                }}>
                  ₹{opt.value}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--g3)', textTransform: 'uppercase', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                  {opt.label}
                </div>
              </div>
            ))}
            <div
              onClick={handleCustomSelect}
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                background: isCustom ? 'var(--bdim)' : 'var(--ink3)',
                border: `1px solid ${isCustom ? 'var(--blue)' : 'var(--ink5)'}`,
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s ease'
              }}
            >
              {isCustom ? (
                <input
                  type="number"
                  autoFocus
                  placeholder="Enter"
                  value={customPrice}
                  onChange={(e) => {
                    setCustomPrice(e.target.value);
                    setPrice(parseInt(e.target.value) || 0);
                  }}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--blue)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '20px',
                    fontWeight: 700,
                    textAlign: 'center',
                    outline: 'none'
                  }}
                />
              ) : (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', color: 'var(--white)', fontWeight: 700 }}>
                  Custom
                </div>
              )}
              <div style={{ fontSize: '10px', color: 'var(--g3)', textTransform: 'uppercase', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                Your Choice
              </div>
            </div>
          </div>
        </div>

        {/* DAILY CAP */}
        <div style={{ marginBottom: '40px' }}>
          <label style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--g3)', textTransform: 'uppercase', display: 'block', marginBottom: '16px' }}>
            MAX QUESTIONS PER DAY
          </label>
          <div style={{
            textAlign: 'center',
            fontFamily: 'var(--font-mono)',
            color: 'var(--white)',
            fontSize: '14px',
            marginBottom: '16px'
          }}>
            {dailyCap} questions/day
          </div>
          <input
            type="range"
            min="5"
            max="100"
            step="5"
            value={dailyCap}
            onChange={(e) => setDailyCap(parseInt(e.target.value))}
            style={{
              width: '100%',
              accentColor: 'var(--blue)',
              cursor: 'pointer'
            }}
          />
        </div>

        {/* PREVIEW CARD */}
        <div style={{
          background: 'var(--ink2)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--ink5)',
          padding: '24px',
          marginBottom: '32px',
          textAlign: 'center'
        }}>
          <div style={{ color: 'var(--g3)', fontSize: '10px', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
            PREVIEW
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', color: 'var(--white)', marginBottom: '16px' }}>
            ASK ME ANYTHING
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '40px', fontWeight: 700, color: 'var(--blue)', marginBottom: '16px' }}>
            ₹{price}
          </div>
          <div style={{ color: 'var(--g2)', fontSize: '12px' }}>
            Reply guaranteed within 24 hours
          </div>
        </div>

        <Button
          variant="success"
          disabled={loading || (isCustom && (!price || price < 10))}
          onClick={handleActivate}
        >
          {loading ? 'Activating...' : 'Activate my page →'}
        </Button>
      </div>
    </div>
  );
};

export default CreatorOnboardPricing;
