import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NotificationBell from '../components/NotificationBell';

const BuyerDisputes = () => {
  const navigate = useNavigate();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('open');

  useEffect(() => {
    const fetchDisputes = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/buyer-disputes`, { withCredentials: true });
        setDisputes(res.data);
      } catch (err) {
        console.error('Error fetching buyer disputes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDisputes();
  }, []);

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
          Admin <span style={{ color: '#ffffff', fontWeight: 'bold' }}>/ Buyer Disputes</span>
        </div>
        <NotificationBell />
      </div>
      
      <hr style={{ border: 'none', borderTop: '1px solid #1e1e2d', margin: '0 0 8px 0' }} />

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h1 className="font-wide" style={{ margin: 0, fontSize: '1.75rem', letterSpacing: '-0.03em', color: '#ffffff' }}>
          Buyer Disputes
        </h1>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>Manage disputes initiated by buyers</div>
      </div>

      {(() => {
        const openDisputes = disputes.filter(d => !d.adminDecision || d.adminDecision === 'pending');
        const resolvedDisputes = disputes.filter(d => d.adminDecision && d.adminDecision !== 'pending');
        const displayedDisputes = filter === 'open' ? openDisputes : resolvedDisputes;

        return (
          <>
            <div style={{ display: 'flex', background: '#13131A', borderRadius: '12px', padding: '4px', width: 'fit-content', border: '1px solid #1E1E2D' }}>
              <button 
                onClick={() => setFilter('open')}
                style={{ 
                  padding: '8px 24px', 
                  borderRadius: '8px', 
                  border: 'none', 
                  background: filter === 'open' ? '#2A2A35' : 'transparent', 
                  color: filter === 'open' ? '#fff' : '#64748b', 
                  fontWeight: 'bold', 
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '0.9rem'
                }}
              >
                Open ({openDisputes.length})
              </button>
              <button 
                onClick={() => setFilter('resolved')}
                style={{ 
                  padding: '8px 24px', 
                  borderRadius: '8px', 
                  border: 'none', 
                  background: filter === 'resolved' ? '#2A2A35' : 'transparent', 
                  color: filter === 'resolved' ? '#fff' : '#64748b', 
                  fontWeight: 'bold', 
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '0.9rem'
                }}
              >
                Resolved ({resolvedDisputes.length})
              </button>
            </div>

            {loading ? (
              <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>Loading disputes...</div>
            ) : displayedDisputes.length === 0 ? (
              <div style={{ background: '#13131A', borderRadius: '16px', padding: '40px', border: '1px solid #1E1E2D', textAlign: 'center', color: '#64748b' }}>
                No {filter} buyer disputes at the moment.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {displayedDisputes.map(d => (
            <div 
              key={d._id} 
              onClick={() => navigate(`/admin/dispute/${d._id}`)}
              style={{ background: '#13131A', borderRadius: '16px', padding: '24px', border: '1px solid #1E1E2D', cursor: 'pointer', transition: 'border-color 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = '#1E1E2D'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#2A2A35', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                    {(d.creatorId?.name || d.handle || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#fff' }}>Answered by: {d.creatorId?.name || '@' + d.handle}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Flagged by buyer: {d.buyerName || d.buyerPhone || 'Anonymous'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    DISPUTED
                  </div>
                  {d.isBuyerBanned && (
                    <div style={{ background: '#EF4444', color: '#ffffff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      {d.buyerName || d.buyerPhone || 'ANONYMOUS BUYER'} HAS BEEN BANNED
                    </div>
                  )}
                </div>
              </div>

              <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <div style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '8px', textTransform: 'uppercase' }}>REASON FOR DISPUTE</div>
                <div style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '500' }}>{d.flagReason || 'No specific reason provided.'}</div>
              </div>

              <div style={{ background: '#1A1A24', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #2A2A35' }}>
                <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '8px', textTransform: 'uppercase' }}>QUESTION</div>
                <div style={{ color: '#cbd5e1', fontStyle: 'italic', fontSize: '0.95rem', overflowWrap: 'anywhere' }}>"{d.questionText}"</div>
              </div>

              <div style={{ background: '#0a1922', padding: '16px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                <div style={{ color: '#38bdf8', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '8px', textTransform: 'uppercase' }}>ANSWER PROVIDED</div>
                <div style={{ color: '#fff', fontSize: '0.95rem', lineHeight: '1.5' }}>{d.answerText}</div>
              </div>
            </div>
          ))}
          </div>
        )}
      </>
    );
  })()}
    </div>
  );
};

export default BuyerDisputes;
