import React from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../components/NotificationBell';

const PlatformAnalytics = () => {
  return (
    <div style={{ padding: '32px 24px', maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
          Admin <span style={{ color: '#ffffff', fontWeight: 'bold' }}>/ Analytics</span>
        </div>
        <NotificationBell />
      </div>
      
      <hr style={{ border: 'none', borderTop: '1px solid #1e1e2d', margin: '0 0 8px 0' }} />

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h1 className="font-wide" style={{ margin: 0, fontSize: '1.75rem', letterSpacing: '-0.03em', color: '#ffffff' }}>
          Platform analytics
        </h1>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>Trends across the platform</div>
      </div>

      {/* Toggles */}
      <div style={{ display: 'flex', background: '#13131A', borderRadius: '12px', padding: '4px', width: 'fit-content', border: '1px solid #1E1E2D' }}>
        <div style={{ padding: '8px 24px', borderRadius: '8px', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}>7d</div>
        <div style={{ padding: '8px 24px', borderRadius: '8px', background: '#2A2A35', color: '#fff', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}>30d</div>
        <div style={{ padding: '8px 24px', borderRadius: '8px', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}>90d</div>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        
        <div style={{ background: '#13131A', borderRadius: '16px', padding: '24px', border: '1px solid #1E1E2D', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ color: '#38BDF8', fontSize: '2rem', fontWeight: 'bold', letterSpacing: '-0.03em' }}>₹48.2K</div>
          <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px' }}>PLATFORM GMV</div>
          <div style={{ color: '#10B981', fontSize: '0.8rem', fontWeight: 'bold', marginTop: '4px' }}>↑ +31% MoM</div>
        </div>

        <div style={{ background: '#13131A', borderRadius: '16px', padding: '24px', border: '1px solid #1E1E2D', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ color: '#10B981', fontSize: '2rem', fontWeight: 'bold', letterSpacing: '-0.03em' }}>₹9,640</div>
          <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px' }}>REVENUE 20%</div>
          <div style={{ color: '#10B981', fontSize: '0.8rem', fontWeight: 'bold', marginTop: '4px' }}>↑ +31% MoM</div>
        </div>

        <div style={{ background: '#13131A', borderRadius: '16px', padding: '24px', border: '1px solid #1E1E2D', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ color: '#38BDF8', fontSize: '2rem', fontWeight: 'bold', letterSpacing: '-0.03em' }}>482</div>
          <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px' }}>QUESTIONS THIS MONTH</div>
        </div>

        <div style={{ background: '#13131A', borderRadius: '16px', padding: '24px', border: '1px solid #1E1E2D', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ color: '#A855F7', fontSize: '2rem', fontWeight: 'bold', letterSpacing: '-0.03em' }}>89</div>
          <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px' }}>ACTIVE CREATORS EARNING</div>
        </div>

      </div>

      {/* Chart Simulation */}
      <div style={{ background: '#13131A', borderRadius: '16px', padding: '24px', border: '1px solid #1E1E2D', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.95rem' }}>Weekly GMV</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '120px', paddingTop: '20px' }}>
          {/* Simulated Bars */}
          {[40, 50, 52, 65, 55, 60, 60, 70, 75, 100, 110].map((h, i) => (
            <div key={i} style={{ flex: 1, background: 'linear-gradient(180deg, #38BDF8 0%, #0284C7 100%)', height: `${h}%`, borderRadius: '4px 4px 0 0' }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.75rem', marginTop: '4px' }}>
          <span>1 May</span>
          <span>31 May</span>
        </div>
      </div>

      {/* Top Earners */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold', color: '#fff' }}>Top earners · May</h3>
        
        <div style={{ background: '#13131A', borderRadius: '16px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #1E1E2D' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#422006', color: '#FCD34D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0, fontWeight: 'bold' }}>
              1
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.95rem' }}>@amitupsc</div>
              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>56 questions</div>
            </div>
          </div>
          <div style={{ color: '#10B981', fontWeight: 'bold', fontSize: '1rem' }}>₹4,455</div>
        </div>

        <div style={{ background: '#13131A', borderRadius: '16px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #1E1E2D' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', color: '#38BDF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0, fontWeight: 'bold' }}>
              2
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.95rem' }}>@rahulfinance</div>
              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>41 questions</div>
            </div>
          </div>
          <div style={{ color: '#10B981', fontWeight: 'bold', fontSize: '1rem' }}>₹3,241</div>
        </div>

        <div style={{ background: '#13131A', borderRadius: '16px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #1E1E2D' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.1)', color: '#A855F7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0, fontWeight: 'bold' }}>
              3
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.95rem' }}>@sanacareer</div>
              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>27 questions</div>
            </div>
          </div>
          <div style={{ color: '#10B981', fontWeight: 'bold', fontSize: '1rem' }}>₹2,178</div>
        </div>

      </div>

    </div>
  );
};

export default PlatformAnalytics;
