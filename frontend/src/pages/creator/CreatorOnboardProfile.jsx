/**
 * @file CreatorOnboardProfile.jsx
 * @description Step 1 of onboarding: Profile setup (C3).
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveProfile, getMe } from '../../services/creatorApi';
import { PhoneFrame } from '../../components/ama/layout/PhoneFrame';
import { Button } from '../../components/ama/ui/Button';
import { Field } from '../../components/ama/ui/Field';

const CreatorOnboardProfile = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    handle: '',
    email: '',
    bio: '',
    expertise: [],
    instagramHandle: '',
    instagramConnected: false,
    instagramFollowers: 0
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCreator, setLoadingCreator] = useState(true);

  // List of standard expertise tag options
  const expertiseOptions = [
    'Personal Finance',
    'SIP / Mutual Funds',
    'Stock Trading',
    'Career Coaching',
    'Tax Planning',
    'Real Estate',
    'Tech & Coding',
    'Fitness & Health'
  ];

  useEffect(() => {
    const loadCreator = async () => {
      try {
        const res = await getMe();
        if (res.success && res.creator) {
          const creator = res.creator;
          setForm(prev => ({
            ...prev,
            name: creator.name || '',
            handle: creator.handle || '',
            email: (creator.email && !creator.email.includes('@temp.skriibe.com')) ? creator.email : '',
            bio: creator.bio || '',
            expertise: creator.expertise ? (Array.isArray(creator.expertise) ? creator.expertise : creator.expertise.split(',').map(e => e.trim())) : [],
            instagramHandle: creator.instagramHandle || '',
            instagramConnected: creator.instagramConnected || false,
            instagramFollowers: creator.instagramFollowers || 0
          }));
          if (creator.avatarUrl) {
            setAvatarPreview(creator.avatarUrl);
          }
        }
      } catch (err) {
        console.error('Failed to fetch creator data:', err);
      } finally {
        setLoadingCreator(false);
      }
    };

    loadCreator();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const igData = params.get('igData');
    if (igData) {
      try {
        const data = JSON.parse(decodeURIComponent(igData));
        setForm(prev => ({
          ...prev,
          instagramHandle: data.handle || prev.instagramHandle,
          instagramConnected: true,
          name: data.name || prev.name,
          bio: data.bio || prev.bio,
        }));
        if (data.avatarUrl) setAvatarPreview(data.avatarUrl);
        window.history.replaceState({}, '', window.location.pathname);
      } catch (e) {
        console.error('Failed to parse igData', e);
      }
    }
  }, []);

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleInstagramConnect = () => {
    window.location.href = 'http://localhost:5000/api/auth/instagram';
  };
  const handleToggleTag = (tag) => {
    setForm(prev => {
      const isSelected = prev.expertise.includes(tag);
      if (isSelected) {
        return {
          ...prev,
          expertise: prev.expertise.filter(t => t !== tag)
        };
      } else {
        if (prev.expertise.length >= 3) return prev; // Limit to max 3 tags
        return {
          ...prev,
          expertise: [...prev.expertise, tag]
        };
      }
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size too large (max 5MB)');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleContinue = async () => {
    if (!form.name || !form.email || form.expertise.length === 0) return;
    
    setLoading(true);
    try {
      // If handle is not filled, default to formatted name or standard handle
      const finalHandle = form.handle || form.name.toLowerCase().replace(/[^a-z0-9_]/g, '');
      const res = await saveProfile({
        ...form,
        handle: finalHandle,
        avatarUrl: typeof avatarPreview === 'string' && avatarPreview.startsWith('http') ? avatarPreview : null
      });
      
      navigate('/onboard/pricing', { state: { creator: res.data.creator } });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const canContinue = form.name.trim().length >= 2 &&
    isEmailValid &&
    form.expertise.length >= 1 &&
    form.expertise.length <= 3;

  if (loadingCreator) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0B0B10',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff'
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px' }}>Loading profile...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0B0B10',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px'
    }}>
      {/* MONOSPACED LABEL OUTSIDE PHONE FRAME */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '13px',
        color: 'var(--g3)',
        letterSpacing: '0.1em',
        marginBottom: '20px',
        textTransform: 'uppercase',
        fontWeight: 'bold'
      }}>
      </div>

      <PhoneFrame>
        <div style={{
          padding: '16px 20px 80px',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          boxSizing: 'border-box'
        }}>
          {/* HEADER WITH BACK CHEVRON */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            height: '24px',
            marginBottom: '10px'
          }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                position: 'absolute',
                left: 0,
                background: 'none',
                border: 'none',
                color: 'var(--white)',
                fontSize: '18px',
                cursor: 'pointer',
                padding: 0
              }}
            >
              ←
            </button>
            <div style={{
              margin: '0 auto',
              fontFamily: 'var(--font-heading)',
              fontSize: '15px',
              fontWeight: 700,
              color: 'var(--white)'
            }}>
              Connect & setup
            </div>
          </div>

          {/* PROGRESS BAR: STEP 1 ACTIVE */}
          <div style={{
            display: 'flex',
            width: '100%',
            height: '4px',
            background: 'var(--ink5)',
            borderRadius: '2px',
            overflow: 'hidden',
            marginBottom: '18px'
          }}>
            <div style={{ flex: 1, background: '#3DD9FF' }} />
            <div style={{ flex: 1, background: 'var(--ink5)' }} />
          </div>

          {/* SCROLL CONTAINER FOR FORM */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            paddingRight: '4px',
            marginBottom: '20px'
          }}>
            {/* INSTAGRAM CONNECT CARD */}
            <div style={{
              background: '#141420',
              border: '1px solid #2a2a3e',
              borderRadius: '14px',
              padding: '16px',
              marginBottom: '20px',
              textAlign: 'center',
              position: 'relative'
            }}>
              {!form.instagramConnected ? (
                <>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                    fontSize: '20px'
                  }}>
                    📸
                  </div>
                  <h3 style={{
                    color: 'var(--white)',
                    fontSize: '14px',
                    fontWeight: 700,
                    margin: '0 0 6px'
                  }}>
                    Connect Instagram
                  </h3>
                  <p style={{
                    color: 'var(--g2)',
                    fontSize: '11px',
                    lineHeight: '1.4',
                    margin: '0 0 16px',
                    padding: '0 8px'
                  }}>
                    Your skriibe profile pulls your photo, handle, and follower count automatically. Builds instant trust with buyers.
                  </p>
                  <button
                    type="button"
                    onClick={handleInstagramConnect}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '14px',
                      background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                    onMouseLeave={(e) => e.target.style.opacity = '1'}
                  >
                    Connect @instagram
                  </button>
                  <div style={{
                    fontSize: '9px',
                    color: 'var(--g3)',
                    marginTop: '8px',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    Read-only access · We never post on your behalf
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      background: 'linear-gradient(45deg, #3DD9FF, #7c3aed)',
                      color: 'var(--white)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 10px rgba(61, 217, 255, 0.3)'
                    }}>
                      {avatarPreview === 'T' ? 'T' : '📸'}
                    </div>
                    <div style={{
                      position: 'absolute',
                      bottom: -2,
                      right: -2,
                      background: 'var(--ink2)',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid var(--ink5)'
                    }}>
                      <span style={{ fontSize: '10px', color: '#3DD9FF', fontWeight: 'bold' }}>+</span>
                    </div>
                  </div>
                  <div>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '8px',
                      color: 'var(--g3)',
                      letterSpacing: '0.05em',
                      display: 'block'
                    }}>
                      INSTAGRAM CONNECTED AS
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <span style={{ color: 'var(--white)', fontSize: '13px', fontWeight: 600 }}>
                        @{form.instagramHandle}
                      </span>
                      <span style={{
                        background: 'rgba(34,197,94,.1)',
                        color: '#22C55E',
                        fontSize: '9px',
                        fontWeight: 'bold',
                        padding: '2px 6px',
                        borderRadius: '12px',
                        fontFamily: 'var(--font-mono)'
                      }}>
                        ✓ linked
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* AVATAR UPLOAD CIRCLE */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <label style={{ cursor: 'pointer', textAlign: 'center' }}>
                <div style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  background: 'var(--ink3)',
                  border: '1px dashed var(--ink5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  {avatarPreview ? (
                    typeof avatarPreview === 'string' && avatarPreview.length === 1 ? (
                      <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--white)' }}>{avatarPreview}</span>
                    ) : (
                      <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )
                  ) : (
                    <span style={{ fontSize: '20px', color: 'var(--g3)' }}>+</span>
                  )}
                  <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                </div>
                <span style={{
                  display: 'block',
                  fontSize: '9px',
                  color: 'var(--blue)',
                  fontFamily: 'var(--font-mono)',
                  marginTop: '6px'
                }}>
                  UPLOAD PHOTO
                </span>
              </label>
            </div>

            {/* INPUTS CONTAINER */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Field
                label="FULL NAME *"
                value={form.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Pre-filled from Instagram"
                required
              />

              {/* FIELD OF EXPERTISE TAG SELECTOR */}
              <div>
                <label style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9px',
                  color: 'var(--g3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  FIELD OF EXPERTISE * (1–3)
                </label>

                {/* Selected tags */}
                {form.expertise.length > 0 && (
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                    marginBottom: '10px',
                    padding: '8px',
                    background: 'var(--ink3)',
                    borderRadius: '8px',
                    border: '1px solid var(--ink5)'
                  }}>
                    {form.expertise.map(tag => (
                      <span
                        key={tag}
                        onClick={() => handleToggleTag(tag)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: 'rgba(61, 217, 255, 0.1)',
                          color: '#3DD9FF',
                          border: '1px solid rgba(61, 217, 255, 0.3)',
                          padding: '4px 10px',
                          borderRadius: '16px',
                          fontSize: '11px',
                          fontWeight: 500,
                          cursor: 'pointer'
                        }}
                      >
                        {tag} <span style={{ fontWeight: 'bold' }}>×</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Tag options */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px'
                }}>
                  {expertiseOptions.map(opt => {
                    const isSelected = form.expertise.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleToggleTag(opt)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '16px',
                          fontSize: '11px',
                          fontFamily: 'var(--font-body)',
                          cursor: 'pointer',
                          background: isSelected ? 'rgba(61, 217, 255, 0.05)' : '#141420',
                          color: isSelected ? '#3DD9FF' : 'var(--g2)',
                          border: `1px solid ${isSelected ? '#3DD9FF' : '#2a2a3e'}`,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Field
                label="EMAIL *"
                type="email"
                value={form.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="you@example.com"
                required
              />

              {/* BIO TEXTAREA */}
              <div style={{
                background: 'var(--ink3)',
                border: '1px solid var(--ink5)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px',
                position: 'relative'
              }}>
                <label style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9px',
                  color: 'var(--g3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  marginBottom: '6px',
                  display: 'block'
                }}>
                  BIO (OPTIONAL, MAX 200 CHARS)
                </label>
                <textarea
                  value={form.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value.slice(0, 200))}
                  placeholder="Helping India save smarter…"
                  rows={2}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--white)',
                    fontSize: '13px',
                    fontFamily: 'var(--font-body)',
                    resize: 'none'
                  }}
                />
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginTop: '4px',
                  fontSize: '9px',
                  fontFamily: 'var(--font-mono)',
                  color: form.bio.length >= 180 ? 'var(--red)' : 'var(--g3)'
                }}>
                  {form.bio.length}/200
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM CTA: STICKY TO PHONE BOTTOM */}
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '20px',
            right: '20px',
            zIndex: 10
          }}>
            <button
              onClick={handleContinue}
              disabled={!canContinue || loading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '14px',
                background: canContinue ? '#3DD9FF' : 'rgba(255, 255, 255, 0.05)',
                color: canContinue ? '#000000' : 'var(--g3)',
                fontWeight: 500,
                fontSize: '14px',
                border: 'none',
                cursor: canContinue ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'none'
              }}
            >
              {loading ? 'Saving...' : 'Continue →'}
            </button>
          </div>
        </div>
      </PhoneFrame>
    </div>
  );
};

export default CreatorOnboardProfile;
