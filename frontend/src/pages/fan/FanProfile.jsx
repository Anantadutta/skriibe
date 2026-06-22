import React, { useState, useEffect, useRef } from 'react';
import FanNavbar from '../../components/fan/layout/FanNavbar';
import FanBottomNav from '../../components/fan/layout/FanBottomNav';
import { getFanMe, switchRole, getFanHistory, updateFanProfile } from '../../services/fanApi';
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
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);
  
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const avatarInputRef = useRef(null);
  const menuRef = useRef(null);

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
      if (menuRef.current && !menuRef.current.contains(event.target)) {
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
    const diff = (new Date() - new Date(date)) / (1000 * 60 * 60 * 24);
    if (diff < 1) return `Today`;
    if (diff < 2) return `1 day ago`;
    return `${Math.floor(diff)} days ago`;
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

                  {/* Dropdown Menu */}
                  {showAvatarMenu && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      marginTop: '8px',
                      background: '#1a1a24',
                      border: '1px solid #2A2A2A',
                      borderRadius: '12px',
                      padding: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      zIndex: 100,
                      minWidth: '140px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                    }}>
                      <button 
                        onClick={() => avatarInputRef.current?.click()}
                        style={{ background: 'transparent', border: 'none', color: '#ffffff', padding: '8px 12px', textAlign: 'left', cursor: 'pointer', borderRadius: '8px', fontSize: '0.85rem' }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        Upload new photo
                      </button>
                      <button 
                        onClick={openCropCurrent}
                        style={{ background: 'transparent', border: 'none', color: '#ffffff', padding: '8px 12px', textAlign: 'left', cursor: 'pointer', borderRadius: '8px', fontSize: '0.85rem' }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        Crop current photo
                      </button>
                    </div>
                  )}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '700' }}>{fanProfile.name || 'Fan'}</h2>
                  {isEditingEmail ? (
                    <input 
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      disabled={savingEmail}
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
                    <div style={{ color: '#94a3b8', fontSize: '16px', wordBreak: 'break-all' }}>{fanProfile.email}</div>
                  )}
                </div>
              </div>
              <button 
                onClick={async () => {
                  if (isEditingEmail) {
                    if (!newEmail || newEmail === fanProfile.email) {
                      setIsEditingEmail(false);
                      return;
                    }
                    setSavingEmail(true);
                    try {
                      const res = await updateFanProfile(newEmail);
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
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: savingEmail ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  opacity: savingEmail ? 0.6 : 1,
                  flexShrink: 0
              }}>
                {!isEditingEmail && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                )}
                {isEditingEmail ? (savingEmail ? 'Saving...' : 'Save') : 'Edit'}
              </button>
            </div>
          </div>

          {/* Payout History Section */}
          <div style={{ marginTop: '48px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>Payout History</h2>
              {!showAllQuestions && questions.length > 3 && (
                <button 
                  onClick={() => setShowAllQuestions(true)}
                  style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  See all <span style={{ fontSize: '18px' }}>→</span>
                </button>
              )}
            </div>
            
            <div style={{
              background: '#13161C',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '16px',
              overflow: 'hidden'
            }}>
              {questions.slice(0, showAllQuestions ? undefined : 3).map((q, idx) => (
                <div key={q._id} style={{
                  padding: '20px',
                  borderBottom: idx < (showAllQuestions ? questions.length : 3) - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }} onClick={() => navigate('/fan/history')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0, marginRight: '16px' }}>
                      <div style={{ minWidth: '40px', height: '40px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontWeight: '700', fontSize: '16px', color: '#fff', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {q.questionText}
                        </div>
                        <div style={{ fontSize: '14px', color: '#64748b' }}>
                            {q.status === 'answered' ? '1 answer' : '0 answers'} · {getTimeAgo(q.createdAt)}
                        </div>
                      </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', minWidth: '80px' }}>
                      <div style={{ 
                          padding: '6px 14px', 
                          borderRadius: '20px', 
                          fontSize: '12px', 
                          fontWeight: '700',
                          background: q.status === 'answered' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                          color: q.status === 'answered' ? '#10b981' : '#38bdf8'
                      }}>
                          {q.status === 'submitted' ? 'Open' : q.status.charAt(0).toUpperCase() + q.status.slice(1)}
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: '#cbd5e1' }}>
                          Rs. {q.price || 99}
                      </div>
                  </div>
                </div>
              ))}
              
              {questions.length === 0 && (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '15px' }}>
                      You haven't asked any questions yet.
                  </div>
              )}
              
              {!showAllQuestions && questions.length > 3 && (
                  <div 
                    onClick={() => setShowAllQuestions(true)}
                    style={{ padding: '16px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', cursor: 'pointer', transition: 'background 0.2s', borderTop: '1px solid rgba(255,255,255,0.05)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  >
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </div>
                  </div>
              )}
            </div>
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
                {roles && roles.length === 1 && roles[0] === 'fan' && (
                  <button 
                    onClick={() => navigate('/fan/upgrade')}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(90deg, #7c3aed 0%, #06b6d4 100%)',
                      border: 'none',
                      color: '#ffffff',
                      padding: '16px',
                      borderRadius: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontSize: '16px',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg> Become a Creator
                  </button>
                )}

                {roles && roles.includes('creator') && (
                  <button 
                    disabled={switching}
                    onClick={async () => {
                      setSwitching(true);
                      try {
                        const res = await switchRole('creator');
                        if (res.success) {
                          setAuthData(roles, 'creator', res.token);
                          window.location.href = '/creator/dashboard';
                        }
                      } catch (err) {
                        alert('Failed to switch role');
                      } finally {
                        setSwitching(false);
                      }
                    }}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(90deg, #7c3aed 0%, #06b6d4 100%)',
                      border: 'none',
                      color: '#ffffff',
                      padding: '16px',
                      borderRadius: '12px',
                      fontWeight: '700',
                      cursor: switching ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontSize: '16px',
                      transition: 'opacity 0.2s',
                      opacity: switching ? 0.7 : 1
                    }}
                    onMouseEnter={e => !switching && (e.currentTarget.style.opacity = '0.9')}
                    onMouseLeave={e => !switching && (e.currentTarget.style.opacity = '1')}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg> {switching ? 'Switching...' : 'Switch to Creator Mode'}
                  </button>
                )}

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
                      try {
                        const res = await api.delete('/fan-auth/profile');
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
    </div>
  );
};

export default FanProfile;
