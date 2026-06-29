import React, { useState } from 'react';
import api from '../../services/api';

const QuestionModal = ({ creator, onClose }) => {
  const [step, setStep] = useState('overview'); // 'overview' | 'ask'
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const price = creator.pricePerQuestion || 99;
  const replyRate = creator.stats?.replyRate ?? 0;
  const avgReply = creator.stats?.avgReplyTime || 0;
  const answeredCount = creator.stats?.totalAnswered || creator.questionsAnswered || 0;

  // Format reply time (e.g. 3.2h)
  const formatTime = (time) => {
    if (typeof time === 'string') return time;
    if (time < 1) return `${Math.round(time * 60)}m`;
    return `${time.toFixed(1)}h`;
  };

  const handleSubmit = async () => {
    if (!question.trim()) return;
    if (question.length > 500) return;

    setLoading(true);
    setError('');
    try {
      await api.post('/questions', {
        creatorId: creator.id || creator._id,
        questionText: question
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to send question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
      fontFamily: 'Inter, var(--font-body, sans-serif)'
    }}>
      <div style={{
        background: '#0a0a0f',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '480px',
        border: '1px solid #1a1a1a',
        padding: '32px 24px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
      }}>
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '20px',
            background: 'transparent', border: 'none', color: '#64748b',
            fontSize: '28px', cursor: 'pointer', zIndex: 10
          }}
        >
          &times;
        </button>

        {success ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', width: '100%' }}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>✅</div>
            <h2 style={{ margin: '0 0 12px', color: '#fff', fontSize: '28px' }}>Message sent!</h2>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '16px', lineHeight: '1.5' }}>
              You'll get a real answer directly from {creator.name} within {creator.responseTime || '24 hours'}.
            </p>
          </div>
        ) : step === 'overview' ? (
          // STEP 1: Profile Overview
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            {/* Header / Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <h2 style={{ margin: 0, color: '#ffffff', fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>
                {creator.name}
              </h2>
            </div>
            
            <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>
              @{creator.handle} · <span style={{ color: '#ffffff', fontWeight: '700' }}>12K</span> followers
            </div>

            {/* Instagram Linked Pill */}
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid #db2777', // subtle pink border
              padding: '6px 12px',
              borderRadius: '20px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: '600',
              color: '#f472b6',
              marginBottom: '20px'
            }}>
              📸 Instagram linked
            </div>

            {/* Topic Tags & Live */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {creator.expertise?.slice(0,2).map(exp => (
                <span key={exp} style={{
                  background: 'rgba(6, 182, 212, 0.1)',
                  color: '#06b6d4',
                  fontSize: '12px',
                  fontWeight: '600',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  border: '1px solid rgba(6, 182, 212, 0.2)'
                }}>
                  {exp}
                </span>
              ))}
              <span style={{
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#10b981',
                fontSize: '12px',
                fontWeight: '700',
                padding: '4px 12px',
                borderRadius: '16px',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <div style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px #10b981' }} />
                LIVE
              </span>
            </div>

            {/* Stats Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '12px',
              width: '100%',
              marginBottom: '24px'
            }}>
              <div style={{ background: '#131313', border: '1px solid #1f1f1f', borderRadius: '16px', padding: '16px 8px', textAlign: 'center' }}>
                <div style={{ color: '#38bdf8', fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>{replyRate}%</div>
                <div style={{ color: '#64748b', fontSize: '10px', fontWeight: '700', letterSpacing: '1px' }}>REPLY</div>
              </div>
              <div style={{ background: '#131313', border: '1px solid #1f1f1f', borderRadius: '16px', padding: '16px 8px', textAlign: 'center' }}>
                <div style={{ color: '#38bdf8', fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>{formatTime(avgReply)}</div>
                <div style={{ color: '#64748b', fontSize: '10px', fontWeight: '700', letterSpacing: '1px' }}>AVG</div>
              </div>
              <div style={{ background: '#131313', border: '1px solid #1f1f1f', borderRadius: '16px', padding: '16px 8px', textAlign: 'center' }}>
                <div style={{ color: '#38bdf8', fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>{answeredCount}</div>
                <div style={{ color: '#64748b', fontSize: '10px', fontWeight: '700', letterSpacing: '1px' }}>ANSWERED</div>
              </div>
            </div>

            {/* Bio */}
            <div style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', textAlign: 'center', padding: '0 16px', marginBottom: '32px' }}>
              {creator.bio}
            </div>

            {/* Large Bottom Booking Card */}
            <div style={{
              background: '#131313',
              border: '1px solid #1f1f1f',
              borderRadius: '24px',
              padding: '32px 24px',
              width: '100%',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: 'inset 0 2px 10px rgba(255,255,255,0.02)'
            }}>
              <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '700', letterSpacing: '2px', marginBottom: '16px' }}>
                ASK ME ANYTHING
              </div>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px' }}>
                <span style={{ color: '#fff', fontSize: '24px', fontWeight: '600', marginTop: '6px', marginRight: '4px' }}>₹</span>
                <span style={{ color: '#fff', fontSize: '56px', fontWeight: '800', lineHeight: '1' }}>{price}</span>
              </div>

              <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#fb923c' }}>⚡</span> I'll reply within 24 hrs
              </div>

              <button
                onClick={() => setStep('ask')}
                style={{
                  background: 'linear-gradient(90deg, #34d399, #10b981)',
                  color: '#000',
                  border: 'none',
                  borderRadius: '100px',
                  padding: '16px',
                  fontWeight: '700',
                  fontSize: '16px',
                  width: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Ask Now →
              </button>
            </div>

            <div style={{ color: '#64748b', fontSize: '12px', marginTop: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🔒</span> Secured payments · 100% refund if no reply
            </div>

          </div>
        ) : (
          // STEP 2: Ask Question Form (Current UI adapted)
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: creator.bgColor || '#333',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', fontWeight: 'bold', color: '#fff'
              }}>
                {creator.initials || creator.name.charAt(0)}
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px', color: '#fff', fontSize: '20px' }}>Ask {creator.name}</h3>
                <div style={{ color: '#9ca3af', fontSize: '14px' }}>@{creator.handle}</div>
              </div>
            </div>

            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your question..."
              maxLength={500}
              autoFocus
              style={{
                width: '100%', height: '140px',
                background: '#131313', border: '1px solid #2a2a2a',
                borderRadius: '16px', padding: '16px',
                color: '#fff', fontSize: '16px', fontFamily: 'inherit',
                resize: 'none', outline: 'none', boxSizing: 'border-box',
                marginBottom: '12px'
              }}
            />
            <div style={{ textAlign: 'right', color: '#64748b', fontSize: '12px', marginBottom: '24px' }}>
              {question.length}/500 chars
            </div>

            {error && (
              <div style={{ color: '#ef4444', fontSize: '14px', marginBottom: '16px', background: 'rgba(239,68,68,0.1)', padding: '12px', borderRadius: '8px' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button
                onClick={() => setStep('overview')}
                style={{
                  background: 'transparent',
                  color: '#94a3b8', border: 'none',
                  fontSize: '14px', cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                ← Back
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ color: '#9ca3af', fontSize: '14px' }}>
                  Cost <span style={{ color: '#fff', fontWeight: 'bold' }}>₹{price}</span>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={!question.trim() || loading}
                  style={{
                    background: 'linear-gradient(90deg, #38bdf8, #818cf8)',
                    color: '#000', border: 'none', borderRadius: '100px',
                    padding: '12px 24px', fontWeight: 'bold', fontSize: '14px',
                    cursor: !question.trim() || loading ? 'not-allowed' : 'pointer',
                    opacity: !question.trim() || loading ? 0.5 : 1,
                    boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)'
                  }}
                >
                  {loading ? 'Sending...' : 'Send →'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionModal;
