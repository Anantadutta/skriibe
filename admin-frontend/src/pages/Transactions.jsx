import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/transactions`, { withCredentials: true });
        setTransactions(res.data);
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const formatTimeTaken = (start, end) => {
    if (!start || !end) return 'Pending';
    const diff = new Date(end) - new Date(start);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return <div style={{ padding: '32px 24px', color: '#fff' }}>Loading transactions...</div>;
  }

  return (
    <div style={{ padding: '32px 24px', maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div>
        <h1 className="font-wide" style={{ margin: '0 0 8px 0', fontSize: '2rem', letterSpacing: '-0.03em' }}>Transactions</h1>
        <p style={{ margin: 0, color: '#94a3b8' }}>Monitor the flow of questions and payments between fans and creators.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {transactions.map(t => (
          <div key={t._id} style={{ background: '#13131A', borderRadius: '16px', border: '1px solid #1E1E2D', overflow: 'hidden' }}>
            
            {/* Primary Question Row */}
            <div 
              onClick={() => toggleExpand(t._id)}
              style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: expandedId === t._id ? 'rgba(255,255,255,0.02)' : 'transparent', transition: 'background 0.2s' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: 1 }}>
                {/* Fan Info */}
                <div style={{ width: '150px' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Fan</div>
                  <div style={{ color: '#fff', fontWeight: 'bold' }}>{t.buyerName || t.fanId?.name || 'Anonymous'}</div>
                  <div style={{ color: '#10B981', fontSize: '0.9rem', fontWeight: 'bold', marginTop: '2px' }}>₹{t.amountPaid || 0}</div>
                </div>

                <div style={{ color: '#334155' }}>→</div>

                {/* Creator Info */}
                <div style={{ width: '150px' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Creator</div>
                  <div style={{ color: '#fff', fontWeight: 'bold' }}>{t.creatorId?.name || t.handle || 'Unknown'}</div>
                  <div style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>@{t.handle}</div>
                </div>

                {/* Time Taken */}
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Time Taken</div>
                  <div style={{ color: t.answeredAt ? '#fff' : '#f59e0b', fontWeight: '500' }}>
                    {formatTimeTaken(t.createdAt, t.answeredAt)}
                  </div>
                </div>
              </div>

              {/* Status & Expand Icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  background: t.status === 'answered' || t.status === 'satisfied' ? 'rgba(16, 185, 129, 0.1)' : (t.status === 'expired' || t.status === 'flagged' || t.status === 'rejected') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                  color: t.status === 'answered' || t.status === 'satisfied' ? '#10B981' : (t.status === 'expired' || t.status === 'flagged' || t.status === 'rejected') ? '#EF4444' : '#F59E0B',
                  padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase'
                }}>
                  {t.status}
                </div>
                {t.followUps && t.followUps.length > 0 ? (
                  <div style={{ background: '#38BDF8', color: '#000', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    {t.followUps.length} Follow-up{t.followUps.length > 1 ? 's' : ''}
                  </div>
                ) : (
                  <div style={{ width: '80px' }}></div>
                )}
                <div style={{ color: '#64748b', transform: expandedId === t._id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ▼
                </div>
              </div>
            </div>

            {/* Expanded Content (Follow-ups & Answers) */}
            {expandedId === t._id && (
              <div style={{ padding: '0 20px 20px 20px', borderTop: '1px solid #1E1E2D', background: '#0a0a0f' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', marginBottom: '8px', color: '#94a3b8', fontSize: '0.85rem' }}>
                  <span>Original Question:</span>
                  <span>Asked: {new Date(t.createdAt).toLocaleString()}</span>
                </div>
                <div style={{ color: '#fff', fontStyle: 'italic', marginBottom: '16px' }}>"{t.questionText}"</div>
                
                {t.answerText && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '16px', borderRadius: '12px', marginBottom: '16px', borderLeft: '4px solid #10B981' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#10B981', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      <span>Answer:</span>
                      {t.answeredAt && <span>Answered: {new Date(t.answeredAt).toLocaleString()}</span>}
                    </div>
                    <div style={{ color: '#fff', fontSize: '0.95rem' }}>
                      {t.answerText}
                    </div>
                  </div>
                )}
                
                {t.followUps && t.followUps.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {t.followUps.map((f, index) => (
                      <div key={f._id} style={{ background: '#13131A', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #38BDF8' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <div style={{ color: '#38BDF8', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Follow-up {index + 1}
                          </div>
                          <div style={{ color: f.answeredAt ? '#10B981' : '#F59E0B', fontSize: '0.8rem', fontWeight: 'bold', textAlign: 'right' }}>
                            <div>Time Taken: {formatTimeTaken(f.createdAt, f.answeredAt)}</div>
                            <div style={{ color: '#94a3b8', fontSize: '0.7rem', marginTop: '4px', fontWeight: 'normal' }}>
                              Asked: {new Date(f.createdAt).toLocaleString()}
                              {f.answeredAt && ` | Answered: ${new Date(f.answeredAt).toLocaleString()}`}
                            </div>
                          </div>
                        </div>
                        <div style={{ color: '#cbd5e1', fontStyle: 'italic' }}>"{f.questionText}"</div>
                        {f.answerText && (
                          <div style={{ marginTop: '12px', color: '#fff', fontSize: '0.95rem', borderTop: '1px dashed #2A2A35', paddingTop: '12px' }}>
                            <span style={{ color: '#94a3b8', fontSize: '0.8rem', marginRight: '8px' }}>A:</span>
                            {f.answerText}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        ))}

        {transactions.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', background: '#13131A', borderRadius: '16px', border: '1px solid #1E1E2D' }}>
            No transactions found.
          </div>
        )}
      </div>

    </div>
  );
};

export default Transactions;
