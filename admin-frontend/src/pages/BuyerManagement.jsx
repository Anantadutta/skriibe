import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BuyerManagement = () => {
  const navigate = useNavigate();
  const [fans, setFans] = useState([]);

  useEffect(() => {
    const fetchFans = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/fans', { withCredentials: true });
        setFans(res.data);
      } catch (err) {
        console.error('Failed to fetch fans', err);
      }
    };
    fetchFans();
  }, []);

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
          All Buyers / Fans
        </h1>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>View all registered fans</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {fans.map((fan) => (
            <div key={fan._id} style={{ background: '#13131A', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #1E1E2D' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '1rem' }}>{fan.email}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{fan.name || 'Anonymous User'}</div>
                <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Joined: {new Date(fan.createdAt).toLocaleDateString()}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ color: '#10B981', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px' }}>Active</div>
                <button 
                  onClick={() => alert('Block action pending')}
                  style={{ background: '#1E1E2D', color: '#f8fafc', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Block
                </button>
              </div>
            </div>
          ))}
          {fans.length === 0 && (
            <div style={{ color: '#94a3b8', textAlign: 'center', padding: '24px' }}>No fans found.</div>
          )}
        </div>
      </div>

    </div>
  );
};

export default BuyerManagement;
