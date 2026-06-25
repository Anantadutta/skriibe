/**
 * @file CreatorOnboardProfile.jsx
 * @description Step 1 of onboarding: Profile setup (C3).
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveProfile, getMe, uploadAvatar } from '../../services/creatorApi';
import { PhoneFrame } from '../../components/ama/layout/PhoneFrame';
import { Field } from '../../components/ama/ui/Field';
import ImageCropperModal from '../../components/common/ImageCropperModal';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { validatePhoneNumber, COUNTRIES } from '../../utils/phoneValidation';

const CreatorOnboardProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const passedCreator = location.state?.creator || {};

  const [form, setForm] = useState({
    name: passedCreator.name || '',
    handle: '',
    email: (passedCreator.email && !passedCreator.email.includes('@temp.skriibe.com')) ? passedCreator.email : '',
    phone: passedCreator.phone || '',
    bio: passedCreator.bio?.trim() === '' ? '' : passedCreator.bio || '',
    expertise: (passedCreator.expertise && passedCreator.expertise.length === 1 && passedCreator.expertise[0] === 'Others') ? [] : (passedCreator.expertise || []),
    instagramHandle: passedCreator.instagramHandle || '',
    instagramConnected: passedCreator.instagramConnected || false,
    instagramFollowers: passedCreator.instagramFollowers || 0
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCreator, setLoadingCreator] = useState(true);
  const [instagramMedia, setInstagramMedia] = useState([]);
  const [error, setError] = useState('');

  const [bioFocused, setBioFocused] = useState(false);
  const [customExpertise, setCustomExpertise] = useState('');

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState(null);

  // List of standard expertise tag options
  const expertiseOptions = [
    'Career & Finance',
    'Health & Fitness',
    'Tech & Skills',
    'Fashion & Lifestyle',
    'Daily Vlogs & Entertainment',
    'Education',
    'Business & Entrepreneurship',
    'Relationships & Life',
    'Spirituality',
    'Others'
  ];

  useEffect(() => {
    const loadCreator = async () => {
      try {
        const res = await getMe();
        if (res.success && res.creator) {
          const creator = res.creator;
          setForm(prev => ({
            ...prev,
            name: creator.name || prev.name,
            handle: creator.handle || prev.handle || '',
            email: (creator.email && !creator.email.includes('@temp.skriibe.com')) ? creator.email : prev.email,
            phone: creator.phone || prev.phone,
            bio: creator.bio?.trim() === '' ? '' : (creator.bio || prev.bio || ''),
            expertise: (creator.expertise && creator.expertise.length === 1 && creator.expertise[0] === 'Others') ? [] : (creator.expertise?.length > 0 ? creator.expertise : prev.expertise),
            instagramHandle: creator.instagramHandle || prev.instagramHandle || '',
            instagramConnected: creator.instagramConnected || false,
            instagramFollowers: creator.instagramFollowers || prev.instagramFollowers || 0
          }));
          if (creator.avatarUrl) {
            setAvatarPreview(creator.avatarUrl);
          }
          if (creator.instagramMedia) {
            setInstagramMedia(creator.instagramMedia);
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
          handle: data.handle || prev.handle || '',
          instagramHandle: data.handle || prev.instagramHandle,
          instagramFollowers: data.followers || prev.instagramFollowers,
          instagramConnected: true,
          name: data.name || prev.name || '',
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
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const stateToken = localStorage.getItem('skriibe_token') || '';
    window.location.href = `${apiUrl}/auth/instagram?state=${stateToken}`;
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
        if (prev.expertise.length >= 2) return prev; // Limit to max 2 tags
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
      const reader = new FileReader();
      reader.onload = () => {
        setCropImageSrc(reader.result);
        setCropModalOpen(true);
      };
      reader.readAsDataURL(file);
      e.target.value = ''; // Reset input
    }
  };

  const handleCropComplete = (blob) => {
    const file = new File([blob], "profile_crop.webp", { type: "image/webp" });
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(blob));
    setCropModalOpen(false);
    setCropImageSrc(null);
  };

  const handleAddCustomExpertise = () => {
    if (!customExpertise.trim()) return;
    setForm(prev => ({
      ...prev,
      expertise: prev.expertise.map(t => t === 'Others' ? customExpertise.trim() : t)
    }));
    setCustomExpertise('');
  };

  const handleContinue = async () => {
    setError('');
    const showError = (msg) => {
      setError(msg);
      setTimeout(() => setError(''), 5000);
    };

    if (!form.name || !form.handle || !form.email || !form.phone || form.expertise.length === 0 || !form.instagramFollowers) {
      const missing = [];
      if (!form.name || form.name.trim().length < 2) missing.push('Full Name');
      if (!isHandleValid) missing.push('Username (3–30 chars)');
      if (!isEmailValid) missing.push('Valid Email');
      if (!isPhoneValid) missing.push('Valid Phone Number');
      if (form.expertise.length === 0) missing.push('Expertise (min 1)');
      if (!form.instagramFollowers || form.instagramFollowers.toString().trim() === '') missing.push('Instagram Followers');
      showError('Please fix: ' + missing.join(' · '));
      return;
    }
    if (form.expertise.includes('Others') && !customExpertise.trim()) {
      showError('Please specify your expertise in the text field.');
      return;
    }

    setLoading(true);
    try {
      const finalHandle = form.handle;
      const finalExpertise = form.expertise.map(t => t === 'Others' ? customExpertise.trim() : t);

      // Upload the avatar if there is a new one selected
      if (avatarFile) {
        try {
          const formData = new FormData();
          formData.append('avatar', avatarFile);
          await uploadAvatar(formData);
        } catch (uploadErr) {
          console.error('Avatar upload failed:', uploadErr);
          // We can choose to show an error or continue without the avatar
        }
      }

      const res = await saveProfile({
        ...form,
        expertise: finalExpertise,
        handle: finalHandle
      });

      const creatorPayload = res.data?.creator || res.creator || res.data;
      navigate('/onboard/pricing', { state: { creator: creatorPayload } });
    } catch (err) {
      showError(err.response?.data?.message || 'Could not connect to server — make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const isHandleValid = /^[a-zA-Z0-9_.]{3,30}$/.test(form.handle);
  const isPhoneValid = (() => {
    if (!form.phone) return false;
    const parsed = parsePhoneNumberFromString(form.phone);
    let countryCode, localValue;

    if (parsed && parsed.country) {
      countryCode = parsed.country;
      localValue = parsed.nationalNumber;
    } else {
      const matched = COUNTRIES.find(c => form.phone.startsWith(c.dialCode));
      if (matched) {
        countryCode = matched.code;
        localValue = form.phone.substring(matched.dialCode.length);
      }
    }

    if (!countryCode || !localValue) return false;
    return validatePhoneNumber(localValue, countryCode) === null;
  })();
  const canContinue = form.name.trim().length >= 2 &&
    isHandleValid &&
    isEmailValid &&
    isPhoneValid &&
    form.expertise.length >= 1 &&
    form.expertise.length <= 2 &&
    form.instagramFollowers.toString().trim().length > 0;

  if (loadingCreator) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0f',
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
      background: '#0a0a0f',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'visible',
      overflowX: 'hidden'
    }}>
      {/* Background Shader & Noise */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        background: '#0a0a0f',
        overflow: 'hidden',
        pointerEvents: 'none'
      }}>
        {/* Aurora purple, deep violet, electric blue waves */}
        <div style={{
          position: 'absolute',
          width: '180%',
          height: '180%',
          top: '-40%',
          left: '-40%',
          background: 'radial-gradient(circle at 30% 20%, rgba(124, 58, 237, 0.18) 0%, transparent 40%), radial-gradient(circle at 70% 80%, rgba(6, 182, 212, 0.18) 0%, transparent 40%), radial-gradient(circle at 50% 50%, rgba(147, 51, 234, 0.15) 0%, transparent 50%), radial-gradient(circle at 10% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 45%)',
          filter: 'blur(90px)',
          animation: 'aurora-flow 25s infinite alternate ease-in-out'
        }} />
        {/* Subtle noise/grain texture overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          opacity: 0.035,
          mixBlendMode: 'overlay',
          pointerEvents: 'none'
        }} />
        {/* Sparkle dots scattered */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div className="sparkle" style={{ top: '8%', left: '12%', animationDelay: '0s' }} />
          <div className="sparkle" style={{ top: '26%', left: '88%', animationDelay: '1.2s' }} />
          <div className="sparkle" style={{ top: '44%', left: '6%', animationDelay: '2.5s' }} />
          <div className="sparkle" style={{ top: '70%', left: '82%', animationDelay: '0.6s' }} />
          <div className="sparkle" style={{ top: '92%', left: '15%', animationDelay: '3.4s' }} />
        </div>
      </div>

      {/* CSS Keyframes and Animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes aurora-flow {
          0% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
          33% { transform: translate(20px, -30px) rotate(120deg) scale(1.05); }
          66% { transform: translate(-15px, 15px) rotate(240deg) scale(0.98); }
          100% { transform: translate(0px, 0px) rotate(360deg) scale(1); }
        }
        @keyframes sparkle-pulse {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2) rotate(45deg); }
        }
        .sparkle {
          position: absolute;
          width: 3px;
          height: 3px;
          background: #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 6px #06b6d4, 0 0 10px #7c3aed;
          animation: sparkle-pulse 4s infinite ease-in-out;
        }
        .gradient-title {
          font-family: var(--font-heading);
          font-size: 20px;
          font-weight: 800;
          background: linear-gradient(90deg, #7c3aed 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .continue-btn {
          width: 100%;
          max-width: 280px;
          padding: 14px 28px;
          border-radius: 9999px;
          background: linear-gradient(90deg, #7c3aed 0%, #06b6d4 100%);
          color: #ffffff;
          font-weight: 700;
          font-size: 14px;
          border: none;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2);
        }
        .continue-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 0 20px #7c3aed;
        }
        .continue-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .continue-btn:disabled {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          box-shadow: none;
          cursor: not-allowed;
        }
        .avatar-upload-circle {
          width: 76px;
          height: 76px;
          border-radius: 50%;
          border: 2px dashed #7c3aed;
          box-shadow: 0 0 10px rgba(124, 58, 237, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
          background: rgba(255, 255, 255, 0.03);
          transition: all 0.25s ease;
        }
        .avatar-upload-circle:hover {
          border-color: #06b6d4;
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.4);
        }
        .ig-connect-card {
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 16px;
          padding: 20px;
          margin-top: 12px;
          margin-bottom: 24px;
          text-align: center;
          position: relative;
          z-index: 1;
          box-sizing: border-box;
          width: 100%;
          max-width: 100%;
        }
        /* Custom Instagram border-gradient effect */
        .ig-connect-card::before {
          content: '';
          position: absolute;
          top: -1px; left: -1px; right: -1px; bottom: -1px;
          background: linear-gradient(45deg, #f09433, #dc2743, #bc1888);
          border-radius: 17px;
          z-index: -1;
          pointer-events: none;
        }
        .ig-connect-card::after {
          content: '';
          position: absolute;
          inset: 0px;
          background: #0a0a0f;
          border-radius: 16px;
          z-index: -1;
          pointer-events: none;
          opacity: 0.94;
        }
      `}} />

      {/* Main Page Container */}
      <div style={{
        width: '100%',
        maxWidth: '480px',
        minHeight: '100vh',
        padding: '16px 16px 100px', // padding-top set to 16px
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 1,
        overflow: 'visible'
      }}>
        
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
              height: '32px',
              marginBottom: '16px'
            }}>
              <button
                onClick={() => navigate('/')}
                style={{
                  position: 'absolute',
                  left: 0,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '50%',
                  color: '#ffffff',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  padding: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'translateX(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                ←
              </button>
              <div className="gradient-title" style={{ margin: '0 auto' }}>
                Connect & setup
              </div>
            </div>

            {/* PROGRESS BAR: 50% FILL VIOLET TO CYAN */}
            <div style={{
              width: '100%',
              height: '4px',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '999px',
              marginBottom: '20px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                width: '50%',
                background: 'linear-gradient(90deg, #7c3aed 0%, #06b6d4 100%)',
                borderRadius: '999px'
              }} />
            </div>

            {/* SCROLL CONTAINER FOR FORM */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              paddingRight: '4px',
              marginBottom: '24px'
            }}>
              
              {/* INSTAGRAM CONNECT CARD */}
              <div className="ig-connect-card" style={{ display: 'block' }}>
                {form.instagramConnected ? (
                  <div style={{ padding: '8px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="url(#ig-gradient)" stroke="none">
                        <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2z" opacity="0.1"/>
                        <path d="M16.25 2h-8.5A5.75 5.75 0 0 0 2 7.75v8.5A5.75 5.75 0 0 0 7.75 22h8.5A5.75 5.75 0 0 0 22 16.25v-8.5A5.75 5.75 0 0 0 16.25 2zm3.75 14.25A3.75 3.75 0 0 1 16.25 20h-8.5A3.75 3.75 0 0 1 4 16.25v-8.5A3.75 3.75 0 0 1 7.75 4h8.5A3.75 3.75 0 0 1 20 7.75v8.5z" fill="url(#ig-gradient)"/>
                        <path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" fill="url(#ig-gradient)"/>
                        <circle cx="17" cy="7" r="1.2" fill="url(#ig-gradient)"/>
                      </svg>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0', color: '#fff' }}>@{form.instagramHandle}</h3>
                    </div>
                    <p style={{ fontSize: '13px', color: '#06b6d4', margin: '0 0 16px', fontWeight: 600 }}>
                      {Number(form.instagramFollowers).toLocaleString()} Followers
                    </p>
                    <button 
                      onClick={handleInstagramConnect}
                      style={{
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#94a3b8',
                        padding: '6px 16px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        cursor: 'pointer'
                      }}
                    >
                      Reconnect Instagram
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: '16px' }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="url(#ig-gradient)" stroke="none">
                        <defs>
                          <linearGradient id="ig-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#f09433"/>
                            <stop offset="25%" stopColor="#e6683c"/>
                            <stop offset="50%" stopColor="#dc2743"/>
                            <stop offset="75%" stopColor="#cc2366"/>
                            <stop offset="100%" stopColor="#bc1888"/>
                          </linearGradient>
                        </defs>
                        <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2z" opacity="0.1"/>
                        <path d="M16.25 2h-8.5A5.75 5.75 0 0 0 2 7.75v8.5A5.75 5.75 0 0 0 7.75 22h8.5A5.75 5.75 0 0 0 22 16.25v-8.5A5.75 5.75 0 0 0 16.25 2zm3.75 14.25A3.75 3.75 0 0 1 16.25 20h-8.5A3.75 3.75 0 0 1 4 16.25v-8.5A3.75 3.75 0 0 1 7.75 4h8.5A3.75 3.75 0 0 1 20 7.75v8.5z" fill="url(#ig-gradient)"/>
                        <path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" fill="url(#ig-gradient)"/>
                        <circle cx="17" cy="7" r="1.2" fill="url(#ig-gradient)"/>
                      </svg>
                    </div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 8px', color: '#fff' }}>Connect Instagram</h3>
                    <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 16px', lineHeight: 1.4 }}>
                      Link your Instagram account to quickly set up your profile! We'll automatically fetch your profile photo, username, and follower count from Instagram.
                    </p>
                    <div title="Click here to authenticate with Meta and auto-fill your profile!">
                      <button 
                        onClick={handleInstagramConnect}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'linear-gradient(45deg, #f09433, #dc2743, #bc1888)',
                          border: 'none',
                          borderRadius: '999px',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '14px',
                          cursor: 'pointer',
                          boxShadow: '0 4px 15px rgba(220, 39, 67, 0.4)',
                          marginBottom: '12px'
                        }}
                      >
                        Connect @Instagram
                      </button>
                    </div>
                    <div style={{ fontSize: '9px', color: '#64748b' }}>
                      Read-only access. We never post on your behalf.
                    </div>
                  </>
                )}
              </div>



              {/* AVATAR UPLOAD CIRCLE — violet dashed glowing circle */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                <label style={{ cursor: 'pointer', textAlign: 'center' }}>
                  <div className="avatar-upload-circle">
                    {avatarPreview ? (
                      typeof avatarPreview === 'string' && avatarPreview.length === 1 ? (
                        <span style={{ fontSize: '26px', fontWeight: 'extrabold', color: '#ffffff' }}>{avatarPreview}</span>
                      ) : (
                        <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )
                    ) : (
                      <span style={{ fontSize: '24px', color: '#7c3aed', fontWeight: 800 }}>+</span>
                    )}
                    <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                  </div>
                  <span style={{
                    display: 'block',
                    fontSize: '10px',
                    color: '#06b6d4',
                    fontFamily: 'monospace, var(--font-mono)',
                    fontWeight: 700,
                    marginTop: '8px'
                  }}>
                    UPLOAD PHOTO
                  </span>
                </label>
              </div>

              {/* INPUTS CONTAINER */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div title={form.instagramConnected ? "Auto-filled from your connected Instagram account!" : "Enter your full name"}>
                  <Field
                    label="FULL NAME *"
                    value={form.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>

                <div title={form.instagramConnected ? "Auto-filled from your connected Instagram account!" : "Choose your unique Skriibe username"}>
                  <Field
                    label="USERNAME *"
                    subtitle={<>This will be your profile link that will be generated as: <br /> <span style={{ color: '#29C5F6' }}>https://skriibe.com/@{form.handle || 'username'}</span></>}
                    value={form.handle}
                    onChange={(e) => handleInputChange('handle', e.target.value.replace(/[^a-zA-Z0-9_.]/g, ''))}
                    placeholder=""
                    required
                  />
                </div>

                {/* CONNECTED INSTAGRAM MEDIA GRID */}
                {form.instagramConnected && (
                  <div style={{ marginTop: '12px', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>
                      Connected Media from @{form.instagramHandle || form.handle}
                    </h3>
                    
                    {(!instagramMedia || instagramMedia.length === 0) ? (
                      <div style={{ padding: '24px', textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', color: '#94a3b8', fontSize: '12px' }}>
                        No recent posts found.
                      </div>
                    ) : (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                        gap: '8px'
                      }}>
                        {instagramMedia.map((media) => (
                          <a key={media.id} href={media.permalink} target="_blank" rel="noopener noreferrer" style={{ display: 'block', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#1e293b', position: 'relative' }}>
                            <img 
                              src={media.media_type === 'VIDEO' || media.media_type === 'REEL' ? (media.thumbnail_url || media.media_url) : media.media_url} 
                              alt={media.caption || 'Instagram Post'} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            {(media.media_type === 'VIDEO' || media.media_type === 'REEL') && (
                              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="white" opacity="0.8">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            )}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {/* FIELD OF EXPERTISE TAG SELECTOR */}
                <div style={{ textAlign: 'left' }}>
                  <label style={{
                    fontFamily: 'monospace, var(--font-mono)',
                    fontSize: '10px',
                    color: '#06b6d4',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    display: 'block',
                    marginBottom: '10px',
                    fontWeight: 700
                  }}>
                    FIELD OF EXPERTISE <span style={{ color: '#ef4444' }}>*</span> (1–2)
                  </label>

                  {/* Selected tags */}
                  {form.expertise.length > 0 && (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      marginBottom: '12px',
                      padding: '12px',
                      background: '#0f0f1a',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)'
                    }}>
                      {form.expertise.map(tag => (
                        <span
                          key={tag}
                          onClick={() => handleToggleTag(tag)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'linear-gradient(90deg, #7c3aed 0%, #06b6d4 100%)',
                            color: '#ffffff',
                            padding: '4px 12px',
                            borderRadius: '999px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(124, 58, 237, 0.2)'
                          }}
                        >
                          {tag} <span style={{ fontWeight: 'extrabold' }}>×</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Tag options */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    {expertiseOptions.map(opt => {
                      const isSelected = form.expertise.includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleToggleTag(opt)}
                          style={{
                            padding: '8px 14px',
                            borderRadius: '999px',
                            fontSize: '11px',
                            fontWeight: 600,
                            fontFamily: 'var(--font-body)',
                            cursor: 'pointer',
                            background: isSelected ? 'rgba(6, 182, 212, 0.05)' : 'rgba(255, 255, 255, 0.04)',
                            color: isSelected ? '#06b6d4' : '#94a3b8',
                            border: `1px solid ${isSelected ? '#06b6d4' : 'rgba(255, 255, 255, 0.08)'}`,
                            transition: 'all 0.2s ease',
                            backdropFilter: 'blur(12px)'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                              e.currentTarget.style.color = '#ffffff';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                              e.currentTarget.style.color = '#94a3b8';
                            }
                          }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom 'Others' Input */}
                  {form.expertise.includes('Others') && (
                    <div style={{ marginTop: '12px', animation: 'fadeIn 0.2s ease-in-out', display: 'flex', gap: '8px' }}>
                      <input 
                        type="text"
                        placeholder="Please specify your expertise..."
                        value={customExpertise}
                        onChange={(e) => setCustomExpertise(e.target.value)}
                        style={{
                          flex: 1,
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(6, 182, 212, 0.3)',
                          borderRadius: '12px',
                          padding: '12px 16px',
                          color: '#ffffff',
                          fontSize: '12px',
                          fontFamily: 'var(--font-body)',
                          outline: 'none',
                          boxSizing: 'border-box',
                          boxShadow: '0 0 10px rgba(6, 182, 212, 0.1)',
                          transition: 'all 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#06b6d4'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(6, 182, 212, 0.3)'}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomExpertise();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomExpertise}
                        style={{
                          background: 'linear-gradient(90deg, #7c3aed 0%, #06b6d4 100%)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '0 20px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Done
                      </button>
                    </div>
                  )}
                </div>

                <Field
                  label="EMAIL *"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="you@example.com"
                  required
                />

                <Field
                  label="MOBILE NUMBER *"
                  type="phone"
                  value={form.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Local mobile number"
                  required
                />

                <Field
                  label="INSTAGRAM FOLLOWERS *"
                  type="text"
                  value={form.instagramFollowers || ''}
                  onChange={(e) => handleInputChange('instagramFollowers', e.target.value)}
                  placeholder="e.g. 10k"
                  required
                />

                {/* BIO TEXTAREA — styled exactly like Field */}
                <div style={{
                  background: '#0f0f1a',
                  border: `1px solid ${bioFocused ? '#7c3aed' : 'rgba(255, 255, 255, 0.08)'}`,
                  borderRadius: '12px',
                  padding: '14px 16px',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: bioFocused ? '0 0 10px rgba(124, 58, 237, 0.3)' : 'inset 0 2px 4px rgba(0,0,0,0.4)',
                  textAlign: 'left'
                }}>
                  <label style={{
                    fontFamily: 'monospace, var(--font-mono)',
                    fontSize: '10px',
                    color: '#06b6d4',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '6px',
                    display: 'block',
                    fontWeight: 700
                  }}>
                    BIO (OPTIONAL, MAX 200 CHARS)
                  </label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value.slice(0, 200))}
                    rows={2}
                    onFocus={() => setBioFocused(true)}
                    onBlur={() => setBioFocused(false)}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: '#ffffff',
                      fontSize: '14px',
                      fontFamily: 'var(--font-body)',
                      resize: 'none'
                    }}
                  />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginTop: '4px',
                    fontSize: '9px',
                    fontFamily: 'monospace, var(--font-mono)',
                    color: form.bio.length >= 180 ? '#ef4444' : '#94a3b8'
                  }}>
                    {form.bio.length}/200
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM CTA: STICKY TO BOTTOM */}
            <div style={{
              position: 'absolute',
              bottom: '16px',
              left: 0,
              right: 0,
              zIndex: 10,
              padding: '0 20px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <button
                onClick={handleContinue}
                disabled={loading}
                className="continue-btn"
              >
                {loading ? 'Saving...' : 'Continue →'}
              </button>
              {error && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  color: '#f87171',
                  fontSize: '12px',
                  lineHeight: '1.5',
                  fontFamily: 'var(--font-body)',
                  textAlign: 'center'
                }}>
                  {error}
                </div>
              )}
            </div>
          </div>
        </PhoneFrame>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          color: '#94a3b8',
          fontSize: '11px',
          fontFamily: 'var(--font-mono), monospace',
          marginTop: '24px',
          opacity: 0.75
        }}>
          Made with 🤍 from Skriibe
        </div>

      </div>

      {cropModalOpen && cropImageSrc && (
        <ImageCropperModal
          imageSrc={cropImageSrc}
          onCropComplete={handleCropComplete}
          onClose={() => {
            setCropModalOpen(false);
            setCropImageSrc(null);
          }}
        />
      )}
    </div>
  );
};

export default CreatorOnboardProfile;
