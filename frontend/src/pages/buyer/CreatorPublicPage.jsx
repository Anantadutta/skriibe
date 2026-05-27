import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCreatorProfile, sendBuyerOTP, verifyBuyerOTP, submitQuestion } from '../../api/buyerApi';
import { mockQuestions } from '../../mock/questions';

const CreatorPublicPage = () => {
  const { handle } = useParams();
  const navigate = useNavigate();
  
  // State
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [step, setStep] = useState(0); // 0=profile, 1=question, 2=details, 3=review, 4=success
  const [btnHover, setBtnHover] = useState(false);
  
  // Step 1 - Question
  const [questionText, setQuestionText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  
  // Step 2 - Details
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [buyerToken, setBuyerToken] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);
  
  // Status
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let timer;
    if (otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

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
  }, [handle]);

  const handleSendOTP = async () => {
    if (!/^\d{10}$/.test(buyerPhone)) {
      setError('Please enter a valid 10-digit number');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await sendBuyerOTP(buyerPhone);
      setOtpSent(true);
      setOtpCountdown(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await verifyBuyerOTP(buyerPhone, otp);
      setBuyerToken(res.buyerToken);
      setPhoneVerified(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitQuestion = async () => {
    setError('');
    setSubmitting(true);
    try {
      await submitQuestion({
        creatorHandle: handle,
        questionText,
        buyerName: isAnonymous ? 'Anonymous' : buyerName,
        buyerEmail,
        isAnonymous,
        buyerToken
      });
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit question');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayAndSubmit = async () => {
    const qId = await handleSubmitQuestion();
    const orderRes = await createOrder({ questionId: qId, amount: creator.pricePerQuestion });
    const rzp = new window.Razorpay({
      key: orderRes.keyId,
      amount: orderRes.amount,
      order_id: orderRes.orderId,
      handler: async (response) => {
        await confirmPayment({ questionId: qId, ...response });
        setStep(4);
      }
    });
    rzp.open();
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
        ::-webkit-scrollbar {
          display: none;
        }
        * {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes ripple-dot {
          0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
          100% { box-shadow: 0 0 0 14px rgba(34, 197, 94, 0); }
        }
      `}} />
      
      {/* Container to restrict width */}
      <div style={{
        width: '100%',
        maxWidth: '390px',
        padding: '24px 20px 0',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>

        {/* 1. TOP BAR */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 0 4px 0'
        }}>
          {/* Logo */}
          <div style={{
            fontSize: '1.6rem',
            fontWeight: '600',
            fontStyle: 'normal',
            letterSpacing: '-0.03em',
            color: '#fff'
          }}>
            skr<span style={{ color: '#29C5F6' }}>ii</span>be
          </div>

          {/* Avatar with Status Dot */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#1A1A1A',
              border: '2px solid #2A2A2A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              color: '#ffffff',
              fontSize: '16px'
            }}>
              {creator.name ? creator.name[0].toUpperCase() : 'T'}
            </div>
            <div style={{
              position: 'absolute',
              top: '0px',
              right: '0px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#22C55E',
              border: '2px solid #0E0E0E',
              animation: 'ripple-dot 1.5s infinite ease-out'
            }} />
          </div>
        </div>

        {/* 2. STATS ROW */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '10px'
        }}>
          <div style={{
            background: '#1A1A1A',
            border: '1px solid #2A2A2A',
            borderRadius: '14px',
            padding: '16px 12px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#29C5F6', letterSpacing: '-1px' }}>
              <span style={{ fontSize: '1.4rem' }}>₹</span>890
            </div>
            <div style={{ fontSize: '0.6rem', color: '#64748b', marginTop: '4px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
              THIS WEEK
            </div>
          </div>

          <div style={{
            background: '#1A1A1A',
            border: '1px solid #2A2A2A',
            borderRadius: '14px',
            padding: '16px 12px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#EF4444' }}>
              3
            </div>
            <div style={{ fontSize: '0.6rem', color: '#64748b', marginTop: '4px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
              PENDING
            </div>
          </div>

          <div style={{
            background: '#1A1A1A',
            border: '1px solid #2A2A2A',
            borderRadius: '14px',
            padding: '16px 12px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#22C55E' }}>
              94%
            </div>
            <div style={{ fontSize: '0.6rem', color: '#64748b', marginTop: '4px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
              REPLY RATE
            </div>
          </div>
        </div>

        {/* 3. LIVE STATUS BANNER */}
        <div 
          onClick={() => setStep(1)}
          style={{
          background: '#1A1A1A',
          border: '1px solid #2A2A2A',
          boxShadow: 'none',
          borderRadius: '16px',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#22C55E',
                transition: 'background-color 0.2s ease'
              }} />
              <span style={{ fontWeight: 700, fontSize: '1rem', color: '#ffffff' }}>
                You're LIVE
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
              Accepting questions · ₹{creator.pricePerQuestion}/question
            </div>
          </div>

          <div 
            style={{
              width: '48px',
              height: '28px',
              borderRadius: '14px',
              background: '#22C55E',
              position: 'relative',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: '#ffffff',
              position: 'absolute',
              top: '4px',
              left: '24px',
              transition: 'all 0.2s ease'
            }} />
          </div>
        </div>

        {/* 4. PRIMARY ACTIONS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '100px' }}>

          <div 
            onClick={() => navigate('/creator/payouts')}
            style={{
              background: 'linear-gradient(90deg, rgba(41, 197, 246, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
              border: '1px solid rgba(41, 197, 246, 0.3)',
              borderRadius: '16px',
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(0.98)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <span style={{ fontWeight: 700, fontSize: '1rem', color: '#ffffff' }}>
                  Setup payouts
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                Link your bank account
              </div>
            </div>
            <div style={{
              background: '#ffffff',
              color: '#0E0E0E',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700
            }}>
              Setup →
            </div>
          </div>

          <div 
            onClick={() => navigate('/creator/health')}
            style={{
              background: '#13131f',
              border: '1px solid #2A2A2A',
              borderRadius: '16px',
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(0.98)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <span style={{ fontWeight: 700, fontSize: '1rem', color: '#ffffff' }}>
                  Account health
                </span>
                <span style={{
                  background: 'rgba(34, 197, 94, 0.2)',
                  color: '#4ade80',
                  padding: '2px 6px',
                  borderRadius: '12px',
                  fontSize: '0.7rem',
                  fontWeight: 600
                }}>
                  Good
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                Review metrics and SLAs
              </div>
            </div>
            <div style={{
              background: '#2A2A2A',
              color: '#ffffff',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 600
            }}>
              View →
            </div>
          </div>
        </div>

      </div>

      {/* 5. BOTTOM NAV BAR */}
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
        {[
          { label: 'HOME', icon: '🏠', route: '/creator/dashboard' },
          { label: 'INBOX', icon: '💬', route: '/creator/inbox' },
          { label: 'ANALYTICS', icon: '📊', route: '/creator/analytics' },
          { label: 'PAYOUTS', icon: '💰', route: '/creator/payouts' },
          { label: 'SETTINGS', icon: '⚙️', route: '/creator/settings' }
        ].map((item, idx) => (
            <div
              key={idx}
              onClick={() => navigate(item.route)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                color: item.label === 'HOME' ? '#29C5F6' : '#64748b',
                fontSize: '0.6rem',
                letterSpacing: '1px',
                fontWeight: 'bold',
                gap: '6px'
              }}
            >
              <span style={{ 
                fontSize: '20px',
                filter: item.label === 'HOME' ? cyanFilter : grayFilter
              }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </div>
        ))}
      </div>

    </div>
  );

  const renderStep1 = () => (
    <div style={{ width: '100%', maxWidth: 420 }}>
      <button onClick={() => setStep(0)} style={{ background: 'none', border: 'none', color: 'var(--g3)', fontFamily: 'var(--font-mono)', fontSize: 12, cursor: 'pointer', padding: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
        ← Back to profile
      </button>
      <div style={{ background: 'var(--ink2)', border: '1px solid var(--ink4)', borderRadius: 'var(--radius-lg)', padding: '28px 24px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, color: 'var(--white)', margin: '0 0 24px' }}>
          Ask @{creator.handle} a question
        </h2>
        <textarea
          value={questionText}
          onChange={e => setQuestionText(e.target.value)}
          placeholder={`What do you want to ask @${creator.handle}?`}
          maxLength={500}
          style={{ width: '100%', background: 'var(--ink3)', border: '1px solid var(--ink5)', borderRadius: 'var(--radius-md)', padding: '12px 14px', color: 'var(--white)', fontFamily: 'var(--font-body)', fontSize: 14, outline: 'none', minHeight: 120, resize: 'none', marginBottom: 8 }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--g3)', marginBottom: 24 }}>
          {questionText.length}/500
        </div>
        
        <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', marginBottom: 24 }}>
          <input 
            type="checkbox" 
            checked={isAnonymous} 
            onChange={e => setIsAnonymous(e.target.checked)} 
            style={{ width: 18, height: 18, accentColor: 'var(--blue)' }} 
          />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--white)' }}>Ask anonymously</span>
        </label>

        <button 
          onClick={() => setStep(2)}
          disabled={questionText.trim().length < 20}
          style={{ width: '100%', background: 'var(--blue)', color: 'var(--ink1)', border: 'none', borderRadius: 'var(--radius-md)', padding: '14px', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-body)', cursor: questionText.trim().length < 20 ? 'not-allowed' : 'pointer', opacity: questionText.trim().length < 20 ? 0.5 : 1 }}
        >
          Next →
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div style={{ width: '100%', maxWidth: 420 }}>
      <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--g3)', fontFamily: 'var(--font-mono)', fontSize: 12, cursor: 'pointer', padding: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
        ← Back
      </button>
      <div style={{ background: 'var(--ink2)', border: '1px solid var(--ink4)', borderRadius: 'var(--radius-lg)', padding: '28px 24px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, color: 'var(--white)', margin: '0 0 24px' }}>
          Your details
        </h2>
        
        {!isAnonymous && (
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', color: 'var(--g3)', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>YOUR NAME *</label>
            <input 
              type="text" 
              value={buyerName} 
              onChange={e => setBuyerName(e.target.value)} 
              placeholder="Full name"
              style={{ width: '100%', background: 'var(--ink3)', border: '1px solid var(--ink5)', borderRadius: 'var(--radius-md)', padding: '12px 14px', color: 'var(--white)', fontFamily: 'var(--font-body)', fontSize: 14, outline: 'none' }} 
            />
          </div>
        )}

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', color: 'var(--g3)', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>MOBILE NUMBER *</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ background: 'var(--ink3)', border: '1px solid var(--ink5)', borderRadius: 'var(--radius-md)', padding: '12px 14px', color: 'var(--g2)', fontFamily: 'var(--font-body)', fontSize: 14 }}>+91</div>
            <input 
              type="tel" 
              maxLength={10}
              value={buyerPhone} 
              onChange={e => setBuyerPhone(e.target.value.replace(/\D/g, ''))} 
              placeholder="9876543210"
              disabled={phoneVerified || otpSent}
              style={{ flex: 1, background: 'var(--ink3)', border: '1px solid var(--ink5)', borderRadius: 'var(--radius-md)', padding: '12px 14px', color: 'var(--white)', fontFamily: 'var(--font-body)', fontSize: 14, outline: 'none', opacity: (phoneVerified || otpSent) ? 0.5 : 1 }} 
            />
          </div>
          {(!otpSent && !phoneVerified) && (
            <button onClick={handleSendOTP} disabled={buyerPhone.length !== 10 || submitting} style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: 12, marginTop: 8, cursor: 'pointer', padding: 0 }}>
              {submitting ? 'Sending...' : 'Send OTP'}
            </button>
          )}
          {(otpSent && !phoneVerified) && (
            <button onClick={handleSendOTP} disabled={otpCountdown > 0 || submitting} style={{ background: 'none', border: 'none', color: otpCountdown > 0 ? 'var(--g3)' : 'var(--blue)', fontSize: 12, marginTop: 8, cursor: otpCountdown > 0 ? 'default' : 'pointer', padding: 0 }}>
              {otpCountdown > 0 ? `Resend in ${otpCountdown}s` : 'Resend OTP'}
            </button>
          )}
        </div>

        {otpSent && !phoneVerified && (
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', color: 'var(--g3)', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>ENTER OTP *</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input 
                type="text" 
                maxLength={6}
                value={otp} 
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} 
                placeholder="000000"
                style={{ flex: 1, background: 'var(--ink3)', border: '1px solid var(--ink5)', borderRadius: 'var(--radius-md)', padding: '12px 14px', color: 'var(--white)', fontFamily: 'var(--font-mono)', fontSize: 16, outline: 'none', letterSpacing: '0.2em' }} 
              />
              <button onClick={handleVerifyOTP} disabled={otp.length !== 6 || submitting} style={{ background: 'var(--blue)', color: 'var(--ink1)', border: 'none', borderRadius: 'var(--radius-md)', padding: '0 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Verify
              </button>
            </div>
          </div>
        )}

        {phoneVerified && (
          <div style={{ marginBottom: 24, color: '#22C55E', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            ✓ Phone verified
          </div>
        )}

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', color: 'var(--g3)', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>EMAIL (OPTIONAL)</label>
          <input 
            type="email" 
            value={buyerEmail} 
            onChange={e => setBuyerEmail(e.target.value)} 
            placeholder="For answer notifications"
            style={{ width: '100%', background: 'var(--ink3)', border: '1px solid var(--ink5)', borderRadius: 'var(--radius-md)', padding: '12px 14px', color: 'var(--white)', fontFamily: 'var(--font-body)', fontSize: 14, outline: 'none' }} 
          />
        </div>

        {error && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#EF4444', marginBottom: 16 }}>{error}</div>}

        <button 
          onClick={() => { setError(''); setStep(3); }}
          disabled={!phoneVerified || (!isAnonymous && !buyerName.trim())}
          style={{ width: '100%', background: 'var(--blue)', color: 'var(--ink1)', border: 'none', borderRadius: 'var(--radius-md)', padding: '14px', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-body)', cursor: (!phoneVerified || (!isAnonymous && !buyerName.trim())) ? 'not-allowed' : 'pointer', opacity: (!phoneVerified || (!isAnonymous && !buyerName.trim())) ? 0.5 : 1 }}
        >
          Next →
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div style={{ width: '100%', maxWidth: 420 }}>
      <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', color: 'var(--g3)', fontFamily: 'var(--font-mono)', fontSize: 12, cursor: 'pointer', padding: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
        ← Back
      </button>
      <div style={{ background: 'var(--ink2)', border: '1px solid var(--ink4)', borderRadius: 'var(--radius-lg)', padding: '28px 24px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, color: 'var(--white)', margin: '0 0 24px' }}>
          Review your question
        </h2>
        
        <div style={{ background: 'var(--ink3)', border: '1px solid var(--ink5)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: 24 }}>
          <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--white)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            "{questionText}"
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
            <span style={{ color: 'var(--g3)' }}>To:</span>
            <span style={{ color: 'var(--white)' }}>@{creator.handle}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
            <span style={{ color: 'var(--g3)' }}>From:</span>
            <span style={{ color: 'var(--white)' }}>{isAnonymous ? 'Anonymous' : buyerName}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
            <span style={{ color: 'var(--g3)' }}>Price:</span>
            <span style={{ color: 'var(--white)' }}>₹{creator.pricePerQuestion}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
            <span style={{ color: 'var(--g3)' }}>Expect:</span>
            <span style={{ color: 'var(--white)' }}>Within {creator.responseTime}</span>
          </div>
        </div>

        {error && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#EF4444', marginBottom: 16 }}>{error}</div>}

        <button 
          onClick={handlePayAndSubmit}
          disabled={submitting}
          style={{ width: '100%', background: 'var(--blue)', color: 'var(--ink1)', border: 'none', borderRadius: 'var(--radius-md)', padding: '14px', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-body)', cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}
        >
          {submitting ? 'Processing...' : `Pay ₹${creator.pricePerQuestion} & Submit`}
        </button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div style={{ width: '100%', maxWidth: 420 }}>
      <div style={{ background: 'var(--ink2)', border: '1px solid var(--ink4)', borderRadius: 'var(--radius-lg)', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, color: 'var(--white)', margin: '0 0 16px' }}>
          Question submitted!
        </h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--g2)', lineHeight: 1.5, margin: '0 0 32px' }}>
          We'll notify you when {creator.name} answers.
          {buyerEmail && <span> Check <strong>{buyerEmail}</strong> for updates.</span>}
        </p>

        <button 
          onClick={() => { setStep(1); setQuestionText(''); }}
          style={{ width: '100%', background: 'var(--blue)', color: 'var(--ink1)', border: 'none', borderRadius: 'var(--radius-md)', padding: '14px', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-body)', cursor: 'pointer', marginBottom: 12 }}
        >
          Ask another question
        </button>
        <button 
          onClick={() => { setStep(0); setQuestionText(''); setBuyerToken(''); setPhoneVerified(false); setOtpSent(false); setBuyerPhone(''); setOtp(''); setBuyerName(''); setIsAnonymous(false); }}
          style={{ width: '100%', background: 'none', border: '1px solid var(--ink5)', color: 'var(--white)', borderRadius: 'var(--radius-md)', padding: '14px', fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-body)', cursor: 'pointer' }}
        >
          ← Back to profile
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: step === 0 ? '#0E0E0E' : 'var(--ink1)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: step === 0 ? '0' : '40px 16px 80px' }}>
      {step === 0 && renderStep0()}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
    </div>
  );
};

export default CreatorPublicPage;
