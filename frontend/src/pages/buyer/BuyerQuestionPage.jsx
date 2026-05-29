import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSingleQuestion, getCreatorProfile } from '../../api/buyerApi';

const BuyerQuestionPage = () => {
  const { handle, id } = useParams();
  const [question, setQuestion] = useState(null);
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [qRes, cRes] = await Promise.all([
          getSingleQuestion(id),
          getCreatorProfile(handle)
        ]);

        if (qRes.success) setQuestion(qRes.question);
        if (cRes.success) setCreator(cRes.creator);
      } catch (err) {
        setError('Failed to fetch question details.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, handle]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0E0E0E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #2A2A2A', borderTopColor: '#29C5F6', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div style={{ minHeight: '100vh', background: '#0E0E0E', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
        <div style={{ fontSize: '2rem', marginBottom: '16px' }}>⚠️</div>
        <div>{error || 'Question not found'}</div>
        <Link to="/history" style={{ color: '#29C5F6', marginTop: '16px' }}>Go back to history</Link>
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
        
        {/* HEADER */}
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
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>To: @{question.handle}</h1>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
              Order #{question._id.slice(-8).toUpperCase()}
            </div>
          </div>
          <div style={{ 
            fontSize: '0.8rem', 
            fontWeight: '700',
            padding: '6px 12px',
            borderRadius: '16px',
            background: question.status === 'answered' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
            color: question.status === 'answered' ? '#22c55e' : '#eab308'
          }}>
            {question.status.toUpperCase()}
          </div>
        </div>

        {/* QUESTION TEXT */}
        <div style={{ 
          background: '#1A1A1A', 
          border: '1px solid #2A2A2A', 
          borderRadius: '16px', 
          padding: '24px',
          marginBottom: '24px'
        }}>
          <div style={{ color: '#29C5F6', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>
            Your Question
          </div>
          <div style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#f8fafc' }}>
            {question.questionText}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '16px' }}>
            Asked on {new Date(question.createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* ANSWER BOX */}
        {question.status === 'answered' ? (
          <div style={{ 
            background: 'rgba(41, 197, 246, 0.05)', 
            border: '1px solid rgba(41, 197, 246, 0.2)', 
            borderRadius: '16px', 
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#29C5F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                🎙️
              </div>
              <div style={{ color: '#29C5F6', fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                @{question.handle}'s Answer
              </div>
            </div>
            
            {/* If audio/video answer supported in future, render media player here */}
            {question.answerText && (
              <div style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#f8fafc' }}>
                {question.answerText}
              </div>
            )}
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '16px' }}>
              Answered on {new Date(question.answeredAt || question.updatedAt).toLocaleDateString()}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b', border: '1px dashed #2A2A2A', borderRadius: '16px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
            <div style={{ fontSize: '1rem', fontWeight: '600', color: '#cbd5e1' }}>Waiting for response</div>
            <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
              {creator ? creator.name : `@${question.handle}`} usually replies within {creator ? creator.responseTime : '24 hours'}.
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default BuyerQuestionPage;
