import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NotificationBell from '../components/NotificationBell';

const CreatorDisputes = () => {
  const navigate = useNavigate();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState('open'); // 'open' or 'resolved'

  useEffect(() => {
    const fetchDisputes = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/creator-disputes`, { withCredentials: true });
        setDisputes(res.data);
      } catch (err) {
        console.error('Error fetching creator disputes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDisputes();
  }, []);

  const openCount = disputes.filter(d => !d.adminDecision).length;
  const resolvedCount = disputes.filter(d => !!d.adminDecision).length;
  const filteredDisputes = disputes.filter(d => filter === 'open' ? !d.adminDecision : !!d.adminDecision);

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
          Admin <span style={{ color: '#ffffff', fontWeight: 'bold' }}>/ Creator Disputes</span>
        </div>
        <NotificationBell />
      </div>
      
      <hr style={{ border: 'none', borderTop: '1px solid #1e1e2d', margin: '0 0 8px 0' }} />

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h1 className="font-wide" style={{ margin: 0, fontSize: '1.75rem', letterSpacing: '-0.03em', color: '#ffffff' }}>
          Creator Disputes
        </h1>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>Manage questions rejected or flagged by creators</div>
      </div>

      {/* Toggle */}
      <div style={{ display: 'flex', background: '#13131A', padding: '4px', borderRadius: '12px', border: '1px solid #1E1E2D', width: 'fit-content' }}>
        <button 
          onClick={() => setFilter('open')}
          style={{
            background: filter === 'open' ? '#2A2A35' : 'transparent',
            color: filter === 'open' ? '#fff' : '#64748b',
            border: 'none',
            padding: '8px 24px',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Open ({openCount})
        </button>
        <button 
          onClick={() => setFilter('resolved')}
          style={{
            background: filter === 'resolved' ? '#2A2A35' : 'transparent',
            color: filter === 'resolved' ? '#fff' : '#64748b',
            border: 'none',
            padding: '8px 24px',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Resolved ({resolvedCount})
        </button>
      </div>

      {loading ? (
        <div style={{ color: '#fff', textAlign: 'center', padding: '40px' }}>Loading disputes...</div>
      ) : filteredDisputes.length === 0 ? (
        <div style={{ background: '#13131A', borderRadius: '16px', padding: '40px', border: '1px solid #1E1E2D', textAlign: 'center', color: '#64748b' }}>
          No {filter} creator disputes at the moment.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredDisputes.map(d => {
            const isAbuse = d.rejectReason === 'abuse';
            let borderColor = '#1E1E2D';
            if (d.adminDecision === 'fan_wins') borderColor = '#EF4444'; // Red for fan wins
            else if (d.adminDecision === 'creator_wins') borderColor = '#38BDF8'; // Blue for creator wins

            return (
              <div 
                key={d._id} 
                onClick={() => navigate(`/admin/creator-dispute/${d._id}`)}
                style={{ background: '#13131A', borderRadius: '16px', padding: '24px', border: `1px solid ${borderColor}`, cursor: 'pointer', transition: 'border-color 0.2s', boxShadow: d.adminDecision ? `0 0 10px ${borderColor}20` : 'none' }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = d.adminDecision ? borderColor : 'rgba(255,255,255,0.2)'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = borderColor}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#2A2A35', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                      {d.creatorId?.name ? d.creatorId.name[0].toUpperCase() : 'C'}
                    </div>
                    <div>
                      <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '1rem' }}>Rejected by: {d.creatorId?.name || 'Creator'}</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Buyer: {d.buyerName || d.followerName || 'Anonymous'}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-start' }}>
                    <div style={{ background: '#1d4ed8', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px' }}>
                      Dispute #{d.disputeId || d._id.slice(-6)}
                    </div>
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px' }}>
                      {isAbuse ? 'ABUSE FLAGGED' : 'REJECTED'}
                    </div>
                  </div>
                </div>

                <div style={{ background: 'rgba(245, 158, 11, 0.05)', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                  <div style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '8px', textTransform: 'uppercase' }}>CREATOR REASON</div>
                  <div style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '500' }}>
                    {isAbuse ? 'The creator flagged this question as abusive or inappropriate.' : `Rejected: ${d.rejectReason || 'Outside expertise'}`}
                  </div>
                </div>

                <div style={{ background: '#1A1A24', padding: '16px', borderRadius: '12px', marginBottom: d.adminDecision ? '16px' : '0', border: '1px solid #2A2A35' }}>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '8px', textTransform: 'uppercase' }}>QUESTION</div>
                  <div style={{ color: '#cbd5e1', fontStyle: 'italic', fontSize: '0.95rem', overflowWrap: 'anywhere' }}>"{d.questionText}"</div>
                </div>

                {d.adminDecision && (
                  <div style={{ background: 'rgba(56, 189, 248, 0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                    {d.adminNotes && (
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ color: '#38BDF8', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '8px', textTransform: 'uppercase' }}>
                          ADMIN NOTES
                        </div>
                        <div style={{ color: '#e2e8f0', fontSize: '0.95rem' }}>
                          {d.adminNotes}
                        </div>
                      </div>
                    )}
                    <div>
                      <div style={{ color: '#38BDF8', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '8px', textTransform: 'uppercase' }}>
                        DECISION
                      </div>
                      <div style={{ color: '#e2e8f0', fontSize: '0.95rem', fontWeight: '500' }}>
                        {d.adminDecision === 'fan_wins' ? 'Fan Wins (Refunded)' : d.adminDecision === 'creator_wins' ? 'Creator Wins (Paid)' : d.adminDecision}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CreatorDisputes;
