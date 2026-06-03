import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminAlerts = () => {
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);

  // Simulate incoming real-time flag after 3.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowToast(true);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ padding: '32px 24px', maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Simulation Toast */}
      {showToast && (
        <div 
          onClick={() => navigate('/admin/dispute/1238')}
          style={{
            position: 'absolute',
            top: '0',
            right: '24px',
            background: 'rgba(239, 68, 68, 0.95)',
            color: '#fff',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            zIndex: 100,
            animation: 'slideIn 0.3s ease-out'
          }}
        >
          <div style={{ background: '#fff', color: '#EF4444', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>!</div>
          <div style={{ fontWeight: 'bold' }}>New question flagged</div>
          <style>{`
            @keyframes slideIn {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
          Admin <span style={{ color: '#ffffff', fontWeight: 'bold' }}>/ Alerts</span>
        </div>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#1A1A1A', border: '1px solid #2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
          <span style={{ fontSize: '1.2rem' }}>🔔</span>
          <div style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, background: '#EF4444', borderRadius: '50%' }} />
        </div>
      </div>
      
      <hr style={{ border: 'none', borderTop: '1px solid #1e1e2d', margin: '0 0 8px 0' }} />

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h1 className="font-wide" style={{ margin: 0, fontSize: '1.75rem', letterSpacing: '-0.03em', color: '#ffffff' }}>
          Admin alerts
        </h1>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>Your inbox — flagged questions, disputes, payouts & signups land here</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: '#13131A', borderRadius: '12px', padding: '4px', width: 'fit-content', border: '1px solid #1E1E2D' }}>
        <div style={{ padding: '8px 16px', borderRadius: '8px', background: '#2A2A35', color: '#fff', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}>All (7)</div>
        <div style={{ padding: '8px 16px', borderRadius: '8px', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}>Disputes</div>
        <div style={{ padding: '8px 16px', borderRadius: '8px', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}>Payouts</div>
        <div style={{ padding: '8px 16px', borderRadius: '8px', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}>Creators</div>
      </div>

      {/* Alert List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* Row 1 */}
        <div style={{ background: '#13131A', borderRadius: '16px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #1E1E2D' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
              ⚠
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.95rem' }}>Dispute SLA breached — #1237</div>
              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>@priya_startup · 4hrs overdue</div>
            </div>
          </div>
          <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Now</div>
        </div>

        {/* Row 2 */}
        <div style={{ background: '#13131A', borderRadius: '16px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #1E1E2D' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', color: '#38BDF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0, fontWeight: 'bold' }}>
              ₹
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.95rem' }}>Payout failed — @vikrambiz</div>
              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>NEFT bounce · ₹891 · ICICI ****9921</div>
            </div>
          </div>
          <div style={{ color: '#64748b', fontSize: '0.8rem' }}>2m</div>
        </div>

        {/* Row 3 - Clickable Dispute */}
        <div 
          onClick={() => navigate('/admin/dispute/1238')}
          style={{ background: '#13131A', borderRadius: '16px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #1E1E2D', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
              🚩
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.95rem' }}>New dispute filed — #1238</div>
              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Fan flagged a reply · Rohan M. vs @rahulfinance · 31h SLA</div>
            </div>
          </div>
          <div style={{ color: '#64748b', fontSize: '0.8rem' }}>1h</div>
        </div>

        {/* Row 4 */}
        <div style={{ background: '#13131A', borderRadius: '16px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #1E1E2D' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(234, 179, 8, 0.1)', color: '#EAB308', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
              ★
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.95rem' }}>@amitupsc — 4.9 star avg</div>
              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Top performer · 56 questions this month</div>
            </div>
          </div>
          <div style={{ color: '#64748b', fontSize: '0.8rem' }}>2h</div>
        </div>

        {/* Row 5 */}
        <div 
          onClick={() => navigate('/admin/verification')}
          style={{ background: '#13131A', borderRadius: '16px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #1E1E2D', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', color: '#38BDF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0, fontWeight: 'bold' }}>
              N
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.95rem' }}>New creator signup</div>
              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>@nisha_fitness · 8.2K followers · pending</div>
            </div>
          </div>
          <div style={{ color: '#64748b', fontSize: '0.8rem' }}>3h</div>
        </div>

        {/* Row 6 */}
        <div style={{ background: '#13131A', borderRadius: '16px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #1E1E2D' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
              💰
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.95rem' }}>Monday batch processed</div>
              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>₹34,210 to 43 creators · 2 failed</div>
            </div>
          </div>
          <div style={{ color: '#64748b', fontSize: '0.8rem' }}>1d</div>
        </div>

        {/* Row 7 */}
        <div style={{ background: '#13131A', borderRadius: '16px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #1E1E2D' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
              🔒
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.95rem' }}>Buyer blocked</div>
              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Permanent ban · harassment x3 reports</div>
            </div>
          </div>
          <div style={{ color: '#64748b', fontSize: '0.8rem' }}>2d</div>
        </div>

      </div>
    </div>
  );
};

export default AdminAlerts;
