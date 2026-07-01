import React, { useState, useEffect } from 'react';
import { CheckCircle2, ChevronRight, MessageSquare, PlayCircle, Star, PauseCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import FanBottomNav from '../../components/fan/layout/FanBottomNav';
import FanNavbar from '../../components/fan/layout/FanNavbar';
import { getFanHistory, flagQuestion, satisfyQuestion } from '../../services/fanApi';
import api from '../../services/api';

const FanHistory = () => {
  const location = useLocation();
  const flagOptions = [
    { category: "", options: [
      { label: "Irrelevant Answer", desc: "The response was vague and off topic" },
      { label: "Abusive / Vulgar", desc: "The response contained abusive, offensive, hateful, or vulgar content." }
    ]}
  ];

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedMessageForModal, setSelectedMessageForModal] = useState(null);
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
          
          const searchParams = new URLSearchParams(location.search);
          const qId = searchParams.get('qId');
          if (qId && data.questions) {
            const targetQuestion = data.questions.find(q => q._id === qId);
            if (targetQuestion) {
              const rootId = targetQuestion.parentQuestionId || targetQuestion._id;
              const rootQuestion = data.questions.find(q => q._id === rootId);
              if (rootQuestion) {
                setSelectedQuestion(rootQuestion);
                
                // Mark unread logic
                const childrenMap = {};
                data.questions.forEach(q => {
                  if (q.isFollowUp && q.parentQuestionId) {
                    if (!childrenMap[q.parentQuestionId]) childrenMap[q.parentQuestionId] = [];
                    childrenMap[q.parentQuestionId].push(q);
                  }
                });
                
                const threadChildren = childrenMap[rootQuestion._id] || [];
                const unreadChildren = threadChildren.filter(c => c.status === 'answered' && !c.fanRead);
                if ((rootQuestion.status === 'answered' && !rootQuestion.fanRead) || unreadChildren.length > 0) {
                  try {
                    const toMark = [];
                    if (rootQuestion.status === 'answered' && !rootQuestion.fanRead) toMark.push(rootQuestion._id);
                    toMark.push(...unreadChildren.map(c => c._id));
                    await Promise.all(toMark.map(id => api.post(`/questions/${id}/read`)));
                    setQuestions(prev => prev.map(question => 
                      toMark.includes(question._id) ? { ...question, fanRead: true } : question
                    ));
                    window.dispatchEvent(new Event('notificationRead'));
                  } catch(e) { console.error('Failed to mark read', e); }
                }
              }
            }
          }
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
      case 'rejected':
      case 'flagged': return '#f59e0b'; // Dark yellow for under review
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
            onClick={async () => {
              setSelectedQuestion(q);
              const unreadChildren = threadChildren.filter(c => c.status === 'answered' && !c.fanRead);
              if ((q.status === 'answered' && !q.fanRead) || unreadChildren.length > 0) {
                try {
                  const toMark = [];
                  if (q.status === 'answered' && !q.fanRead) toMark.push(q._id);
                  toMark.push(...unreadChildren.map(c => c._id));
                  
                  // Mark them all as read sequentially or promise all
                  await Promise.all(toMark.map(id => api.post(`/questions/${id}/read`)));
                  
                  // Update state
                  setQuestions(prev => prev.map(question => 
                    toMark.includes(question._id) ? { ...question, fanRead: true } : question
                  ));
                  window.dispatchEvent(new Event('notificationRead'));
                } catch(e) { console.error('Failed to mark read', e); }
              }
            }}
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
                {q.status === 'rejected' ? 'REJECTED' : (q.status === 'flagged' ? 'UNDER ADMIN REVIEW' : q.status)}
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
    const isAnswered = ['answered', 'satisfied'].includes(q.status) && q.answeredAt;
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
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '900', fontSize: '18px', overflow: 'hidden' }}>
                  {q.creatorId?.avatarUrl ? (
                    <img src={q.creatorId.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    creatorName.charAt(0).toUpperCase()
                  )}
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

            <div 
              style={{ background: '#1a1b23', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
              onClick={() => setSelectedMessageForModal({ messageTitle: q.isFollowUp ? 'YOUR FOLLOW-UP' : 'YOUR MESSAGE', questionText: q.questionText, answerText: q.answerText, creatorName })}
            >
              <div style={{ color: '#64748b', fontSize: '10px', fontWeight: '800', letterSpacing: '1px', marginBottom: '12px', textTransform: 'uppercase' }}>{q.isFollowUp ? 'YOUR FOLLOW-UP' : 'YOUR MESSAGE'}</div>
              <div style={{ color: '#94a3b8', fontSize: '15px', fontStyle: 'italic', lineHeight: '1.5', wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                "{q.questionText}"
              </div>
            </div>

            <div style={{ background: '#0a1922', borderRadius: '16px', padding: '20px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
              <div style={{ color: '#38bdf8', fontSize: '10px', fontWeight: '800', letterSpacing: '1px', marginBottom: '12px', textTransform: 'uppercase' }}>{creatorName.split(' ')[0]}'S {q.isFollowUp ? 'REPLY' : 'FULL REPLY'}</div>
              <div style={{ color: '#fff', fontSize: '16px', lineHeight: '1.6', wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                {q.answerText}
              </div>
            </div>

            {(childrenMap[q._id] || []).map((child) => (
              <React.Fragment key={child._id}>
                  <>
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '8px 0' }} />
                    <div 
                      style={{ background: '#1a1b23', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
                      onClick={() => setSelectedMessageForModal({ messageTitle: 'YOUR FOLLOW-UP', questionText: child.questionText, answerText: child.answerText, creatorName })}
                    >
                      <div style={{ color: '#64748b', fontSize: '10px', fontWeight: '800', letterSpacing: '1px', marginBottom: '12px', textTransform: 'uppercase' }}>YOUR FOLLOW-UP</div>
                      <div style={{ color: '#94a3b8', fontSize: '15px', fontStyle: 'italic', lineHeight: '1.5', wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                        "{child.questionText}"
                      </div>
                    </div>
                  </>
                {child.answerText && (
                  <>
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '8px 0' }} />
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

            {!q.isFollowUp && q.followUpAllowed !== false && (
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
            )}

            {!q.isFollowUp && !hasFollowUp && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                  <button 
                    onClick={async () => {
                      if (q.status === 'satisfied' || q.status === 'flagged') return;
                      try {
                        await satisfyQuestion(q._id);
                        setQuestions(prev => prev.map(question => question._id === q._id ? { ...question, status: 'satisfied' } : question));
                        if (selectedQuestion?._id === q._id) {
                          setSelectedQuestion({ ...selectedQuestion, status: 'satisfied' });
                        }
                      } catch (e) {
                        console.error('Failed to satisfy', e);
                      }
                    }}
                    disabled={q.status === 'satisfied' || q.status === 'flagged'}
                    style={{ background: q.status === 'satisfied' ? 'rgba(16, 185, 129, 0.2)' : (q.status === 'flagged' ? 'transparent' : 'rgba(16, 185, 129, 0.1)'), border: q.status === 'flagged' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '16px', padding: '16px', color: q.status === 'flagged' ? '#64748b' : '#10b981', fontWeight: '600', fontSize: '14px', cursor: (q.status === 'satisfied' || q.status === 'flagged') ? 'not-allowed' : 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} 
                    onMouseOver={(e) => { if (q.status !== 'satisfied' && q.status !== 'flagged') e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)' }} 
                    onMouseOut={(e) => { if (q.status !== 'satisfied' && q.status !== 'flagged') e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)' }}
                  >
                    {q.status === 'satisfied' ? (
                      <><span style={{ fontSize: '18px' }}>✓</span> Satisfied</>
                    ) : (
                      <><span style={{ fontSize: '18px', opacity: q.status === 'flagged' ? 0.5 : 1 }}>🙂</span> Satisfied with answer</>
                    )}
                  </button>

                  <button 
                    onClick={() => setIsFlagModalOpen(true)}
                    disabled={q.status === 'satisfied' || q.status === 'flagged'}
                    style={{ background: q.status === 'flagged' ? 'rgba(239, 68, 68, 0.1)' : 'transparent', border: q.status === 'satisfied' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '16px', padding: '16px', color: q.status === 'satisfied' ? '#64748b' : '#ef4444', fontWeight: '600', fontSize: '14px', cursor: (q.status === 'satisfied' || q.status === 'flagged') ? 'not-allowed' : 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} 
                    onMouseOver={(e) => { if (q.status !== 'satisfied' && q.status !== 'flagged') e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)' }} 
                    onMouseOut={(e) => { if (q.status !== 'satisfied' && q.status !== 'flagged') e.currentTarget.style.background = 'transparent' }}
                  >
                    <span style={{ fontSize: '16px', opacity: q.status === 'satisfied' ? 0.5 : 1 }}>⚑</span> {q.status === 'flagged' ? 'Flagged as incomplete' : 'Flag as incomplete (24hr window)'}
                  </button>
                </div>
            )}

            <button 
              onClick={() => window.location.href = `/creator/${q.handle}`}
              style={{ background: '#38bdf8', color: '#000', border: 'none', borderRadius: '16px', padding: '16px', fontWeight: '800', fontSize: '15px', cursor: 'pointer', marginTop: '8px', width: '100%' }}
            >
              Message Again
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
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '900', fontSize: '18px', overflow: 'hidden' }}>
                    {q.creatorId?.avatarUrl ? (
                      <img src={q.creatorId.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      creatorName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '16px', color: '#fff' }}>{creatorName}</div>
                    <div style={{ color: '#64748b', fontSize: '12px' }}>@{q.handle || creatorName.toLowerCase().replace(/\s+/g, '')}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#fff', fontSize: '24px', fontWeight: '900', fontStyle: 'italic', lineHeight: '1', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '14px', marginRight: '2px', marginTop: '2px' }}>Rs.</span>{q.isFollowUp ? 0 : (q.amountPaid || q.price)}
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

            <div 
              style={{ background: '#1a1b23', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
              onClick={() => setSelectedMessageForModal({ messageTitle: 'YOUR MESSAGE', questionText: q.questionText, answerText: q.answerText, creatorName })}
            >
              <div style={{ color: '#64748b', fontSize: '10px', fontWeight: '800', letterSpacing: '1px', marginBottom: '12px', textTransform: 'uppercase' }}>YOUR MESSAGE</div>
              <div style={{ color: '#94a3b8', fontSize: '15px', fontStyle: 'italic', lineHeight: '1.5', wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                "{q.questionText}"
              </div>
            </div>

            <div style={{ background: '#0a1922', borderRadius: '16px', padding: '20px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
              <div style={{ color: '#38bdf8', fontSize: '10px', fontWeight: '800', letterSpacing: '1px', marginBottom: '12px', textTransform: 'uppercase' }}>{creatorName.split(' ')[0]}'S FULL REPLY</div>
              <div style={{ color: '#fff', fontSize: '16px', lineHeight: '1.6', wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                {q.answerText}
              </div>
            </div>

            {(childrenMap[q._id] || []).map((child) => (
              <React.Fragment key={child._id}>
                <>
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '8px 0' }} />
                  <div style={{ background: '#1a1b23', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ color: '#64748b', fontSize: '10px', fontWeight: '800', letterSpacing: '1px', marginBottom: '12px', textTransform: 'uppercase' }}>YOUR FOLLOW-UP</div>
                    <div style={{ color: '#94a3b8', fontSize: '15px', fontStyle: 'italic', lineHeight: '1.5', wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                      "{child.questionText}"
                    </div>
                  </div>
                </>
                {child.answerText && (
                  <>
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '8px 0' }} />
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

            {q.followUpAllowed !== false && (
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
            )}

            {!q.isFollowUp && !hasFollowUp && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                  <button 
                    disabled
                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '16px', color: '#64748b', fontWeight: '600', fontSize: '14px', cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} 
                  >
                    <span style={{ fontSize: '18px', opacity: 0.5 }}>🙂</span> Satisfied with answer
                  </button>

                  <button 
                    disabled
                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '16px', color: '#64748b', fontWeight: '600', fontSize: '14px', cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} 
                  >
                    <span style={{ fontSize: '16px', opacity: 0.5 }}>⚑</span> Flag as incomplete (Expired)
                  </button>
                </div>
            )}

            <button 
              onClick={() => window.location.href = `/creator/${q.handle}`}
              style={{ background: '#38bdf8', color: '#000', border: 'none', borderRadius: '16px', padding: '16px', fontWeight: '800', fontSize: '15px', cursor: 'pointer', marginTop: '8px', width: '100%' }}
            >
              Message Again
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
            <h2 style={{ flex: 1, textAlign: 'center', margin: 0, fontSize: '18px', fontWeight: '800' }}>Order receipt</h2>
            </div>
            
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ color: '#64748b', fontSize: '10px', fontWeight: '800', letterSpacing: '2px', marginBottom: '4px' }}>SKRIIBE RECEIPT</div>
              <div style={{ color: '#fff', fontSize: '28px', fontWeight: '900', fontStyle: 'italic', letterSpacing: '1px' }}>#{q.orderId || `SKR-${q._id.substring(0,8).toUpperCase()}`}</div>
            </div>
            
            <div 
              style={{ background: '#1a1b23', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '16px', cursor: 'pointer' }}
              onClick={() => setSelectedMessageForModal({ messageTitle: 'YOUR MESSAGE', questionText: q.questionText, answerText: q.answerText, creatorName })}
            >
                <div style={{ color: '#64748b', fontSize: '10px', fontWeight: '800', letterSpacing: '1px', marginBottom: '12px', textTransform: 'uppercase' }}>YOUR MESSAGE</div>
                <div style={{ color: '#94a3b8', fontSize: '15px', fontStyle: 'italic', lineHeight: '1.5', wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                "{q.questionText}"
                </div>
            </div>

            {q.answerText && (
              <div style={{ background: '#0a1922', borderRadius: '16px', padding: '20px', border: '1px solid rgba(56, 189, 248, 0.2)', marginBottom: '16px' }}>
                <div style={{ color: '#38bdf8', fontSize: '10px', fontWeight: '800', letterSpacing: '1px', marginBottom: '12px', textTransform: 'uppercase' }}>{creatorName.split(' ')[0]}'S FULL REPLY</div>
                <div style={{ color: '#fff', fontSize: '16px', lineHeight: '1.6', wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                  {q.answerText}
                </div>
              </div>
            )}
            
            {q.adminDecision && q.adminDecision !== 'pending' ? (
              <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                  Status: <strong style={{ color: '#10b981', textTransform: 'uppercase' }}>
                    {q.adminDecision === 'fan_wins' ? 'Issued full refund to buyer' : 
                     q.adminDecision === 'creator_wins' ? 'Dismiss — payout to creator' : 
                     q.adminDecision === 'partial_refund' ? 'Partial refund to the buyer/creator' : 
                     (q.adminDecision === 'abusive' || q.adminDecision === 'banned') ? 'User banned' : 
                     q.adminDecision}
                  </strong>
                  <p style={{ marginTop: '8px', fontSize: '14px', lineHeight: '1.5', color: '#fff' }}>
                     {q.adminDecision === 'fan_wins' ? 'A full refund has been issued to you.' : 
                      q.adminDecision === 'creator_wins' ? 'This dispute has been dismissed and payout released to the creator.' : 
                      q.adminDecision === 'partial_refund' ? 'A partial refund has been issued to you.' : 
                      (q.adminDecision === 'abusive' || q.adminDecision === 'banned') ? 'Your account has been flagged for violating guidelines. No refund will be issued.' : 
                      'This dispute has been resolved by Skriibe admin.'}
                  </p>
              </div>
            ) : q.status === 'rejected' ? (
              <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                  Status: <strong style={{ color: '#fbbf24', textTransform: 'uppercase' }}>UNDER ADMIN REVIEW</strong>
                  <p style={{ marginTop: '8px', fontSize: '14px', lineHeight: '1.5', color: '#e2e8f0' }}>
                    {q.rejectReason === 'abusive' ? (
                      "The creator has marked your message as abusive. It is currently under admin review."
                    ) : (q.rejectReason === 'abuse' ? (
                      "The creator has flagged your message for abuse. It is currently under admin review."
                    ) : (
                      `The creator has marked your message: "${q.rejectReason === 'vague' ? 'Question is too vague' : 'Outside the creator\'s expertise'}". It is currently under admin review for a refund.`
                    ))}
                  </p>
              </div>
            ) : q.status === 'flagged' ? (
              <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                  Status: <strong style={{ color: '#fbbf24', textTransform: 'uppercase' }}>UNDER ADMIN REVIEW</strong>
                  <p style={{ marginTop: '8px', fontSize: '14px', lineHeight: '1.5' }}>
                    You flagged this answer. It is currently under admin review.
                  </p>
              </div>
            ) : q.status === 'resolved' ? (
              <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                  Status: <strong style={{ color: '#10b981', textTransform: 'uppercase' }}>DISPUTE RESOLVED</strong>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                  Status: <strong style={{ color: getStatusColor(q.status), textTransform: 'uppercase' }}>{q.status}</strong>
                  <p style={{ marginTop: '8px', fontSize: '14px' }}>Waiting for {creatorName} to reply.</p>
              </div>
            )}
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
            <p style={{ color: '#94a3b8', marginBottom: '40px' }}>Track the messages you've asked and view creator replies.</p>
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
            <h3 style={{ fontSize: '20px', margin: '0 0 8px' }}>No messages yet</h3>
            <p style={{ color: '#94a3b8', margin: 0 }}>Go to the explore page to ask your first message !</p>
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
            
            {!selectedFlagOption ? (
              <div style={{ maxHeight: '55vh', overflowY: 'auto', textAlign: 'left', marginBottom: '24px', paddingRight: '8px' }} className="custom-scrollbar">
                {flagOptions.map((group, idx) => (
                  <div key={idx} style={{ marginBottom: '24px' }}>
                    {group.category && <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>{group.category}</div>}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {group.options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => { setSelectedFlagOption(opt.label); setFlagReason(''); }}
                          style={{
                            width: '100%',
                            background: '#15151A',
                            border: '1px solid rgba(255,255,255,0.06)',
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
                            border: '2px solid rgba(255,255,255,0.2)',
                            background: 'transparent',
                            flexShrink: 0
                          }} />
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ color: '#ffffff', fontWeight: '800', fontSize: '1rem' }}>{opt.label}</div>
                            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{opt.desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'left', marginBottom: '24px' }}>
                <div style={{
                  background: 'rgba(239, 68, 68, 0.05)',
                  border: '1px solid rgba(239, 68, 68, 0.5)',
                  borderRadius: '16px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '16px'
                }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ color: '#ffffff', fontWeight: '800', fontSize: '1rem' }}>{selectedFlagOption}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                      {flagOptions.flatMap(g => g.options).find(o => o.label === selectedFlagOption)?.desc}
                    </div>
                  </div>
                </div>

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
                      minHeight: '100px',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              {selectedFlagOption ? (
                <>
                  <button 
                    onClick={() => { setSelectedFlagOption(''); setFlagReason(''); }}
                    disabled={isFlagging}
                    style={{ flex: 1, background: 'transparent', border: '1px solid #334155', color: '#cbd5e1', padding: '12px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleFlagConfirm}
                    disabled={!flagReason.trim() || isFlagging}
                    style={{ 
                      flex: 1, 
                      background: (!flagReason.trim() || isFlagging) ? '#3f3f46' : '#ef4444', 
                      border: 'none', 
                      color: (!flagReason.trim() || isFlagging) ? '#a1a1aa' : '#fff', 
                      padding: '12px', 
                      borderRadius: '12px', 
                      fontWeight: 'bold', 
                      cursor: (!flagReason.trim() || isFlagging) ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {isFlagging ? 'Submitting...' : 'Submit'}
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => { setIsFlagModalOpen(false); setSelectedFlagOption(''); setFlagReason(''); }}
                  style={{ width: '100%', background: 'transparent', border: '1px solid #334155', color: '#cbd5e1', padding: '12px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedMessageForModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setSelectedMessageForModal(null)}>
          <div style={{ background: '#131313', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#fff' }}>Message Details</h3>
              <button onClick={() => setSelectedMessageForModal(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
            
            <div style={{ background: '#1a1b23', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '16px' }}>
              <div style={{ color: '#64748b', fontSize: '10px', fontWeight: '800', letterSpacing: '1px', marginBottom: '12px', textTransform: 'uppercase' }}>{selectedMessageForModal.messageTitle}</div>
              <div style={{ color: '#94a3b8', fontSize: '15px', fontStyle: 'italic', lineHeight: '1.5', wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                "{selectedMessageForModal.questionText}"
              </div>
            </div>

            {selectedMessageForModal.answerText && (
              <div style={{ background: '#0a1922', borderRadius: '16px', padding: '20px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                <div style={{ color: '#38bdf8', fontSize: '10px', fontWeight: '800', letterSpacing: '1px', marginBottom: '12px', textTransform: 'uppercase' }}>{selectedMessageForModal.creatorName?.split(' ')[0]}'S REPLY</div>
                <div style={{ color: '#fff', fontSize: '16px', lineHeight: '1.6', wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                  {selectedMessageForModal.answerText}
                </div>
              </div>
            )}
            
            <button onClick={() => setSelectedMessageForModal(null)} style={{ width: '100%', padding: '14px', marginTop: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>
              Back
            </button>
          </div>
        </div>
      )}

      <FanBottomNav />
    </div>
  );
};

export default FanHistory;
