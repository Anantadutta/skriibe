import React from 'react';
import { useNavigate } from 'react-router-dom';

const UnbanBuyer = () => {
  const navigate = useNavigate();

  const handleConfirm = () => {
    alert('Buyer successfully unbanned.');
    navigate('/admin/buyers');
  };

  return (
    <div style={{ padding: '32px 24px', maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', position: 'relative', justifyContent: 'center', marginBottom: '16px' }}>
        <button 
          onClick={() => navigate(-1)}
          style={{ position: 'absolute', left: 0, background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}
        >
          ‹
        </button>
        <h1 style={{ margin: 0, fontSize: '1.25rem', letterSpacing: '-0.02em', fontWeight: 'bold', color: '#fff' }}>
          Unban Buyer
        </h1>
      </div>

      <div style={{ background: '#13131A', border: '1px solid #1E1E2D', borderRadius: '16px', padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
          🔓
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#f8fafc', letterSpacing: '-0.02em' }}>Restore access?</h2>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.5' }}>
            This will immediately unban the user and restore their ability to interact with the platform and make purchases.
          </p>
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
          <button 
            onClick={handleConfirm}
            style={{ width: '100%', background: '#10B981', color: '#fff', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}
          >
            Yes, restore access
          </button>
          <button 
            onClick={() => navigate(-1)}
            style={{ width: '100%', background: 'transparent', color: '#64748b', border: '1px solid #1E1E2D', padding: '16px', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnbanBuyer;
