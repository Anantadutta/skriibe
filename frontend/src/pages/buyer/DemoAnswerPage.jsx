import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const DemoAnswerPage = () => {
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

  const { handle } = useParams();
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [selectedFlagOption, setSelectedFlagOption] = useState('');
  const [flagReason, setFlagReason] = useState('');

  const submitFlag = () => {
    const finalReason = selectedFlagOption === 'Something else' 
      ? `Something else: ${flagReason}` 
      : (selectedFlagOption || flagReason);

    setShowFlagModal(false);
    setShowToast(true);
    setTimeout(() => {
      window.location.href = `/${handle}/flag-submitted`;
    }, 1500);
  };

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
                <div style={{ color: '#475569', fontSize: '0.8rem' }}>Valid for 24 hours · Ask now</div>
              </div>
            </div>
            <button onClick={() => window.location.href = `/creator/${handle}?isFollowUp=true`} style={{
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
            onClick={() => setShowFlagModal(true)}
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

        {/* FLAG CONFIRMATION MODAL */}
        {showFlagModal && (
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
                  onClick={() => { setShowFlagModal(false); setSelectedFlagOption(''); setFlagReason(''); }}
                  style={{ flex: 1, background: 'transparent', border: '1px solid #334155', color: '#cbd5e1', padding: '12px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={submitFlag}
                  disabled={!selectedFlagOption || (selectedFlagOption === 'Something else' && !flagReason.trim())}
                  style={{ 
                    flex: 1, 
                    background: (!selectedFlagOption || (selectedFlagOption === 'Something else' && !flagReason.trim())) ? '#3f3f46' : '#ef4444', 
                    border: 'none', 
                    color: (!selectedFlagOption || (selectedFlagOption === 'Something else' && !flagReason.trim())) ? '#a1a1aa' : '#fff', 
                    padding: '12px', 
                    borderRadius: '12px', 
                    fontWeight: 'bold', 
                    cursor: (!selectedFlagOption || (selectedFlagOption === 'Something else' && !flagReason.trim())) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Yes, Flag it
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
