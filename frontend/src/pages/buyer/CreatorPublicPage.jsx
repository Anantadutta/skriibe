import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCreatorProfile, sendBuyerOTP, verifyBuyerOTP, submitQuestion } from '../../api/buyerApi';
import { mockQuestions } from '../../mock/questions';
import { io } from 'socket.io-client';

const CreatorPublicPage = () => {
  const { handle } = useParams();
  const navigate = useNavigate();
  
  // State
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [step, setStep] = useState(0); // 0=profile, 1=ask form, 2=success
  
  // Form State
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [paymentTab, setPaymentTab] = useState('UPI');
  const [buyerUpiId, setBuyerUpiId] = useState('');
  const [submittedQuestionId, setSubmittedQuestionId] = useState(null);
  
  // Status
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getCreatorProfile(handle);
        if (data.success && data.creator) {
          setCreator(data.creator);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();

    const socket = io('http://localhost:5000');
    socket.on('creator-status-changed', ({ creatorId, isLive }) => {
      setCreator(prev => {
        if (!prev) return prev;
        // Only update if it's the current creator
        if (prev._id === creatorId || prev.id === creatorId) {
          return { ...prev, isLive };
        }
        return prev;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [handle]);

  const handleSubmitQuestion = async () => {
    setError('');
    setSubmitting(true);
    try {
      const res = await submitQuestion({
        creatorHandle: handle,
        questionText,
        buyerName,
        buyerPhone,
        buyerEmail,
        isAnonymous: false
      });
      if (res.success && res.questionId) {
        setSubmittedQuestionId(res.questionId);
        localStorage.setItem('skriibe_buyer_phone', buyerPhone);
      }
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit question');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayAndSubmit = async () => {
    // Navigate to custom checkout UI (Step 3) instead of Razorpay SDK
    setStep(3);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--ink5)', borderTopColor: 'var(--blue)', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (notFound || !creator) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--ink)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 24px' }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 48, color: 'var(--ink5)' }}>404</div>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--g3)', fontSize: 14, marginTop: 12 }}>
          This creator doesn't exist or hasn't set up their page yet.
        </p>
        <Link to="/" style={{ color: 'var(--blue)', fontFamily: 'var(--font-mono)', fontSize: 12, marginTop: 16, display: 'block', textDecoration: 'none' }}>
          ← Back to skriibe
        </Link>
      </div>
    );
  }

  // --- RENDERING STEPS ---

  // Cyan filter: to make emojis turn cyan #29C5F6
  const cyanFilter = 'invert(69%) sepia(87%) saturate(2714%) hue-rotate(164deg) brightness(99%) contrast(98%)';
  // Gray filter
  const grayFilter = 'invert(31%) sepia(13%) saturate(760%) hue-rotate(181deg) brightness(96%) contrast(85%)';

  const renderStep0 = () => (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: '#0E0E0E',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxSizing: 'border-box',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        ::-webkit-scrollbar { display: none; }
        * { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
      
      <div style={{
        width: '100%',
        maxWidth: '390px',
        padding: '24px 20px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        
        {/* TOP BAR: Logo only */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '8px' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: '600', letterSpacing: '-0.03em', color: '#333' }}>
            skr<span style={{ color: '#29C5F6' }}>ii</span>be
          </div>
        </div>

        {/* HEADER SECTION: Avatar + Info */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {/* Large Avatar */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: '#1A1A1A', border: '2px solid #29C5F6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '900', fontSize: '32px', color: '#ffffff'
            }}>
              {creator.name ? creator.name[0].toUpperCase() : 'R'}
            </div>
            {/* Live Dot / Badge */}
            {creator.isLive && (
              <div style={{
                position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)',
                background: '#29C5F6', color: '#0E0E0E', fontSize: '0.65rem', fontWeight: '900',
                padding: '2px 8px', borderRadius: '12px', border: '2px solid #0E0E0E',
                letterSpacing: '1px'
              }}>
                LIVE
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#ffffff' }}>
                {creator.name || 'Rahul Finance'}
              </span>
              <span style={{ color: '#29C5F6', fontSize: '1.1rem' }}>✓</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
              <span style={{ color: '#64748b' }}>@{creator.handle}</span>
              <span style={{ color: '#475569' }}>•</span>
              <span style={{ color: '#94a3b8', fontWeight: '500' }}><span style={{ color: '#29C5F6', fontWeight: '700' }}>{creator.followers || '12K'}</span> Followers</span>
            </div>
            {/* Instagram linked badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.2)',
              borderRadius: '6px', padding: '2px 8px', width: 'fit-content', marginTop: '4px'
            }}>
              <span style={{ width: '8px', height: '8px', background: '#ec4899', borderRadius: '2px' }} />
              <span style={{ color: '#ec4899', fontSize: '0.75rem', fontWeight: '700' }}>Instagram linked</span>
            </div>
            {/* Tags row */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(41, 197, 246, 0.1)', color: '#29C5F6', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '700' }}>
                Finance
              </span>
              <span style={{ background: 'rgba(41, 197, 246, 0.1)', color: '#29C5F6', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '700' }}>
                SIP
              </span>
              {creator.isLive && (
                <span style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22C55E', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '4px', height: '4px', background: '#22C55E', borderRadius: '50%' }} /> LIVE
                </span>
              )}
            </div>
          </div>
        </div>

        {/* STATS ROW (3 boxes) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          <div style={{ background: '#1A1A1A', borderRadius: '14px', padding: '16px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#29C5F6' }}>{creator.replyRate || '94'}%</div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '4px', fontWeight: '700', letterSpacing: '1px' }}>REPLY</div>
          </div>
          <div style={{ background: '#1A1A1A', borderRadius: '14px', padding: '16px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#29C5F6' }}>{creator.avgReplyTime || '3.2'}h</div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '4px', fontWeight: '700', letterSpacing: '1px' }}>AVG</div>
          </div>
          <div style={{ background: '#1A1A1A', borderRadius: '14px', padding: '16px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#29C5F6' }}>{creator.totalAnswered || '247'}</div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '4px', fontWeight: '700', letterSpacing: '1px' }}>ANSWERED</div>
          </div>
        </div>

        {/* BIO */}
        <div>
          <p style={{ margin: 0, fontSize: '0.95rem', color: '#94a3b8', lineHeight: '1.5' }}>
            {creator.bio || 'Helping India save smarter. 5 yrs at HDFC. SIP, mutual funds, tax planning.'}
          </p>
        </div>
        
        {/* DIVIDER */}
        <div style={{ width: '100%', height: '1px', background: '#1A1A1A' }} />

        {/* ASK ME ANYTHING CARD */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(41, 197, 246, 0.15)',
          borderRadius: '24px',
          padding: '32px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase' }}>
            Ask me anything
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', color: '#ffffff' }}>
            <span style={{ fontSize: '2rem', fontWeight: '600' }}>₹</span>
            <span style={{ fontSize: '4.5rem', fontWeight: '900', letterSpacing: '-0.03em', fontStyle: 'italic', lineHeight: '1' }}>
              {creator.pricePerQuestion || '99'}
            </span>
          </div>

          <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
            Reply guaranteed within {creator.responseTime || '24'} hours
          </div>

          <button
            onClick={() => setStep(1)}
            style={{
              background: '#29C5F6', color: '#0E0E0E', width: '100%', border: 'none',
              borderRadius: '16px', padding: '18px', fontSize: '1.1rem', fontWeight: '800',
              cursor: 'pointer', marginTop: '8px', transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Ask Now →
          </button>
        </div>

        {/* FOOTER BADGES */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#475569', fontSize: '0.75rem' }}>
            <span style={{ color: '#22C55E' }}>✓</span> Secured by Razorpay
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#475569', fontSize: '0.75rem' }}>
            <span style={{ color: '#22C55E' }}>✓</span> 100% refund if no reply
          </div>
        </div>

      </div>
    </div>
  );

  const renderStep1 = () => (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: '#0E0E0E',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxSizing: 'border-box',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        ::-webkit-scrollbar { display: none; }
        * { -ms-overflow-style: none; scrollbar-width: none; }
        .unified-input {
          width: 100%;
          background: transparent;
          border: none;
          color: #ffffff;
          font-size: 1.1rem;
          font-weight: 600;
          outline: none;
          padding: 0;
          margin-top: 4px;
        }
        .unified-input::placeholder {
          color: #475569;
        }
      `}} />
      
      <div style={{
        width: '100%',
        maxWidth: '390px',
        padding: '24px 20px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        
        {/* HEADER: Back Button */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button 
            onClick={() => setStep(0)} 
            style={{ 
              background: '#1A1A1A', border: 'none', color: '#94a3b8', 
              width: '36px', height: '36px', borderRadius: '50%', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              cursor: 'pointer', fontSize: '1.2rem', padding: 0 
            }}
          >
            {'<'}
          </button>
          <div style={{ flex: 1, textAlign: 'center', fontSize: '1.2rem', fontWeight: '800', letterSpacing: '-0.02em', marginLeft: '-36px' }}>
            Ask @{creator.handle}
          </div>
        </div>

        {/* READ BEFORE CONTINUING CARD */}
        <div style={{
          background: 'rgba(249, 115, 22, 0.03)',
          border: '1px solid rgba(249, 115, 22, 0.2)',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ color: '#f97316', fontSize: '0.85rem', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>
            READ BEFORE CONTINUING
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.5' }}>
            <li style={{ display: 'flex', gap: '8px' }}><span style={{ color: '#f97316' }}>·</span> Answers are personal opinions — not professional advice</li>
            <li style={{ display: 'flex', gap: '8px' }}><span style={{ color: '#f97316' }}>·</span> Not a substitute for medical, legal or financial counsel</li>
            <li style={{ display: 'flex', gap: '8px' }}><span style={{ color: '#f97316' }}>·</span> One question per payment — be specific</li>
            <li style={{ display: 'flex', gap: '8px' }}><span style={{ color: '#f97316' }}>·</span> 100% refund if no reply in {creator.responseTime || '24'} hours</li>
            <li style={{ display: 'flex', gap: '8px' }}><span style={{ color: '#f97316' }}>·</span> Do not share others' personal data</li>
          </ul>
          
          <label style={{
            display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px',
            background: '#131313', padding: '12px 16px', borderRadius: '12px', cursor: 'pointer', border: '1px solid #1A1A1A'
          }}>
            <input 
              type="checkbox" 
              checked={termsAccepted} 
              onChange={e => setTermsAccepted(e.target.checked)} 
              style={{ width: '20px', height: '20px', accentColor: '#29C5F6', borderRadius: '4px', border: 'none' }} 
            />
            <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#ffffff' }}>I understand and agree</span>
          </label>
        </div>

        {/* FORM FIELDS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '16px', padding: '16px' }}>
            <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase' }}>
              YOUR NAME <span style={{ color: '#ef4444' }}>*</span>
            </div>
            <input 
              className="unified-input" 
              value={buyerName} 
              onChange={e => setBuyerName(e.target.value)} 
              placeholder="Amit Kumar" 
            />
          </div>

          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '16px', padding: '16px' }}>
            <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase' }}>
              EMAIL ADDRESS <span style={{ color: '#ef4444' }}>*</span>
            </div>
            <input 
              type="email"
              className="unified-input" 
              value={buyerEmail} 
              onChange={e => setBuyerEmail(e.target.value)} 
              placeholder="amit@gmail.com" 
            />
          </div>

          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '16px', padding: '16px' }}>
            <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase' }}>
              WHATSAPP NUMBER <span style={{ color: '#ef4444' }}>*</span>
            </div>
            <input 
              type="tel"
              className="unified-input" 
              maxLength={10}
              value={buyerPhone} 
              onChange={e => setBuyerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} 
              placeholder="9876543210" 
              style={{ fontStyle: buyerPhone ? 'normal' : 'italic', color: buyerPhone ? '#ffffff' : '#475569' }}
            />
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '8px' }}>
              It should only be a 10 digit number.
            </div>
          </div>

          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase' }}>
              YOUR QUESTION <span style={{ color: '#ef4444' }}>*</span> <span style={{ color: '#64748b' }}>(MIN 20 CHARS)</span>
            </div>
            <textarea 
              className="unified-input"
              value={questionText} 
              onChange={e => setQuestionText(e.target.value)} 
              placeholder={`What do you want to ask @${creator.handle}?`}
              maxLength={500}
              style={{ minHeight: '80px', resize: 'none', lineHeight: '1.4' }}
            />
          </div>

        </div>

        {/* COUNTER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px', marginTop: '-8px' }}>
          <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '600' }}>
            Min 20 characters
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: questionText.length >= 20 ? '#22C55E' : '#475569' }}>
            {questionText.length} / 500 {questionText.length >= 20 && '✓'}
          </div>
        </div>

        {error && <div style={{ fontSize: '0.85rem', color: '#ef4444', textAlign: 'center', fontWeight: '600' }}>{error}</div>}

        {/* CTA BUTTON */}
        <button 
          onClick={handlePayAndSubmit}
          disabled={!termsAccepted || !buyerName || !buyerEmail || buyerPhone.length !== 10 || questionText.length < 20 || submitting}
          style={{
            width: '100%',
            background: '#29C5F6',
            color: '#0E0E0E',
            border: 'none',
            borderRadius: '16px',
            padding: '18px',
            fontSize: '1.1rem',
            fontWeight: '800',
            cursor: (!termsAccepted || !buyerName || !buyerEmail || buyerPhone.length !== 10 || questionText.length < 20 || submitting) ? 'not-allowed' : 'pointer',
            opacity: (!termsAccepted || !buyerName || !buyerEmail || buyerPhone.length !== 10 || questionText.length < 20 || submitting) ? 0.5 : 1,
            marginTop: '8px'
          }}
        >
          {submitting ? 'Processing...' : `Pay Rs.${creator.pricePerQuestion || '99'} — UPI / Card`}
        </button>

        {/* FOOTER */}
        <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#475569', fontWeight: '600', marginTop: '4px' }}>
          Secured by Razorpay <span style={{ margin: '0 4px' }}>·</span> India's most trusted payment
        </div>

      </div>
    </div>
  );

  const renderStep2 = () => (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: '#0E0E0E',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxSizing: 'border-box',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '390px',
        padding: '32px 20px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px'
      }}>
        
        {/* SUCCESS ICON */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          border: '2px solid #22c55e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '16px'
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>

        {/* HEADING & SUBTITLES */}
        <div style={{ textAlign: 'center', marginTop: '-8px' }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '900', 
            margin: '0 0 12px',
            fontFamily: '"Arial Black", Impact, sans-serif',
            letterSpacing: '-0.02em',
            transform: 'scaleX(1.1)',
            color: '#ffffff'
          }}>
            Question sent!
          </h2>
          <p style={{ margin: '0 0 4px', fontSize: '1rem', color: '#64748b' }}>
            {creator.name || creator.displayName} will reply within {creator.responseTime || '24'} hours.
          </p>
          <p style={{ margin: 0, fontSize: '1rem', color: '#64748b' }}>
            You'll be notified on both channels.
          </p>
        </div>

        {/* DELIVERY CHANNELS CARD */}
        <div style={{ 
          width: '100%',
          background: '#1A1A1A', 
          border: '1px solid #2A2A2A', 
          borderRadius: '16px', 
          padding: '20px',
          marginTop: '8px'
        }}>
          <div style={{ color: '#475569', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>
            DELIVERY CHANNELS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }}></div>
              <span style={{ fontSize: '1rem', color: '#cbd5e1' }}>{buyerEmail || 'amit@gmail.com'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }}></div>
              <span style={{ fontSize: '1rem', color: '#cbd5e1' }}>{buyerPhone || '+91 98765 43210'} (WhatsApp)</span>
            </div>
          </div>
        </div>

        {/* ORDER CARD */}
        <div style={{ 
          width: '100%',
          background: '#1A1A1A', 
          border: '1px solid #2A2A2A', 
          borderRadius: '16px', 
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>
              Order #SKR-20250501
            </div>
            <div style={{ fontSize: '0.85rem', color: '#475569', fontFamily: 'monospace' }}>
              Amount paid: ₹{creator.pricePerQuestion || '99'}
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
            Paid
          </div>
        </div>

        {/* BUTTONS */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
          
          <button 
            onClick={() => {
              if (submittedQuestionId) {
                window.location.href = `/${creator.handle}/question/${submittedQuestionId}`;
              } else {
                alert('Question ID not found in mock');
              }
            }}
            style={{
              width: '100%',
              background: '#29C5F6',
              color: '#0E0E0E',
              border: 'none',
              borderRadius: '16px',
              padding: '18px',
              fontSize: '1.1rem',
              fontWeight: '800',
              cursor: 'pointer'
            }}
          >
            View my question
          </button>
          


          <button 
            onClick={() => {
              window.location.href = `/history`;
            }}
            style={{
              width: '100%',
              background: '#1A1A1A',
              color: '#ffffff',
              border: 'none',
              borderRadius: '16px',
              padding: '18px',
              fontSize: '1.1rem',
              fontWeight: '800',
              cursor: 'pointer'
            }}
          >
            View question history
          </button>
          
          <button 
            onClick={() => {
              setQuestionText('');
              setBuyerUpiId('');
              setStep(1); // Go back to the form
            }}
            style={{
              width: '100%',
              background: 'transparent',
              color: '#94a3b8',
              border: '1px solid #2A2A2A',
              borderRadius: '16px',
              padding: '16px',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Ask another question
          </button>
        </div>

      </div>
    </div>
  );

  const renderStep3 = () => (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: '#0E0E0E',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxSizing: 'border-box',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '390px',
        padding: '24px 20px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        
        {/* HEADER: Back Button */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button 
            onClick={() => setStep(1)} 
            style={{ 
              background: '#1A1A1A', border: 'none', color: '#94a3b8', 
              width: '36px', height: '36px', borderRadius: '50%', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              cursor: 'pointer', fontSize: '1.2rem', padding: 0 
            }}
          >
            {'<'}
          </button>
          <div style={{ flex: 1, textAlign: 'center', fontSize: '1.2rem', fontWeight: '800', letterSpacing: '-0.02em', marginLeft: '-36px' }}>
            Pay ₹{creator.pricePerQuestion || '99'}
          </div>
        </div>

        {/* PAYMENT INFO */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '4px' }}>Paying to</div>
          <div style={{ fontSize: '1.3rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
            @{creator.handle} via skriibe
          </div>
          <div style={{ 
            fontSize: '4.5rem', 
            fontWeight: '900', 
            color: '#29C5F6', 
            fontStyle: 'italic', 
            letterSpacing: '-0.05em',
            marginTop: '8px',
            textShadow: '0 4px 24px rgba(41, 197, 246, 0.2)'
          }}>
            <span style={{ fontSize: '3.5rem', marginRight: '4px' }}>₹</span>{creator.pricePerQuestion || '99'}
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', background: '#1A1A1A', borderRadius: '12px', padding: '4px', border: '1px solid #2A2A2A', marginTop: '16px' }}>
          {['UPI', 'Card', 'Net Banking'].map(tab => (
            <button
              key={tab}
              onClick={() => setPaymentTab(tab)}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                background: paymentTab === tab ? '#2A2A2A' : 'transparent',
                color: paymentTab === tab ? '#ffffff' : '#64748b',
                fontSize: '0.95rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* UPI INPUT */}
        {paymentTab === 'UPI' && (
          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '16px', padding: '16px', marginTop: '8px' }}>
            <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase' }}>
              UPI ID
            </div>
            <input 
              className="unified-input" 
              value={buyerUpiId} 
              onChange={e => setBuyerUpiId(e.target.value)} 
              placeholder="amit@paytm" 
            />
          </div>
        )}
        {/* CARD INPUTS */}
        {paymentTab === 'Card' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
            <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '16px', padding: '16px' }}>
              <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase' }}>
                CARD NUMBER
              </div>
              <input 
                className="unified-input" 
                placeholder="0000 0000 0000 0000" 
                maxLength={19}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '16px', padding: '16px' }}>
                <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase' }}>
                  EXPIRY
                </div>
                <input 
                  className="unified-input" 
                  placeholder="MM/YY" 
                  maxLength={5}
                />
              </div>
              <div style={{ flex: 1, background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '16px', padding: '16px' }}>
                <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase' }}>
                  CVV
                </div>
                <input 
                  type="password"
                  className="unified-input" 
                  placeholder="•••" 
                  maxLength={4}
                />
              </div>
            </div>
            <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '16px', padding: '16px' }}>
              <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase' }}>
                CARDHOLDER NAME
              </div>
              <input 
                className="unified-input" 
                placeholder="e.g. Amit Kumar" 
              />
            </div>
          </div>
        )}

        {/* NET BANKING INPUTS */}
        {paymentTab === 'Net Banking' && (
          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '16px', padding: '16px', marginTop: '8px' }}>
            <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
              SELECT BANK
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank'].map(bank => (
                <div key={bank} style={{ background: '#2A2A2A', borderRadius: '8px', padding: '12px', textAlign: 'center', color: '#ffffff', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
                     onMouseOver={(e) => e.currentTarget.style.background = '#333'}
                     onMouseOut={(e) => e.currentTarget.style.background = '#2A2A2A'}>
                  {bank}
                </div>
              ))}
            </div>
            <select style={{ width: '100%', marginTop: '12px', background: '#2A2A2A', border: 'none', borderRadius: '8px', padding: '12px', color: '#ffffff', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' }}>
              <option value="">Other Banks...</option>
              <option value="kotak">Kotak Mahindra Bank</option>
              <option value="pnb">Punjab National Bank</option>
              <option value="yes">Yes Bank</option>
              <option value="bob">Bank of Baroda</option>
            </select>
          </div>
        )}

        {/* OR SCAN QR CODE */}
        {paymentTab === 'UPI' && (
          <div style={{ textAlign: 'center', marginTop: '8px' }}>
            <div style={{ color: '#475569', fontSize: '0.85rem', fontFamily: 'monospace' }}>
              — or scan QR code —
            </div>
            <button style={{
              background: '#1A1A1A',
              border: '1px solid #2A2A2A',
              borderRadius: '16px',
              width: '80px',
              height: '80px',
              marginTop: '16px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', opacity: 0.5 }}>
                <div style={{ width: '16px', height: '16px', border: '3px solid #94a3b8', borderRadius: '4px' }}></div>
                <div style={{ width: '16px', height: '16px', border: '3px solid #94a3b8', borderRadius: '4px' }}></div>
                <div style={{ width: '16px', height: '16px', border: '3px solid #94a3b8', borderRadius: '4px' }}></div>
                <div style={{ width: '16px', height: '16px', display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
                  <div style={{ width: '6px', height: '6px', background: '#94a3b8' }}></div>
                  <div style={{ width: '6px', height: '6px', background: '#94a3b8' }}></div>
                  <div style={{ width: '6px', height: '6px', background: '#94a3b8' }}></div>
                </div>
              </div>
            </button>
          </div>
        )}
        {/* ERROR DISPLAY */}
        {error && <div style={{ fontSize: '0.85rem', color: '#ef4444', textAlign: 'center', fontWeight: '600', marginTop: '8px' }}>{error}</div>}

        {/* CTA BUTTON */}
        <button 
          onClick={async () => {
            await handleSubmitQuestion();
          }}
          disabled={submitting}
          style={{
            width: '100%',
            background: '#29C5F6',
            color: '#0E0E0E',
            border: 'none',
            borderRadius: '16px',
            padding: '18px',
            fontSize: '1.1rem',
            fontWeight: '800',
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.5 : 1,
            marginTop: '16px'
          }}
        >
          {submitting ? 'Processing...' : `Pay ₹${creator.pricePerQuestion || '99'}`}
        </button>

        {/* FOOTER TEXT */}
        <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#475569', fontWeight: '600' }}>
          GPay · PhonePe · Paytm · BHIM UPI
        </div>
        
        <div style={{ 
          background: '#111827', 
          border: '1px solid #1f2937', 
          borderRadius: '12px', 
          padding: '12px', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '8px',
          color: '#475569',
          fontSize: '0.8rem',
          marginTop: '8px'
        }}>
          <span style={{ color: '#22c55e', fontSize: '1rem' }}>🔒</span> 256-bit encryption · Razorpay PCI-DSS compliant
        </div>

      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: step === 0 ? '#0E0E0E' : '#0E0E0E', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: step === 0 ? '0' : '0' }}>
      {step === 0 && renderStep0()}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </div>
  );
};

export default CreatorPublicPage;
