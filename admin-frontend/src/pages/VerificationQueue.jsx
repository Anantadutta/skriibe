import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const VerificationQueue = () => {
  const navigate = useNavigate();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const response = await axios.get(`${API_URL}/admin/verification-queue`);
        setQueue(response.data);
      } catch (error) {
        console.error('Error fetching queue:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQueue();
  }, []);

  if (loading) {
    return <div style={{ padding: 40, color: '#fff' }}>Loading Queue...</div>;
  }

  if (!queue) {
    return <div style={{ padding: 40, color: '#ef4444' }}>Error: Could not load queue. Ensure backend is running.</div>;
  }

  return (
    <div style={{ padding: '32px 24px', maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
          Admin <span style={{ color: '#ffffff', fontWeight: 'bold' }}>/ Verification</span>
        </div>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#1A1A1A', border: '1px solid #2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
          <span style={{ fontSize: '1.2rem' }}>🔔</span>
        </div>
      </div>
      
      <hr style={{ border: 'none', borderTop: '1px solid #1e1e2d', margin: '0 0 8px 0' }} />

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h1 className="font-wide" style={{ margin: 0, fontSize: '1.75rem', letterSpacing: '-0.03em', color: '#ffffff' }}>
          Verification queue
        </h1>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>Approve or reject new creators</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: '#13131A', borderRadius: '12px', padding: '4px', width: 'fit-content', border: '1px solid #1E1E2D' }}>
        <div style={{ padding: '8px 24px', borderRadius: '8px', background: '#2A2A35', color: '#fff', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}>Pending (3)</div>
        <div style={{ padding: '8px 24px', borderRadius: '8px', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}>Active</div>
        <div style={{ padding: '8px 24px', borderRadius: '8px', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}>Suspended</div>
      </div>

      {/* Queue List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* Item 1 */}
        <div 
          className="bg-card-dark" 
          style={{ padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #1E1E2D' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', color: '#38BDF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0, fontWeight: 'bold' }}>
              R
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.95rem' }}>@rahulfinance</div>
              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>12K · PAN OK · 3mo · IG linked</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => navigate('/admin/verification/approve/rahulfinance')}
              style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '6px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Verify
            </button>
            <button 
              onClick={() => navigate('/admin/verification/reject/rahulfinance')}
              style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '6px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Reject
            </button>
          </div>
        </div>

        {/* Item 2 */}
        <div 
          className="bg-card-dark" 
          style={{ padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #1E1E2D' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', color: '#38BDF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0, fontWeight: 'bold' }}>
              P
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.95rem' }}>@priya_startup</div>
              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>3.2K · PAN pending · 1mo</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => navigate('/admin/verification/approve/priya_startup')}
              style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '6px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Verify
            </button>
            <button 
              onClick={() => navigate('/admin/verification/reject/priya_startup')}
              style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '6px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Reject
            </button>
          </div>
        </div>

        {/* Item 3 */}
        <div 
          className="bg-card-dark" 
          style={{ padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #1E1E2D' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', color: '#38BDF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0, fontWeight: 'bold' }}>
              R
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.95rem' }}>@rohan_money</div>
              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>28K · PAN OK · 8mo · IG linked</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => navigate('/admin/verification/approve/rohan_money')}
              style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '6px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Verify
            </button>
            <button 
              onClick={() => navigate('/admin/verification/reject/rohan_money')}
              style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '6px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Reject
            </button>
          </div>
        </div>

      </div>

      {/* Verification Checklist */}
      <div style={{ 
        background: '#13131A', 
        border: '1px solid rgba(234, 179, 8, 0.3)', 
        borderRadius: '16px', 
        padding: '24px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '16px',
        marginTop: '8px'
      }}>
        <div style={{ color: '#EAB308', fontWeight: 'bold', fontSize: '0.85rem', letterSpacing: '1px' }}>VERIFICATION CHECKLIST</div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', color: '#94a3b8', fontSize: '0.85rem' }}>
            <span style={{ color: '#10B981' }}>✓</span> Instagram 3+ months old
          </div>
          <div style={{ display: 'flex', gap: '8px', color: '#94a3b8', fontSize: '0.85rem' }}>
            <span style={{ color: '#10B981' }}>✓</span> Min 1,000 organic followers
          </div>
          <div style={{ display: 'flex', gap: '8px', color: '#94a3b8', fontSize: '0.85rem' }}>
            <span style={{ color: '#10B981' }}>✓</span> Instagram profile linked to skriibe
          </div>
          <div style={{ display: 'flex', gap: '8px', color: '#94a3b8', fontSize: '0.85rem' }}>
            <span style={{ color: '#10B981' }}>✓</span> PAN number valid format
          </div>
          <div style={{ display: 'flex', gap: '8px', color: '#94a3b8', fontSize: '0.85rem' }}>
            <span style={{ color: '#10B981' }}>✓</span> Bank account linked
          </div>
        </div>
      </div>

    </div>
  );
};

export default VerificationQueue;
