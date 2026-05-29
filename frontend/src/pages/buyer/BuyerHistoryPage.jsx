import React, { useState, useEffect } from 'react';
import { getQuestionHistory } from '../../api/buyerApi';
import { Link } from 'react-router-dom';

const BuyerHistoryPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const phone = localStorage.getItem('skriibe_buyer_phone');

  useEffect(() => {
    if (!phone) {
      setLoading(false);
      return;
    }
    
    const fetchHistory = async () => {
      try {
        const res = await getQuestionHistory(phone);
        if (res.success) {
          setQuestions(res.questions);
        }
      } catch (err) {
        setError('Failed to fetch question history.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, [phone]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0E0E0E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #2A2A2A', borderTopColor: '#29C5F6', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: '#0E0E0E',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '32px 20px',
      boxSizing: 'border-box',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: '600px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
          <button 
            onClick={() => window.history.back()} 
            style={{ 
              background: '#1A1A1A', border: 'none', color: '#94a3b8', 
              width: '36px', height: '36px', borderRadius: '50%', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              cursor: 'pointer', fontSize: '1.2rem', padding: 0, marginRight: '16px'
            }}
          >
            {'<'}
          </button>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>My Questions</h1>
        </div>

        {!phone ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '40px 0' }}>
            No phone number found in local storage. Have you asked a question yet?
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', color: '#ef4444', padding: '40px 0' }}>
            {error}
          </div>
        ) : questions.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '40px 0' }}>
            You haven't asked any questions yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {questions.map(q => (
              <Link 
                key={q._id} 
                to={`/${q.handle}/question/${q._id}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={{ 
                  background: '#1A1A1A', 
                  border: '1px solid #2A2A2A', 
                  borderRadius: '16px', 
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'transform 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      To: @{q.handle}
                    </div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: '700',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      background: q.status === 'answered' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                      color: q.status === 'answered' ? '#22c55e' : '#eab308'
                    }}>
                      {q.status.toUpperCase()}
                    </div>
                  </div>
                  
                  <div style={{ fontSize: '1rem', color: '#ffffff', lineHeight: '1.4', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    "{q.questionText}"
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{new Date(q.createdAt).toLocaleDateString()}</span>
                    <span>₹{q.amountPaid}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default BuyerHistoryPage;
