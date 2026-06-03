import React from 'react';
import { useNavigate } from 'react-router-dom';

const CreatorHealth = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '32px 24px', maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
          Admin <span style={{ color: '#ffffff', fontWeight: 'bold' }}>/ Creators</span>
        </div>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#1A1A1A', border: '1px solid #2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
          <span style={{ fontSize: '1.2rem' }}>🔔</span>
        </div>
      </div>
      
      <hr style={{ border: 'none', borderTop: '1px solid #1e1e2d', margin: '0 0 8px 0' }} />

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h1 className="font-wide" style={{ margin: 0, fontSize: '1.75rem', letterSpacing: '-0.03em', color: '#ffffff' }}>
          Creator health
        </h1>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>Monitor reply rates, refunds & SLA breaches</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: '#13131A', borderRadius: '12px', padding: '4px', width: 'fit-content', border: '1px solid #1E1E2D' }}>
        <div style={{ padding: '8px 24px', borderRadius: '8px', background: '#2A2A35', color: '#fff', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}>Healthy (76)</div>
        <div style={{ padding: '8px 24px', borderRadius: '8px', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}>At Risk (8)</div>
        <div style={{ padding: '8px 24px', borderRadius: '8px', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}>Critical (2)</div>
      </div>

      {/* AT RISK Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F59E0B', fontWeight: 'bold', fontSize: '0.8rem', letterSpacing: '1px', marginTop: '8px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F59E0B' }} />
          AT RISK
        </div>
        
        <div style={{ background: '#13131A', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', border: '1px solid #1E1E2D' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0, fontWeight: 'bold' }}>
                P
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' }}>@priya_startup</div>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Score: 62/100 ↓</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', border: 'none', padding: '6px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem' }}>
                Warn
              </button>
              <button style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: 'none', padding: '6px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem' }}>
                Suspend
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{ color: '#F59E0B', fontSize: '1.4rem', fontWeight: 'bold' }}>71%</div>
              <div style={{ color: '#f8fafc', fontSize: '0.75rem', fontWeight: 'bold' }}>Reply</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{ color: '#F59E0B', fontSize: '1.4rem', fontWeight: 'bold' }}>14%</div>
              <div style={{ color: '#f8fafc', fontSize: '0.75rem', fontWeight: 'bold' }}>Refunds</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{ color: '#EF4444', fontSize: '1.4rem', fontWeight: 'bold' }}>3</div>
              <div style={{ color: '#f8fafc', fontSize: '0.75rem', fontWeight: 'bold' }}>Breaches</div>
            </div>
          </div>
        </div>
      </div>

      {/* TOP PERFORMERS Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', fontWeight: 'bold', fontSize: '0.8rem', letterSpacing: '1px', marginTop: '8px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
          TOP PERFORMERS
        </div>

        {/* Performer 1 */}
        <div style={{ background: '#13131A', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #1E1E2D' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', color: '#38BDF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0, fontWeight: 'bold' }}>
              R
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.95rem' }}>@rahulfinance</div>
              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>94% reply rate</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
            <div style={{ color: '#10B981', fontWeight: 'bold', fontSize: '0.95rem' }}>97/100 ↑</div>
            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>₹3,241</div>
          </div>
        </div>

        {/* Performer 2 */}
        <div style={{ background: '#13131A', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #1E1E2D' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0, fontWeight: 'bold' }}>
              A
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.95rem' }}>@amitupsc</div>
              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>91% reply rate</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
            <div style={{ color: '#10B981', fontWeight: 'bold', fontSize: '0.95rem' }}>94/100 →</div>
            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>₹4,455</div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default CreatorHealth;
