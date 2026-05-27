import React from 'react';
import { useNavigate } from 'react-router-dom';

const CreatorAccountHealth = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      width: '390px',
      minHeight: '100vh',
      background: '#0a0a0f', // Dark background matching the image
      color: '#FFFFFF',
      fontFamily: 'sans-serif',
      position: 'relative',
      margin: '0 auto',
      borderLeft: '1px solid #1A1A1A',
      borderRight: '1px solid #1A1A1A',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '20px 24px',
        position: 'relative',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div 
          onClick={() => navigate(-1)}
          style={{
            width: '36px', height: '36px',
            borderRadius: '50%',
            background: '#1A1A24',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </div>
        <h2 style={{
          position: 'absolute',
          left: 0, right: 0,
          textAlign: 'center',
          margin: 0,
          fontSize: '1.2rem',
          fontWeight: 700,
          pointerEvents: 'none'
        }}>
          Account health
        </h2>
      </div>

      <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
        
        {/* Banner: Account healthy */}
        <div style={{
          background: 'linear-gradient(180deg, #0d2a18 0%, #081a0e 100%)',
          border: '1px solid #144024',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div style={{
            background: '#4ade80',
            width: '40px', height: '40px',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '12px',
            boxShadow: '0 4px 12px rgba(74, 222, 128, 0.2)'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h1 style={{ margin: '0 0 8px', color: '#4ade80', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Account healthy
          </h1>
          <p style={{ margin: 0, color: '#4d7c5b', fontSize: '0.85rem' }}>
            1 strike · 3 remaining before suspension
          </p>
        </div>

        {/* Strike counter */}
        <div style={{
          background: '#16161e',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px',
          border: '1px solid #22222c'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Strike counter</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fb923c', fontWeight: 800, fontSize: '1.2rem', fontFamily: 'monospace' }}>
              <span>1</span>
              <span style={{ color: '#fb923c', opacity: 0.5, margin: '0 2px' }}>/</span>
              <span>4</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            {/* Progress Bar Segments */}
            <div style={{ flex: 1, height: '8px', background: '#fb923c', borderRadius: '4px' }}></div>
            <div style={{ flex: 1, height: '8px', background: '#2a2a36', borderRadius: '4px' }}></div>
            <div style={{ flex: 1, height: '8px', background: '#2a2a36', borderRadius: '4px' }}></div>
            <div style={{ flex: 1, height: '8px', background: '#2a2a36', borderRadius: '4px' }}></div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: '0.7rem', fontWeight: 600 }}>
            <div style={{ flex: 1, textAlign: 'center' }}>1-Warning</div>
            <div style={{ flex: 1, textAlign: 'center' }}>2-Review</div>
            <div style={{ flex: 1, textAlign: 'center' }}>3-Suspend</div>
            <div style={{ flex: 1, textAlign: 'center' }}>4-Ban</div>
          </div>
        </div>

        {/* Strike log */}
        <h3 style={{ margin: '0 0 12px 4px', fontSize: '1.1rem', fontWeight: 700 }}>Strike log</h3>
        <div style={{
          background: '#16161e',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '24px',
          border: '1px solid #22222c',
          display: 'flex',
          gap: '16px'
        }}>
          <div style={{
            minWidth: '36px', height: '36px',
            borderRadius: '50%',
            background: 'rgba(251, 146, 60, 0.1)',
            border: '1px solid rgba(251, 146, 60, 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
              <div style={{ color: '#fb923c', fontWeight: 700, fontSize: '0.95rem' }}>Strike 1 — SLA breach</div>
              <button style={{
                background: '#2a2a36',
                border: 'none',
                color: '#475569',
                padding: '4px 12px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'not-allowed'
              }}>
                Appeal
              </button>
            </div>
            <div style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: '1.4', marginBottom: '8px' }}>
              Question #SKR-20250428 · Auto-refund triggered
            </div>
            <div style={{ color: '#475569', fontSize: '0.7rem', fontWeight: 600, fontFamily: 'monospace' }}>
              28 Apr 2025
            </div>
          </div>
        </div>

        {/* Thresholds */}
        <h3 style={{ margin: '0 0 12px 4px', fontSize: '1.1rem', fontWeight: 700 }}>Thresholds</h3>
        <div style={{
          background: '#16161e',
          borderRadius: '16px',
          border: '1px solid #22222c',
          overflow: 'hidden',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', padding: '16px', borderBottom: '1px solid #22222c' }}>
            <div style={{ width: '80px', color: '#fb923c', fontWeight: 700, fontSize: '0.85rem' }}>Strike 2</div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Admin review and email warning</div>
          </div>
          <div style={{ display: 'flex', padding: '16px', borderBottom: '1px solid #22222c' }}>
            <div style={{ width: '80px', color: '#ef4444', fontWeight: 700, fontSize: '0.85rem' }}>Strike 3</div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Page auto-paused for 48 hours</div>
          </div>
          <div style={{ display: 'flex', padding: '16px' }}>
            <div style={{ width: '80px', color: '#ef4444', fontWeight: 700, fontSize: '0.85rem' }}>Strike 4</div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Permanent ban · payouts frozen</div>
          </div>
        </div>

        {/* How to improve */}
        <div style={{
          background: 'linear-gradient(180deg, rgba(13, 42, 24, 0.4) 0%, rgba(8, 26, 14, 0.4) 100%)',
          border: '1px solid #144024',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <h3 style={{ margin: '0 0 16px', color: '#4ade80', fontSize: '1.1rem', fontWeight: 700 }}>
            How to improve
          </h3>
          <ul style={{ 
            margin: 0, padding: 0, listStyleType: 'none', 
            display: 'flex', flexDirection: 'column', gap: '12px' 
          }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#4ade80', fontWeight: 'bold' }}>·</span>
              <span style={{ color: '#4d7c5b', fontSize: '0.9rem' }}>Keep reply rate above 90%</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#4ade80', fontWeight: 'bold' }}>·</span>
              <span style={{ color: '#4d7c5b', fontSize: '0.9rem' }}>Reply within 12 hours not just 24</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#4ade80', fontWeight: 'bold' }}>·</span>
              <span style={{ color: '#4d7c5b', fontSize: '0.9rem' }}>Keep refund rate below 5%</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#4ade80', fontWeight: 'bold' }}>·</span>
              <span style={{ color: '#4d7c5b', fontSize: '0.9rem' }}>No complaints for 30 days removes 1 strike</span>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default CreatorAccountHealth;
