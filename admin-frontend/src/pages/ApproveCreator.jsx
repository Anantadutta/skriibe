import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const ApproveCreator = () => {
  const navigate = useNavigate();
  const { username } = useParams();
  const [fee, setFee] = useState(10);

  const handleApprove = () => {
    // In a real app, make API call here
    alert(`Successfully verified @${username} with a ${fee}% fee!`);
    navigate('/admin/verification');
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
          Approve {username}
        </h1>
      </div>

      {/* Summary Card */}
      <div className="bg-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', color: '#4ade80' }}>
          {username?.charAt(1).toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{username}</div>
          <div className="text-muted" style={{ fontSize: '0.85rem', marginTop: '4px' }}>All verification checks passed</div>
        </div>
        <div style={{ color: '#4ade80', fontSize: '2rem' }}>✓</div>
      </div>

      {/* Admin Controls */}
      <div className="bg-card-dark" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontWeight: 'bold', color: '#e2e8f0' }}>Approval Settings</div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Platform Fee (%)</label>
          <input 
            type="number" 
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            style={{ 
              padding: '12px', 
              borderRadius: '8px', 
              border: '1px solid #2A2A2A', 
              background: '#1A1A1A', 
              color: '#fff',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Action Button */}
      <button 
        onClick={handleApprove}
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
        Confirm & Send Welcome Email
      </button>

    </div>
  );
};

export default ApproveCreator;
