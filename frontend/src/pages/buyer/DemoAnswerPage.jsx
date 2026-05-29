import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const DemoAnswerPage = () => {
  const { handle } = useParams();
  const [showFlagSheet, setShowFlagSheet] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');

  const submitFlag = () => {
    if (!selectedReason) return;
    window.location.href = `/${handle}/flag-submitted`;
  };

  const reasons = [
    { title: "Reply was too short or unhelpful", sub: "Generic or under 100 characters" },
    { title: "Reply did not answer my question", sub: "Off-topic or missed the point" },
    { title: "Reply was inappropriate", sub: "Offensive or unprofessional" },
    { title: "Factually incorrect information", sub: "Wrong advice that could cause harm" }
  ];

  return (
    <div className="no-scrollbar" style={{
      width: '100%',
      minHeight: '100vh',
      background: '#06060A',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: '600px', position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* TOP BAR */}
        <div style={{ padding: '24px 20px', display: 'flex', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800' }}>Answer ready</h1>
        </div>

        <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
          
          {/* CREATOR PROFILE ROW */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: '900', fontSize: '20px', color: '#ffffff'
              }}>
                R
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: '800' }}>Rahul Finance</div>
                <div style={{ fontSize: '0.85rem', color: '#475569' }}>Replied 2 hours ago</div>
              </div>
            </div>
            <div style={{ 
              background: 'rgba(34, 197, 94, 0.1)', 
              color: '#22c55e', 
              padding: '6px 12px', 
              borderRadius: '20px', 
              fontSize: '0.75rem', 
              fontWeight: '800',
              letterSpacing: '0.5px'
            }}>
              Replied
            </div>
          </div>

          {/* YOUR QUESTION */}
          <div style={{ 
            background: '#15151A', 
            border: '1px solid rgba(255, 255, 255, 0.06)', 
            borderRadius: '16px', 
            padding: '24px'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
              Your Question
            </div>
            <div style={{ fontSize: '1.05rem', color: '#94a3b8', fontStyle: 'italic', lineHeight: '1.5' }}>
              "I earn Rs.30K/month. How do I build an emergency fund and start SIP?"
            </div>
          </div>

          {/* ANSWER */}
          <div style={{ 
            background: 'rgba(41, 197, 246, 0.05)', 
            border: '1px solid rgba(41, 197, 246, 0.2)', 
            borderRadius: '16px', 
            padding: '24px'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#3BA8D8', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>
              Rahul's Answer
            </div>
            <div style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#f8fafc' }}>
              Start with the 50-30-20 rule: 50% needs, 30% wants, 20% savings. Build a 3-month emergency fund in a liquid mutual fund first — target Rs.60,000-75,000. Then start SIP of Rs.2,000 in Nifty 50 index fund via Zerodha Coin. Increase by 10% every year with salary hike.
            </div>
          </div>

          {/* FOLLOW UP BANNER */}
          <div style={{ 
            background: '#062010', // Dark green tint
            border: '1px solid #14532D', 
            borderRadius: '16px', 
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '1.2rem' }}>💬</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ color: '#22c55e', fontWeight: '800', fontSize: '0.95rem' }}>1 free follow-up available</div>
                <div style={{ color: '#475569', fontSize: '0.8rem' }}>Valid for 7 days · Ask now</div>
              </div>
            </div>
            <button style={{
              background: '#22c55e',
              color: '#000000',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 20px',
              fontWeight: '800',
              cursor: 'pointer'
            }}>
              Ask →
            </button>
          </div>

          {/* FLAG BUTTON */}
          <button 
            onClick={() => setShowFlagSheet(true)}
            style={{
              width: '100%',
              background: 'transparent',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              borderRadius: '16px',
              padding: '18px',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: 'pointer',
              marginTop: '8px'
            }}
          >
            Flag as incomplete (48hr window)
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Link to={`/${handle}`} style={{ color: '#475569', textDecoration: 'none', fontSize: '0.9rem' }}>
              Back to creator page
            </Link>
          </div>
        </div>

        {/* FULL SCREEN FLAG UI */}
        {showFlagSheet && (
          <div className="no-scrollbar" style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: '#06060A', zIndex: 50,
            display: 'flex', flexDirection: 'column',
            overflowY: 'auto'
          }}>
            {/* Header */}
            <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <button 
                onClick={() => setShowFlagSheet(false)}
                style={{
                  background: '#1A1A24', border: 'none', color: '#94a3b8',
                  width: '36px', height: '36px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                {'<'}
              </button>
              <h1 style={{ flex: 1, textAlign: 'center', margin: 0, fontSize: '1.2rem', fontWeight: '800', marginRight: '36px' }}>
                Flag answer
              </h1>
            </div>

            <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Warning box */}
              <div style={{
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '16px',
                padding: '20px',
                color: '#f8fafc',
                fontSize: '0.95rem',
                lineHeight: '1.5'
              }}>
                Flagging pauses the creator payout and opens a dispute. Admin reviews within 48 hours and you will be notified.
              </div>

              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>Reason for flagging</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {reasons.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedReason(r.title)}
                    style={{
                      background: selectedReason === r.title ? 'rgba(239, 68, 68, 0.05)' : '#15151A',
                      border: selectedReason === r.title ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '16px',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      border: selectedReason === r.title ? 'none' : '2px solid rgba(255,255,255,0.2)',
                      background: selectedReason === r.title ? '#ef4444' : 'transparent',
                      flexShrink: 0
                    }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ color: '#ffffff', fontWeight: '800', fontSize: '1rem' }}>{r.title}</div>
                      <div style={{ color: selectedReason === r.title ? 'rgba(255,255,255,0.3)' : '#64748b', fontSize: '0.85rem' }}>{r.sub}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Textarea */}
              <div style={{
                background: '#15151A',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Additional note (Optional)
                </div>
                <textarea 
                  placeholder="Explain what was wrong..."
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
              <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#64748b', marginTop: '-12px', fontFamily: 'monospace' }}>
                0 / 150
              </div>

              {/* Refund Info */}
              <div style={{
                background: '#062010',
                border: '1px solid #14532D',
                borderRadius: '16px',
                padding: '20px',
                marginTop: '8px'
              }}>
                <div style={{ color: '#22c55e', fontWeight: '800', fontSize: '1rem', marginBottom: '4px' }}>
                  If approved: full Rs.99 refund
                </div>
                <div style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.4' }}>
                  Returned to your original payment method within 5-7 business days.
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px', paddingBottom: '32px' }}>
                <button
                  onClick={submitFlag}
                  disabled={!selectedReason}
                  style={{
                    width: '100%',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '16px',
                    padding: '18px',
                    fontSize: '1.1rem',
                    fontWeight: '800',
                    cursor: selectedReason ? 'pointer' : 'not-allowed',
                    opacity: selectedReason ? 1 : 0.5
                  }}
                >
                  Submit flag
                </button>
                <button
                  onClick={() => setShowFlagSheet(false)}
                  style={{
                    width: '100%',
                    background: '#15151A',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '16px',
                    padding: '18px',
                    fontSize: '1.1rem',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>

            </div>
          </div>
        )}

        {/* TOAST NOTIFICATION */}
        {showToast && (
          <div style={{
            position: 'fixed',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#22c55e',
            color: '#000000',
            padding: '12px 24px',
            borderRadius: '12px',
            fontWeight: '800',
            zIndex: 100,
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            animation: 'fadeInOut 3s forwards'
          }}>
            Flag submitted successfully!
          </div>
        )}
        <style>{`
          @keyframes fadeInOut {
            0% { opacity: 0; bottom: 20px; }
            10% { opacity: 1; bottom: 40px; }
            90% { opacity: 1; bottom: 40px; }
            100% { opacity: 0; bottom: 60px; }
          }
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </div>
    </div>
  );
};

export default DemoAnswerPage;
