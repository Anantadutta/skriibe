import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const RejectCreator = () => {
  const navigate = useNavigate();
  const { username } = useParams();
  const [reason, setReason] = useState('followers');
  const [note, setNote] = useState('');

  const handleReject = () => {
    // In a real app, make API call here
    alert(`Rejected @${username} for reason: ${reason}`);
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
          Reject {username}
        </h1>
      </div>

      <div className="bg-card-dark" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ fontWeight: 'bold', color: '#e2e8f0', fontSize: '0.95rem' }}>Select rejection reason</div>
        
        {/* Radio List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
            <input 
              type="radio" 
              name="reason" 
              value="followers" 
              checked={reason === 'followers'} 
              onChange={() => setReason('followers')}
              style={{ marginTop: '4px', accentColor: '#EF4444' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#fff', fontSize: '0.95rem' }}>Insufficient followers or engagement</span>
              <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Does not meet the 1,000 follower minimum requirement.</span>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
            <input 
              type="radio" 
              name="reason" 
              value="documents" 
              checked={reason === 'documents'} 
              onChange={() => setReason('documents')}
              style={{ marginTop: '4px', accentColor: '#EF4444' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#fff', fontSize: '0.95rem' }}>Invalid PAN or Banking details</span>
              <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Documents provided are blurry, invalid, or do not match name.</span>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
            <input 
              type="radio" 
              name="reason" 
              value="guidelines" 
              checked={reason === 'guidelines'} 
              onChange={() => setReason('guidelines')}
              style={{ marginTop: '4px', accentColor: '#EF4444' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#fff', fontSize: '0.95rem' }}>Content violates platform guidelines</span>
              <span style={{ color: '#64748b', fontSize: '0.8rem' }}>NSFW, spam, or otherwise inappropriate content.</span>
            </div>
          </label>
        </div>
      </div>

      {/* Custom Note */}
      <div className="bg-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontWeight: 'bold', color: '#e2e8f0', fontSize: '0.95rem' }}>Optional Note</div>
        <textarea 
          placeholder="Add a custom note to send to the creator..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          style={{
            background: '#13131f',
            border: '1px solid #2A2A2A',
            borderRadius: '8px',
            padding: '12px',
            color: '#fff',
            fontFamily: 'inherit',
            resize: 'none',
            outline: 'none'
          }}
        />
      </div>

      {/* Action Button */}
      <button 
        onClick={handleReject}
        style={{ 
          background: 'rgba(239, 68, 68, 0.15)', 
          color: '#EF4444', 
          border: '1px solid rgba(239, 68, 68, 0.3)', 
          padding: '16px', 
          borderRadius: '12px', 
          fontWeight: 'bold', 
          fontSize: '1rem',
          cursor: 'pointer',
          marginTop: '8px'
        }}
      >
        Confirm Rejection
      </button>

    </div>
  );
};

export default RejectCreator;
