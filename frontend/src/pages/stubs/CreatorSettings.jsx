import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const CreatorSettings = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [questionPrice, setQuestionPrice] = useState(99);
  const [dailyCap, setDailyCap] = useState(50);
  const [isLive, setIsLive] = useState(true);
  const [autoPause, setAutoPause] = useState(true);
  const [bio, setBio] = useState('Finance · 12K followers');
  const [avatar, setAvatar] = useState('R');
  
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [isEditingCap, setIsEditingCap] = useState(false);

  const [phone, setPhone] = useState('+91 98765 43210');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  
  const [instagram, setInstagram] = useState('@rahulfinance');
  const [isEditingInstagram, setIsEditingInstagram] = useState(false);
  
  const [pan, setPan] = useState('ABCDE1234F');
  const [isEditingPan, setIsEditingPan] = useState(false);

  const [isCopied, setIsCopied] = useState(false);
  const [isPausedFeedback, setIsPausedFeedback] = useState(false);
  const [isDeletedFeedback, setIsDeletedFeedback] = useState(false);

  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const [deleteModalStep, setDeleteModalStep] = useState(0);
  const [deleteInputValue, setDeleteInputValue] = useState('');
  
  const [isAccountDeleted, setIsAccountDeleted] = useState(false);

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
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.5' }}>
          Sorry to see you go. All your questions, earnings, and profile data have been permanently removed.
        </p>
      </div>
    );
  }

  const handleEditAvatar = () => {
    const newAvatar = prompt("Enter new avatar initial or emoji:", avatar);
    if (newAvatar) setAvatar(newAvatar.substring(0,2));
  };
  
  const handleEditBio = () => {
    const newBio = prompt("Enter new bio:", bio);
    if (newBio) setBio(newBio);
  };

  // Cyan filter for active bottom nav icons
  const cyanFilter = 'invert(69%) sepia(87%) saturate(2714%) hue-rotate(164deg) brightness(99%) contrast(98%)';
  const grayFilter = 'invert(31%) sepia(13%) saturate(760%) hue-rotate(181deg) brightness(96%) contrast(85%)';

  const navItems = [
    { label: 'HOME', icon: '🏠', route: '/creator/dashboard' },
    { label: 'INBOX', icon: '💬', route: '/creator/inbox' },
    { label: 'ANALYTICS', icon: '📊', route: '/creator/analytics' },
    { label: 'PAYOUTS', icon: '💰', route: '/creator/payouts' },
    { label: 'SETTINGS', icon: '⚙️', route: '/creator/settings' },
  ];

  return (
    <div style={{
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
              borderRadius: '50%',
              background: '#1A1A1A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <span style={{ fontSize: '1.2rem', color: '#94a3b8' }}>‹</span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 auto', paddingRight: '40px' }}>
            Settings
          </h2>
        </div>

        {/* Profile Card */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '20px', 
          padding: '12px 0 24px',
          borderBottom: '1px solid #1A1A1A'
        }}>
          {/* Avatar with edit icon */}
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={handleEditAvatar}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: '#13131f',
              border: '2px solid #29C5F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '28px',
              fontWeight: 800
            }}>
              {avatar}
            </div>
            {/* Edit icon */}
            <div style={{
              position: 'absolute',
              bottom: '0px',
              right: '0px',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: '#29C5F6',
              border: '2px solid #0E0E0E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0E0E0E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </div>
          </div>
          
          {/* Info */}
          <div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
              Rahul Sharma
            </div>
            <div style={{ fontSize: '0.9rem', color: '#29C5F6', marginBottom: '4px', cursor: 'pointer' }}>
              skriibe.com/@rahulfinance
            </div>
            <div 
              onClick={handleEditBio}
              style={{ fontSize: '0.85rem', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {bio}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </div>
          </div>
        </div>

        {/* AMA SETTINGS SECTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', letterSpacing: '1px' }}>
            AMA SETTINGS
          </div>

          <div style={{
            background: '#16161e',
            borderRadius: '16px',
            border: '1px solid #2A2A2A',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Question Price Row */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 16px',
              borderBottom: '1px solid #2A2A2A'
            }}>
              <div style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Question price</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {isEditingPrice ? (
                  <>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <span style={{ position: 'absolute', left: '10px', color: '#94a3b8', fontSize: '0.95rem' }}>₹</span>
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
                          fontSize: '0.95rem',
                          width: '70px',
                          outline: 'none',
                          fontWeight: 600,
                          boxSizing: 'border-box'
                        }}
                        autoFocus
                      />
                    </div>
                    <button 
                      onClick={() => setIsEditingPrice(false)}
                      style={{
                        background: '#29C5F6',
                        border: 'none',
                        color: '#0E0E0E',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >Save</button>
                  </>
                ) : (
                  <>
                    <span style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.95rem' }}>₹{questionPrice}</span>
                    <button 
                      onClick={() => setIsEditingPrice(true)}
                      style={{
                        background: '#2A2A2A',
                        border: 'none',
                        color: '#e2e8f0',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >Change</button>
                  </>
                )}
              </div>
            </div>

            {/* Daily Question Cap Row */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 16px',
              borderBottom: '1px solid #2A2A2A'
            }}>
              <div style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Daily question cap</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {isEditingCap ? (
                  <>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={dailyCap} 
                        onChange={(e) => setDailyCap(e.target.value)}
                        style={{
                          background: '#16161e',
                          border: '1px solid #29C5F6',
                          color: '#ffffff',
                          borderRadius: '8px',
                          padding: '8px 10px',
                          fontSize: '0.95rem',
                          width: '60px',
                          outline: 'none',
                          fontWeight: 600,
                          boxSizing: 'border-box',
                          textAlign: 'center'
                        }}
                        autoFocus
                      />
                      <span style={{ marginLeft: '10px', color: '#94a3b8', fontSize: '0.95rem' }}>/ day</span>
                    </div>
                    <button 
                      onClick={() => setIsEditingCap(false)}
                      style={{
                        background: '#29C5F6',
                        border: 'none',
                        color: '#0E0E0E',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >Save</button>
                  </>
                ) : (
                  <>
                    <span style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.95rem' }}>{dailyCap} / day</span>
                    <button 
                      onClick={() => setIsEditingCap(true)}
                      style={{
                        background: '#2A2A2A',
                        border: 'none',
                        color: '#e2e8f0',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >Edit</button>
                  </>
                )}
              </div>
            </div>

            {/* Page Status Row */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 16px',
              borderBottom: '1px solid #2A2A2A'
            }}>
              <div style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Page status</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isLive ? '#22C55E' : '#ef4444', fontWeight: 600, fontSize: '0.95rem' }}>
                  {isLive ? 'Live' : 'Paused'} <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isLive ? '#22C55E' : '#ef4444' }} />
                </div>
                <button 
                  onClick={() => setIsLive(!isLive)}
                  style={{
                    background: '#2A2A2A',
                    border: 'none',
                    color: '#e2e8f0',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >{isLive ? 'Pause' : 'Resume'}</button>
              </div>
            </div>

            {/* Auto-pause Row */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 16px'
            }}>
              <div style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Auto-pause on SLA breach</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.95rem' }}>{autoPause ? 'Enabled' : 'Disabled'}</span>
                <button 
                  onClick={() => setAutoPause(!autoPause)}
                  style={{
                    background: '#2A2A2A',
                    border: 'none',
                    color: '#e2e8f0',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >Toggle</button>
              </div>
            </div>

          </div>
        </div>

        {/* ACCOUNT & SECURITY SECTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Account & Security
          </div>
          
          <div style={{
            background: '#16161e',
            borderRadius: '16px',
            border: '1px solid #2A2A2A',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Phone number */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '20px 16px', borderBottom: '1px solid #2A2A2A'
            }}>
              <div style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Phone number</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {isEditingPhone ? (
                  <>
                    <input 
                      type="text" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)}
                      style={{
                        background: '#16161e', border: '1px solid #29C5F6', color: '#ffffff',
                        borderRadius: '8px', padding: '8px 10px', fontSize: '0.95rem',
                        width: '140px', outline: 'none', fontWeight: 500, fontFamily: 'monospace',
                        boxSizing: 'border-box'
                      }}
                      autoFocus
                    />
                    <button style={{
                      background: '#29C5F6', border: 'none', color: '#0E0E0E',
                      borderRadius: '8px', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer'
                    }} onClick={() => setIsEditingPhone(false)}>Save</button>
                  </>
                ) : (
                  <>
                    <span style={{ color: '#ffffff', fontWeight: 500, fontFamily: 'monospace', fontSize: '0.95rem', opacity: 0.3 }}>{phone}</span>
                    <button style={{
                      background: '#2A2A2A', border: 'none', color: '#e2e8f0',
                      borderRadius: '8px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
                    }} onClick={() => setIsEditingPhone(true)}>Change</button>
                  </>
                )}
              </div>
            </div>
            
            {/* Instagram account */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '20px 16px', borderBottom: '1px solid #2A2A2A'
            }}>
              <div style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Instagram account</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {isEditingInstagram ? (
                  <>
                    <input 
                      type="text" 
                      value={instagram} 
                      onChange={(e) => setInstagram(e.target.value)}
                      style={{
                        background: '#16161e', border: '1px solid #29C5F6', color: '#ffffff',
                        borderRadius: '8px', padding: '8px 10px', fontSize: '0.95rem',
                        width: '140px', outline: 'none', fontWeight: 500, fontFamily: 'monospace',
                        boxSizing: 'border-box'
                      }}
                      autoFocus
                    />
                    <button style={{
                      background: '#29C5F6', border: 'none', color: '#0E0E0E',
                      borderRadius: '8px', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer'
                    }} onClick={() => setIsEditingInstagram(false)}>Save</button>
                  </>
                ) : (
                  <>
                    <span style={{ color: '#ffffff', fontWeight: 500, fontFamily: 'monospace', fontSize: '0.95rem', opacity: 0.3 }}>{instagram}</span>
                    <button style={{
                      background: '#2A2A2A', border: 'none', color: '#e2e8f0',
                      borderRadius: '8px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
                    }} onClick={() => setIsEditingInstagram(true)}>Re-link</button>
                  </>
                )}
              </div>
            </div>

            {/* PAN number */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '20px 16px', borderBottom: '1px solid #2A2A2A'
            }}>
              <div style={{ color: '#94a3b8', fontSize: '0.95rem' }}>PAN number</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {isEditingPan ? (
                  <>
                    <input 
                      type="text" 
                      value={pan} 
                      onChange={(e) => setPan(e.target.value.toUpperCase())}
                      style={{
                        background: '#16161e', border: '1px solid #29C5F6', color: '#ffffff',
                        borderRadius: '8px', padding: '8px 10px', fontSize: '0.95rem',
                        width: '120px', outline: 'none', fontWeight: 500, fontFamily: 'monospace',
                        boxSizing: 'border-box'
                      }}
                      autoFocus
                    />
                    <button style={{
                      background: '#29C5F6', border: 'none', color: '#0E0E0E',
                      borderRadius: '8px', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer'
                    }} onClick={() => setIsEditingPan(false)}>Save</button>
                  </>
                ) : (
                  <>
                    <span style={{ color: '#ffffff', fontWeight: 500, fontFamily: 'monospace', fontSize: '0.95rem', opacity: 0.3 }}>{pan}</span>
                    <button style={{
                      background: '#2A2A2A', border: 'none', color: '#e2e8f0',
                      borderRadius: '8px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
                    }} onClick={() => setIsEditingPan(true)}>Edit</button>
                  </>
                )}
              </div>
            </div>

            {/* Referral code */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '20px 16px'
            }}>
              <div style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Referral code</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: '#ffffff', fontWeight: 500, fontFamily: 'monospace', fontSize: '0.95rem', opacity: 0.3 }}>RAHUL20</span>
                <button style={{
                  background: isCopied ? '#166534' : '#2A2A2A',
                  border: 'none', 
                  color: isCopied ? '#4ade80' : '#e2e8f0',
                  borderRadius: '8px', 
                  padding: '6px 12px', 
                  fontSize: '0.8rem', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                  minWidth: '70px',
                  justifyContent: 'center'
                }} onClick={() => { 
                  navigator.clipboard.writeText('RAHUL20'); 
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                }}>
                  {isCopied ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Copied
                    </>
                  ) : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* DANGER ZONE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ef4444', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Danger Zone
          </div>
          
          <div style={{
            background: '#16161e',
            borderRadius: '16px',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Pause my page */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '20px 16px', borderBottom: '1px solid rgba(239, 68, 68, 0.1)'
            }}>
              <div style={{ color: '#ef4444', fontSize: '0.95rem', fontWeight: 500 }}>Pause my page</div>
              <button style={{
                background: isPausedFeedback ? '#166534' : 'transparent', 
                border: isPausedFeedback ? 'none' : '1px solid rgba(239, 68, 68, 0.3)', 
                color: isPausedFeedback ? '#4ade80' : '#ef4444',
                borderRadius: '8px', 
                padding: '6px 12px', 
                fontSize: '0.8rem', 
                fontWeight: 600, 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
                minWidth: '70px',
                justifyContent: 'center'
              }} onClick={() => { 
                setIsPauseModalOpen(true);
              }}>
                {isPausedFeedback ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Paused
                  </>
                ) : 'Pause'}
              </button>
            </div>
            
            {/* Delete account */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '20px 16px'
            }}>
              <div style={{ color: '#ef4444', fontSize: '0.95rem', fontWeight: 500 }}>Delete account</div>
              <button style={{
                background: isDeletedFeedback ? '#166534' : 'transparent', 
                border: isDeletedFeedback ? 'none' : '1px solid rgba(239, 68, 68, 0.3)', 
                color: isDeletedFeedback ? '#4ade80' : '#ef4444',
                borderRadius: '8px', 
                padding: '6px 12px', 
                fontSize: '0.8rem', 
                fontWeight: 600, 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
                minWidth: '75px',
                justifyContent: 'center'
              }} onClick={() => { 
                setDeleteModalStep(1);
              }}>
                {isDeletedFeedback ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Deleted
                  </>
                ) : 'Delete'}
              </button>
            </div>
          </div>
        </div>

        {/* SIGN OUT */}
        <div style={{ paddingBottom: '100px', paddingTop: '16px', display: 'flex', justifyContent: 'center' }}>
          <button style={{
            background: 'transparent',
            border: 'none',
            color: '#ef4444',
            fontSize: '1rem',
            fontWeight: 500,
            cursor: 'pointer'
          }} onClick={() => navigate('/')}>
            Sign out
          </button>
        </div>
      </div>

      {/* BOTTOM NAV BAR */}
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
        {navItems.map((item) => {
          const isActive = location.pathname === item.route;
          return (
            <div
              key={item.route}
              onClick={() => navigate(item.route)}
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
      {isPauseModalOpen && (
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
            <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', color: '#ffffff' }}>Pause your page?</h3>
            <p style={{ margin: '0 0 24px', color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.4' }}>
              You won't accept new questions while paused. You can unpause anytime.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={{
                flex: 1, background: '#2A2A2A', border: 'none', color: '#ffffff',
                padding: '12px', borderRadius: '12px', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer'
              }} onClick={() => setIsPauseModalOpen(false)}>Cancel</button>
              <button style={{
                flex: 1, background: '#ef4444', border: 'none', color: '#ffffff',
                padding: '12px', borderRadius: '12px', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer'
              }} onClick={() => {
                setIsLive(false);
                setIsPausedFeedback(true);
                setIsPauseModalOpen(false);
                setTimeout(() => setIsPausedFeedback(false), 2000);
              }}>Yes, pause</button>
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
                    padding: '12px', borderRadius: '12px', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer'
                  }} onClick={() => setDeleteModalStep(0)}>Cancel</button>
                  <button style={{
                    flex: 1, background: '#ef4444', border: 'none', color: '#ffffff',
                    padding: '12px', borderRadius: '12px', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer'
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
                    padding: '12px', borderRadius: '12px', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer'
                  }} onClick={() => { setDeleteModalStep(0); setDeleteInputValue(''); }}>Cancel</button>
                  <button style={{
                    flex: 1, 
                    background: deleteInputValue.trim().length > 0 ? '#ef4444' : '#2A2A2A', 
                    border: 'none', 
                    color: deleteInputValue.trim().length > 0 ? '#ffffff' : '#64748b',
                    padding: '12px', borderRadius: '12px', fontWeight: 600, fontSize: '0.95rem', 
                    cursor: deleteInputValue.trim().length > 0 ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease'
                  }} 
                  disabled={deleteInputValue.trim().length === 0}
                  onClick={async () => {
                    try {
                      await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/creator/delete-account', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ reason: deleteInputValue.trim() })
                      });
                    } catch(err) {
                      console.error("Failed to delete account", err);
                    }
                    setIsAccountDeleted(true);
                  }}>Delete forever</button>
                </div>
              </>
            )}
          </div>
        </div>
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
