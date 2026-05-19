import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCreatorProfile, sendBuyerOTP, verifyBuyerOTP, submitQuestion } from '../../api/buyerApi';

const CreatorPublicPage = () => {
  const { handle } = useParams();
  
  // State
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [step, setStep] = useState(0); // 0=profile, 1=question, 2=details, 3=review, 4=success
  
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

  const renderStep0 = () => (
    <div style={{ width: '100%', maxWidth: 420, background: 'var(--ink2)', border: '1px solid var(--ink4)', borderRadius: 'var(--radius-lg)', padding: '28px 24px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        {creator.avatarUrl ? (
          <img src={creator.avatarUrl} alt={creator.name} style={{ width: 72, height: 72, borderRadius: '50%', marginBottom: 16, objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--ink3)', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--white)', fontSize: 24, fontFamily: 'var(--font-heading)' }}>
            {creator.name?.[0] || '?'}
          </div>
        )}
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, color: 'var(--white)', margin: '0 0 4px' }}>
          {creator.name}
        </h1>
        {creator.instagramLinked && creator.instagramHandle && (
          <div style={{ color: 'var(--g2)', fontSize: 14, marginBottom: 12 }}>
            @{creator.instagramHandle} 📷
          </div>
        )}
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--g2)', lineHeight: 1.5, margin: '0 0 24px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {creator.bio}
        </p>

        <div style={{ width: '100%', height: 1, background: 'var(--ink4)', marginBottom: 16 }} />
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--g3)', textTransform: 'uppercase', marginBottom: 16 }}>
          {creator.questionsAnswered} questions answered
        </div>
        <div style={{ width: '100%', height: 1, background: 'var(--ink4)', marginBottom: 24 }} />

        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, color: 'var(--white)', margin: '0 0 8px' }}>
          Ask a question
        </h2>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--g2)', marginBottom: 24 }}>
          ₹{creator.pricePerQuestion} · ~{creator.responseTime}
        </div>

        <button 
          onClick={() => setStep(1)}
          style={{ width: '100%', background: 'var(--blue)', color: 'var(--ink1)', border: 'none', borderRadius: 'var(--radius-md)', padding: '14px', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-body)', cursor: 'pointer' }}
        >
          Ask @{creator.handle} →
        </button>
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
          onClick={handleSubmitQuestion}
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
    <div style={{ minHeight: '100vh', background: 'var(--ink1)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 16px 80px' }}>
      {step === 0 && renderStep0()}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
    </div>
  );
};

export default CreatorPublicPage;
