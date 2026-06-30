import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { mockCreator } from '../../mock/questions';
import { getMe } from '../../services/creatorApi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { switchRole } from '../../services/fanApi';
import ImageCropperModal from '../../components/common/ImageCropperModal';
import { getCurrencySymbol } from '../../utils/phoneValidation';

const CreatorSettings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = useRef(null);
  const avatarInputRef = useRef(null);
  const { setAuthData, roles } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, []);

  const [creator, setCreator] = useState(location.state?.creator || mockCreator);
  const [highlightPause, setHighlightPause] = useState(location.state?.highlightPause || false);
  const [pauseReason, setPauseReason] = useState('');
  const [customAlert, setCustomAlert] = useState(null);
  const currencySymbol = getCurrencySymbol(creator?.phone);

  useEffect(() => {
    if (highlightPause) {
      setTimeout(() => {
        const pauseBtn = document.getElementById('pause-page-container');
        if (pauseBtn) {
          pauseBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      const timer = setTimeout(() => {
        setHighlightPause(false);
        // Clear state so refresh doesn't trigger it again
        navigate(location.pathname, { replace: true, state: {} });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [highlightPause, navigate, location.pathname]);

  useEffect(() => {
    const fetchCreator = async () => {
      try {
        const res = await getMe();
        if (res.success) {
          setCreator(prev => ({ ...prev, ...res.creator }));
        } else {
          navigate('/creator/login');
        }
      } catch (error) {
        console.error('Failed to fetch creator:', error);
        navigate('/creator/login');
      }
    };
    // Always fetch latest data from backend
    fetchCreator();
  }, [location.state?.creator]);

  const [questionPrice, setQuestionPrice] = useState(creator.price || creator.pricePerQuestion);
  const [dailyCap, setDailyCap] = useState(creator.dailyCap || 50);

  const [isPaused, setIsPaused] = useState(creator.isPaused || false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const formattedFollowers = creator.instagramFollowers 
    ? (creator.instagramFollowers >= 1000 ? (creator.instagramFollowers/1000).toFixed(1).replace('.0', '') + 'K' : creator.instagramFollowers) 
    : '12K';
  const defaultBio = `${creator.expertise && creator.expertise.length > 0 ? creator.expertise[0] : 'Finance'} · ${formattedFollowers} followers`;
  const [bio, setBio] = useState(creator.bio || defaultBio);
  
  const [expertiseList, setExpertiseList] = useState(creator.expertise || []);
  const [isEditingExpertise, setIsEditingExpertise] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [customExpertise, setCustomExpertise] = useState('');

  const displayUserName = creator.name || creator.displayName || creator.handle || 'C';
  const [avatar, setAvatar] = useState(creator.avatarUrl || displayUserName[0].toUpperCase());
  
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [isEditingCap, setIsEditingCap] = useState(false);
  
  const [weeklyGoal, setWeeklyGoal] = useState(creator.weeklyGoal || 1500);
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  const [phone, setPhone] = useState(creator.phone || '+91 98765 43210');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  
  const [instagram, setInstagram] = useState(creator.instagramHandle || `@${creator.handle || 'creator'}`);
  const [isEditingInstagram, setIsEditingInstagram] = useState(false);
  
  const [email, setEmail] = useState(creator.email || '');
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  useEffect(() => {
    if (creator) {
      if (!isEditingPrice && (creator.price || creator.pricePerQuestion)) setQuestionPrice(creator.price || creator.pricePerQuestion);
      if (!isEditingCap && creator.dailyCap) setDailyCap(creator.dailyCap);
      if (!isEditingGoal && creator.weeklyGoal) setWeeklyGoal(creator.weeklyGoal);
      if (!isEditingBio && creator.bio) setBio(creator.bio);
      if (!isEditingPhone && creator.phone) setPhone(creator.phone);
      if (!isEditingEmail && creator.email) setEmail(creator.email);
      if (!isEditingInstagram) {
        if (creator.instagramHandle) setInstagram(creator.instagramHandle);
        else if (creator.handle) setInstagram(`@${creator.handle}`);
      }
      if (creator.avatarUrl) {
        setAvatar(creator.avatarUrl);
      } else {
        const dName = creator.name || creator.displayName || creator.handle || 'C';
        setAvatar(dName[0].toUpperCase());
      }
      if (creator.isPaused !== undefined) setIsPaused(creator.isPaused);
      if (!isEditingExpertise && creator.expertise) setExpertiseList(creator.expertise);
    }
  }, [creator, isEditingPrice, isEditingCap, isEditingGoal, isEditingBio, isEditingPhone, isEditingEmail, isEditingInstagram, isEditingExpertise]);
  const emailContainerRef = useRef(null);

  useEffect(() => {
    const handleEmailClickOutside = (event) => {
      if (emailContainerRef.current && !emailContainerRef.current.contains(event.target)) {
        setIsEditingEmail(false);
      }
    };
    if (isEditingEmail) {
      document.addEventListener('mousedown', handleEmailClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleEmailClickOutside);
    };
  }, [isEditingEmail]);

  const [isCopied, setIsCopied] = useState(false);
  const [isPausedFeedback, setIsPausedFeedback] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [deleteModalStep, setDeleteModalStep] = useState(0); // 0: closed, 1: confirm, 2: deleting
  const [deleteInputValue, setDeleteInputValue] = useState('');
  
  const [isAccountDeleted, setIsAccountDeleted] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);

  useEffect(() => {
    if (isAccountDeleted) {
      const timer = setTimeout(() => {
        navigate('/', { replace: true, state: { accountDeleted: true } });
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [isAccountDeleted, navigate]);

  if (isAccountDeleted) {
    return (
      <div style={{
        width: '390px', height: '100vh', background: '#0E0E0E', color: '#FFFFFF',
        fontFamily: 'sans-serif', position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto', borderLeft: '1px solid #1A1A1A', borderRight: '1px solid #1A1A1A',
        padding: '24px', boxSizing: 'border-box', textAlign: 'center'
      }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%', background: '#16161e',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
            <path d="m12 13-1-1 2-2-3-3 2-2"></path>
          </svg>
        </div>
        <h2 style={{ margin: '0 0 12px', fontSize: '1.5rem', fontWeight: 700 }}>Account deleted</h2>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.5' }}>
          Sorry to see you go. All your messages, earnings, and profile data have been permanently removed.
        </p>
      </div>
    );
  }

  const handleEditAvatarClick = () => {
    if (creator.avatarUrl) {
      setShowAvatarMenu(prev => !prev);
    } else {
      avatarInputRef.current?.click();
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setCustomAlert("Image must be smaller than 5 Megabytes.");
        return;
      }
      const url = URL.createObjectURL(file);
      setCropImageSrc(url);
    }
    setShowAvatarMenu(false);
    if (avatarInputRef.current) avatarInputRef.current.value = '';
  };

  const handleCropComplete = async (blob) => {
    setCropImageSrc(null);
    const url = URL.createObjectURL(blob);
    setAvatar(url);
    
    try {
      const formData = new FormData();
      formData.append('avatar', blob, 'avatar.webp');
      const response = await api.post('/creators/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        setCreator(prev => ({ ...prev, avatarUrl: response.data.avatarUrl }));
      }
    } catch (err) {
      console.error('Failed to upload avatar', err);
    }
  };

  const openCropCurrent = () => {
    setCropImageSrc(creator.avatarUrl);
    setShowAvatarMenu(false);
  };
  
  const handleSaveBio = async () => {
    try {
      await api.post('/creators/settings', { bio });
      setIsEditingBio(false);
      setCreator(prev => ({ ...prev, bio }));
    } catch (err) {
      console.error('Failed to save bio', err);
    }
  };

  const handleSaveExpertise = async () => {
    if (expertiseList.length < 1) {
      setCustomAlert("Please select at least 1 expertise.");
      return;
    }
    if (expertiseList.length > 2) {
      setCustomAlert("You can select a maximum of 2 expertises.");
      return;
    }
    try {
      const finalExpertise = expertiseList.map(t => t === 'Others' ? (customExpertise.trim() || 'Others') : t);
      await api.post('/creators/settings', { expertise: finalExpertise });
      setIsEditingExpertise(false);
      setExpertiseList(finalExpertise);
      setCreator(prev => ({ ...prev, expertise: finalExpertise }));
    } catch (err) {
      console.error('Failed to save expertise', err);
    }
  };

  const handleSaveGoal = async () => {
    if (Number(weeklyGoal) < 100) {
      setCustomAlert("Weekly Earnings Goal cannot be less than 100.");
      return;
    }
    if (Number(weeklyGoal) > 20000) {
      setCustomAlert("Weekly Earnings Goal cannot be more than 20,000.");
      return;
    }
    try {
      await api.post('/creators/settings', { weeklyGoal: Number(weeklyGoal) });
      setIsEditingGoal(false);
      setCreator(prev => ({ ...prev, weeklyGoal: Number(weeklyGoal) }));
    } catch (err) {
      console.error('Failed to save goal', err);
    }
  };

  const handleSavePrice = async () => {
    try {
      await api.post('/creators/settings', { pricePerQuestion: Number(questionPrice) });
      setIsEditingPrice(false);
      setCreator(prev => ({ ...prev, price: Number(questionPrice), pricePerQuestion: Number(questionPrice) }));
    } catch (err) {
      console.error('Failed to save price', err);
    }
  };

  const handleSaveCap = async () => {
    if (Number(dailyCap) < 10) {
      setCustomAlert("Daily Message Cap cannot be less than 10.");
      return;
    }
    if (Number(dailyCap) > 100) {
      setCustomAlert("Daily Message Cap cannot be more than 100.");
      return;
    }
    try {
      await api.post('/creators/settings', { dailyCap: Number(dailyCap) });
      setIsEditingCap(false);
      setCreator(prev => ({ ...prev, dailyCap: Number(dailyCap) }));
    } catch (err) {
      console.error('Failed to save cap', err);
    }
  };

  const handleSavePhone = async () => {
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      setCustomAlert("Phone number must have at least 10 digits.");
      return;
    }
    try {
      await api.post('/creators/settings', { phone });
      setIsEditingPhone(false);
      setCreator(prev => ({ ...prev, phone }));
    } catch (err) {
      console.error('Failed to save phone', err);
    }
  };

  const handleSaveInstagram = async () => {
    try {
      await api.post('/creators/settings', { instagramHandle: instagram });
      setIsEditingInstagram(false);
      setCreator(prev => ({ ...prev, instagramHandle: instagram }));
    } catch (err) {
      console.error('Failed to save instagram', err);
    }
  };

  const handleSaveEmail = async () => {
    const lowerEmail = email.toLowerCase();
    if (!lowerEmail.includes('@') || !lowerEmail.includes('gmail.com')) {
      setCustomAlert("Email must include @ and gmail.com");
      return;
    }
    try {
      await api.post('/creators/settings', { email });
      setIsEditingEmail(false);
      setCreator(prev => ({ ...prev, email }));
    } catch (err) {
      console.error('Failed to save email', err);
    }
  };

  const handleTogglePause = () => {
    setShowPauseModal(true);
  };

  const handleConfirmPause = async (newPausedState) => {
    try {
      if (newPausedState && !pauseReason.trim()) {
        alert("Please provide a reason for pausing your account.");
        return;
      }
      await api.post('/creators/settings', { 
        isPaused: newPausedState,
        pauseReason: newPausedState ? pauseReason : ''
      });
      setIsPaused(newPausedState);
      setCreator(prev => ({ ...prev, isPaused: newPausedState }));
      if (!newPausedState) {
        setPauseReason('');
      }
    } catch (err) {
      console.error('Failed to update pause state', err);
    } finally {
      setShowPauseModal(false);
    }
  };

  // Cyan filter for active bottom nav icons
  const cyanFilter = 'invert(69%) sepia(87%) saturate(2714%) hue-rotate(164deg) brightness(99%) contrast(98%)';
  const grayFilter = 'invert(31%) sepia(13%) saturate(760%) hue-rotate(181deg) brightness(96%) contrast(85%)';

  const navItems = [
    { label: 'HOME', icon: '🏠', route: '/creator/dashboard' },
    { label: 'INBOX', icon: '💬', route: '/creator/inbox' },
    { label: 'PAYOUTS', icon: '💰', route: '/creator/payouts' },
    { label: 'SETTINGS', icon: '⚙️', route: '/creator/settings' },
  ];

  return (
    <div ref={scrollRef} style={{
      minHeight: '100vh',
      background: '#0E0E0E',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxSizing: 'border-box',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Container to restrict width */}
      <div style={{
        width: '100%',
        maxWidth: '390px',
        padding: '24px 20px 0',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <div 
            onClick={() => navigate('/creator/dashboard')}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              border: '1px solid #2A2A2A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <span style={{ fontSize: '1.2rem', color: '#94a3b8', marginTop: '-2px' }}>‹</span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 auto', paddingRight: '40px' }}>
            Settings
          </h2>
        </div>

        {/* Profile Card */}
        <div style={{
          background: 'linear-gradient(135deg, #1A2235 0%, #0F172A 100%)',
          borderRadius: '24px',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}>
          {/* Abstract circles */}
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '150px', height: '150px', borderRadius: '50%', background: '#253B75', opacity: 0.5 }} />
          <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '120px', height: '120px', borderRadius: '50%', background: '#0F2C3A', opacity: 0.6 }} />
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
            {/* Avatar */}
            <div style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }} onClick={handleEditAvatarClick}>
              <input 
                type="file" 
                ref={avatarInputRef} 
                onChange={handleAvatarChange} 
                style={{ display: 'none' }} 
                accept="image/*" 
              />
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #4ADE80 0%, #2DD4BF 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                color: '#0E0E0E', fontWeight: '900', fontSize: '24px'
              }}>
                {(() => {
                  const getFullAvatarUrl = (url) => {
                    if (!url) return '';
                    if (url.startsWith('blob:')) return url;
                    const backendBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
                    if (url.startsWith('http://localhost:5000')) {
                      return url.replace('http://localhost:5000', backendBase);
                    }
                    if (url.startsWith('/uploads')) {
                      return `${backendBase}${url}`;
                    }
                    return url;
                  };
                  const finalAvatarUrl = creator.avatarUrl ? getFullAvatarUrl(creator.avatarUrl) : '';
                  return finalAvatarUrl ? (
                    <img 
                      src={finalAvatarUrl} 
                      alt="" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) {
                          e.target.nextSibling.style.display = 'block';
                        }
                      }}
                    />
                  ) : null;
                })()}
                <div style={{ display: creator.avatarUrl ? 'none' : 'block' }}>
                  {avatar.substring(0, 1).toUpperCase()}
                </div>
              </div>
              <div style={{
                position: 'absolute', bottom: '0px', right: '0px', width: '24px', height: '24px', borderRadius: '50%',
                background: '#6366F1', border: '2px solid #0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
              </div>
              {showAvatarMenu && (
                <div style={{
                  position: 'absolute', top: '80px', left: '0', background: '#1E293B',
                  borderRadius: '12px', padding: '8px', zIndex: 100, border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '4px', width: '150px'
                }}>
                  <button onClick={() => { avatarInputRef.current?.click(); setShowAvatarMenu(false); }} style={{
                    background: 'none', border: 'none', color: '#FFF', padding: '8px', textAlign: 'left',
                    borderRadius: '8px', cursor: 'pointer', fontSize: '13px'
                  }} onMouseOver={e => e.target.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={e => e.target.style.background = 'none'}>
                    Upload New Photo
                  </button>
                  <button onClick={openCropCurrent} style={{
                    background: 'none', border: 'none', color: '#FFF', padding: '8px', textAlign: 'left',
                    borderRadius: '8px', cursor: 'pointer', fontSize: '13px'
                  }} onMouseOver={e => e.target.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={e => e.target.style.background = 'none'}>
                    Crop Current Photo
                  </button>
                </div>
              )}
            </div>

            {/* Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
                {creator.name || creator.displayName || creator.handle || ''}
              </div>
              <div style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
                {creator.handle || creator.username ? `skriibe.com/${creator.handle || creator.username}` : ''}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                {expertiseList.map((exp, idx) => (
                  <div 
                    key={idx}
                    style={{ 
                      background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)',
                      borderRadius: '12px', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '6px',
                      color: '#A5B4FC', fontSize: '0.85rem', fontWeight: 600
                    }}
                  >
                    {exp}
                  </div>
                ))}
              </div>
              
              <div style={{ color: '#E2E8F0', fontSize: '0.9rem', lineHeight: '1.5', marginTop: '8px' }}>
                {creator.instagramFollowers >= 1000 ? (creator.instagramFollowers/1000).toFixed(1).replace('.0', '') + 'K' : (creator.instagramFollowers || 0)} followers
              </div>


            </div>
          </div>

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', width: '100%', position: 'relative', zIndex: 1 }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1, padding: '4px 0' }}>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '4px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF' }}>{currencySymbol}{questionPrice}</span>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Per question</span>
            </div>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.08)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '4px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF' }}>{dailyCap}</span>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Daily cap</span>
            </div>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.08)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '4px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF' }}>{currencySymbol}{weeklyGoal}</span>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Weekly goal</span>
            </div>
          </div>
        </div>

        {/* VIEW MY PAGE CTA */}
        <button 
          onClick={async () => {
            if (isEditingBio) await handleSaveBio();
            if (isEditingPrice) await handleSavePrice();
            if (isEditingCap) await handleSaveCap();
            if (isEditingGoal) await handleSaveGoal();

            const username = creator?.handle || creator?.username;
            if (username) navigate(`/creator/${username}?preview=true`);
          }}
          style={{
            background: '#202020',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '16px',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'background 0.2s',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          <span style={{ fontSize: '1.1rem', fontWeight: '700' }}>Preview page</span>
        </button>

        <button 
          onClick={() => navigate('/dashboard/share', { state: { creator, openQR: true, returnToSettings: true } })}
          style={{
            background: '#202020',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '16px',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'background 0.2s',
            width: '100%',
            boxSizing: 'border-box',
            marginTop: '8px'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          <span style={{ fontSize: '1.1rem', fontWeight: '700' }}>Share profile</span>
        </button>

        {/* AMA SETTINGS SECTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38BDF8' }} />
            AMA SETTINGS
          </div>

          <div style={{
            background: '#16161e',
            borderRadius: '20px',
            border: '1px solid #2A2A2A',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Question Price Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #2A2A2A' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38BDF8', fontWeight: 700, fontSize: '1.1rem' }}>
                  {currencySymbol}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ color: '#ffffff', fontSize: '0.85rem', fontWeight: 700 }}>Question price</div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem' }}>What fans pay per message.</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {isEditingPrice ? (
                  <>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <span style={{ position: 'absolute', left: '10px', color: '#94a3b8', fontSize: '0.85rem' }}>{currencySymbol}</span>
                      <input 
                        type="text" 
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={questionPrice} 
                        onChange={(e) => setQuestionPrice(e.target.value)}
                        style={{
                          background: '#16161e',
                          border: '1px solid #29C5F6',
                          color: '#ffffff',
                          borderRadius: '8px',
                          padding: '8px 10px 8px 24px',
                          fontSize: '0.85rem',
                          width: '70px',
                          outline: 'none',
                          fontWeight: 600,
                          boxSizing: 'border-box'
                        }}
                        autoFocus
                      />
                    </div>
                    <button 
                      onClick={handleSavePrice}
                      style={{
                        background: '#38BDF8', border: 'none', color: '#0E0E0E',
                        borderRadius: '12px', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer'
                      }}
                    >Save</button>
                  </>
                ) : (
                  <>
                    <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.9rem' }}>{currencySymbol}{questionPrice}</span>
                    <button 
                      onClick={() => setIsEditingPrice(true)}
                      style={{
                        background: '#252530', border: 'none', color: '#ffffff', borderRadius: '12px', padding: '8px 14px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer'
                      }}
                    >Edit</button>
                  </>
                )}
              </div>
            </div>

            {/* Daily Question Cap Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #2A2A2A' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A855F7' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ color: '#ffffff', fontSize: '0.85rem', fontWeight: 700 }}>Daily message cap</div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Max messages you'll take a day</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {isEditingCap ? (
                  <>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={dailyCap} 
                        onChange={(e) => {
                          if (e.target.value === '') {
                            setDailyCap('');
                            return;
                          }
                          let val = parseInt(e.target.value.replace(/\D/g, ''));
                          if (isNaN(val)) return;
                          if (val > 100) val = 100;
                          setDailyCap(val.toString());
                        }}
                        style={{
                          background: '#16161e', border: '1px solid #29C5F6', color: '#ffffff',
                          borderRadius: '8px', padding: '8px 10px', fontSize: '0.85rem', width: '60px',
                          outline: 'none', fontWeight: 600, boxSizing: 'border-box', textAlign: 'center'
                        }}
                        autoFocus
                      />
                    </div>
                    <button 
                      onClick={handleSaveCap}
                      style={{
                        background: '#38BDF8', border: 'none', color: '#0E0E0E',
                        borderRadius: '12px', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer'
                      }}
                    >Save</button>
                  </>
                ) : (
                  <>
                    <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.9rem' }}>{dailyCap} / day</span>
                    <button 
                      onClick={() => setIsEditingCap(true)}
                      style={{
                        background: '#252530', border: 'none', color: '#ffffff', borderRadius: '12px', padding: '8px 14px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer'
                      }}
                    >Edit</button>
                  </>
                )}
              </div>
            </div>



            {/* Weekly Goal Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #2A2A2A' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38BDF8' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ color: '#ffffff', fontSize: '0.85rem', fontWeight: 700 }}>Set your Weekly Earnings Goal</div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Set your target</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {isEditingGoal ? (
                  <>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <span style={{ position: 'absolute', left: '12px', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500 }}>{currencySymbol}</span>
                      <input 
                        type="number" 
                        value={weeklyGoal} 
                        onChange={(e) => setWeeklyGoal(e.target.value)}
                        style={{
                          background: '#16161e', border: '1px solid #29C5F6', color: '#ffffff',
                          borderRadius: '8px', padding: '8px 10px 8px 24px', fontSize: '0.85rem', width: '80px',
                          outline: 'none', fontWeight: 600, boxSizing: 'border-box'
                        }}
                        autoFocus
                      />
                    </div>
                    <button 
                      onClick={handleSaveGoal}
                      style={{
                        background: '#38BDF8', border: 'none', color: '#0E0E0E',
                        borderRadius: '12px', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer'
                      }}
                    >Save</button>
                  </>
                ) : (
                  <>
                    <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.9rem' }}>{currencySymbol}{weeklyGoal}</span>
                    <button 
                      onClick={() => setIsEditingGoal(true)}
                      style={{
                        background: '#252530', border: 'none', color: '#ffffff', borderRadius: '12px', padding: '8px 14px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer'
                      }}
                    >Edit</button>
                  </>
                )}
              </div>
            </div>

            {/* Expertise Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #2A2A2A' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366F1' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ color: '#ffffff', fontSize: '0.85rem', fontWeight: 700 }}>Expertise</div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Your creator categories</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {isEditingExpertise ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', position: 'relative' }}>
                    
                    {/* Custom Dropdown Trigger */}
                    <div 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      style={{
                        background: '#16161e', border: '1px solid #29C5F6', color: '#ffffff',
                        borderRadius: '8px', padding: '8px 12px', fontSize: '0.85rem', width: '200px',
                        outline: 'none', fontWeight: 600, boxSizing: 'border-box', cursor: 'pointer',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}
                    >
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {expertiseList.length > 0 ? expertiseList.join(', ') : 'Select...'}
                      </span>
                      <span style={{ fontSize: '0.75rem', marginLeft: '8px', color: '#94a3b8' }}>▼</span>
                    </div>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <div style={{
                        position: 'absolute', top: '44px', right: '0', background: '#16161e',
                        border: '1px solid #2A2A2A', borderRadius: '8px', padding: '8px',
                        display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 10, width: '200px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
                      }}>
                          {Array.from(new Set([
                          'Career & Finance', 'Health & Fitness', 'Tech & Skills',
                          'Fashion & Lifestyle', 'Daily Vlogs & Entertainment',
                          'Education', 'Business & Entrepreneurship',
                          'Relationships & Life', 'Spirituality', 'Others',
                          ...expertiseList
                        ])).filter(cat => cat !== 'General').map(cat => (
                          <label key={cat} style={{ 
                            display: 'flex', alignItems: 'center', gap: '8px', padding: '6px', 
                            borderRadius: '4px', fontSize: '13px', 
                            cursor: expertiseList.includes(cat) || expertiseList.length < 2 ? 'pointer' : 'not-allowed',
                            opacity: !expertiseList.includes(cat) && expertiseList.length >= 2 ? 0.5 : 1,
                            background: 'rgba(255,255,255,0.02)'
                          }}>
                            <input 
                              type="checkbox" 
                              checked={expertiseList.includes(cat)}
                              disabled={!expertiseList.includes(cat) && expertiseList.length >= 2}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  if (expertiseList.length < 2) setExpertiseList([...expertiseList, cat]);
                                } else {
                                  setExpertiseList(expertiseList.filter(c => c !== cat));
                                }
                              }}
                            />
                            {cat}
                          </label>
                        ))}

                        {expertiseList.includes('Others') && (
                          <input
                            type="text"
                            placeholder="Type custom expertise..."
                            value={customExpertise}
                            onChange={(e) => setCustomExpertise(e.target.value)}
                            style={{
                              background: '#16161e', border: '1px solid #29C5F6', color: '#ffffff',
                              borderRadius: '4px', padding: '6px 8px', fontSize: '13px', marginTop: '4px',
                              outline: 'none', width: '100%', boxSizing: 'border-box'
                            }}
                            autoFocus
                          />
                        )}
                        
                        {/* Action Buttons Inside Dropdown */}
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #2A2A2A' }}>
                          <button onClick={() => { setExpertiseList([]); setCustomExpertise(''); }} style={{ flex: 1, background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '8px', padding: '6px', fontSize: '0.75rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>Clear All</button>
                          <button onClick={() => { setIsEditingExpertise(false); setIsDropdownOpen(false); setExpertiseList(creator.expertise || []); }} style={{ flex: 1, background: 'transparent', border: '1px solid #475569', color: '#94a3b8', borderRadius: '8px', padding: '6px', fontSize: '0.75rem', cursor: 'pointer' }}>Cancel</button>
                          <button onClick={() => { handleSaveExpertise(); setIsDropdownOpen(false); }} style={{ flex: 1, background: '#38BDF8', border: 'none', color: '#0E0E0E', borderRadius: '8px', padding: '6px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>Save</button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.85rem', textAlign: 'right', maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {expertiseList.length > 0 ? expertiseList.join(', ') : 'None'}
                      </span>
                    </div>
                    <button 
                      onClick={() => { setIsEditingExpertise(true); setIsDropdownOpen(true); }}
                      style={{
                        background: '#252530', border: 'none', color: '#ffffff', borderRadius: '12px', padding: '8px 14px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer'
                      }}
                    >Edit</button>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ACCOUNT & SECURITY SECTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#c026d3' }} />
            ACCOUNT & SECURITY
          </div>
          
          <div style={{
            background: '#16161e',
            borderRadius: '20px',
            border: '1px solid #2A2A2A',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Phone number */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #2A2A2A' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38BDF8' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ color: '#ffffff', fontSize: '0.85rem', fontWeight: 700 }}>Phone number</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {isEditingPhone ? (
                  <>
                    <input 
                      type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                      onFocus={(e) => {
                        const target = e.target;
                        setTimeout(() => target.setSelectionRange(0, 0), 0);
                      }}
                      style={{ background: '#16161e', border: '1px solid #29C5F6', color: '#ffffff', borderRadius: '8px', padding: '8px', fontSize: '0.85rem', width: '120px', outline: 'none', fontWeight: 500, fontFamily: 'monospace' }} autoFocus
                    />
                    <button style={{ background: '#38BDF8', border: 'none', color: '#0E0E0E', borderRadius: '12px', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }} onClick={handleSavePhone}>Save</button>
                  </>
                ) : (
                  <>
                    <span style={{ color: '#64748b', fontWeight: 500, fontFamily: 'monospace, Consolas', fontSize: '0.85rem' }}>
                      {phone.length === 10 && !phone.includes('+') ? `+91 ${phone.substring(0, 5)} ${phone.substring(5, 10)}` : phone}
                    </span>
                    <button style={{ background: '#252530', border: 'none', color: '#ffffff', borderRadius: '12px', padding: '8px 14px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }} onClick={() => setIsEditingPhone(true)}>Edit</button>
                  </>
                )}
              </div>
            </div>
            
            {/* Email account */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #2A2A2A', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(234, 179, 8, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#eab308' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ color: '#ffffff', fontSize: '0.85rem', fontWeight: 700 }}>Email Address</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1, justifyContent: 'flex-end' }} ref={emailContainerRef}>
                {isEditingEmail ? (
                  <>
                    <input 
                      type="text" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={(e) => {
                        const target = e.target;
                        setTimeout(() => target.setSelectionRange(0, 0), 0);
                      }}
                      style={{ background: '#16161e', border: '1px solid #29C5F6', color: '#ffffff', borderRadius: '8px', padding: '8px', fontSize: '0.85rem', width: '100%', maxWidth: '160px', outline: 'none', fontWeight: 500, fontFamily: 'monospace' }} autoFocus
                    />
                    <button style={{ background: '#38BDF8', border: 'none', color: '#0E0E0E', borderRadius: '12px', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }} onClick={handleSaveEmail}>Save</button>
                  </>
                ) : (
                  <>
                    <span style={{ color: '#64748b', fontWeight: 500, fontFamily: 'monospace, Consolas', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</span>
                    <button style={{ background: '#252530', border: 'none', color: '#ffffff', borderRadius: '12px', padding: '8px 14px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }} onClick={() => setIsEditingEmail(true)}>{email ? 'Edit' : 'Add'}</button>
                  </>
                )}
              </div>
            </div>


            {/* Bank account */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(52, 211, 153, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ color: '#ffffff', fontSize: '0.85rem', fontWeight: 700 }}>Bank Account</div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{creator.bankLinked ? 'Linked' : 'Not linked'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button 
                  onClick={() => navigate('/creator/setup-payouts', { state: { creator } })}
                  style={{ background: '#252530', border: 'none', color: '#ffffff', borderRadius: '12px', padding: '8px 14px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  {creator.bankLinked ? 'Edit details' : 'Setup'}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* DANGER ZONE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 800, color: '#ef4444', letterSpacing: '1px', textTransform: 'uppercase' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
            DANGER ZONE
          </div>
          
          <div style={{
            background: '#1c161a',
            borderRadius: '20px',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            display: 'flex',
            flexDirection: 'column'
          }}>

            {/* Pause my page */}
            <div id="pause-page-container" style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', 
              borderBottom: '1px solid rgba(239, 68, 68, 0.2)',
              backgroundColor: highlightPause ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
              transition: 'background-color 1s ease'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 700 }}>Pause my page temporarily</div>
                <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Hide from discovery</div>
              </div>
              <button style={{
                background: isPaused ? '#ef4444' : 'transparent', border: '1px solid rgba(239, 68, 68, 0.3)', color: isPaused ? '#ffffff' : '#ef4444',
                borderRadius: '12px', padding: '8px 14px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', minWidth: '75px', justifyContent: 'center', transition: 'all 0.2s'
              }} onClick={handleTogglePause}>
                {isPaused ? 'Unpause' : 'Pause'}
              </button>
            </div>

            {/* Delete account */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 700 }}>Delete account</div>
                <div style={{ color: '#64748b', fontSize: '0.75rem' }}>This can't be undone</div>
              </div>
              <button style={{
                background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444',
                borderRadius: '12px', padding: '8px 14px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', minWidth: '75px', justifyContent: 'center'
              }} onClick={() => setDeleteModalStep(1)}>
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* ACCOUNT SWITCH & SIGN OUT */}
        <div style={{ paddingBottom: '100px', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <button 
              onClick={async () => {
                try {
                  const res = await switchRole('fan');
                  if (res.success) {
                    setAuthData(roles, 'fan', res.token);
                    window.location.href = '/discovery';
                  }
                } catch (err) {
                  setCustomAlert('Failed to switch to Fan mode');
                }
              }}
              style={{
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#38bdf8',
                padding: '12px 24px',
                borderRadius: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background 0.2s'
              }}
            >
              <span style={{ fontSize: '18px' }}>👤</span> Switch to Fan Mode →
            </button>

          <button style={{
            background: 'transparent', border: 'none', color: '#f87171',
            fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', marginTop: '8px'
          }} onClick={() => {
            localStorage.clear();
            window.location.href = '/';
          }}>
            Log out 
          </button>
        </div>
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
          const isActive = location.pathname === item.route;
          return (
            <div
              key={item.route}
              onClick={() => navigate(item.route, { state: { creator } })}
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



      {/* PAUSE MODAL */}
      {showPauseModal && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'flex-end', zIndex: 200
        }}>
          <div style={{
            background: '#16161e', width: '100%',
            borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
            padding: '24px 24px 40px', boxSizing: 'border-box',
            borderTop: '1px solid #2A2A2A',
            animation: 'slideUp 0.3s ease-out'
          }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', color: '#ffffff' }}>
              {isPaused ? 'Unpause your page?' : 'Pause your page?'}
            </h3>
            <p style={{ margin: '0 0 24px', color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5' }}>
              {isPaused 
                ? "Are you sure you want to unpause? Your profile will be visible and open for questions."
                : "Are you sure you want to pause your page? Your profile will be temporarily hidden from the discovery page and you won't be able to receive new questions until you unpause."
              }
            </p>
            {!isPaused && (
              <textarea
                value={pauseReason}
                onChange={(e) => setPauseReason(e.target.value)}
                placeholder="Please tell us why you are pausing your account..."
                style={{
                  width: '100%',
                  minHeight: '80px',
                  background: '#2A2A2A',
                  border: '1px solid #333',
                  borderRadius: '12px',
                  color: '#fff',
                  padding: '12px',
                  marginBottom: '24px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
            )}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={{
                flex: 1, background: '#2A2A2A', border: 'none', color: '#ffffff',
                padding: '12px', borderRadius: '12px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer'
              }} onClick={() => setShowPauseModal(false)}>Cancel</button>
              <button style={{
                flex: 1, background: isPaused ? '#10B981' : '#ef4444', border: 'none', color: '#ffffff',
                padding: '12px', borderRadius: '12px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer'
              }} onClick={() => handleConfirmPause(!isPaused)}>
                {isPaused ? 'Yes, unpause' : 'Yes, pause page'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModalStep > 0 && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'flex-end', zIndex: 200
        }}>
          <div style={{
            background: '#16161e', width: '100%',
            borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
            padding: '24px 24px 40px', boxSizing: 'border-box',
            borderTop: '1px solid #2A2A2A',
            animation: 'slideUp 0.3s ease-out'
          }}>
            {deleteModalStep === 1 ? (
              <>
                <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', color: '#ef4444' }}>Are you sure?</h3>
                <p style={{ margin: '0 0 24px', color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.4' }}>
                  This will permanently delete your account, all questions, and earnings data.
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button style={{
                    flex: 1, background: '#2A2A2A', border: 'none', color: '#ffffff',
                    padding: '12px', borderRadius: '12px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer'
                  }} onClick={() => setDeleteModalStep(0)}>Cancel</button>
                  <button style={{
                    flex: 1, background: '#ef4444', border: 'none', color: '#ffffff',
                    padding: '12px', borderRadius: '12px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer'
                  }} onClick={() => setDeleteModalStep(2)}>Yes, delete</button>
                </div>
              </>
            ) : (
              <>
                <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', color: '#ef4444' }}>Why are you leaving?</h3>
                <textarea
                  placeholder="Please tell us your reason for deleting your account..."
                  value={deleteInputValue}
                  onChange={(e) => setDeleteInputValue(e.target.value)}
                  style={{
                    width: '100%', background: '#0E0E0E', border: '1px solid #2A2A2A',
                    color: '#ffffff', padding: '12px', borderRadius: '12px',
                    fontSize: '1rem', outline: 'none', marginBottom: '24px',
                    boxSizing: 'border-box', minHeight: '100px', resize: 'vertical'
                  }}
                  autoFocus
                />
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button style={{
                    flex: 1, background: '#2A2A2A', border: 'none', color: '#ffffff',
                    padding: '12px', borderRadius: '12px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer'
                  }} onClick={() => { setDeleteModalStep(0); setDeleteInputValue(''); }}>Cancel</button>
                  <button style={{
                    flex: 1, 
                    background: deleteInputValue.trim().length > 0 ? '#ef4444' : '#2A2A2A', 
                    border: 'none', 
                    color: deleteInputValue.trim().length > 0 ? '#ffffff' : '#64748b',
                    padding: '12px', borderRadius: '12px', fontWeight: 600, fontSize: '0.85rem', 
                    cursor: deleteInputValue.trim().length > 0 ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease'
                  }} 
                  disabled={deleteInputValue.trim().length === 0}
                  onClick={async () => {
                    try {
                      await api.post('/creator/delete-account', { reason: deleteInputValue.trim() });
                    } catch(err) {
                      console.error("Failed to delete account", err);
                    }
                    localStorage.clear();
                    setIsAccountDeleted(true);
                  }}>Delete forever</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      {customAlert && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: '#15151D',
            border: '1px solid #232330',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#fff', marginBottom: '20px' }}>
              {customAlert}
            </div>
            <button 
              onClick={() => setCustomAlert(null)}
              style={{
                background: '#00FFA3',
                color: '#000',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '8px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {cropImageSrc && (
        <ImageCropperModal 
          imageSrc={cropImageSrc} 
          onCropComplete={handleCropComplete} 
          onClose={() => setCropImageSrc(null)} 
        />
      )}
      
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default CreatorSettings;
