import React, { useState, useEffect } from 'react';
import FanNavbar from '../../components/fan/layout/FanNavbar';
import { getFanHistory, flagQuestion } from '../../services/fanApi';

const FanHistory = () => {
  const flagOptions = [
    { category: "About the answer quality", options: [
      { label: "Didn't answer my question", desc: "the reply was vague or completely off-topic" },
      { label: "Copy-pasted / not original", desc: "looks like it was lifted from somewhere else" }
    ]},
    { category: "About the content itself", options: [
      { label: "Spam or self-promotion", desc: "the reply was just plugging their own links/products" },
      { label: "Undisclosed paid promotion", desc: "looks like a sponsored answer but wasn't labeled" }
    ]},
    { category: "About behavior toward the fan", options: [
      { label: "Rude or dismissive", desc: "the creator was condescending or disrespectful in the reply" },
      { label: "Ignored the actual question", desc: "replied but deliberately dodged what was asked" }
    ]},
    { category: "About authenticity", options: [
      { label: "This doesn't seem like the real creator", desc: "suspected impersonation or ghost-written" },
      { label: "AI-generated response", desc: "feels like it wasn't written by the creator at all" }
    ]},
    { category: "Catch-all", options: [
      { label: "Something else", desc: "with a short text box for the fan to explain" }
    ]}
  ];

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
  const [isFlagging, setIsFlagging] = useState(false);
  const [selectedFlagOption, setSelectedFlagOption] = useState('');
  const [flagReason, setFlagReason] = useState('');

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

  const getTimeAgo = (date) => {
    if (!date) return '';
    const diff = (new Date() - new Date(date)) / (1000 * 60 * 60);
    if (diff < 1) return `${Math.round(diff * 60)} mins ago`;
    if (diff < 24) return `${Math.round(diff)} hours ago`;
    return `${Math.round(diff / 24)} days ago`;
  };

  const getAnsweredIn = (created, answered) => {
    if (!created || !answered) return '';
    const diff = (new Date(answered) - new Date(created)) / (1000 * 60);
    if (diff < 60) return `${Math.round(diff)} min`;
    return `${Math.floor(diff / 60)}h ${Math.round(diff % 60)} min`;
  };

  const handleFlagConfirm = async () => {
    if (!selectedQuestion) return;
    const finalReason = selectedFlagOption === 'Something else' 
      ? `Something else: ${flagReason}` 
      : (selectedFlagOption || flagReason);
    
    setIsFlagging(true);
    try {
      const res = await flagQuestion(selectedQuestion._id, finalReason);
      if (res.success) {
        const updatedQuestions = questions.map(q => q._id === selectedQuestion._id ? { ...q, status: 'flagged' } : q);
        setQuestions(updatedQuestions);
        setSelectedQuestion({ ...selectedQuestion, status: 'flagged' });
        setIsFlagModalOpen(false);
        setSelectedFlagOption('');
        setFlagReason('');
      } else {
        alert(res.message || 'Failed to flag question');
      }
    } catch (err) {
      alert('Error flagging question');
    } finally {
      setIsFlagging(false);
    }
  };

  const buildThreads = (qs) => {
    const roots = [];
    const childrenMap = {};

    qs.forEach(q => {
      if (q.isFollowUp && q.parentQuestionId) {
        if (!childrenMap[q.parentQuestionId]) childrenMap[q.parentQuestionId] = [];
        childrenMap[q.parentQuestionId].push(q);
      } else {
        roots.push(q);
      }
    });

    qs.forEach(q => {
      if (q.isFollowUp && q.parentQuestionId && !roots.find(r => r._id === q.parentQuestionId)) {
        roots.push(q);
      }
    });

    Object.values(childrenMap).forEach(children => {
      children.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    });

    roots.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return { roots, childrenMap };
  };

  const { roots, childrenMap } = buildThreads(questions);

  const renderList = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {roots.map((q) => {
        const threadChildren = childrenMap[q._id] || [];
        return (
        <div key={q._id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div 
            onClick={() => setSelectedQuestion(q)}
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
        >
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
                  Asked on {new Date(q.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {threadChildren.length > 0 && (
                <div style={{
                  background: 'rgba(56, 189, 248, 0.1)',
                  color: '#38bdf8',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span>💬</span> {threadChildren.length + 1} Messages
                </div>
              )}
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
          </div>
          
          <div style={{ color: '#e2e8f0', fontSize: '15px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
            {q.questionText}
          </div>
        </div>

        </div>
      )})}
    </div>
  );

  const renderDetail = () => {
    const q = selectedQuestion;
    const isAnswered = q.status === 'answered' && q.answeredAt;
    let diffHours = 0;
    
    if (isAnswered) {
      diffHours = (new Date() - new Date(q.answeredAt)) / (1000 * 60 * 60);
    }

    const creatorName = q.creatorId?.name || '@' + q.handle;

    const hasFollowUp = (childrenMap[q._id] || []).length > 0;

    if (isAnswered && diffHours < 24) {
      return (
        <div style={{ maxWidth: '480px', margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', position: 'relative' }}>
            <button 
              onClick={() => setSelectedQuestion(null)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer', position: 'absolute', left: 0 }}
            >
              ←
            </button>
            <h2 style={{ flex: 1, textAlign: 'center', margin: 0, fontSize: '18px', fontWeight: '800' }}>Answer ready</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '900', fontSize: '18px' }}>
                  {creatorName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '16px', color: '#fff' }}>{creatorName}</div>
                  <div style={{ color: '#64748b', fontSize: '12px' }}>Replied {getTimeAgo(q.answeredAt)}</div>
                </div>
              </div>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                Replied
              </div>
            </div>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '4px 0' }} />

            <div style={{ background: '#1a1b23', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ color: '#64748b', fontSize: '10px', fontWeight: '800', letterSpacing: '1px', marginBottom: '12px', textTransform: 'uppercase' }}>YOUR QUESTION</div>
              <div style={{ color: '#94a3b8', fontSize: '15px', fontStyle: 'italic', lineHeight: '1.5', wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                "{q.questionText}"
              </div>
            </div>

            <div style={{ background: '#0a1922', borderRadius: '16px', padding: '20px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
              <div style={{ color: '#38bdf8', fontSize: '10px', fontWeight: '800', letterSpacing: '1px', marginBottom: '12px', textTransform: 'uppercase' }}>{creatorName.split(' ')[0]}'S ANSWER</div>
              <div style={{ color: '#fff', fontSize: '16px', lineHeight: '1.6', wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                {q.answerText}
              </div>
            </div>

            {(childrenMap[q._id] || []).map((child) => (
              <React.Fragment key={child._id}>
                <div style={{ display: 'flex', justifyContent: 'center', margin: '-8px 0' }}>
                  <div style={{ width: '2px', height: '24px', background: 'rgba(255,255,255,0.1)' }} />
                </div>
                <div style={{ background: '#1a1b23', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ color: '#64748b', fontSize: '10px', fontWeight: '800', letterSpacing: '1px', marginBottom: '12px', textTransform: 'uppercase' }}>↳ YOUR FOLLOW-UP</div>
                  <div style={{ color: '#94a3b8', fontSize: '15px', fontStyle: 'italic', lineHeight: '1.5', wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                    "{child.questionText}"
                  </div>
                </div>
                {child.status === 'answered' && child.answerText && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '-8px 0' }}>
                      <div style={{ width: '2px', height: '24px', background: 'rgba(56, 189, 248, 0.2)' }} />
                    </div>
                    <div style={{ background: '#0a1922', borderRadius: '16px', padding: '20px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                      <div style={{ color: '#38bdf8', fontSize: '10px', fontWeight: '800', letterSpacing: '1px', marginBottom: '12px', textTransform: 'uppercase' }}>{creatorName.split(' ')[0]}'S ANSWER</div>
                      <div style={{ color: '#fff', fontSize: '16px', lineHeight: '1.6', wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                        {child.answerText}
                      </div>
                    </div>
                  </>
                )}
              </React.Fragment>
            ))}

            <div style={{ background: hasFollowUp ? '#11131a' : '#062c19', borderRadius: '16px', padding: '16px', border: hasFollowUp ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: hasFollowUp ? 0.5 : 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ color: '#fff', fontSize: '20px' }}>💬</div>
                <div>
                  <div style={{ color: hasFollowUp ? '#94a3b8' : '#10b981', fontWeight: '800', fontSize: '14px' }}>1 free follow-up available</div>
                  <div style={{ color: '#64748b', fontSize: '12px' }}>{hasFollowUp ? 'Follow-up submitted' : 'Valid for 24 hours'}</div>
                </div>
              </div>
              <button 
                onClick={() => window.location.href = `/creator/${q.handle}?isFollowUp=true&parentQuestionId=${q._id}`} 
                disabled={hasFollowUp}
                style={{ background: hasFollowUp ? '#334155' : '#10b981', color: hasFollowUp ? '#94a3b8' : '#000', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: '700', fontSize: '14px', cursor: hasFollowUp ? 'not-allowed' : 'pointer' }}>
                Ask →
              </button>
            </div>

            <button 
              onClick={() => setIsFlagModalOpen(true)}
              style={{ background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '16px', padding: '16px', color: '#ef4444', fontWeight: '600', fontSize: '14px', cursor: 'pointer', marginTop: '8px', transition: 'background 0.2s' }} 
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'} 
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              Flag as incomplete (48hr window)
            </button>

          </div>
        </div>
      );
    }

    if (isAnswered && diffHours >= 24) {
      return (
        <div style={{ maxWidth: '480px', margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', position: 'relative' }}>
            <button 
              onClick={() => setSelectedQuestion(null)}
              style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '50%', width: '32px', height: '32px', border: 'none', color: '#94a3b8', fontSize: '16px', cursor: 'pointer', position: 'absolute', left: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ←
            </button>
            <h2 style={{ flex: 1, textAlign: 'center', margin: 0, fontSize: '18px', fontWeight: '800' }}>Answer receipt</h2>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ color: '#64748b', fontSize: '10px', fontWeight: '800', letterSpacing: '2px', marginBottom: '4px' }}>SKRIIBE RECEIPT</div>
            <div style={{ color: '#fff', fontSize: '28px', fontWeight: '900', fontStyle: 'italic', letterSpacing: '1px' }}>#{q.orderId || `SKR-${q._id.substring(0,8).toUpperCase()}`}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: '#11131a', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '900', fontSize: '18px' }}>
                    {creatorName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '16px', color: '#fff' }}>{creatorName}</div>
                    <div style={{ color: '#64748b', fontSize: '12px' }}>@{q.handle || creatorName.toLowerCase().replace(/\s+/g, '')}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#fff', fontSize: '24px', fontWeight: '900', fontStyle: 'italic', lineHeight: '1', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '14px', marginRight: '2px', marginTop: '2px' }}>Rs.</span>{q.price || '99'}
                  </div>
                  <div style={{ color: '#10b981', fontSize: '12px', fontWeight: '700', marginTop: '4px' }}>Paid</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Date</span>
                  <span style={{ color: '#cbd5e1', fontWeight: '500' }}>{new Date(q.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })} · {new Date(q.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Razorpay ID</span>
                  <span style={{ color: '#cbd5e1', fontFamily: 'monospace' }}>{q.razorpayId || 'pay_ABC123XYZ456'}</span>
                </div>
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Answered in</span>
                  <span style={{ color: '#cbd5e1', fontWeight: '500' }}>{getAnsweredIn(q.createdAt, q.answeredAt)}</span>
                </div>
              </div>
            </div>

            <div style={{ background: '#1a1b23', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ color: '#64748b', fontSize: '10px', fontWeight: '800', letterSpacing: '1px', marginBottom: '12px', textTransform: 'uppercase' }}>YOUR QUESTION</div>
              <div style={{ color: '#94a3b8', fontSize: '15px', fontStyle: 'italic', lineHeight: '1.5', wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                "{q.questionText}"
              </div>
            </div>

            <div style={{ background: '#0a1922', borderRadius: '16px', padding: '20px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
              <div style={{ color: '#38bdf8', fontSize: '10px', fontWeight: '800', letterSpacing: '1px', marginBottom: '12px', textTransform: 'uppercase' }}>{creatorName.split(' ')[0]}'S FULL ANSWER</div>
              <div style={{ color: '#fff', fontSize: '16px', lineHeight: '1.6' }}>
                {q.answerText}
              </div>
            </div>

            <div style={{ background: '#11131a', borderRadius: '16px', padding: '16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.5 }}>
                <div style={{ color: '#fff', fontSize: '20px' }}>💬</div>
                <div>
                  <div style={{ color: '#94a3b8', fontWeight: '800', fontSize: '14px' }}>1 free follow-up available</div>
                  <div style={{ color: '#64748b', fontSize: '12px' }}>{hasFollowUp ? 'Follow-up submitted' : 'Expired (24h limit)'}</div>
                </div>
              </div>
              <button disabled style={{ background: '#334155', color: '#94a3b8', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: '700', fontSize: '14px', cursor: 'not-allowed' }}>
                Ask →
              </button>
            </div>

            <button style={{ background: '#38bdf8', color: '#000', border: 'none', borderRadius: '16px', padding: '16px', fontWeight: '800', fontSize: '15px', cursor: 'pointer', marginTop: '8px' }}>
              Ask {creatorName.split(' ')[0]} another question
            </button>

          </div>
        </div>
      );
    }
    
    return (
        <div style={{ maxWidth: '480px', margin: '0 auto', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', position: 'relative' }}>
            <button 
                onClick={() => setSelectedQuestion(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer', position: 'absolute', left: 0 }}
            >
                ←
            </button>
            <h2 style={{ flex: 1, textAlign: 'center', margin: 0, fontSize: '18px', fontWeight: '800' }}>Question Details</h2>
            </div>
            
            <div style={{ background: '#1a1b23', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '16px' }}>
                <div style={{ color: '#64748b', fontSize: '10px', fontWeight: '800', letterSpacing: '1px', marginBottom: '12px', textTransform: 'uppercase' }}>YOUR QUESTION</div>
                <div style={{ color: '#94a3b8', fontSize: '15px', fontStyle: 'italic', lineHeight: '1.5', wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                "{q.questionText}"
                </div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                Status: <strong style={{ color: getStatusColor(q.status), textTransform: 'uppercase' }}>{q.status}</strong>
                <p style={{ marginTop: '8px', fontSize: '14px' }}>Waiting for {creatorName} to reply.</p>
            </div>
        </div>
    );
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
      
      <main style={{ flex: 1, padding: '40px 20px', maxWidth: '800px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {!selectedQuestion && (
          <>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '8px' }}>Your History</h1>
            <p style={{ color: '#94a3b8', marginBottom: '40px' }}>Track the questions you've asked and view creator replies.</p>
          </>
        )}
        
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
          selectedQuestion ? renderDetail() : renderList()
        )}
      </main>

      {/* Flag Confirmation Modal */}
      {isFlagModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#11131a', border: '1px solid #1f2937', borderRadius: '16px', padding: '32px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h3 style={{ margin: '0 0 16px', fontSize: '20px', color: '#fff' }}>Flag Reply?</h3>
            <p style={{ color: '#94a3b8', marginBottom: '24px', lineHeight: '1.5', fontSize: '0.9rem' }}>
              Select a reason for flagging this reply. This will open a dispute.
            </p>
            
            <div style={{ maxHeight: '55vh', overflowY: 'auto', textAlign: 'left', marginBottom: '24px', paddingRight: '8px' }} className="custom-scrollbar">
              {flagOptions.map((group, idx) => (
                <div key={idx} style={{ marginBottom: '24px' }}>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>{group.category}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {group.options.map((opt, oIdx) => (
                      <div key={oIdx} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button
                          onClick={() => { setSelectedFlagOption(opt.label); if(opt.label !== 'Something else') setFlagReason(''); }}
                          style={{
                            width: '100%',
                            background: selectedFlagOption === opt.label ? 'rgba(239, 68, 68, 0.05)' : '#15151A',
                            border: selectedFlagOption === opt.label ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '16px',
                            padding: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s'
                          }}
                        >
                          <div style={{
                            width: '24px', height: '24px', borderRadius: '50%',
                            border: selectedFlagOption === opt.label ? 'none' : '2px solid rgba(255,255,255,0.2)',
                            background: selectedFlagOption === opt.label ? '#ef4444' : 'transparent',
                            flexShrink: 0
                          }} />
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ color: '#ffffff', fontWeight: '800', fontSize: '1rem' }}>{opt.label}</div>
                            <div style={{ color: selectedFlagOption === opt.label ? 'rgba(255,255,255,0.5)' : '#64748b', fontSize: '0.85rem' }}>{opt.desc}</div>
                          </div>
                        </button>
                        
                        {opt.label === 'Something else' && selectedFlagOption === 'Something else' && (
                          <div style={{
                            background: '#15151A',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '16px',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            animation: 'fadeIn 0.3s ease-out'
                          }}>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                              Please explain
                            </div>
                            <textarea 
                              placeholder="Write your reason here..."
                              value={flagReason}
                              onChange={(e) => setFlagReason(e.target.value)}
                              autoFocus
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#ffffff',
                                fontSize: '1rem',
                                resize: 'none',
                                outline: 'none',
                                minHeight: '60px',
                                fontFamily: 'inherit'
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => { setIsFlagModalOpen(false); setSelectedFlagOption(''); setFlagReason(''); }}
                disabled={isFlagging}
                style={{ flex: 1, background: 'transparent', border: '1px solid #334155', color: '#cbd5e1', padding: '12px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleFlagConfirm}
                disabled={!selectedFlagOption || (selectedFlagOption === 'Something else' && !flagReason.trim()) || isFlagging}
                style={{ 
                  flex: 1, 
                  background: (!selectedFlagOption || (selectedFlagOption === 'Something else' && !flagReason.trim()) || isFlagging) ? '#3f3f46' : '#ef4444', 
                  border: 'none', 
                  color: (!selectedFlagOption || (selectedFlagOption === 'Something else' && !flagReason.trim()) || isFlagging) ? '#a1a1aa' : '#fff', 
                  padding: '12px', 
                  borderRadius: '12px', 
                  fontWeight: 'bold', 
                  cursor: (!selectedFlagOption || (selectedFlagOption === 'Something else' && !flagReason.trim()) || isFlagging) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {isFlagging ? 'Flagging...' : 'Yes, Flag it'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FanHistory;
