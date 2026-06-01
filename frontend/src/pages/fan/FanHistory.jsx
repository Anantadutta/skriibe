import React, { useState, useEffect } from 'react';
import FanNavbar from '../../components/fan/layout/FanNavbar';
import { getFanHistory } from '../../services/fanApi';

const FanHistory = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getFanHistory();
        if (data.success) {
          setQuestions(data.questions || []);
        } else {
          setError('Failed to fetch history');
        }
      } catch (err) {
        setError('Failed to load your history. Make sure you are logged in.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'answered': return '#10b981'; // Green
      case 'submitted': return '#fbbf24'; // Yellow
      case 'expired': return '#ef4444'; // Red
      default: return '#94a3b8'; // Gray
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      color: '#ffffff',
      fontFamily: 'Inter, var(--font-body, sans-serif)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <FanNavbar />
      
      <main style={{ flex: 1, padding: '40px', maxWidth: '800px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '8px' }}>Your History</h1>
        <p style={{ color: '#94a3b8', marginBottom: '40px' }}>Track the questions you've asked and view creator replies.</p>
        
        {loading ? (
          <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>Loading history...</div>
        ) : error ? (
          <div style={{ color: '#ef4444', textAlign: 'center', padding: '40px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px' }}>
            {error}
          </div>
        ) : questions.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '64px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '20px',
            border: '1px dashed rgba(255,255,255,0.1)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
            <h3 style={{ fontSize: '20px', margin: '0 0 8px' }}>No questions yet</h3>
            <p style={{ color: '#94a3b8', margin: 0 }}>Go to the explore page to ask your first question!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {questions.map((q) => (
              <div key={q._id} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(45deg, #7c3aed, #06b6d4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '18px'
                    }}>
                      {q.creatorId?.avatarUrl ? (
                        <img src={q.creatorId.avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        (q.creatorId?.name || q.handle || 'C').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{q.creatorId?.name || '@'+q.handle}</div>
                      <div style={{ color: '#94a3b8', fontSize: '13px' }}>
                        Asked on {new Date(q.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(q.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    background: `${getStatusColor(q.status)}20`,
                    color: getStatusColor(q.status),
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}>
                    {q.status}
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', fontSize: '15px', lineHeight: '1.5', color: '#e2e8f0' }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', fontWeight: 'bold', textTransform: 'uppercase' }}>Your Question:</div>
                  {q.questionText}
                </div>

                {q.status === 'answered' && q.answerText && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '16px', borderRadius: '12px', fontSize: '15px', lineHeight: '1.5', color: '#e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 'bold', textTransform: 'uppercase' }}>Creator's Reply:</div>
                      {q.answeredAt && (
                        <div style={{ fontSize: '11px', color: '#10b981', opacity: 0.8 }}>
                          {new Date(q.answeredAt).toLocaleDateString()} {new Date(q.answeredAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      )}
                    </div>
                    {q.answerText}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default FanHistory;
