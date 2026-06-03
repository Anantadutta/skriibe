import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const StrikeCreator = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [note, setNote] = useState('');

  const handleConfirm = () => {
    if (!note.trim()) {
      alert("A reason must be provided for a strike.");
      return;
    }
    alert(`Strike added to creator for Dispute #${id}`);
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
          Issue Strike for #{id}
        </h1>
      </div>

      <div className="bg-card-dark" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid #38BDF8' }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#38BDF8' }}>Add Creator Strike</div>
        <div className="text-muted" style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
          This will negatively impact the creator's health score. Please provide a mandatory reason explaining the platform violation. This note will be sent directly to the creator.
        </div>
      </div>

      {/* Note Area */}
      <div className="bg-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontWeight: 'bold', color: '#e2e8f0', fontSize: '0.95rem' }}>Mandatory Note</div>
        <textarea 
          placeholder="Explain the violation..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={5}
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
        onClick={handleConfirm}
        style={{ 
          background: '#1A1A1A', 
          color: '#38BDF8', 
          border: '1px solid #38BDF8', 
          padding: '16px', 
          borderRadius: '12px', 
          fontWeight: 'bold', 
          fontSize: '1rem',
          cursor: 'pointer',
          marginTop: '8px'
        }}
      >
        Confirm & Issue Strike
      </button>

    </div>
  );
};

export default StrikeCreator;
