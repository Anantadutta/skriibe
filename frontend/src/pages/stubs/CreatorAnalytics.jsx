import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { io } from 'socket.io-client';
import { getCurrencySymbol } from '../../utils/phoneValidation';

const CreatorAnalytics = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatorInfo, setCreatorInfo] = useState(location.state?.creator || null);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(new Date().getMonth());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isViewAllModalOpen, setIsViewAllModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterOption, setFilterOption] = useState('Newest');

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 880);
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'referral');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 880);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { label: 'HOME', icon: '🏠', route: '/creator/dashboard' },
    { label: 'CHATS', icon: '💬', route: '/creator/inbox' },
    { label: 'TRANSACTIONS', icon: '💰', route: '/creator/payouts' },
    { label: 'ANALYTICS', icon: '📊', route: '/creator/analytics' },
    { label: 'SETTINGS', icon: '⚙️', route: '/creator/settings' },
  ];

  const [totalReferrals, setTotalReferrals] = useState(0);
  const [lifetimeEarnings, setLifetimeEarnings] = useState(0);

  const [payoutStats, setPayoutStats] = useState({
    lifetimePaid: 0,
    liveChatEarnings: 0,
    amaEarnings: 0,
    tipEarnings: 0,
    liveChatsComplete: 0,
    liveChatsIncomplete: 0,
    amaCount: 0,
    tipCount: 0,
    creatorSharePercent: 80
  });

  const currencySymbol = getCurrencySymbol(creatorInfo?.phone) || '₹';

  const creatorSharePercent = Number.isFinite(payoutStats?.creatorSharePercent)
    ? payoutStats.creatorSharePercent
    : 80;
  const platformSharePercent = 100 - creatorSharePercent;

  const fetchPayouts = async () => {
    try {
      const res = await api.get('/creator/payouts');
      if (res.data && res.data.success) {
        setPayoutStats(res.data);
      }
    } catch (err) {
      console.error('Error fetching creator payouts in analytics:', err);
    }
  };

  useEffect(() => {
    fetchPayouts();

    const socketUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
    const socket = io(socketUrl);

    const cId = creatorInfo?._id || creatorInfo?.id;
    if (cId) {
      socket.emit('join_creator_room', { creatorId: cId });
    }

    socket.on('connect', () => {
      if (cId) {
        socket.emit('join_creator_room', { creatorId: cId });
      }
    });

    socket.on('new-question', () => {
      fetchPayouts();
    });

    socket.on('question-status-changed', () => {
      fetchPayouts();
    });

    socket.on('chat-session-ended', () => {
      fetchPayouts();
    });

    socket.on('chat_ended', () => {
      fetchPayouts();
    });

    socket.on('chat_cancelled_by_fan', () => {
      fetchPayouts();
    });

    socket.on('tip-received', () => {
      fetchPayouts();
    });

    return () => {
      socket.disconnect();
    };
  }, [creatorInfo?._id, creatorInfo?.id]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let currentCreator = creatorInfo;
        if (!currentCreator) {
          const meRes = await api.get('/creator/me');
          currentCreator = meRes.data.creator;
          setCreatorInfo(currentCreator);
        }

        const refRes = await api.get('/creators/my-referrals');
        
        if (refRes.data.success) {
          const rawMapped = refRes.data.referrals.map((r, i) => ({
            id: r._id || i,
            name: r.name || r.handle || (r.email ? r.email.split('@')[0] : 'Anonymous Creator'),
            handle: r.handle ? (r.handle.startsWith('@') ? r.handle : `@${r.handle}`) : (r.email ? `@${r.email.split('@')[0]}` : '@anonymous'),
            joined: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            status: r.status || 'Active',
            earnings: `₹${r.earnings || 0}`, 
            rawEarnings: r.earnings || 0,
            rawCreatedAt: r.createdAt,
            img: r.profilePic || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
          }));

          const uniqueMapped = [];
          const seenHandles = new Set();
          for (const m of rawMapped) {
            if (!seenHandles.has(m.handle)) {
              seenHandles.add(m.handle);
              uniqueMapped.push(m);
            }
          }

          setTotalReferrals(uniqueMapped.length);
          setLifetimeEarnings(refRes.data.lifetimeEarnings || 0);
          setReferrals(uniqueMapped);
        }
      } catch (err) {
        console.error('Error fetching analytics data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const [fromDate, setFromDate] = useState('');
  
  const [toDate, setToDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const formatDateStr = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Calculate the earliest date we should allow (either account creation or oldest referral)
  const earliestReferralDate = referrals.length > 0 
    ? Math.min(...referrals.map(r => new Date(r.rawCreatedAt || new Date()).getTime()))
    : null;
    
  const accountCreatedAt = creatorInfo?.createdAt ? new Date(creatorInfo.createdAt).getTime() : null;
  
  const minTime = earliestReferralDate && accountCreatedAt 
    ? Math.min(earliestReferralDate, accountCreatedAt)
    : (earliestReferralDate || accountCreatedAt || new Date('2024-01-01').getTime());

  const minDate = new Date(minTime).toISOString().split('T')[0];
  const maxDate = new Date().toISOString().split('T')[0];

  const [tempFromDate, setTempFromDate] = useState('');
  const [tempToDate, setTempToDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isFilterActive, setIsFilterActive] = useState(false);

  useEffect(() => {
    if (minDate && !isFilterActive) {
      setFromDate(minDate);
      setTempFromDate(minDate);
      setToDate(maxDate);
      setTempToDate(maxDate);
    }
  }, [minDate, maxDate, isFilterActive]);

  const currentDateRangeStr = fromDate ? `${formatDateStr(fromDate)} – ${formatDateStr(toDate)}` : 'Loading...';

  const filteredReferrals = [...referrals]
    .filter(c => {
      if (!c.rawCreatedAt || !fromDate || !toDate) return true;
      const joinedDate = new Date(c.rawCreatedAt).getTime();
      const start = new Date(fromDate + 'T00:00:00').getTime();
      const end = new Date(toDate + 'T23:59:59').getTime();
      return joinedDate >= start && joinedDate <= end;
    });

  const displayTotalReferrals = isFilterActive ? filteredReferrals.length : totalReferrals;
  const displayEarnings = isFilterActive ? filteredReferrals.reduce((acc, curr) => acc + (curr.rawEarnings || 0), 0) : lifetimeEarnings;
  const displayActiveCreators = filteredReferrals.filter(r => r.status === 'Active').length;

  return (
    <>
    <div style={{
      minHeight: '100vh',
      background: '#0d1017',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxSizing: 'border-box',
      overflowX: 'hidden',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        ::-webkit-scrollbar { display: none; }
        * { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* Left Vertical Menu Bar (Desktop/Tablet) */}
      {!isMobile && (
        <div style={{
          position: 'fixed',
          top: '24px',
          left: 'max(16px, calc(50% - 195px - 230px - 24px))',
          width: '230px',
          zIndex: 40
        }}>
          <div style={{
            background: '#161925',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)'
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#64748b',
              padding: '4px 8px 8px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              marginBottom: '4px'
            }}>
              Analytics
            </div>

            {/* Heading 1: Referral Analytics */}
            <button
              onClick={() => setActiveTab('referral')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '10px',
                border: activeTab === 'referral' ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid transparent',
                background: activeTab === 'referral' ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                color: activeTab === 'referral' ? '#38bdf8' : '#94a3b8',
                fontWeight: activeTab === 'referral' ? 700 : 500,
                fontSize: '14px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                width: '100%',
                boxSizing: 'border-box',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'referral') {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'referral') {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#94a3b8';
                }
              }}
            >
              <span style={{ fontSize: '16px' }}>👥</span>
              <span>Referral Analytics</span>
              {activeTab === 'referral' && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: '20%',
                  height: '60%',
                  width: '3px',
                  background: '#38bdf8',
                  borderRadius: '0 4px 4px 0'
                }} />
              )}
            </button>

            {/* Heading 2: Creator Analytics */}
            <button
              onClick={() => {
                setActiveTab('creator');
                fetchPayouts();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '10px',
                border: activeTab === 'creator' ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid transparent',
                background: activeTab === 'creator' ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                color: activeTab === 'creator' ? '#38bdf8' : '#94a3b8',
                fontWeight: activeTab === 'creator' ? 700 : 500,
                fontSize: '14px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                width: '100%',
                boxSizing: 'border-box',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'creator') {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'creator') {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#94a3b8';
                }
              }}
            >
              <span style={{ fontSize: '16px' }}>📊</span>
              <span>Creator Analytics</span>
              {activeTab === 'creator' && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: '20%',
                  height: '60%',
                  width: '3px',
                  background: '#38bdf8',
                  borderRadius: '0 4px 4px 0'
                }} />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Mobile Drawer (Left Slide-out Menu) */}
      {isMobileDrawerOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.7)',
            zIndex: 1000,
            display: 'flex'
          }}
          onClick={() => setIsMobileDrawerOpen(false)}
        >
          <div
            style={{
              width: '260px',
              height: '100%',
              background: '#161925',
              borderRight: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '24px 16px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              boxShadow: '4px 0 25px rgba(0, 0, 0, 0.6)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0 8px 16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: '12px'
            }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>Analytics Menu</span>
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer', padding: 0 }}
              >
                ✕
              </button>
            </div>

            <button
              onClick={() => {
                setActiveTab('referral');
                setIsMobileDrawerOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '10px',
                border: activeTab === 'referral' ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid transparent',
                background: activeTab === 'referral' ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                color: activeTab === 'referral' ? '#38bdf8' : '#94a3b8',
                fontWeight: activeTab === 'referral' ? 700 : 500,
                fontSize: '14px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%'
              }}
            >
              <span style={{ fontSize: '16px' }}>👥</span>
              <span>Referral Analytics</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('creator');
                setIsMobileDrawerOpen(false);
                fetchPayouts();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '10px',
                border: activeTab === 'creator' ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid transparent',
                background: activeTab === 'creator' ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                color: activeTab === 'creator' ? '#38bdf8' : '#94a3b8',
                fontWeight: activeTab === 'creator' ? 700 : 500,
                fontSize: '14px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%'
              }}
            >
              <span style={{ fontSize: '16px' }}>📊</span>
              <span>Creator Analytics</span>
            </button>
          </div>
        </div>
      )}

      <div style={{
        width: '100%',
        maxWidth: '390px',
        padding: '0 0 120px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Mobile top switcher */}
        {isMobile && (
          <div style={{ padding: '16px 20px 0', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              style={{
                background: '#161925',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#ffffff',
                padding: '8px 12px',
                fontSize: '13px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <span>☰</span>
              <span>Menu</span>
            </button>

            <div style={{
              display: 'flex',
              flex: 1,
              background: '#161925',
              borderRadius: '8px',
              padding: '3px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <button
                onClick={() => setActiveTab('referral')}
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  background: activeTab === 'referral' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                  color: activeTab === 'referral' ? '#38bdf8' : '#94a3b8',
                  fontWeight: activeTab === 'referral' ? 700 : 500,
                  fontSize: '12px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                Referral
              </button>
              <button
                onClick={() => {
                  setActiveTab('creator');
                  fetchPayouts();
                }}
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  background: activeTab === 'creator' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                  color: activeTab === 'creator' ? '#38bdf8' : '#94a3b8',
                  fontWeight: activeTab === 'creator' ? 700 : 500,
                  fontSize: '12px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                Creator
              </button>
            </div>
          </div>
        )}

        {/* Section 1: Referral Analytics */}
        {activeTab === 'referral' && (
          <>
            {/* Header */}
            <div style={{ padding: '24px 20px 16px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 4px 0' }}>Referral Analytics</h1>
              <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Track your referrals and earnings</p>
            </div>

      {/* Date Picker */}
      <div ref={dropdownRef} style={{ padding: '0 20px 16px', position: 'relative', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div 
          onClick={() => {
            setTempFromDate(fromDate);
            setTempToDate(toDate);
            setIsDropdownOpen(!isDropdownOpen);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '8px',
            padding: '8px 12px',
            color: '#e2e8f0',
            fontSize: '13px',
            gap: '8px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <span style={{ fontSize: '14px' }}>📅</span>
          <span>{currentDateRangeStr}</span>
          <span style={{ fontSize: '10px', marginLeft: '4px', transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
        </div>

        {isFilterActive && (
          <div 
            onClick={() => {
              setIsFilterActive(false);
              setFromDate(minDate);
              setToDate(maxDate);
              setTempFromDate(minDate);
              setTempToDate(maxDate);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'rgba(52, 211, 153, 0.15)',
              border: '1px solid #34d399',
              borderRadius: '8px',
              padding: '8px 12px',
              color: '#34d399',
              fontSize: '13px',
              gap: '6px',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <span>{formatDateStr(fromDate)} - {formatDateStr(toDate)}</span>
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>×</span>
          </div>
        )}

        {isDropdownOpen && (
          <div style={{
            position: 'absolute',
            top: '50px',
            left: '20px',
            background: '#161925',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '16px',
            zIndex: 50,
            width: '240px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
          }}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>From</label>
              <input 
                type="date" 
                value={tempFromDate}
                min={minDate}
                max={tempToDate || maxDate}
                onChange={(e) => setTempFromDate(e.target.value)}
                style={{ background: '#13151f', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px', borderRadius: '4px', width: '100%', colorScheme: 'dark' }} 
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>To</label>
              <input 
                type="date" 
                value={tempToDate}
                min={tempFromDate || minDate}
                max={maxDate}
                onChange={(e) => setTempToDate(e.target.value)}
                style={{ background: '#13151f', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px', borderRadius: '4px', width: '100%', colorScheme: 'dark' }} 
              />
            </div>
            <button 
              onClick={() => {
                setFromDate(tempFromDate);
                setToDate(tempToDate);
                setIsFilterActive(true);
                setIsDropdownOpen(false);
              }}
              style={{ background: '#34d399', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '8px', width: '100%', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Apply Filter
            </button>
          </div>
        )}
      </div>

      {/* Overview Card */}
      <div style={{ margin: '0 20px', background: '#161925', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 20px 0' }}>Overview</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 16px' }}>
            {/* Item 1 */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(124, 58, 237, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa' }}>
                👥
              </div>
              <div>
                <div style={{ color: '#94a3b8', fontSize: '11px', marginBottom: '2px' }}>Creators Referred</div>
                <div style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 2px 0' }}>{loading ? '-' : displayTotalReferrals}</div>
                <div style={{ color: '#64748b', fontSize: '10px' }}>Total</div>
              </div>
            </div>

            {/* Item 2 (Your Earnings) */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24' }}>
                %
              </div>
              <div>
                <div style={{ color: '#94a3b8', fontSize: '11px', marginBottom: '2px' }}>Your Earnings (25%)</div>
                <div style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 2px 0', color: '#34d399' }}>₹{loading ? '-' : displayEarnings.toLocaleString()}</div>
                <div style={{ color: '#64748b', fontSize: '10px' }}>{isFilterActive ? 'Filtered earnings' : 'Lifetime earnings'}</div>
              </div>
            </div>

            {/* Item 3 (Active Creators) */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
                ✅
              </div>
              <div>
                <div style={{ color: '#94a3b8', fontSize: '11px', marginBottom: '2px' }}>Active Creators</div>
                <div style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 2px 0' }}>{loading ? '-' : displayActiveCreators}</div>
                <div style={{ color: '#64748b', fontSize: '10px' }}>Started earning</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Referred Creators List */}
      <div style={{ margin: '24px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Referred Creators</h2>
          <span style={{ color: '#eab308', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }} onClick={() => setIsViewAllModalOpen(true)}>View All</span>
        </div>

        {/* Search & Filter */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <div style={{ 
            flex: 1, 
            background: '#161925', 
            borderRadius: '8px', 
            display: 'flex', 
            alignItems: 'center',
            padding: '10px 12px'
          }}>
            <span style={{ color: '#64748b', marginRight: '8px' }}>🔍</span>
            <input 
              type="text" 
              placeholder="Search by name" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: '#fff', 
                fontSize: '14px',
                width: '100%',
                outline: 'none'
              }} 
            />
          </div>
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              style={{
                background: '#161925',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 16px',
                color: '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                height: '100%'
              }}
            >
              <span>≡</span> Filter
            </button>
            
            {isFilterOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                background: '#161925',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '8px 0',
                zIndex: 50,
                minWidth: '160px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
              }}>
                {['Newest', 'Highest to Lowest'].map(opt => (
                  <div 
                    key={opt}
                    onClick={() => {
                      setFilterOption(opt);
                      setIsFilterOpen(false);
                    }}
                    style={{
                      padding: '10px 16px',
                      color: filterOption === opt ? '#34d399' : '#e2e8f0',
                      cursor: 'pointer',
                      fontSize: '13px',
                      background: filterOption === opt ? 'rgba(255,255,255,0.03)' : 'transparent'
                    }}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* List */}
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>Loading referrals...</div>
          ) : referrals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>No referrals found.</div>
          ) : (
            filteredReferrals
              .filter(c => 
                (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (c.handle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
              )
              .sort((a, b) => {
                if (filterOption === 'Highest to Lowest') return b.rawEarnings - a.rawEarnings;
                if (filterOption === 'Lowest to Highest') return a.rawEarnings - b.rawEarnings;
                return 0; // Newest is the default from the backend
              })
              .slice(0, 4)
              .map((creator) => (
              <div key={creator.id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '20px'
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={creator.img} alt={creator.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{creator.name}</span>
                    <span style={{ 
                      fontSize: '10px', 
                      padding: '2px 6px', 
                      borderRadius: '4px',
                      color: creator.status === 'Active' ? '#34d399' : '#f87171',
                      border: `1px solid ${creator.status === 'Active' ? '#34d399' : '#f87171'}`,
                      background: 'rgba(0,0,0,0.2)'
                    }}>
                      {creator.status}
                    </span>
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '12px' }}>{creator.handle}</div>
                  <div style={{ color: '#64748b', fontSize: '10px', marginTop: '2px' }}>Joined {creator.joined}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#94a3b8', fontSize: '11px', marginBottom: '2px' }}>Earnings</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: creator.earnings !== '₹0' ? '#34d399' : '#e2e8f0' }}>{creator.earnings}</div>
                </div>
              </div>
            </div>
          )))}
        </div>
      </div>
      </>
      )}

      {/* Section 2: Creator Analytics */}
      {activeTab === 'creator' && (
        <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: '90px' }}>
          {/* Header */}
          <div style={{ padding: '24px 20px 16px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 4px 0' }}>Creator Analytics</h1>
            <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Your earnings overview</p>
          </div>

          {/* Transactions / Earnings Overview Card */}
          <div style={{
            padding: '24px',
            margin: '0 20px 24px',
            borderRadius: '16px',
            background: 'linear-gradient(145deg, #0F172A 0%, #0B0F19 100%)',
            border: '1px solid #1E293B',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38BDF8', fontSize: '11px', fontWeight: '800', letterSpacing: '1.2px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                <polyline points="16 7 22 7 22 13"></polyline>
              </svg>
              EARNINGS
              <span style={{ color: '#64748B', fontSize: '10px', fontWeight: '700', letterSpacing: '0.3px' }}>
                (You keep {creatorSharePercent}% · Skriibe takes {platformSharePercent}%)
              </span>
            </div>
            <div style={{ fontSize: '42px', fontWeight: '900', letterSpacing: '-1px', color: '#fff', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', lineHeight: 1 }}>
              <span style={{ color: '#E2E8F0', fontSize: '32px' }}>{currencySymbol}</span>{(payoutStats?.lifetimePaid || 0)}
            </div>
            <div style={{ color: '#64748B', fontSize: '13px', fontWeight: '500', marginBottom: '24px' }}>
              Total amount earned
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1, background: '#1E293B', borderRadius: '14px', padding: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ color: '#64748B', fontSize: '9px', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Live chat
                </div>
                <div style={{ color: '#38BDF8', fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <span style={{ fontSize: '13px' }}>{currencySymbol}</span>{(payoutStats?.liveChatEarnings || 0)}
                </div>
              </div>
              <div style={{ flex: 1, background: '#1E293B', borderRadius: '14px', padding: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ color: '#64748B', fontSize: '9px', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Ask me anything
                </div>
                <div style={{ color: '#38BDF8', fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <span style={{ fontSize: '13px' }}>{currencySymbol}</span>{(payoutStats?.amaEarnings || 0)}
                </div>
              </div>
              <div style={{ flex: 1, background: '#1E293B', borderRadius: '14px', padding: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ color: '#64748B', fontSize: '9px', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Tip
                </div>
                <div style={{ color: '#38BDF8', fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <span style={{ fontSize: '13px' }}>{currencySymbol}</span>{(payoutStats?.tipEarnings || 0)}
                </div>
              </div>
            </div>
          </div>

          {/* Count Matters Card */}
          <div style={{
            padding: '24px',
            margin: '0 20px 24px',
            borderRadius: '16px',
            background: 'linear-gradient(145deg, #0F172A 0%, #0B0F19 100%)',
            border: '1px solid #1E293B',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38BDF8', fontSize: '11px', fontWeight: '800', letterSpacing: '1.2px', marginBottom: '12px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38BDF8' }} />
              COUNT MATTERS
            </div>
            <div style={{ fontSize: '42px', fontWeight: '900', letterSpacing: '-1px', color: '#fff', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', lineHeight: 1 }}>
              {((payoutStats?.liveChatsComplete || 0) + (payoutStats?.liveChatsIncomplete || 0) + (payoutStats?.amaCount || 0) + (payoutStats?.tipCount || 0))}
            </div>
            <div style={{ color: '#64748B', fontSize: '13px', fontWeight: '500', marginBottom: '24px' }}>
              Total interactions count
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {/* Sub-box 1: Live chat */}
              <div style={{ flex: 1.3, background: '#1E293B', borderRadius: '14px', padding: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                <div style={{ color: '#64748B', fontSize: '9px', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Live chat
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                      <span style={{ color: '#94A3B8', fontSize: '10px', fontWeight: '600' }}>Complete</span>
                      <span style={{ color: '#38BDF8', fontSize: '15px', fontWeight: '800' }}>{payoutStats?.liveChatsComplete || 0}</span>
                    </div>
                    <div style={{ color: '#64748B', fontSize: '8px', lineHeight: '1.2', fontWeight: '500', marginTop: '1px' }}>
                      (chats smoothly ended as the time got over)
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                      <span style={{ color: '#94A3B8', fontSize: '10px', fontWeight: '600' }}>Incomplete</span>
                      <span style={{ color: '#F87171', fontSize: '15px', fontWeight: '800' }}>{payoutStats?.liveChatsIncomplete || 0}</span>
                    </div>
                    <div style={{ color: '#64748B', fontSize: '8px', lineHeight: '1.2', fontWeight: '500', marginTop: '1px' }}>
                      (chats manually ended by the fan)
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-box 2: Ask me anything */}
              <div style={{ flex: 1, background: '#1E293B', borderRadius: '14px', padding: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                <div style={{ color: '#64748B', fontSize: '9px', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Ask me anything
                </div>
                <div style={{ color: '#38BDF8', fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  {payoutStats?.amaCount || 0}
                </div>
              </div>

              {/* Sub-box 3: Tips */}
              <div style={{ flex: 1, background: '#1E293B', borderRadius: '14px', padding: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                <div style={{ color: '#64748B', fontSize: '9px', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Tips
                </div>
                <div style={{ color: '#38BDF8', fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  {payoutStats?.tipCount || 0}
                </div>
              </div>
            </div>
          </div>

          <div style={{
            padding: '24px',
            margin: '0 20px 24px',
            borderRadius: '16px',
            background: 'linear-gradient(145deg, #0F172A 0%, #0B0F19 100%)',
            border: '1px solid #1E293B',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38BDF8', fontSize: '11px', fontWeight: '800', letterSpacing: '1.2px', marginBottom: '16px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
              LIVE CHATS BREAKDOWN
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, background: '#1E293B', borderRadius: '14px', padding: '16px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                <div style={{ color: '#64748B', fontSize: '10px', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '8px', textTransform: 'uppercase', lineHeight: '1.4' }}>
                  Number of free chats till now
                </div>
                <div style={{ color: '#38BDF8', fontSize: '24px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  {payoutStats?.freeLiveChats || 0}
                </div>
              </div>

              <div style={{ flex: 1, background: '#1E293B', borderRadius: '14px', padding: '16px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                <div style={{ color: '#64748B', fontSize: '10px', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '8px', textTransform: 'uppercase', lineHeight: '1.4' }}>
                  Number of paid chats till now
                </div>
                <div style={{ color: '#38BDF8', fontSize: '24px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  {payoutStats?.paidLiveChats || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        margin: '0 auto',
        width: '100%',
        maxWidth: '390px',
        background: '#13151f',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '12px 0 24px',
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
                color: isActive ? '#00e5ff' : '#64748b',
                fontSize: '10px',
                fontWeight: 600,
                gap: '4px'
              }}
            >
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>
      {/* View All Modal */}
      {isViewAllModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.7)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            background: '#13151f',
            width: '90%',
            maxWidth: '390px',
            maxHeight: '80vh',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ 
              padding: '20px', 
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>All Referred Creators</h2>
              <button 
                onClick={() => setIsViewAllModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: 0,
                  lineHeight: 1
                }}
              >×</button>
            </div>
            
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ 
                background: 'rgba(0,0,0,0.2)', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center',
                padding: '10px 12px',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <span style={{ color: '#64748b', marginRight: '8px' }}>🔍</span>
                <input 
                  type="text" 
                  placeholder="Search by name or handle..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ 
                    background: 'transparent', 
                    border: 'none', 
                    color: '#fff', 
                    fontSize: '14px',
                    width: '100%',
                    outline: 'none'
                  }} 
                />
              </div>
            </div>
            
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              {filteredReferrals
                .filter(c => 
                  (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (c.handle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
                )
                .sort((a, b) => {
                  if (filterOption === 'Highest to Lowest') return b.rawEarnings - a.rawEarnings;
                  if (filterOption === 'Lowest to Highest') return a.rawEarnings - b.rawEarnings;
                  return 0;
                })
                .map((creator) => (
                <div key={creator.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={creator.img} alt={creator.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>{creator.name}</span>
                        <span style={{ 
                          fontSize: '10px', 
                          padding: '2px 6px', 
                          borderRadius: '4px',
                          color: creator.status === 'Active' ? '#34d399' : '#f87171',
                          border: `1px solid ${creator.status === 'Active' ? '#34d399' : '#f87171'}`,
                          background: 'rgba(0,0,0,0.2)'
                        }}>
                          {creator.status}
                        </span>
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '12px' }}>{creator.handle}</div>
                      <div style={{ color: '#64748b', fontSize: '10px', marginTop: '2px' }}>Joined {creator.joined}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#94a3b8', fontSize: '11px', marginBottom: '2px' }}>Earnings</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: creator.earnings !== '₹0' ? '#34d399' : '#e2e8f0' }}>{creator.earnings}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
    </>
  );
};

export default CreatorAnalytics;
