import React, { useState, useEffect, useRef } from 'react';
import FanNavbar from '../../components/fan/layout/FanNavbar';
import FanBottomNav from '../../components/fan/layout/FanBottomNav';
import { getFanMe, switchRole, getFanHistory, updateFanProfile, upgradeToCreator } from '../../services/fanApi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ImageCropperModal from '../../components/common/ImageCropperModal';

const FanProfile = () => {
  const [fanProfile, setFanProfile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [switching, setSwitching] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);
  
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [savingPhone, setSavingPhone] = useState(false);
  const selectedQuestion = null;

  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const avatarInputRef = useRef(null);
  const menuRef = useRef(null);
  const menuContainerRef = useRef(null);
  const nameContainerRef = useRef(null);
  const emailContainerRef = useRef(null);
  const phoneContainerRef = useRef(null);

  const { roles, setAuthData } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getFanMe();
        if (res.success && res.fan) {
          setFanProfile(res.fan);
          setAuthData(res.fan.roles, res.fan.activeRole);
        }
      } catch (err) {
        console.error('Failed to fetch fan profile', err);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/questions/notifications');
        if (res.data.success && res.data.notifications) {
          const unread = res.data.notifications.filter(n => !n.isRead).length;
          setUnreadCount(unread);
        }
      } catch (err) {}
    };

    const fetchHistory = async () => {
      try {
        const res = await getFanHistory();
        if (res.success) {
          setQuestions(res.questions || []);
        }
      } catch (err) {}
    };

    fetchProfile();
    fetchNotifications();
    fetchHistory();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutsideAvatar = menuRef.current && !menuRef.current.contains(event.target);
      const isOutsideMenu = menuContainerRef.current && !menuContainerRef.current.contains(event.target);
      if (isOutsideAvatar && isOutsideMenu) {
        setShowAvatarMenu(false);
      }
    };
    if (showAvatarMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAvatarMenu]);

  useEffect(() => {
    const handleNameClickOutside = (event) => {
      if (nameContainerRef.current && !nameContainerRef.current.contains(event.target)) {
        setIsEditingName(false);
      }
    };
    const handleEmailClickOutside = (event) => {
      if (emailContainerRef.current && !emailContainerRef.current.contains(event.target)) {
        setIsEditingEmail(false);
      }
    };
    const handlePhoneClickOutside = (event) => {
      if (phoneContainerRef.current && !phoneContainerRef.current.contains(event.target)) {
        setIsEditingPhone(false);
      }
    };
    if (isEditingName) {
      document.addEventListener('mousedown', handleNameClickOutside);
    }
    if (isEditingEmail) {
      document.addEventListener('mousedown', handleEmailClickOutside);
    }
    if (isEditingPhone) {
      document.addEventListener('mousedown', handlePhoneClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleNameClickOutside);
      document.removeEventListener('mousedown', handleEmailClickOutside);
      document.removeEventListener('mousedown', handlePhoneClickOutside);
    };
  }, [isEditingName, isEditingEmail, isEditingPhone]);

  const handleSaveName = async () => {
    if (isEditingName) {
      const trimmed = (newName || '').trim();
      if (!trimmed) {
        setIsEditingName(false);
        return;
      }
      if (trimmed === fanProfile?.name) {
        setIsEditingName(false);
        return;
      }
      setSavingName(true);
      try {
        const payload = {
          name: trimmed,
          email: fanProfile?.email || undefined,
          phone: fanProfile?.phone || undefined
        };
        const res = await updateFanProfile(payload);
        if (res.success && res.fan) {
          setFanProfile(res.fan);
          setIsEditingName(false);

          // Update localStorage
          const firstName = res.fan.name ? res.fan.name.split(' ')[0] : trimmed;
          localStorage.setItem('cachedFanName', firstName);
          localStorage.setItem('skriibe_fan_name', firstName);
          localStorage.setItem('fanName', res.fan.name || trimmed);

          // Dispatch events for immediate cross-component sync
          window.dispatchEvent(new CustomEvent('fanProfileUpdated', {
            detail: { name: res.fan.name, firstName }
          }));
          window.dispatchEvent(new Event('storage'));

          setShowSuccessModal(true);
        }
      } catch (err) {
        setErrorMessage(err.response?.data?.message || 'Failed to update name');
      } finally {
        setSavingName(false);
      }
    } else {
      setNewName(fanProfile?.name || '');
      setIsEditingName(true);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image must be smaller than 5 Megabytes.");
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
    setFanProfile(prev => ({ ...prev, avatarUrl: url }));
    
    try {
      const formData = new FormData();
      formData.append('avatar', blob, 'avatar.webp');
      const response = await api.post('/fan-auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        setFanProfile(prev => ({ ...prev, avatarUrl: response.data.avatarUrl }));
      }
    } catch (err) {
      console.error('Failed to upload avatar', err);
    }
  };

  const openCropCurrent = () => {
    if (fanProfile?.avatarUrl) {
      setCropImageSrc(fanProfile.avatarUrl);
    }
    setShowAvatarMenu(false);
  };

  const getTimeAgo = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const today = new Date();
    if (d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()) {
      return 'Today';
    }
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      color: '#ffffff',
      fontFamily: 'Inter, var(--font-body, sans-serif)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <FanNavbar />
      
      <main style={{ flex: 1, padding: 'min(40px, 5vw)', maxWidth: '800px', margin: '0 auto', width: '100%', boxSizing: 'border-box', paddingBottom: '100px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '32px' }}>Your Profile</h1>
        
        {loading ? (
          <div style={{ color: '#94a3b8' }}>Loading profile...</div>
        ) : fanProfile ? (
          <>
          <div style={{
            background: '#13161C',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
                <div style={{ position: 'relative' }} ref={menuRef}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    minWidth: '60px',
                    borderRadius: '50%',
                    background: '#F59E0B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '1.5rem',
                    color: '#ffffff',
                    flexShrink: 0,
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    {fanProfile?.avatarUrl ? (
                      <img src={fanProfile.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      fanProfile?.name ? fanProfile.name.charAt(0).toUpperCase() : 'F'
                    )}
                  </div>
                  
                  {/* Edit Pencil Icon */}
                  <div 
                    onClick={() => {
                      if (fanProfile?.avatarUrl) {
                        setShowAvatarMenu(!showAvatarMenu);
                      } else {
                        avatarInputRef.current?.click();
                      }
                    }}
                    style={{
                      position: 'absolute',
                      bottom: '-2px',
                      right: '-2px',
                      background: '#1a1a24',
                      border: '1px solid #2A2A2A',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      zIndex: 2
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </div>
                  <input type="file" hidden accept="image/*" ref={avatarInputRef} onChange={handleAvatarChange} />


                </div>
                <div style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
                  <div ref={nameContainerRef} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    {isEditingName ? (
                      <input 
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        disabled={savingName}
                        placeholder="Your name"
                        onFocus={(e) => {
                          const target = e.target;
                          setTimeout(() => target.setSelectionRange(0, 0), 0);
                        }}
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: '#fff',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '18px',
                          fontWeight: '700',
                          width: '100%',
                          outline: 'none',
                          maxWidth: '250px'
                        }}
                        autoFocus
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter') {
                            handleSaveName();
                          } else if (e.key === 'Escape') {
                            setIsEditingName(false);
                          }
                        }}
                      />
                    ) : (
                      <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {fanProfile.name || 'Fan'}
                      </h2>
                    )}
                    <button 
                      onClick={handleSaveName}
                      disabled={savingName}
                      style={{
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#fff',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontWeight: '600',
                        cursor: savingName ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        opacity: savingName ? 0.6 : 1,
                        flexShrink: 0
                      }}
                    >
                      {!isEditingName && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                      )}
                      {isEditingName ? (savingName ? 'Saving...' : 'Save') : 'Edit'}
                    </button>
                  </div>
                  <div ref={emailContainerRef} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {isEditingEmail ? (
                      <input 
                        type="text"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        disabled={savingEmail}
                        onFocus={(e) => {
                          const target = e.target;
                          setTimeout(() => target.setSelectionRange(0, 0), 0);
                        }}
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: '#fff',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '14px',
                          width: '100%',
                          outline: 'none',
                          maxWidth: '250px'
                        }}
                        autoFocus
                      />
                    ) : (
                      <div style={{ color: '#94a3b8', fontSize: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fanProfile.email}</div>
                    )}
                    <button 
                      onClick={async () => {
                        if (isEditingEmail) {
                          if (!newEmail || newEmail === fanProfile.email) {
                            setIsEditingEmail(false);
                            return;
                          }
                          const lowerEmail = newEmail.toLowerCase();
                          if (!lowerEmail.includes('@') || !lowerEmail.includes('.')) {
                            alert('Please enter a valid email address.');
                            return;
                          }
                          setSavingEmail(true);
                          try {
                            const res = await updateFanProfile({ email: newEmail });
                            if (res.success) {
                              setFanProfile(res.fan);
                              setIsEditingEmail(false);
                            }
                          } catch (err) {
                            alert('Failed to update email');
                          } finally {
                            setSavingEmail(false);
                          }
                        } else {
                          setNewEmail(fanProfile.email);
                          setIsEditingEmail(true);
                        }
                      }}
                      disabled={savingEmail}
                      style={{
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#fff',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontWeight: '600',
                        cursor: savingEmail ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        opacity: savingEmail ? 0.6 : 1,
                        flexShrink: 0
                    }}>
                      {!isEditingEmail && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                      )}
                      {isEditingEmail ? (savingEmail ? 'Saving...' : 'Save') : 'Edit'}
                    </button>
                  </div>

                  <div ref={phoneContainerRef} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                    {isEditingPhone ? (
                      <input 
                        type="text"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        disabled={savingPhone}
                        onFocus={(e) => {
                          const target = e.target;
                          setTimeout(() => target.setSelectionRange(0, 0), 0);
                        }}
                        placeholder="+1 234 567 8900"
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: '#fff',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '14px',
                          width: '100%',
                          outline: 'none',
                          maxWidth: '250px'
                        }}
                        autoFocus
                      />
                    ) : (
                      <div style={{ color: '#94a3b8', fontSize: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fanProfile.phone || 'Add Phone Number'}</div>
                    )}
                    <button 
                      onClick={async () => {
                        if (isEditingPhone) {
                          if (!newPhone || newPhone === fanProfile.phone) {
                            setIsEditingPhone(false);
                            return;
                          }
                          const digitsOnly = newPhone.replace(/\D/g, '');
                          if (digitsOnly.length < 10) {
                            alert("Phone number must have at least 10 digits.");
                            return;
                          }
                          setSavingPhone(true);
                          try {
                            const res = await updateFanProfile({ phone: newPhone });
                            if (res.success) {
                              setFanProfile(res.fan);
                              setIsEditingPhone(false);
                            }
                          } catch (err) {
                            alert('Failed to update phone');
                          } finally {
                            setSavingPhone(false);
                          }
                        } else {
                          setNewPhone(fanProfile.phone || '');
                          setIsEditingPhone(true);
                        }
                      }}
                      disabled={savingPhone}
                      style={{
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#fff',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontWeight: '600',
                        cursor: savingPhone ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        opacity: savingPhone ? 0.6 : 1,
                        flexShrink: 0
                    }}>
                      {!isEditingPhone && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                      )}
                      {isEditingPhone ? (savingPhone ? 'Saving...' : 'Save') : 'Edit'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Inline Avatar Actions Menu (moved here to avoid overlap) */}
            {showAvatarMenu && (
              <div 
                ref={menuContainerRef}
                style={{
                background: '#1a1a24',
                border: '1px solid #2A2A2A',
                borderRadius: '12px',
                padding: '8px',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                flexWrap: 'wrap'
              }}>
                <button 
                  onClick={() => avatarInputRef.current?.click()}
                  style={{ background: 'transparent', border: 'none', color: '#ffffff', padding: '8px 12px', textAlign: 'center', cursor: 'pointer', borderRadius: '8px', fontSize: '0.9rem', whiteSpace: 'nowrap', fontWeight: '500' }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  Upload new photo
                </button>
                <div style={{ width: '1px', height: '24px', background: '#2A2A2A' }} />
                <button 
                  onClick={openCropCurrent}
                  style={{ background: 'transparent', border: 'none', color: '#ffffff', padding: '8px 12px', textAlign: 'center', cursor: 'pointer', borderRadius: '8px', fontSize: '0.9rem', whiteSpace: 'nowrap', fontWeight: '500' }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  Crop current photo
                </button>
              </div>
            )}
          </div>



          <div style={{
            background: '#13161C',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '32px',
            marginTop: '48px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            <div>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '14px', fontWeight: '700', letterSpacing: '1px', color: '#64748b', textTransform: 'uppercase' }}>Account Settings</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>





                <button 
                  onClick={() => {
                    localStorage.clear();
                    window.location.href = '/fan/login';
                  }}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: '1px solid rgba(239, 68, 68, 0.5)',
                    color: '#ef4444',
                    padding: '16px',
                    borderRadius: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    fontSize: '16px',
                    transition: 'background 0.2s',
                    marginBottom: '8px'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  Log Out
                </button>

                <button 
                  onClick={async () => {
                    const confirmDelete = window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone.");
                    if (confirmDelete) {
                      const reason = window.prompt("Please tell us why you are leaving (optional):", "");
                      if (reason !== null) {
                        try {
                          const res = await api.delete('/fan-auth/profile', { data: { reason } });
                          if (res.data.success) {
                            localStorage.clear();
                            window.location.href = '/fan/login';
                          } else {
                            alert(res.data.message || 'Failed to delete account');
                          }
                        } catch (err) {
                          alert(err.response?.data?.message || 'Error deleting account');
                        }
                      }
                    }
                  }}
                  style={{
                    width: '100%',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: 'none',
                    color: '#ef4444',
                    padding: '16px',
                    borderRadius: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    fontSize: '16px',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                >
                  Delete Account
                </button>
              </div>
              </div>
            </div>
          </>
        ) : (
          <div style={{ color: '#ef4444' }}>Could not load profile.</div>
        )}
      </main>

      <FanBottomNav />
      {cropImageSrc && (
        <ImageCropperModal 
          imageSrc={cropImageSrc} 
          onCropComplete={handleCropComplete} 
          onClose={() => setCropImageSrc(null)} 
        />
      )}

      {selectedQuestion && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#13161C',
            width: '100%',
            maxWidth: '500px',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '24px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <button 
                onClick={() => setSelectedQuestion(null)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#fff',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Back
              </button>
              <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Message Details</div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '12px', color: '#38bdf8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                Your Message
              </div>
              <div style={{ fontSize: '16px', lineHeight: '1.6', color: '#fff', background: 'rgba(56, 189, 248, 0.05)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(56, 189, 248, 0.1)' }}>
                {selectedQuestion.questionText}
              </div>
            </div>

            {(selectedQuestion.status === 'answered' || selectedQuestion.status === 'satisfied') && selectedQuestion.answerText && (
              <div>
                <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2z"></path><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"></path></svg>
                  Creator's Answer
                </div>
                <div style={{ fontSize: '16px', lineHeight: '1.6', color: '#fff', background: 'rgba(16, 185, 129, 0.05)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                  {selectedQuestion.answerText}
                </div>
              </div>
            )}
            
            {selectedQuestion.status === 'rejected' && selectedQuestion.rejectReason && (
              <div>
                <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Reason for Rejection</div>
                <div style={{ fontSize: '15px', lineHeight: '1.6', color: '#fff', background: 'rgba(239, 68, 68, 0.05)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                  {selectedQuestion.rejectReason}
                </div>
              </div>
            )}
            
            {selectedQuestion.status === 'flagged' && (
              <div>
                <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Flagged / Under Review</div>
                <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#cbd5e1', background: 'rgba(245, 158, 11, 0.05)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
                  This message has been flagged for review. Our team will look into it shortly.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Name Updated Success Modal */}
      {showSuccessModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#13161C',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '32px 28px',
            maxWidth: '380px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981',
              marginBottom: '4px'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>

            <h3 style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: '700',
              color: '#ffffff'
            }}>
              Name updated successfully
            </h3>

            <p style={{
              margin: 0,
              fontSize: '14px',
              color: '#94a3b8',
              lineHeight: '1.5'
            }}>
              Your profile name has been updated and reflected across your account.
            </p>

            <button
              onClick={() => setShowSuccessModal(false)}
              style={{
                marginTop: '8px',
                width: '100%',
                padding: '12px',
                background: '#6366f1',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#4f46e5'}
              onMouseOut={(e) => e.currentTarget.style.background = '#6366f1'}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {errorMessage && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#13161C',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '20px',
            padding: '32px 28px',
            maxWidth: '380px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>Update Failed</h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8', lineHeight: '1.5' }}>{errorMessage}</p>
            <button
              onClick={() => setErrorMessage('')}
              style={{
                marginTop: '8px',
                width: '100%',
                padding: '12px',
                background: '#ef4444',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FanProfile;
