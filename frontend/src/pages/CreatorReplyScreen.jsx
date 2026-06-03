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

  useEffect(() => {
    if (!question) {
      navigate('/creator/dashboard');
    }
  }, [question, navigate]);

  const [replyText, setReplyText] = useState('');
  const [rejectHover, setRejectHover] = useState(false);
  const [abuseHover, setAbuseHover] = useState(false);
  
  // View states: 'reply', 'reject', 'success'
  const [view, setView] = useState('reply');
  const [rejectReason, setRejectReason] = useState('expertise');

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

  const charCount = replyText.length;
  const isMinMet = charCount >= 100;
  const charsRemaining = 100 - charCount;

  const handleSend = async () => {
    if (!isMinMet) return;
    try {
      await api.post(`/creator/questions/${question._id || question.id}/reply`, { replyText });
      navigate('/creator/dashboard/inbox');
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
      await api.post(`/creator/questions/${question._id || question.id}/flag`);
      setView('success_flag');
    } catch (err) {
      console.error('Failed to flag', err);
      alert('Failed to flag. Please try again.');
    }
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
                  background: '#1A1A1A',
                  border: '1px solid #2A2A2A',
                  color: '#ffffff',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '22px',
                  fontWeight: '300',
                  transition: 'background-color 0.2s',
                  paddingBottom: '2px'
                }}
                onMouseEnter={(e) => e.target.style.background = '#2A2A2A'}
                onMouseLeave={(e) => e.target.style.background = '#1A1A1A'}
              >
                ‹
              </button>
              
              <h2 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0, color: '#ffffff', letterSpacing: '-0.02em' }}>
                Reply to {(question.buyerName || question.followerName || 'Anonymous').split(' ')[0]}
              </h2>
            </div>

            {/* SLA Warning Banner */}
            <div style={{ background: '#2C1414', border: '1px solid #3D1B1B', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '10px', color: '#EF4444' }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid #EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '900', flexShrink: 0 }}>!</div>
              <span style={{ fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '0.01em' }}>SLA: {question.slaHoursLeft || 48} hours remaining</span>
            </div>

            {/* Question Details Card */}
            <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
                {question.buyerName || question.followerName || 'Anonymous'} · ₹{question.amountPaid || question.pricePaid} PAID
              </div>
              <p style={{ margin: 0, fontSize: '1.05rem', color: '#f8fafc', lineHeight: '1.5', letterSpacing: '-0.01em', wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                "{question.questionText}"
              </p>
            </div>

            {/* Reply Editor */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Your reply (minimum 100 characters) *</label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Start typing your detailed response here..."
                style={{
                  background: '#1A1A1A',
                  border: '1px solid #2A2A2A',
                  borderRadius: '16px',
                  padding: '20px',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  lineHeight: '1.5',
                  minHeight: '180px',
                  resize: 'none',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  fontStyle: replyText ? 'normal' : 'italic',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.border = '1px solid #38BDF8'}
                onBlur={(e) => e.target.style.border = '1px solid #2A2A2A'}
              />

              {/* Character Count Validator */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.8rem', fontWeight: 500, color: isMinMet ? '#22C55E' : '#64748b' }}>
                {charCount} characters — {isMinMet ? 'minimum met ✓' : `${charsRemaining} left to minimum`}
              </div>
            </div>

            {/* Send Reply Button */}
            <button
              disabled={!isMinMet}
              onClick={handleSend}
              style={{
                background: isMinMet ? '#38BDF8' : '#2A2A2A',
                color: isMinMet ? '#0F172A' : '#64748b',
                border: 'none',
                borderRadius: '14px',
                padding: '16px',
                fontWeight: 'bold',
                fontSize: '1rem',
                cursor: isMinMet ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                textAlign: 'center',
                width: '100%'
              }}
            >
              Send reply →
            </button>

            {/* Action Button Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
              <button
                onMouseEnter={() => setRejectHover(true)}
                onMouseLeave={() => setRejectHover(false)}
                onClick={handleRejectClick}
                style={{
                  background: '#1A1A1A',
                  border: rejectHover ? '1px solid #64748b' : '1px solid #2A2A2A',
                  color: '#ffffff',
                  borderRadius: '14px',
                  padding: '16px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center'
                }}
              >
                Reject
              </button>
              <button
                onMouseEnter={() => setAbuseHover(true)}
                onMouseLeave={() => setAbuseHover(false)}
                onClick={handleFlagClick}
                style={{
                  background: '#1A1A1A',
                  border: abuseHover ? '1px solid #EF4444' : '1px solid #2C1414',
                  color: '#EF4444',
                  borderRadius: '14px',
                  padding: '16px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center'
                }}
              >
                Flag abuse
              </button>
            </div>
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
                { id: 'inappropriate', title: 'Inappropriate question', subtitle: 'Violates my content guidelines' },
                { id: 'break', title: 'I am on a break', subtitle: 'Availability was not updated' }
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

            {/* Notice */}
            <div style={{ background: '#1A1A1A', borderRadius: '12px', padding: '16px' }}>
              <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Buyer receives: </span>
              <span style={{ color: '#e2e8f0', fontSize: '0.9rem', fontStyle: 'italic' }}>
                "The creator could not answer your question. A full refund of Rs.{question.amountPaid || question.pricePaid} has been issued."
              </span>
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
                Confirm rejection — issue refund
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
              Flagging this question will report the user, issue a full refund to the buyer, and remove the question from your queue.
            </div>

            {/* Reasons List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: '8px 0 0 0', color: '#ffffff' }}>
                Why are you flagging this?
              </h3>
              
              {[
                { id: 'expertise', title: 'Outside my expertise', subtitle: 'Cannot answer accurately' }
              ].map((reason) => {
                const isActive = true; // Only one option, so it's always active
                return (
                  <div 
                    key={reason.id}
                    style={{
                      background: '#1A1A1A',
                      border: isActive ? '1px solid #f59e0b' : '1px solid #2A2A2A',
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      cursor: 'default',
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

            {/* Notice */}
            <div style={{ background: '#1A1A1A', borderRadius: '12px', padding: '16px' }}>
              <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Buyer receives: </span>
              <span style={{ color: '#e2e8f0', fontSize: '0.9rem', fontStyle: 'italic' }}>
                "The creator could not answer your question. A full refund of Rs.{question.amountPaid || question.pricePaid} has been issued."
              </span>
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
                Confirm flag abuse — issue refund
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
                You have flagged this question. A full refund of ₹{question.amountPaid || question.pricePaid} has been automatically processed to the buyer.
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
                You have rejected the question. A full refund of ₹{question.amountPaid || question.pricePaid} has been automatically processed to the buyer.
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

      </div>

      {/* BOTTOM NAV BAR */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '390px',
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
