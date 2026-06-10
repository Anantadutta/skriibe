import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NotificationBell from '../components/NotificationBell';

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
          Admin <span style={{ color: '#ffffff', fontWeight: 'bold' }}>/ Buyer Health</span>
        </div>
        <NotificationBell />
      </div>
      
      <hr style={{ border: 'none', borderTop: '1px solid #1e1e2d', margin: '0 0 8px 0' }} />

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h1 className="font-wide" style={{ margin: 0, fontSize: '1.75rem', letterSpacing: '-0.03em', color: '#ffffff' }}>
          Buyer Health
        </h1>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>Monitor the health and status of all registered buyers</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {fans.map((fan) => (
            <div key={fan._id} style={{ background: '#13131A', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #1E1E2D' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '1rem' }}>{fan.name || 'Anonymous User'}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{fan.email}</div>
                <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Joined: {new Date(fan.createdAt).toLocaleDateString()}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {fan.isBanned ? (
                  <>
                    {fan.banExpiresAt && new Date(fan.banExpiresAt) > new Date() ? (
                      <div style={{ color: '#fb923c', fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '1px', background: 'rgba(251, 146, 60, 0.1)', padding: '6px 12px', borderRadius: '12px' }}>Banned for 7 days</div>
                    ) : (
                      <div style={{ color: '#EF4444', fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '1px', background: 'rgba(239, 68, 68, 0.1)', padding: '6px 12px', borderRadius: '12px' }}>Permanent Ban</div>
                    )}
                  </>
                ) : (
                  <div style={{ color: '#10B981', fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '1px', background: 'rgba(16, 185, 129, 0.1)', padding: '6px 12px', borderRadius: '12px' }}>Active</div>
                )}
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
