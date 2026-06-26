import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { mockQuestions } from '../mock/questions';
import api from '../services/api';

const CreatorReplyScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [question, setQuestion] = useState(() => {
    if (location.state?.question) return location.state.question;
    return mockQuestions.find(q => q.id === id) || null;
  });

  const [rootQuestion, setRootQuestion] = useState(() => {
    return location.state?.rootQuestion || null;
  });

  useEffect(() => {
    if (question && question.isFollowUp && question.parentQuestionId && !rootQuestion) {
      const fetchRoot = async () => {
        try {
          const res = await api.get(`/creator/questions?t=${Date.now()}`);
          if (res.data.success) {
            const root = res.data.questions.find(q => (q._id || q.id) === question.parentQuestionId);
            if (root) setRootQuestion(root);
          }
        } catch (e) {
          console.error("Failed to fetch root question", e);
        }
      };
      fetchRoot();
    }
  }, [question, rootQuestion]);

  useEffect(() => {
    if (!question) {
      navigate('/creator/dashboard');
    }
  }, [question, navigate]);

  const [replyText, setReplyText] = useState('');
  const [followUpAllowed, setFollowUpAllowed] = useState(false);
  const [rejectHover, setRejectHover] = useState(false);
  const [abuseHover, setAbuseHover] = useState(false);
  
  // View states: 'reply', 'reject', 'success', 'flag'
  const [view, setView] = useState(() => {
    return location.state?.initialView || 'reply';
  });
  const [rejectReason, setRejectReason] = useState('expertise');
  const [flagReason, setFlagReason] = useState('nudity');

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  const navItems = [
    { label: 'HOME', icon: '🏠', route: '/creator/dashboard' },
    { label: 'INBOX', icon: '💬', route: '/creator/dashboard/inbox' },
    { label: 'ANALYTICS', icon: '📊', route: '/creator/analytics' },
    { label: 'PAYOUTS', icon: '💰', route: '/creator/payouts' },
    { label: 'SETTINGS', icon: '⚙️', route: '/creator/settings' },
  ];

  // Cyan filter: to make emojis turn cyan #29C5F6
  const cyanFilter = 'invert(69%) sepia(87%) saturate(2714%) hue-rotate(164deg) brightness(99%) contrast(98%)';
  // Gray filter
  const grayFilter = 'invert(31%) sepia(13%) saturate(760%) hue-rotate(181deg) brightness(96%) contrast(85%)';

  if (!question) return null;

  const charCount = replyText.trim().length;
  const isMinMet = charCount >= 100 && charCount <= 1000;

  const handleSend = async () => {
    if (!isMinMet) return;
    try {
      await api.post(`/creator/questions/${question._id || question.id}/reply`, { replyText, followUpAllowed });
      setView('success_reply');
    } catch (err) {
      console.error('Failed to send reply', err);
      alert('Failed to send reply. Please try again.');
    }
  };

  const handleRejectClick = () => {
    setView('reject');
  };

  const handleConfirmReject = async () => {
    try {
      await api.post(`/creator/questions/${question._id || question.id}/reject`, { reason: rejectReason });
      setView('success');
    } catch (err) {
      console.error('Failed to reject', err);
      alert('Failed to reject. Please try again.');
    }
  };

  const handleFlagClick = () => {
    setView('flag');
  };

  const handleConfirmFlag = async () => {
    try {
      await api.post(`/creator/questions/${question._id || question.id}/flag`, { reason: flagReason });
      setView('success_flag');
    } catch (err) {
      console.error('Failed to flag', err);
      alert('Failed to flag. Please try again.');
    }
  };

  const calculateSLARemaining = () => {
    const createdAt = new Date(question.createdAt || Date.now());
    const deadline = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
    const now = new Date();
    
    if (now > deadline) {
      return 'Breached';
    }
    
    const diffMs = deadline - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins}m remaining`;
    }
    return `${diffMins}m remaining`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0E0E0E',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingBottom: '60px',
      boxSizing: 'border-box',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Container to restrict width */}
      <div style={{
        width: '100%',
        maxWidth: '390px',
        padding: '24px 20px 20px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        
        {/* ========================================= */}
        {/* VIEW: REPLY (Default)                     */}
        {/* ========================================= */}
        {view === 'reply' && (
          <>
            {/* Header Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={() => navigate('/creator/dashboard')}
                style={{
                  background: '#1A1B23',
                  border: 'none',
                  color: '#94a3b8',
                  borderRadius: '16px',
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '20px',
                  fontWeight: '500',
                  transition: 'background-color 0.2s',
                  paddingBottom: '2px'
                }}
              >
                ‹
              </button>
              
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0', color: '#ffffff', letterSpacing: '-0.02em' }}>
                  Reply to {(question.buyerName || question.followerName || 'Ayushi').split(' ')[0]}
                </h2>
                <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>
                  {question.isFollowUp ? 'Follow-up question · Free' : `Question · ₹${question.amountPaid || question.pricePaid || 99}`}
                </div>
              </div>
            </div>

            {/* SLA Warning Banner */}
            {question.status !== 'satisfied' && (
              <div style={{ background: '#291E00', border: '1px solid #B45309', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', color: '#FBBF24' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FBBF24' }} />
                <span style={{ fontWeight: '800', fontSize: '0.95rem', letterSpacing: '0.01em' }}>SLA: {calculateSLARemaining()}</span>
              </div>
            )}

            {/* Context (Original Question and Answer) */}
            {rootQuestion ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                {/* Original Question Card */}
                <div style={{ background: '#16161E', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ color: '#64748b', fontSize: '10px', fontWeight: '800', letterSpacing: '1px', marginBottom: '12px', textTransform: 'uppercase' }}>ORIGINAL QUESTION</div>
                  <div style={{ color: '#94a3b8', fontSize: '15px', fontStyle: 'italic', lineHeight: '1.5', wordBreak: 'break-all', overflowWrap: 'anywhere', marginBottom: '16px' }}>
                    "{rootQuestion.questionText}"
                  </div>
                  <div style={{ background: '#0a1922', borderRadius: '12px', padding: '16px', border: '1px solid rgba(56, 189, 248, 0.1)' }}>
                    <div style={{ color: '#38bdf8', fontSize: '10px', fontWeight: '800', letterSpacing: '1px', marginBottom: '8px', textTransform: 'uppercase' }}>YOUR PREVIOUS ANSWER</div>
                    <div style={{ color: '#fff', fontSize: '14px', lineHeight: '1.5', wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                      {rootQuestion.answerText}
                    </div>
                  </div>
                </div>
                
                {/* Connector */}
                <div style={{ height: '30px', display: 'flex', justifyContent: 'center' }}>
                  <div style={{ width: '2px', height: '100%', background: 'rgba(255,255,255,0.1)' }} />
                </div>

                {/* Follow-up Question Card */}
                <div style={{ background: '#1C212A', borderRadius: '16px', padding: '20px', border: '1px solid rgba(52, 211, 153, 0.2)', position: 'relative' }}>
                  <div style={{ color: '#34d399', fontSize: '10px', fontWeight: '800', letterSpacing: '1px', marginBottom: '16px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    FOLLOW-UP QUESTION
                    <div style={{ background: 'rgba(52, 211, 153, 0.1)', color: '#34d399', padding: '2px 8px', borderRadius: '12px', fontSize: '9px' }}>FREE</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.1)', color: '#38BDF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem' }}>
                      {(question.buyerName || question.followerName || 'A')[0].toUpperCase()}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
                      {question.buyerName || question.followerName || 'AYUSHI'}
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: '1.1rem', color: '#ffffff', lineHeight: '1.5', fontStyle: 'italic', fontWeight: 600, wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                    "{question.questionText}"
                  </p>
                </div>
              </div>
            ) : (
              // Original single question card
              <div style={{ background: '#16161E', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.1)', color: '#38BDF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem' }}>
                    {(question.buyerName || question.followerName || 'A')[0].toUpperCase()}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
                    {question.buyerName || question.followerName || 'AYUSHI'} · <span style={{ color: '#38BDF8' }}>₹{question.amountPaid || question.pricePaid || 99} PAID</span>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '1.1rem', color: '#ffffff', lineHeight: '1.5', fontStyle: 'italic', fontWeight: 600, wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                  "{question.questionText}"
                </p>
              </div>
            )}

            {question.status === 'satisfied' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: '#0a1922', borderRadius: '16px', padding: '20px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                  <div style={{ color: '#38bdf8', fontSize: '10px', fontWeight: '800', letterSpacing: '1px', marginBottom: '12px', textTransform: 'uppercase' }}>YOUR ANSWER</div>
                  <div style={{ color: '#fff', fontSize: '16px', lineHeight: '1.6', wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                    {question.answerText}
                  </div>
                </div>
                <div style={{ background: '#0a2e1c', color: '#10b981', borderRadius: '16px', padding: '16px', fontWeight: '800', fontSize: '15px', textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <span style={{ fontSize: '18px', marginRight: '8px' }}>🙂</span>
                  {question.buyerName || question.followerName || 'The fan'} is satisfied with your answer!
                </div>
              </div>
            ) : (
              <>
                {/* SLA Warning Banner */}
                {question.status !== 'satisfied' && (
                  <div style={{ background: '#291E00', border: '1px solid #B45309', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', color: '#FBBF24' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FBBF24' }} />
                    <span style={{ fontWeight: '800', fontSize: '0.95rem', letterSpacing: '0.01em' }}>SLA: {calculateSLARemaining()}</span>
                  </div>
                )}

                {/* Reply Editor */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{ fontSize: '0.95rem', color: '#ffffff', fontWeight: 800 }}>
                    Your reply <span style={{ color: '#94a3b8', fontWeight: 500 }}>(Min 100 characters, Max 1000 characters)</span> <span style={{ color: '#38BDF8' }}>*</span>
                  </label>
                  
                  {/* Quick Reply Chips */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['Great question!', "Here's my take —", 'Short answer:'].map((chip, idx) => (
                      <div key={idx} onClick={() => setReplyText(prev => prev ? prev + ' ' + chip : chip)} style={{ background: '#1E293B', color: '#94a3b8', padding: '10px 16px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer' }}>
                        {chip}
                      </div>
                    ))}
                  </div>

                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Start typing your detailed response here..."
                    style={{
                      background: '#16161E',
                      border: 'none',
                      borderRadius: '16px',
                      padding: '20px',
                      color: '#94a3b8',
                      fontSize: '1rem',
                      lineHeight: '1.5',
                      minHeight: '200px',
                      resize: 'none',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      fontStyle: replyText ? 'normal' : 'italic',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />

                  {/* Character Count Validator */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8' }}>
                    <div style={{ color: isMinMet ? '#34D399' : (replyText.trim().length > 0 ? '#ef4444' : '#94a3b8') }}>
                      {charCount}/1000 characters
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <div>
                        {isMinMet ? <span style={{ color: '#34D399' }}>valid ✓</span> : (charCount < 100 ? `${100 - charCount} left to minimum` : `${charCount - 1000} over maximum`)}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>
                        100 characters minimum
                      </div>
                    </div>
                  </div>
                </div>

                {/* Follow Up Allowed Toggle */}
                {!question.isFollowUp && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    padding: '16px', 
                    marginBottom: '16px',
                    background: followUpAllowed ? 'rgba(56, 189, 248, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                    border: followUpAllowed ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    transition: 'all 0.2s ease'
                  }}>
                    <input 
                      type="checkbox" 
                      id="followUpAllowed"
                      checked={followUpAllowed}
                      onChange={(e) => setFollowUpAllowed(e.target.checked)}
                      style={{ cursor: 'pointer', width: '20px', height: '20px', accentColor: '#38BDF8' }}
                    />
                    <label htmlFor="followUpAllowed" style={{ color: followUpAllowed ? '#38BDF8' : '#e2e8f0', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', flex: 1 }}>
                      Allow Fan to ask 1 Free Follow-up Question
                    </label>
                  </div>
                )}

                {/* Send Reply Button */}
                <button
                  disabled={!isMinMet}
                  onClick={handleSend}
                  style={{
                    background: isMinMet ? '#38BDF8' : '#1E293B',
                    color: isMinMet ? '#0F172A' : '#64748b',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '18px',
                    fontWeight: '800',
                    fontSize: '1.05rem',
                    cursor: isMinMet ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease',
                    textAlign: 'center',
                    width: '100%'
                  }}
                >
                  Send reply →
                </button>

                {/* Action Button Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '4px' }}>
                  <button
                    onClick={handleRejectClick}
                    style={{
                      background: '#1A1B23',
                      border: 'none',
                      color: '#ffffff',
                      borderRadius: '16px',
                      padding: '16px',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    Reject & refund
                  </button>
                  <button
                    onClick={handleFlagClick}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      color: '#ef4444',
                      borderRadius: '16px',
                      padding: '16px',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
                    Flag abuse
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* ========================================= */}
        {/* VIEW: REJECT SELECTION                    */}
        {/* ========================================= */}
        {view === 'reject' && (
          <>
            {/* Header Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'center', position: 'relative' }}>
              <button
                onClick={() => setView('reply')}
                style={{
                  position: 'absolute',
                  left: 0,
                  background: '#21212B',
                  border: 'none',
                  color: '#94a3b8',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: '600',
                  paddingBottom: '2px'
                }}
              >
                &lt;
              </button>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0, color: '#ffffff' }}>
                Reject question
              </h2>
            </div>

            {/* Question Details Card (Compact) */}
            <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.5px' }}>
                {question.buyerName || question.followerName || 'Anonymous'} · Rs.{question.amountPaid || question.pricePaid} paid
              </div>
              <p style={{ margin: 0, fontSize: '0.95rem', color: '#e2e8f0', lineHeight: '1.4', fontStyle: 'italic', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                "{question.questionText}"
              </p>
            </div>

            {/* Info Banner */}
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '16px', color: '#f59e0b', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Rejecting auto-issues a full refund to the buyer. No strike on your account for a valid rejection.
            </div>

            {/* Reasons List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: '8px 0 0 0', color: '#ffffff' }}>
                Why are you rejecting?
              </h3>
              {[
                { id: 'expertise', title: 'Outside my expertise', subtitle: 'Cannot answer accurately' },
                { id: 'vague', title: 'Question is too vague', subtitle: 'Not enough detail to help' },
                { id: 'inappropriate', title: 'Inappropriate question', subtitle: 'Violates my content guidelines' }
              ].map((reason) => {
                const isActive = rejectReason === reason.id;
                return (
                  <div 
                    key={reason.id}
                    onClick={() => setRejectReason(reason.id)}
                    style={{
                      background: '#1A1A1A',
                      border: isActive ? '1px solid #f59e0b' : '1px solid #2A2A2A',
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {/* Custom Radio */}
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: isActive ? 'none' : '2px solid #334155',
                      background: isActive ? '#f59e0b' : 'transparent',
                      flexShrink: 0
                    }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '1rem', fontWeight: isActive ? '700' : '500', color: '#ffffff' }}>{reason.title}</span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{reason.subtitle}</span>
                    </div>
                  </div>
                );
              })}
            </div>



            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
              <button
                onClick={handleConfirmReject}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#EF4444',
                  borderRadius: '14px',
                  padding: '16px',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center',
                  width: '100%'
                }}
              >
                Confirm rejection
              </button>
              <button
                onClick={() => setView('reply')}
                style={{
                  background: '#1A1A1A',
                  border: 'none',
                  color: '#ffffff',
                  borderRadius: '14px',
                  padding: '16px',
                  fontWeight: '600',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                  textAlign: 'center',
                  width: '100%'
                }}
                onMouseEnter={(e) => e.target.style.background = '#2A2A2A'}
                onMouseLeave={(e) => e.target.style.background = '#1A1A1A'}
              >
                Cancel — go back to reply
              </button>
            </div>
          </>
        )}

        {/* ========================================= */}
        {/* VIEW: FLAG ABUSE SELECTION                */}
        {/* ========================================= */}
        {view === 'flag' && (
          <>
            {/* Header Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'center', position: 'relative' }}>
              <button
                onClick={() => setView('reply')}
                style={{
                  position: 'absolute',
                  left: 0,
                  background: '#21212B',
                  border: 'none',
                  color: '#94a3b8',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: '600',
                  paddingBottom: '2px'
                }}
              >
                &lt;
              </button>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0, color: '#ffffff' }}>
                Flag abuse
              </h2>
            </div>

            {/* Question Details Card (Compact) */}
            <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.5px' }}>
                {question.buyerName || question.followerName || 'Anonymous'} · Rs.{question.amountPaid || question.pricePaid} paid
              </div>
              <p style={{ margin: 0, fontSize: '0.95rem', color: '#e2e8f0', lineHeight: '1.4', fontStyle: 'italic', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                "{question.questionText}"
              </p>
            </div>

            {/* Info Banner */}
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '16px', color: '#EF4444', fontSize: '0.9rem', lineHeight: '1.5' }}>
               Flagging this question will send it for review by the Skriibe team and 
appropriate action may be taken. You'll be notified once the review is 
complete.
            </div>

            {/* Reasons List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: '8px 0 0 0', color: '#ffffff' }}>
                Why are you flagging this?
              </h3>
              
              {[
                { id: 'nudity', title: 'Nudity / Sexual Content', subtitle: 'Contains nudity or sexual content' },
                { id: 'abusive', title: 'Abusive Language', subtitle: 'Contains insults, threats, hate speech, or harassment.' }
              ].map((reason) => {
                const isActive = flagReason === reason.id;
                return (
                  <div 
                    key={reason.id}
                    onClick={() => setFlagReason(reason.id)}
                    style={{
                      background: '#1A1A1A',
                      border: isActive ? '1px solid #f59e0b' : '1px solid #2A2A2A',
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {/* Custom Radio */}
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: isActive ? 'none' : '2px solid #334155',
                      background: isActive ? '#f59e0b' : 'transparent',
                      flexShrink: 0
                    }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '1rem', fontWeight: isActive ? '700' : '500', color: '#ffffff' }}>{reason.title}</span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{reason.subtitle}</span>
                    </div>
                  </div>
                );
              })}
            </div>



            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
              <button
                onClick={handleConfirmFlag}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#EF4444',
                  borderRadius: '14px',
                  padding: '16px',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center',
                  width: '100%'
                }}
              >
                Raise Flag
              </button>
              <button
                onClick={() => setView('reply')}
                style={{
                  background: '#1A1A1A',
                  border: 'none',
                  color: '#ffffff',
                  borderRadius: '14px',
                  padding: '16px',
                  fontWeight: '600',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                  textAlign: 'center',
                  width: '100%'
                }}
                onMouseEnter={(e) => e.target.style.background = '#2A2A2A'}
                onMouseLeave={(e) => e.target.style.background = '#1A1A1A'}
              >
                Cancel & Return to Question
              </button>
            </div>
          </>
        )}

        {/* ========================================= */}
        {/* VIEW: SUCCESS (Reply Sent)                */}
        {/* ========================================= */}
        {view === 'success_reply' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '40px 0', gap: '24px', textAlign: 'center' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(56, 189, 248, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px'
            }}>
              ✅
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0, color: '#ffffff' }}>
                Reply Sent!
              </h2>
              <p style={{ margin: 0, fontSize: '0.95rem', color: '#94a3b8', lineHeight: '1.5' }}>
                Your response has been sent to {question.buyerName || question.followerName || 'the buyer'}.
              </p>
            </div>

            <button
              onClick={() => navigate('/creator/dashboard')}
              style={{
                background: '#1A1A1A',
                border: '1px solid #2A2A2A',
                color: '#ffffff',
                borderRadius: '14px',
                padding: '16px 32px',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: 'pointer',
                marginTop: '16px',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => e.target.style.background = '#2A2A2A'}
              onMouseLeave={(e) => e.target.style.background = '#1A1A1A'}
            >
              Return to Dashboard
            </button>
          </div>
        )}

        {/* ========================================= */}
        {/* VIEW: SUCCESS (Flagged)                   */}
        {/* ========================================= */}
        {view === 'success_flag' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '40px 0', gap: '24px', textAlign: 'center' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px'
            }}>
              🚩
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0, color: '#ffffff' }}>
                Question Flagged
              </h2>
              <p style={{ margin: 0, fontSize: '0.95rem', color: '#94a3b8', lineHeight: '1.5' }}>
                You have flagged this question.
              </p>
            </div>

            <button
              onClick={() => navigate('/creator/dashboard')}
              style={{
                background: '#1A1A1A',
                border: '1px solid #2A2A2A',
                color: '#ffffff',
                borderRadius: '14px',
                padding: '16px 32px',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: 'pointer',
                marginTop: '16px',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => e.target.style.background = '#2A2A2A'}
              onMouseLeave={(e) => e.target.style.background = '#1A1A1A'}
            >
              Return to Dashboard
            </button>
          </div>
        )}

        {/* ========================================= */}
        {/* VIEW: SUCCESS (Rejected)                  */}
        {/* ========================================= */}
        {view === 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '40px 0', gap: '24px', textAlign: 'center' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px'
            }}>
              ↩️
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0, color: '#ffffff' }}>
                Question Rejected
              </h2>
              <p style={{ margin: 0, fontSize: '0.95rem', color: '#94a3b8', lineHeight: '1.5' }}>
                You have rejected the question.
              </p>
            </div>

            <button
              onClick={() => navigate('/creator/dashboard')}
              style={{
                background: '#1A1A1A',
                border: '1px solid #2A2A2A',
                color: '#ffffff',
                borderRadius: '14px',
                padding: '16px 32px',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: 'pointer',
                marginTop: '16px',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => e.target.style.background = '#2A2A2A'}
              onMouseLeave={(e) => e.target.style.background = '#1A1A1A'}
            >
              Return to Dashboard
            </button>
          </div>
        )}

        {/* ========================================= */}
        {/* VIEW: READONLY FLAGGED/REJECTED           */}
        {/* ========================================= */}
        {view === 'readonly_flagged' && (
          <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Context/Original Question */}
            <div style={{ background: '#1A1A1A', borderRadius: '16px', padding: '16px', border: '1px solid #2A2A2A' }}>
              <div style={{ color: '#FBBF24', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px', letterSpacing: '0.5px' }}>
                {question.status?.toLowerCase() === 'rejected' ? 'REJECTED QUESTION' : 'FLAGGED QUESTION'}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ fontWeight: '700', color: '#fff', fontSize: '1rem' }}>
                  {question.buyerName || question.followerName || 'Anonymous'}
                </div>
              </div>
              <div style={{ color: '#E2E8F0', fontSize: '0.95rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                {question.questionText}
              </div>
            </div>

            {/* Answer (if any) */}
            {question.answerText && (
              <div style={{ background: 'rgba(34, 197, 94, 0.05)', borderRadius: '16px', padding: '16px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                <div style={{ color: '#22C55E', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px', letterSpacing: '0.5px' }}>YOUR ANSWER</div>
                <div style={{ color: '#E2E8F0', fontSize: '0.95rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                  {question.answerText}
                </div>
              </div>
            )}

            {/* Reason */}
            <div style={{ background: 'rgba(239, 68, 68, 0.05)', borderRadius: '16px', padding: '16px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div style={{ color: '#EF4444', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px', letterSpacing: '0.5px' }}>REASON</div>
              <div style={{ color: '#E2E8F0', fontSize: '0.95rem', lineHeight: '1.5' }}>
                {question.flagReason || question.rejectReason || 'No reason provided'}
              </div>
            </div>

            <button
              onClick={() => navigate(-1)}
              style={{
                background: '#2A2A35',
                border: 'none',
                color: '#ffffff',
                borderRadius: '14px',
                padding: '16px',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: 'pointer',
                marginTop: '16px',
                width: '100%'
              }}
            >
              Go Back
            </button>
          </div>
        )}

      </div>

      {/* BOTTOM NAV BAR */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        margin: '0 auto',
        width: '100%',
        maxWidth: '390px',
        background: '#0E0E0E',
        borderTop: '1px solid #1A1A1A',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '12px 0 20px',
        zIndex: 100
      }}>
        {navItems.map((item) => {
          const isActive = location.pathname.includes(item.route) || (item.label === 'INBOX'); // default highlight inbox since we're replying
          return (
            <div
              key={item.route}
              onClick={() => navigate(item.route)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                color: isActive ? '#29C5F6' : '#64748b',
                fontSize: '0.6rem',
                letterSpacing: '1px',
                fontWeight: 'bold',
                gap: '6px'
              }}
            >
              <span style={{ 
                fontSize: '20px',
                filter: isActive ? cyanFilter : grayFilter
              }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CreatorReplyScreen;
