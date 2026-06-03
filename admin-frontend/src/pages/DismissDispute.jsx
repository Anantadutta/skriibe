import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const DismissDispute = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const handleConfirm = () => {
    alert(`Dispute #${id} dismissed. Funds released to creator.`);
    navigate('/admin/dashboard');
  };

  return (
    <div style={{ padding: '32px 24px', maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', position: 'relative', justifyContent: 'center' }}>
        <button 
          onClick={() => navigate(-1)}
          style={{ position: 'absolute', left: 0, background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}
        >
          ‹
        </button>
        <h1 style={{ margin: 0, fontSize: '1.25rem', letterSpacing: '-0.02em', fontWeight: 'bold' }}>
          Dismiss Dispute #{id}
        </h1>
      </div>

      <div className="bg-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center', border: '1px solid rgba(74, 222, 128, 0.3)' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(74, 222, 128, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: '#4ade80' }}>
          ✓
        </div>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#4ade80' }}>Release Payout</div>
          <div className="text-muted" style={{ fontSize: '0.9rem', marginTop: '8px', lineHeight: '1.5' }}>
            You are dismissing this dispute in favor of the creator. This action will release <strong style={{ color: '#fff' }}>₹99</strong> from the escrow holding directly into the creator's wallet.
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button 
        onClick={handleConfirm}
        style={{ 
          background: 'rgba(74, 222, 128, 0.15)', 
          color: '#4ade80', 
          border: '1px solid rgba(74, 222, 128, 0.3)', 
          padding: '16px', 
          borderRadius: '12px', 
          fontWeight: 'bold', 
          fontSize: '1rem',
          cursor: 'pointer',
          marginTop: '8px'
        }}
      >
        Confirm & Release Payout
      </button>

    </div>
  );
};

export default DismissDispute;
