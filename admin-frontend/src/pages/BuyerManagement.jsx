import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BuyerManagement = () => {
  const navigate = useNavigate();
  const [banType, setBanType] = useState('30-day');
  const [selectedReason, setSelectedReason] = useState('Harassment');

  const reasons = ['Harassment', 'Spam questions', 'Chargeback abuse', 'Inappropriate content'];

  return (
    <div style={{ padding: '32px 24px', maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
          Admin <span style={{ color: '#ffffff', fontWeight: 'bold' }}>/ Buyers</span>
        </div>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#1A1A1A', border: '1px solid #2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
          <span style={{ fontSize: '1.2rem' }}>🔔</span>
        </div>
      </div>
      
      <hr style={{ border: 'none', borderTop: '1px solid #1e1e2d', margin: '0 0 8px 0' }} />

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h1 className="font-wide" style={{ margin: 0, fontSize: '1.75rem', letterSpacing: '-0.03em', color: '#ffffff' }}>
          Buyer management
        </h1>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>Block abusive fans / buyers</div>
      </div>

      {/* Block Form */}
      <div style={{ 
        background: '#0a0a0f', 
        border: '1px solid rgba(239, 68, 68, 0.3)', 
        borderRadius: '16px', 
        padding: '24px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '20px'
      }}>
        <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' }}>Block a buyer</div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold', letterSpacing: '1px' }}>PHONE OR EMAIL</label>
          <input 
            type="text" 
            placeholder="+91 or email address"
            style={{
              background: '#13131A',
              border: '1px solid #1E1E2D',
              borderRadius: '8px',
              padding: '16px',
              color: '#fff',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {reasons.map(reason => (
            <div 
              key={reason}
              onClick={() => setSelectedReason(reason)}
              style={{ 
                background: selectedReason === reason ? 'rgba(56, 189, 248, 0.1)' : '#1E1E2D', 
                color: selectedReason === reason ? '#38BDF8' : '#94a3b8', 
                border: selectedReason === reason ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
                padding: '8px 16px', 
                borderRadius: '8px', 
                fontSize: '0.85rem', 
                cursor: 'pointer',
                fontWeight: selectedReason === reason ? 'bold' : 'normal'
              }}
            >
              {reason}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => setBanType('30-day')}
            style={{ 
              flex: 1, 
              background: banType === '30-day' ? 'rgba(245, 158, 11, 0.1)' : '#13131A', 
              color: banType === '30-day' ? '#F59E0B' : '#f8fafc', 
              border: banType === '30-day' ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid #1E1E2D', 
              padding: '16px', 
              borderRadius: '8px', 
              fontWeight: 'bold', 
              cursor: 'pointer' 
            }}
          >
            30-day block
          </button>
          <button 
            onClick={() => setBanType('Permanent')}
            style={{ 
              flex: 1, 
              background: banType === 'Permanent' ? 'rgba(239, 68, 68, 0.1)' : '#13131A', 
              color: banType === 'Permanent' ? '#EF4444' : '#f8fafc', 
              border: banType === 'Permanent' ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid #1E1E2D', 
              padding: '16px', 
              borderRadius: '8px', 
              fontWeight: 'bold', 
              cursor: 'pointer' 
            }}
          >
            Permanent ban
          </button>
        </div>

        <button 
          onClick={() => navigate('/admin/buyers/confirm-block')}
          style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginTop: '4px' }}
        >
          Confirm block
        </button>
      </div>

      {/* Banned List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold', color: '#fff' }}>Banned buyers (3)</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          <div style={{ background: '#13131A', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #1E1E2D' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '1rem' }}>+91 98765 00001</div>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Harassment</div>
              <div style={{ color: '#64748b', fontSize: '0.75rem' }}>3 report(s) · 2 Jun</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ color: '#A855F7', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px' }}>Permanent</div>
              <button 
                onClick={() => navigate('/admin/buyers/unban')}
                style={{ background: '#1E1E2D', color: '#f8fafc', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Unban
              </button>
            </div>
          </div>

          <div style={{ background: '#13131A', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #1E1E2D' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '1rem' }}>abuser@gmail.com</div>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Chargeback abuse</div>
              <div style={{ color: '#64748b', fontSize: '0.75rem' }}>2 report(s) · 28 May</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ color: '#F59E0B', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px' }}>30-day</div>
              <button 
                onClick={() => navigate('/admin/buyers/unban')}
                style={{ background: '#1E1E2D', color: '#f8fafc', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Unban
              </button>
            </div>
          </div>

          <div style={{ background: '#13131A', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #1E1E2D' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '1rem' }}>+91 87654 00002</div>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Spam questions</div>
              <div style={{ color: '#64748b', fontSize: '0.75rem' }}>1 report(s) · 20 May</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ color: '#F59E0B', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px' }}>30-day</div>
              <button 
                onClick={() => navigate('/admin/buyers/unban')}
                style={{ background: '#1E1E2D', color: '#f8fafc', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Unban
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default BuyerManagement;
