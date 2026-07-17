import React from 'react';
import { useNavigate } from 'react-router-dom';
import TransparentLogo from '../components/TransparentLogo';

const AffiliateProgram = ({ theme }) => {
  const navigate = useNavigate();
  
  const isDark = theme === 'dark';
  
  const bg = isDark ? '#0a0a0f' : '#ffffff';
  const textMain = isDark ? '#ffffff' : '#111827';
  const textSecondary = isDark ? '#a3a3a3' : '#4b5563';
  const cardBg = isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff';
  const cardBorder = isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb';

  return (
    <div style={{
      minHeight: '100vh',
      background: bg,
      color: textMain,
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        borderBottom: `1px solid ${cardBorder}`
      }}>
        <div onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <TransparentLogo src="/logo.png" alt="skriibe logo" style={{ height: '24px', width: 'auto', transform: 'scale(4)', transformOrigin: 'left center' }} />
        </div>
        <button 
          onClick={() => navigate('/creator/login')}
          style={{
            background: 'transparent',
            border: `1px solid ${cardBorder}`,
            color: textMain,
            padding: '8px 24px',
            borderRadius: '6px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '14px',
            textTransform: 'uppercase'
          }}
        >
          LOG IN / REGISTER
        </button>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 24px 80px 24px',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: '700',
          marginBottom: '24px',
          letterSpacing: '-0.02em'
        }}>
          Earn 25% of recurring revenue
        </h1>
        
        <p style={{
          fontSize: '18px',
          color: textSecondary,
          maxWidth: '600px',
          margin: '0 auto 40px',
          lineHeight: '1.6'
        }}>
          Refer people to Skriibe and earn 25% of our platform fee for life.<br/>
          If somebody signs up from your link, we attribute it to you automatically.
        </p>

        <button
          onClick={() => navigate('/creator/login')}
          style={{
            background: '#fbbf24', // Yellowish similar to Skool
            color: '#000000',
            border: 'none',
            padding: '16px 40px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '700',
            cursor: 'pointer',
            textTransform: 'uppercase',
            boxShadow: '0 4px 6px rgba(251, 191, 36, 0.2)',
            marginBottom: '80px',
            transition: 'transform 0.2s ease',
          }}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          BECOME AN AFFILIATE
        </button>

        {/* Steps Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '32px',
          textAlign: 'left'
        }}>
          
          {/* Step 1 */}
          <div>
            <div style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: isDark ? 'none' : '0 4px 6px rgba(0,0,0,0.05)',
              minHeight: '140px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{color: '#a3a3a3'}}>🔗</span> Your referral link
              </div>
              <div style={{
                display: 'flex',
                background: isDark ? '#000' : '#f3f4f6',
                borderRadius: '6px',
                border: `1px solid ${cardBorder}`,
                overflow: 'hidden'
              }}>
                <div style={{ padding: '12px', color: textSecondary, fontSize: '13px', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  https://skriibe.com/signup?ref=a4b
                </div>
                <button style={{
                  background: '#fbbf24',
                  border: 'none',
                  padding: '0 16px',
                  fontWeight: '700',
                  color: '#000',
                  cursor: 'pointer'
                }}>
                  COPY
                </button>
              </div>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>1. Share your link</h3>
            <p style={{ color: textSecondary, lineHeight: '1.6' }}>
              Share your referral link with your friends, followers, or customers.
            </p>
          </div>

          {/* Step 2 */}
          <div>
            <div style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: isDark ? 'none' : '0 4px 6px rgba(0,0,0,0.05)',
              minHeight: '140px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TransparentLogo src="/logo.png" alt="skriibe logo" style={{ height: '24px', width: 'auto', transform: 'scale(4)', transformOrigin: 'center center' }} />
              <div style={{ fontWeight: '700', marginTop: '16px', marginBottom: '8px' }}>Create your Skriibe account</div>
              <div style={{ fontSize: '13px', color: textSecondary }}>
                You were referred by <strong>Skriibe Team</strong>
              </div>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>2. Somebody signs up</h3>
            <p style={{ color: textSecondary, lineHeight: '1.6' }}>
              When your friend signs up for Skriibe using your link, they will be attributed to you automatically.
            </p>
          </div>

          {/* Step 3 */}
          <div>
            <div style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: isDark ? 'none' : '0 4px 6px rgba(0,0,0,0.05)',
              minHeight: '140px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '12px', color: textSecondary, marginBottom: '4px' }}>Pending</div>
                <div style={{ fontSize: '24px', fontWeight: '700' }}>₹0</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: textSecondary, marginBottom: '4px' }}>Available</div>
                <div style={{ fontSize: '24px', fontWeight: '700' }}>₹4,500</div>
              </div>
              <button style={{
                background: '#fbbf24',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                fontWeight: '700',
                color: '#000',
                cursor: 'pointer'
              }}>
                PAY OUT
              </button>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>3. Earn 25% commission</h3>
            <p style={{ color: textSecondary, lineHeight: '1.6' }}>
              You'll earn 25% of our platform fee from their earnings for life. Automatically tracked and paid out.
            </p>
          </div>

        </div>

      </main>
    </div>
  );
};

export default AffiliateProgram;
