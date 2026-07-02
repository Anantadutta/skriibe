/**
 * @file CreatorDashboard.jsx
 * @description Creator dashboard route showing mock data if username matches mockCreator.username, else 404.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import TransparentLogo from '../components/TransparentLogo';
import { mockCreator, mockQuestions } from '../mock/questions';
import { getMe, toggleLive } from '../services/creatorApi';
import api from '../services/api';
import { switchRole } from '../services/fanApi';
import { useAuth } from '../context/AuthContext';
import { getCurrencySymbol } from '../utils/phoneValidation';

const CreatorDashboard = () => {
  const { username } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { roles, setAuthData } = useAuth();

  const [creator, setCreator] = useState(location.state?.creator || null);
  const [loadingInitial, setLoadingInitial] = useState(!location.state?.creator);
  const [isLive, setIsLive] = useState(creator?.isLive !== false);
  const [btnHover, setBtnHover] = useState(false);
  const [payoutStats, setPayoutStats] = useState({ available: 0 });
  const [questions, setQuestions] = useState([]);
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [abusivePopupQuestion, setAbusivePopupQuestion] = useState(null);

  const currencySymbol = getCurrencySymbol(creator?.phone);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchCreator = async () => {
      try {
        const res = await getMe();
        if (res.success) {
          if (!res.creator.handle && !res.creator.onboardingComplete && !res.creator.ama_enabled) {
            navigate('/onboard/profile', { replace: true });
            return;
          }
          setCreator(res.creator);
          setIsLive(res.creator.isLive !== false);
        }
      } catch (error) {
        console.error('Failed to fetch creator:', error);
      } finally {
        setLoadingInitial(false);
      }
    };
    // Always fetch latest data from backend on dashboard mount to ensure all stats (including weekly goal) are perfectly in sync
    fetchCreator();

    const fetchQuestions = async () => {
      try {
        const res = await api.get(`/creator/questions?t=${Date.now()}`);
        if (res.data.success) {
          setQuestions(res.data.questions);
        }
      } catch (err) {
        console.error('Error fetching questions:', err);
      }
    };

    const fetchPayouts = async () => {
      try {
        const res = await api.get('/creator/payouts');
        if (res.data.success) {
          setPayoutStats(res.data);
        }
      } catch (err) {
        console.error('Error fetching payouts:', err);
      }
    };

    fetchQuestions();
    fetchPayouts();
  }, [location.state?.creator]);

  useEffect(() => {
    if (questions.length > 0) {
      const resolvedAbusiveQ = questions.find(q => 
        q.status === 'resolved' && 
        q.adminDecision === 'abusive' && 
        !localStorage.getItem(`ack_abusive_${q._id || q.id}`)
      );
      if (resolvedAbusiveQ) {
        setAbusivePopupQuestion(resolvedAbusiveQ);
      }
    }
  }, [questions]);

  const cleanUsername = username ? username.replace('@', '') : '';
  const show404 = username ? (cleanUsername !== creator.handle && cleanUsername !== mockCreator.username) : false;

  const navItems = [
    { label: 'HOME', icon: '🏠', route: '/creator/dashboard' },
    { label: 'INBOX', icon: '💬', route: '/creator/inbox' },
    { label: 'PAYOUTS', icon: '💰', route: '/creator/payouts' },
    { label: 'SETTINGS', icon: '⚙️', route: '/creator/settings' },
  ];

  const handleToggle = async () => {
    const newStatus = !isLive;
    setIsLive(newStatus); // Optimistic UI update
    setCreator(prev => ({ ...prev, isLive: newStatus }));
    try {
      await toggleLive(newStatus);
    } catch (err) {
      console.error('Failed to toggle live status:', err);
      // Revert on failure
      setIsLive(!newStatus);
      setCreator(prev => ({ ...prev, isLive: !newStatus }));
      alert('Failed to update live status. Please try again.');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`skriibe.com/${creator.handle || ''}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loadingInitial) {
    return (
      <div style={{ background: '#0a0a0f', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(124, 58, 237, 0.3)', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>
          {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
        </style>
      </div>
    );
  }

  if (show404) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0E0E0E',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600 }}>Creator not found</h2>
      </div>
    );
  }

  if (!creator) {
    return (
      <div style={{ background: '#0a0a0f', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#fff' }}>
        <h2>Error Loading Creator</h2>
        <button onClick={() => navigate('/creator/login')} style={{ marginTop: '16px', padding: '10px 20px', background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Return to Login</button>
      </div>
    );
  }

  // Cyan filter: to make emojis turn cyan #29C5F6
  const cyanFilter = 'invert(69%) sepia(87%) saturate(2714%) hue-rotate(164deg) brightness(99%) contrast(98%)';
  // Gray filter
  const grayFilter = 'invert(31%) sepia(13%) saturate(760%) hue-rotate(181deg) brightness(96%) contrast(85%)';

  const displayUserName = creator.name || creator.displayName || creator.handle || '';
  const avatarLetter = (displayUserName[0] || 'T').toUpperCase();

  const getGreeting = () => {
    // Get current time in IST
    const options = { timeZone: 'Asia/Kolkata', hour: 'numeric', hour12: false };
    const formatter = new Intl.DateTimeFormat([], options);
    const hour = parseInt(formatter.format(new Date()), 10);
    
    if (hour >= 5 && hour < 12) {
      return "Good morning";
    } else if (hour >= 12 && hour < 17) {
      return "Good afternoon";
    } else if (hour >= 17 && hour < 21) {
      return "Good evening";
    } else {
      // Suggestion for late night greeting instead of just "Good night"
      return "Hope you're having a great night"; 
    }
  };

  const totalReceived = questions.length;
  const pendingCount = questions.filter(q => q.status?.toLowerCase() === 'pending').length;
  const disputeCount = questions.filter(q => q.status?.toLowerCase() === 'flagged').length;
  const repliedQuestions = questions.filter(q => ['answered', 'satisfied', 'rejected'].includes(q.status?.toLowerCase()));
  
  const denominator = totalReceived - pendingCount - disputeCount;
  const dynamicReplyRate = denominator > 0 
    ? Math.round((repliedQuestions.length / denominator) * 100)
    : 0;

  const getPayoutInfo = (createdAtStr) => {
    const now = new Date();
    
    const getNextTuesdayAfter = (date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const day = d.getDay();
      let diff = (7 - day + 2) % 7;
      if (diff === 0) diff = 7;
      d.setDate(d.getDate() + diff);
      
      const originalDate = new Date(date);
      originalDate.setHours(0,0,0,0);
      const msDiff = d.getTime() - originalDate.getTime();
      const daysDiff = Math.round(msDiff / (1000 * 3600 * 24));
      
      if (daysDiff < 7) {
        d.setDate(d.getDate() + 7);
      }
      return d;
    };

    if (!createdAtStr) {
      return { 
        nextPayoutDate: getNextTuesdayAfter(now), 
        lastPayoutDate: new Date(0) 
      };
    }

    const createdAt = new Date(createdAtStr);
    const firstPayout = getNextTuesdayAfter(createdAt);
    
    if (now < firstPayout) {
      return {
        nextPayoutDate: firstPayout,
        lastPayoutDate: new Date(0)
      };
    } else {
      const lastPayout = new Date(now);
      lastPayout.setHours(0,0,0,0);
      const day = lastPayout.getDay();
      const diff = (day + 7 - 2) % 7;
      lastPayout.setDate(lastPayout.getDate() - diff);
      
      const nextPayout = new Date(lastPayout);
      nextPayout.setDate(nextPayout.getDate() + 7);
      
      return {
        nextPayoutDate: nextPayout,
        lastPayoutDate: lastPayout
      };
    }
  };

  const { lastPayoutDate } = getPayoutInfo(creator?.createdAt);

  const getCommissionRate = (questionDate) => {
    let rate = 0.8;
    if (creator?.commissionOverride?.startDate) {
       const start = new Date(creator.commissionOverride.startDate);
       const end = creator.commissionOverride.endDate ? new Date(creator.commissionOverride.endDate) : null;
       start.setHours(0,0,0,0);
       if (end) end.setHours(23,59,59,999);
       
       const qDate = new Date(questionDate);
       
       if (qDate >= start && (!end || qDate <= end)) {
          rate = (creator.commissionOverride.creatorShare || 80) / 100;
       }
    }
    return rate;
  };

  const dynamicWeeklyEarnings = payoutStats?.availableGross || 0;
  const dynamicWeeklyGoalProgress = payoutStats?.available || 0;
  const handleAcknowledgeAbusive = () => {
    if (abusivePopupQuestion) {
      localStorage.setItem(`ack_abusive_${abusivePopupQuestion._id || abusivePopupQuestion.id}`, 'true');
      setAbusivePopupQuestion(null);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0E0E0E',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxSizing: 'border-box',
      overflowX: 'hidden',
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

      {/* Abusive Dispute Resolved Modal */}
      {abusivePopupQuestion && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#1A1A24', border: '1px solid #38BDF8', borderRadius: '20px', padding: '32px', maxWidth: '360px', width: '100%', textAlign: 'center', boxShadow: '0 0 40px rgba(56, 189, 248, 0.15)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛡️</div>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>Message from Admin</h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '16px' }}>
              We've reviewed the abusive question you flagged from <strong>{abusivePopupQuestion.buyerName || abusivePopupQuestion.followerName || 'a fan'}</strong>.
            </p>
            <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
              <p style={{ color: '#38BDF8', margin: '0 0 8px 0', fontWeight: 700 }}>You get the payment, and the question stays closed.</p>
              <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.85rem' }}>The fan has been banned from the platform.</p>
            </div>
            <button 
              onClick={handleAcknowledgeAbusive}
              style={{ width: '100%', background: '#38BDF8', color: '#0F172A', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '1rem', fontWeight: 800, cursor: 'pointer' }}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Container to restrict width */}
      <div style={{
        width: '100%',
        maxWidth: '390px',
        padding: '12px 20px 120px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>

        {/* 1. TOP BAR */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          padding: '0 0 4px 0'
        }}>
          {/* Logo & Greeting */}
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>

            {/* Aesthetic Glow Shader */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '180px',
              height: '120px',
              background: 'radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, rgba(56, 189, 248, 0) 70%)',
              filter: 'blur(24px)',
              pointerEvents: 'none',
              zIndex: 0
            }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center' }}>
                <TransparentLogo src="/logo.png" alt="skriibe logo" style={{ height: '24px', width: 'auto', transform: 'scale(4)', transformOrigin: 'left center' }} />
              </div>
            </div>
            <div style={{ position: 'relative', zIndex: 1, color: '#94a3b8', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {getGreeting()}
              <div style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '1rem' }}>
                {displayUserName}
              </div>
            </div>
          </div>

          {/* Icons: Bell and Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Bell */}
            <div 
              onClick={() => navigate('/creator/notifications')}
              style={{
                position: 'relative',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#1A1A1A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                cursor: 'pointer'
              }}
            >
              <span style={{ filter: 'grayscale(100%) sepia(100%) hue-rotate(350deg) saturate(500%) brightness(1.2)' }}>🔔</span>
              {questions.filter(q => q.status?.toLowerCase() === 'submitted').length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#EF4444',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  border: '2px solid #0E0E0E'
                }}>
                  {questions.filter(q => q.status?.toLowerCase() === 'submitted').length}
                </div>
              )}
            </div>

            {/* Avatar */}
            <div 
              onClick={() => navigate('/creator/settings')}
              style={{ position: 'relative', cursor: 'pointer' }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#29C5F6',
                border: '2px solid #0E0E0E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                color: '#0E0E0E',
                fontSize: '18px'
              }}>
                {avatarLetter}
              </div>
              <div style={{
                position: 'absolute',
                bottom: '0px',
                right: '0px',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: isLive ? '#22C55E' : '#EF4444',
                border: '2px solid #0E0E0E',
                transition: 'background-color 0.3s ease'
              }} />
            </div>
          </div>
        </div>

        {/* 2. EARNINGS CARD */}
        <div style={{
          background: 'linear-gradient(145deg, #13161C 0%, #0B0D13 100%)',
          borderRadius: '20px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          border: '1px solid #1F2937',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Aesthetic glow in the corner */}
          <div style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '150px',
            height: '150px',
            background: 'radial-gradient(circle, rgba(41, 197, 246, 0.15) 0%, rgba(41, 197, 246, 0) 70%)',
            filter: 'blur(30px)',
            pointerEvents: 'none'
          }} />

          <div>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
              EARNINGS · THIS WEEK
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', marginTop: '4px' }}>
              <span style={{ fontSize: '2.2rem', color: '#29C5F6', marginRight: '4px' }}>{currencySymbol}</span>
              <span style={{ fontSize: '3rem', fontWeight: 900, color: '#fff', letterSpacing: '-1.5px' }}>{dynamicWeeklyEarnings || 0}</span>
            </div>
            
            <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, marginTop: '8px' }}>
              Accepting messages. <span style={{ color: '#38bdf8' }}>{currencySymbol}{creator.pricePerQuestion || 0}</span>/message.
            </div>

          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8' }}>
              <span>Weekly goal</span>
              <span><strong style={{ color: '#fff' }}>{currencySymbol}{dynamicWeeklyGoalProgress}</strong> / {currencySymbol}{creator.weeklyGoal || 1500}</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: '#1F2937', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, (dynamicWeeklyGoalProgress / (creator.weeklyGoal || 1500)) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, #29C5F6 0%, #38BDF8 100%)', borderRadius: '4px' }} />
            </div>
          </div>
        </div>

        {/* 3. STATS ROW */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px'
        }}>
          <div style={{
            background: '#13161C',
            border: '1px solid #1F2937',
            borderRadius: '16px',
            padding: '16px 8px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#F87171' }}>
              {questions.filter(q => q.status?.toLowerCase() === 'submitted').length}
            </div>
            <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: '4px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>PENDING</div>
          </div>
          <div style={{
            background: '#13161C',
            border: '1px solid #1F2937',
            borderRadius: '16px',
            padding: '16px 8px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#34D399' }}>{dynamicReplyRate}%</div>
            <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: '4px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>REPLY RATE</div>
          </div>
        </div>

        {/* 4. LIVE STATUS BANNER */}
        <div 
          onClick={() => {
            if (creator?.isPaused) {
              navigate('/creator/settings', { state: { highlightPause: true } });
            }
          }}
          style={{
            background: creator?.isPaused ? '#13161C' : (isLive ? 'rgba(45, 212, 191, 0.04)' : '#13161C'),
            border: creator?.isPaused ? '1px solid #ef4444' : (isLive ? '1px solid rgba(45, 212, 191, 0.3)' : '1px solid #1F2937'),
            borderRadius: '16px',
            padding: '14px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: 'all 0.3s ease',
            cursor: creator?.isPaused ? 'pointer' : 'default'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: creator?.isPaused ? '#ef4444' : (isLive ? '#2DD4BF' : '#94a3b8'),
                transition: 'background-color 0.3s ease'
              }} />
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: creator?.isPaused ? '#ef4444' : '#ffffff' }}>
                {creator?.isPaused ? 'Account paused by yourself temporarily' : `You're ${isLive ? 'LIVE' : 'OFFLINE'}`}
              </span>
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '6px' }}>
              {creator?.isPaused 
                ? 'Not accepting messages temporarily' 
                : (isSavingStatus ? 'Updating...' 
                : (isLive ? 'Go offline on break, live again when back.' : 'Currently offline'))}
            </div>
          </div>

          <div 
            onClick={(e) => {
              if (creator?.isPaused) {
                e.stopPropagation();
                navigate('/creator/settings', { state: { highlightPause: true } });
              } else {
                handleToggle();
              }
            }}
            style={{
              width: '44px',
              height: '26px',
              borderRadius: '13px',
              background: isLive ? '#2DD4BF' : '#1F2937',
              position: 'relative',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              background: '#ffffff',
              position: 'absolute',
              top: '2px',
              left: isLive ? '20px' : '2px',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }} />
          </div>
        </div>

        {/* SETUP PAYOUTS */}
        {!creator.bankLinked ? (
          <div 
            onClick={() => navigate('/creator/setup-payouts')}
            style={{ 
              background: '#13161C', 
              border: '1px dashed #F59E0B', 
              borderRadius: '16px', 
              padding: '20px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              cursor: 'pointer',
              marginTop: '4px'
            }}
          >
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', minWidth: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B', fontSize: '1.5rem' }}>
                🏦
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff' }}>Setup payouts</div>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '4px', lineHeight: '1.4' }}>
                  Link your bank account to start receiving earnings.
                </div>
              </div>
            </div>
            <div style={{ background: '#F59E0B', color: '#0F172A', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800 }}>
              Setup
            </div>
          </div>
        ) : (
          <div 
            style={{ 
              background: '#13161C', 
              border: '1px solid #1F2937', 
              borderRadius: '16px', 
              padding: '16px 20px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginTop: '4px'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff' }}>HDFC Bank - Savings</div>
              <div style={{ color: '#10B981', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                ✓ Verified via penny drop
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800 }}>
                Linked
              </div>
              <span 
                onClick={() => navigate('/creator/setup-payouts', { state: { creator } })}
                style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Edit details
              </span>
            </div>
          </div>
        )}

        {/* ACCOUNT HEALTH */}
        <h3 style={{ margin: '4px 0 0', fontSize: '1.1rem', fontWeight: 800 }}>Account health</h3>
        <div 
          onClick={() => navigate('/creator/health')}
          style={{ background: '#13161C', border: '1px solid #1F2937', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>Looking strong</span>
                <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', padding: '4px 8px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800 }}>Good</span>
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '6px', lineHeight: '1.4' }}>
                {creator?.stats?.replyRate || 0}% reply rate · {creator?.sla?.breaches || 0} SLA breaches · {creator?.sla?.strikes || 0} strikes
              </div>
            </div>
          </div>
          <div style={{ color: '#64748b' }}>→</div>
        </div>

        {/* 5. ANSWER & EARN (Inbox preview) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            Answer & earn 
            <span style={{ background: '#2A2A2A', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', color: '#94a3b8' }}>
              {questions.filter(q => q.status?.toLowerCase() === 'submitted').length}
            </span>
          </h3>
          <span 
            onClick={() => navigate('/creator/inbox')}
            style={{ color: '#29C5F6', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
          >
            Go to inbox →
          </span>
        </div>
        
        {/* Render 2 pending questions */}
        {(() => {
          const pendingQuestions = questions.filter(q => q.status?.toLowerCase() === 'submitted');
          if (pendingQuestions.length === 0) {
            return (
              <div style={{ background: '#1A1A1A', border: '1px dashed #2A2A2A', borderRadius: '16px', padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                No pending messages right now.
              </div>
            );
          }
          return pendingQuestions.slice(0, 2).map((q, idx) => {
            const diffMs = now - new Date(q.createdAt || now).getTime();
            const hoursAgo = Math.floor(diffMs / (1000 * 60 * 60));
            const minutesAgo = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            let timeText = '';
            if (hoursAgo > 0) {
              timeText = `${hoursAgo}h ago`;
            } else if (minutesAgo > 0) {
              timeText = `${minutesAgo}m ago`;
            } else {
              timeText = `Just now`;
            }

            let timerColor = '#10B981'; // Green for recent
            let timerBg = 'rgba(16, 185, 129, 0.15)';
            if (hoursAgo > 20) {
              timerColor = '#EF4444'; // Red for urgent (close to 24h limit)
              timerBg = 'rgba(239, 68, 68, 0.15)';
            } else if (hoursAgo > 12) {
              timerColor = '#F59E0B'; // Yellow
              timerBg = 'rgba(245, 158, 11, 0.15)';
            }

            return (
              <div key={q._id || idx} style={{ background: '#13161C', border: '1px solid #1F2937', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {(() => {
                      const url = q.fanId?.avatarUrl;
                      let finalAvatarUrl = url;
                      if (url && !url.startsWith('http') && !url.startsWith('blob:')) {
                        const backendBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
                        finalAvatarUrl = url.startsWith('/uploads') ? `${backendBase}${url}` : url;
                      }
                      return finalAvatarUrl ? (
                        <img 
                          src={finalAvatarUrl} 
                          alt="" 
                          style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} 
                          onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null;
                    })()}
                    <div style={{ display: q.fanId?.avatarUrl ? 'none' : 'flex', width: '40px', height: '40px', borderRadius: '8px', background: '#1E293B', color: '#38BDF8', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', flexShrink: 0 }}>
                      {(q.buyerName || q.followerName || 'A')[0].toUpperCase()}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ color: '#FBBF24', fontSize: '0.8rem', fontWeight: 600, marginBottom: '2px' }}>
                        {q.isFollowUp ? 'Follow-up Question' : 'New Question'}
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>
                        {q.buyerName || q.followerName} <span style={{ color: '#38BDF8' }}>· {q.isFollowUp ? 'Free' : `${currencySymbol}${q.amountPaid || q.pricePaid}`}</span>
                      </span>
                    </div>
                  </div>
                  <div style={{ background: timerBg, color: timerColor, padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    ⏱ {timeText}
                  </div>
                </div>
                <div style={{ fontSize: '0.95rem', color: '#cbd5e1', lineHeight: '1.5', wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                  "{q.questionText}"
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={() => {
                      const rootQuestion = q.isFollowUp ? questions.find(r => (r._id || r.id) === q.parentQuestionId) : null;
                      navigate(`/creator/dashboard/reply/${q._id || q.id}`, { state: { question: q, rootQuestion } });
                    }}
                    style={{ flex: 1, background: 'linear-gradient(90deg, #38BDF8 0%, #34D399 100%)', color: '#0F172A', border: 'none', borderRadius: '12px', padding: '14px', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer' }}
                  >
                    Reply
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const rootQuestion = q.isFollowUp ? questions.find(r => (r._id || r.id) === q.parentQuestionId) : null;
                      navigate(`/creator/dashboard/reply/${q._id || q.id}`, { state: { question: q, rootQuestion, initialView: 'flag' } });
                    }}
                    style={{ width: '48px', background: '#1F2937', border: 'none', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
                  </button>
                </div>
              </div>
            );
          });
        })()}



        {/* 7. SHARE LINK */}
        <div style={{ background: '#13161C', border: '1px dashed #1F2937', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>

            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>Share your link & get more messages</div>
              <div style={{ color: '#38BDF8', fontSize: '0.85rem', marginTop: '4px' }}>skriibe.com/{creator.handle || ''}</div>
            </div>
          </div>
          <button 
            onClick={handleCopy}
            style={{ 
              background: copied ? 'rgba(16, 185, 129, 0.15)' : '#1E293B', 
              color: copied ? '#10B981' : '#E2E8F0', 
              border: 'none', 
              borderRadius: '12px', 
              padding: '10px 16px', 
              fontWeight: 700, 
              fontSize: '0.85rem', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s ease',
              minWidth: '64px',
              justifyContent: 'center'
            }}
          >
            {copied ? (
              <>
                <span style={{ fontSize: '0.9rem', fontWeight: 900 }}>✓</span> Copied
              </>
            ) : (
              'Copy'
            )}
          </button>
        </div>

        {/* 8. SWITCH TO FAN MODE CTA */}
        {(

          <div 
            onClick={async () => {
              try {
                const res = await switchRole('fan');
                if (res.success) {
                  setAuthData(roles, 'fan', res.token);
                  window.location.href = '/discovery';
                }
              } catch (err) {
                alert(`Failed to switch: ${err.response?.data?.message || err.message}`);
              }
            }}
            style={{ 
              background: 'rgba(56, 189, 248, 0.05)', 
              border: '1px solid rgba(56, 189, 248, 0.3)', 
              borderRadius: '16px', 
              padding: '20px', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              marginTop: '12px',
              cursor: 'pointer',
              gap: '12px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(56, 189, 248, 0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(56, 189, 248, 0.05)'; }}
          >
            <span style={{ fontSize: '1.4rem', filter: 'hue-rotate(60deg)' }}>👤</span>
            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#38bdf8' }}>Switch to Fan Mode →</span>
          </div>
        )}


      </div>

      {/* 9. BOTTOM NAV BAR */}
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
        padding: '12px 0 24px',
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
                fontSize: '0.65rem',
                letterSpacing: '1px',
                fontWeight: 800,
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

    </div>
  );
};

export default CreatorDashboard;
