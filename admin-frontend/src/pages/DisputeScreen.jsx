import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const DisputeScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div style={{ padding: '32px 24px', maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', position: 'relative', justifyContent: 'center', marginBottom: '8px' }}>
        <button 
          onClick={() => navigate(-1)}
          style={{ 
            position: 'absolute', 
            left: 0, 
            background: '#21212B', 
            border: 'none', 
            color: '#94a3b8', 
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem', 
            cursor: 'pointer',
            paddingBottom: '2px'
          }}
        >
          ‹
        </button>
        <h1 className="font-wide" style={{ margin: 0, fontSize: '1.25rem', letterSpacing: '-0.02em', fontWeight: 'bold' }}>
          Dispute #{id || '1234'}
        </h1>
      </div>

      {/* Buyer Flagged Reply */}
      <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ color: '#EF4444', fontSize: '0.75rem', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase' }}>
          BUYER FLAGGED REPLY
        </div>
        <p style={{ margin: 0, fontSize: '0.95rem', color: '#e2e8f0', lineHeight: '1.4', fontStyle: 'italic' }}>
          "Reply was only 2 words — not helpful at all. I want my money back."
        </p>
      </div>

      {/* Creator's Reply */}
      <div className="bg-card-dark" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase' }}>
          CREATOR'S REPLY
        </div>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ffffff' }}>
          "Good question!"
        </div>
        <div style={{ color: '#EF4444', fontFamily: 'monospace', fontSize: '0.85rem' }}>
          22 characters — below 100 minimum
        </div>
      </div>

      {/* Info Table */}
      <div className="bg-card-dark" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Creator</span>
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>@rahulfinance</span>
        </div>
        <hr style={{ border: 'none', borderTop: '1px solid #1e1e2d', margin: 0 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Amount</span>
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>₹99</span>
        </div>
        <hr style={{ border: 'none', borderTop: '1px solid #1e1e2d', margin: 0 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Current strikes</span>
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>0 strikes</span>
        </div>
        <hr style={{ border: 'none', borderTop: '1px solid #1e1e2d', margin: 0 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Payout status</span>
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#38BDF8' }}>Blocked (escrow)</span>
        </div>
      </div>

      {/* Admin Decision */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
        <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 'bold' }}>
          Admin decision:
        </div>
        <button 
          onClick={() => navigate(`/admin/dispute/${id || '1234'}/refund`)}
          style={{ 
            background: 'rgba(239, 68, 68, 0.1)', 
            color: '#EF4444', 
            border: '1px solid rgba(239, 68, 68, 0.3)', 
            padding: '16px', 
            borderRadius: '12px', 
            fontWeight: 'bold', 
            fontSize: '1rem',
            cursor: 'pointer' 
          }}
        >
          Issue full refund to buyer
        </button>
        <button 
          onClick={() => navigate(`/admin/dispute/${id || '1234'}/strike`)}
          style={{ 
            background: '#1A1A1A', 
            color: '#38BDF8', 
            border: '1px solid #2A2A2A', 
            padding: '16px', 
            borderRadius: '12px', 
            fontWeight: 'bold', 
            fontSize: '1rem',
            cursor: 'pointer' 
          }}
        >
          Add creator strike #1
        </button>
        <button 
          onClick={() => navigate(`/admin/dispute/${id || '1234'}/dismiss`)}
          style={{ 
            background: '#1A1A1A', 
            color: '#ffffff', 
            border: '1px solid #2A2A2A', 
            padding: '16px', 
            borderRadius: '12px', 
            fontWeight: 'bold', 
            fontSize: '1rem',
            cursor: 'pointer' 
          }}
        >
          Dismiss — release payout
        </button>
      </div>

      <button 
        onClick={() => navigate('/admin/buyers')}
        style={{ 
          background: 'rgba(239, 68, 68, 0.1)', 
          color: '#EF4444', 
          border: '1px dashed rgba(239, 68, 68, 0.5)', 
          padding: '16px', 
          borderRadius: '12px', 
          fontWeight: 'bold', 
          fontSize: '0.9rem',
          cursor: 'pointer',
          marginTop: '16px'
        }}
      >
        Ban this buyer
      </button>

    </div>
  );
};

export default DisputeScreen;
