import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NotificationBell from '../components/NotificationBell';

const OpenQuestions = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/open-questions`, { withCredentials: true });
        setQuestions(res.data);
      } catch (err) {
        console.error('Failed to fetch open questions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  return (
    <div style={{ padding: '32px 24px', maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
          Admin <span style={{ color: '#ffffff', fontWeight: 'bold' }}>/ Open Questions</span>
        </div>
        <NotificationBell />
      </div>
      
      <hr style={{ border: 'none', borderTop: '1px solid #1e1e2d', margin: '0 0 8px 0' }} />

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => navigate(-1)} 
            style={{ background: '#13131A', border: '1px solid #1E1E2D', color: '#fff', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ← Back
          </button>
          <h1 className="font-wide" style={{ margin: 0, fontSize: '1.75rem', letterSpacing: '-0.03em', color: '#ffffff' }}>
            Open Questions
          </h1>
        </div>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '8px' }}>View all unanswered questions waiting on creators</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
        {loading ? (
          <div style={{ color: '#94a3b8', textAlign: 'center', padding: '24px' }}>Loading questions...</div>
        ) : questions.length === 0 ? (
          <div style={{ color: '#10B981', textAlign: 'center', padding: '24px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            All caught up! There are no pending messages.
          </div>
        ) : (
          questions.map((q) => (
            <div key={q._id} style={{ background: '#13131A', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid #1E1E2D' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 'bold' }}>ASKED TO CREATOR</div>
                  <div style={{ color: '#38BDF8', fontWeight: 'bold', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {q.creatorId?.avatarUrl ? (
                      <img src={q.creatorId.avatarUrl} alt="avatar" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                    ) : (
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#38BDF8' }}>
                        {(q.creatorId?.handle || 'C')[0].toUpperCase()}
                      </div>
                    )}
                    @{q.creatorId?.handle || q.handle || 'Unknown Creator'}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 'bold' }}>ASKED BY</div>
                  <div style={{ color: '#f8fafc', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    {q.isAnonymous ? 'Anonymous' : (q.buyerName || 'Unknown User')}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                    {q.buyerEmail || q.buyerPhone || ''}
                  </div>
                </div>
              </div>

              <div style={{ background: '#0a0a0f', padding: '16px', borderRadius: '12px', border: '1px solid #1E1E2D' }}>
                <div style={{ color: '#e2e8f0', fontSize: '0.95rem', lineHeight: '1.5', overflowWrap: 'anywhere' }}>
                  "{q.questionText}"
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                  Asked {new Date(q.createdAt).toLocaleString()}
                </div>
                <div style={{ color: '#F59E0B', fontSize: '0.8rem', fontWeight: 'bold', background: 'rgba(245, 158, 11, 0.1)', padding: '4px 12px', borderRadius: '12px' }}>
                  Pending
                </div>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default OpenQuestions;
