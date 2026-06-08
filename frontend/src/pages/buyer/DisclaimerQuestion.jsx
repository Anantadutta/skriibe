/**
 * @file DisclaimerQuestion.jsx
 * @description Buyer flow: Disclaimer acceptance and question submission form.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCreatorProfile, validateQuestion } from '../../services/buyerApi';
import { Button } from '../../components/ama/ui/Button';
import { Field } from '../../components/ama/ui/Field';
import { CharCounter } from '../../components/ama/ui/CharCounter';

const DisclaimerQuestion = () => {
  const { handle } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState('disclaimer');
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepted, setAccepted] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    whatsapp: '',
    question: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    getCreatorProfile(handle)
      .then(res => setCreator(res.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [handle, navigate]);

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleBlur = (field) => {
    let newErrors = { ...errors };
    if (field === 'name' && form.name.length < 2) {
      newErrors.name = 'Name is required (min 2 chars)';
    } else if (field === 'name') {
      delete newErrors.name;
    }

    if (field === 'email' && !validateEmail(form.email)) {
      newErrors.email = 'Invalid email address';
    } else if (field === 'email') {
      delete newErrors.email;
    }

    if (field === 'whatsapp' && form.whatsapp && !/^[6-9]\d{9}$/.test(form.whatsapp)) {
      newErrors.whatsapp = 'Invalid WhatsApp number';
    } else if (field === 'whatsapp') {
      delete newErrors.whatsapp;
    }

    setErrors(newErrors);
  };

  const isFormValid = 
    form.name.length >= 2 && 
    validateEmail(form.email) && 
    (!form.whatsapp || /^[6-9]\d{9}$/.test(form.whatsapp)) &&
    form.question.length >= 20;

  const handlePay = async () => {
    if (!isFormValid) return;
    setIsValidating(true);
    setApiError('');
    try {
      const res = await validateQuestion(form.question);
      if (res.data.allowed) {
        navigate(`/pay/${handle}`, { 
          state: { 
            buyerName: form.name, 
            buyerEmail: form.email, 
            buyerWhatsApp: form.whatsapp, 
            questionText: form.question,
            creatorHandle: handle,
            price: creator.price
          } 
        });
      }
    } catch (err) {
      setApiError(err.response?.data?.reason || 'Validation failed. Try again.');
    } finally {
      setIsValidating(false);
    }
  };

  if (loading) return null;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--ink)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '40px 16px' 
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '480px', 
        background: 'var(--ink2)', 
        borderRadius: 'var(--radius-lg)', 
        border: '1px solid var(--ink5)', 
        padding: '40px 36px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        position: 'relative'
      }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <button 
            onClick={() => step === 'disclaimer' ? navigate(`/${handle}`) : setStep('disclaimer')}
            style={{ position: 'absolute', left: '-10px', background: 'none', border: 'none', color: 'var(--white)', fontSize: '20px', cursor: 'pointer' }}
          >
            ←
          </button>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, color: 'var(--white)', margin: 0 }}>
            Ask @{handle}
          </h2>
        </div>

        {step === 'disclaimer' ? (
          <>
            <div style={{ 
              background: 'var(--adim)', 
              border: '1px solid var(--amber)', 
              borderRadius: 'var(--radius-md)', 
              padding: '20px' 
            }}>
              <div style={{ 
                fontFamily: 'var(--font-mono)', 
                fontSize: '12px', 
                color: 'var(--amber)', 
                fontWeight: 700, 
                textTransform: 'uppercase', 
                marginBottom: '12px' 
              }}>
                READ BEFORE CONTINUING
              </div>
              <ul style={{ 
                margin: 0, 
                padding: 0, 
                listStyle: 'none', 
                fontFamily: 'var(--font-body)', 
                fontSize: '13px', 
                color: 'var(--g2)', 
                lineHeight: 1.8 
              }}>
                <li style={{ marginBottom: '8px' }}>· Answers are personal opinions — not professional advice</li>
                <li style={{ marginBottom: '8px' }}>· Not a substitute for medical, legal or financial counsel</li>
                <li style={{ marginBottom: '8px' }}>· One question per payment — be specific</li>
                <li style={{ marginBottom: '8px' }}>· 100% refund if no reply in 24 hours</li>
                <li style={{ marginBottom: '8px' }}>· Do not share others' personal data</li>
              </ul>
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={accepted} 
                onChange={(e) => setAccepted(e.target.checked)}
                style={{ 
                  width: '20px', 
                  height: '20px', 
                  accentColor: 'var(--blue)',
                  cursor: 'pointer',
                  marginTop: '2px',
                  flexShrink: 0
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--white)' }}>
                  I understand and agree
                </span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--g2)', lineHeight: 1.4 }}>
                  By logging in and using Skriibe, you agree to our <span style={{ color: 'var(--blue)', cursor: 'pointer' }}>Terms of Service</span> and <span style={{ color: 'var(--blue)', cursor: 'pointer' }}>Privacy Policy</span>.
                </span>
              </div>
            </label>

            <Button variant="primary" disabled={!accepted} onClick={() => setStep('form')}>
              Continue →
            </Button>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <Field 
                label="YOUR NAME" 
                value={form.name} 
                onChange={(e) => setForm({...form, name: e.target.value})}
                onBlur={() => handleBlur('name')}
                placeholder="Full Name"
              />
              {errors.name && <div style={{ color: 'var(--red)', fontSize: '11px', fontFamily: 'var(--font-mono)', marginTop: '-15px' }}>{errors.name}</div>}

              <Field 
                label="EMAIL ADDRESS *" 
                value={form.email} 
                onChange={(e) => setForm({...form, email: e.target.value})}
                onBlur={() => handleBlur('email')}
                placeholder="email@example.com"
              />
              {errors.email && <div style={{ color: 'var(--red)', fontSize: '11px', fontFamily: 'var(--font-mono)', marginTop: '-15px' }}>{errors.email}</div>}

              <Field 
                label="WHATSAPP (OPTIONAL)" 
                value={form.whatsapp} 
                onChange={(e) => setForm({...form, whatsapp: e.target.value.replace(/\D/g, '')})}
                onBlur={() => handleBlur('whatsapp')}
                placeholder="+91 98765 43210"
              />
              {errors.whatsapp && <div style={{ color: 'var(--red)', fontSize: '11px', fontFamily: 'var(--font-mono)', marginTop: '-15px' }}>{errors.whatsapp}</div>}

              <div>
                <label style={{ 
                  fontFamily: 'var(--font-mono)', 
                  fontSize: '9px', 
                  color: 'var(--g3)', 
                  textTransform: 'uppercase', 
                  display: 'block', 
                  marginBottom: '8px' 
                }}>
                  YOUR QUESTION * (MIN 20 CHARS)
                </label>
                <textarea 
                  maxLength={500}
                  value={form.question}
                  onChange={(e) => setForm({...form, question: e.target.value})}
                  style={{
                    width: '100%',
                    minHeight: '120px',
                    background: 'var(--ink3)',
                    border: '1px solid var(--ink5)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 16px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    color: 'var(--white)',
                    resize: 'vertical',
                    outline: 'none',
                    transition: 'border-color 0.15s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--blue)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--ink5)'}
                />
                <div style={{ marginTop: '8px' }}>
                  <CharCounter count={form.question.length} min={20} max={500} />
                </div>
              </div>

              <div style={{ marginTop: '12px' }}>
                <Button variant="primary" disabled={!isFormValid || isValidating} onClick={handlePay}>
                  {isValidating ? 'Validating...' : `Pay ₹${creator.price} →`}
                </Button>
                
                {apiError && (
                  <div style={{ 
                    marginTop: '16px', 
                    background: 'var(--rdim)', 
                    color: 'var(--red)', 
                    fontFamily: 'var(--font-mono)', 
                    fontSize: '12px', 
                    padding: '12px', 
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(239,68,68,0.2)'
                  }}>
                    {apiError}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default DisclaimerQuestion;
