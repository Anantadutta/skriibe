/**
 * @file CreatorDashboard.jsx
 * @description Creator dashboard route showing mock data if username matches mockCreator.username, else 404.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import TransparentLogo from '../components/TransparentLogo';
import { mockCreator, mockQuestions } from '../mock/questions';
import { getMe, toggleLive, toggleLiveChat, updateLiveChatPrice, getMyReferrals } from '../services/creatorApi';
import api from '../services/api';
import { switchRole } from '../services/fanApi';
import { useAuth } from '../context/AuthContext';
import { getCurrencySymbol } from '../utils/phoneValidation';
import { getImageUrl } from '../utils/imageUtils';
import { io } from 'socket.io-client';

const CreatorDashboard = () => {
  const { username } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { roles, setAuthData } = useAuth();

  const [creator, setCreator] = useState(location.state?.creator || null);
  const [loadingInitial, setLoadingInitial] = useState(!location.state?.creator);
  const [isLive, setIsLive] = useState(creator?.isLive === true);
  const [isLiveChatEnabled, setIsLiveChatEnabled] = useState(creator?.liveChatEnabled !== false);
  const [liveChatPrice, setLiveChatPrice] = useState(creator?.liveChatPrice || 5);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [btnHover, setBtnHover] = useState(false);
  const [payoutStats, setPayoutStats] = useState({ available: 0 });
  const [questions, setQuestions] = useState([]);
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [abusivePopupQuestion, setAbusivePopupQuestion] = useState(null);
  const [pendingChats, setPendingChats] = useState([]);
  const [missedChats, setMissedChats] = useState([]);
  const [cancelledSessions, setCancelledSessions] = useState(() => {
    try {
      localStorage.removeItem('skriibe_dismissed_fans');
      const saved = JSON.parse(localStorage.getItem('skriibe_dismissed_sessions') || '[]');
      return new Set(saved);
    } catch (e) {
      return new Set();
    }
  });
  const [acceptedChatsCount, setAcceptedChatsCount] = useState(0);
  const [showNotifySuccessModal, setShowNotifySuccessModal] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const dismissSession = (sessionId) => {
    if (!sessionId) return;
    const sid = String(sessionId);

    try {
      const savedSessions = JSON.parse(localStorage.getItem('skriibe_dismissed_sessions') || '[]');
      if (!savedSessions.includes(sid)) {
        savedSessions.push(sid);
        localStorage.setItem('skriibe_dismissed_sessions', JSON.stringify(savedSessions));
      }
    } catch (e) {}

    setCancelledSessions(prev => new Set(prev).add(sid));
    setPendingChats(prev => prev.filter(c => String(c.sessionId) !== sid));
  };

  // Filter out cancelled, accepted, or expired (> 120s) chats
  const validPendingChats = pendingChats.filter(chat => {
    if (!chat || !chat.sessionId) return false;
    const sid = String(chat.sessionId);

    if (cancelledSessions.has(sid)) return false;

    if (!chat.isContinueChat) {
      try {
        const savedSessions = JSON.parse(localStorage.getItem('skriibe_dismissed_sessions') || '[]');
        if (savedSessions.includes(sid)) return false;
      } catch (e) {}
    }

    if (chat.creatorJoined || chat.fanAccepted || chat.status === 'ended') return false;
    const chatTimeMs = chat.time ? new Date(chat.time).getTime() : 0;
    if (!chatTimeMs || isNaN(chatTimeMs)) return false;
    const timeDiff = now - chatTimeMs;
    if (timeDiff >= 120000) return false;
    return true;
  });
  
  // Referrals Modal State
  const [showReferralsModal, setShowReferralsModal] = useState(false);
  const [referralsList, setReferralsList] = useState([]);
  const [loadingReferrals, setLoadingReferrals] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showMissedChatsModal, setShowMissedChatsModal] = useState(false);

  const currencySymbol = getCurrencySymbol(creator?.phone);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchCreator = async () => {
      try {
        const res = await getMe();
        if (res.success) {
          if (!res.creator.handle) {
            navigate('/onboard/profile', { replace: true });
            return;
          }
          setCreator(res.creator);
          setIsLive(res.creator.isLive === true);
          setIsLiveChatEnabled(res.creator.liveChatEnabled !== false);
          setLiveChatPrice(res.creator.liveChatPrice || 5);
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

    const fetchNotifications = async () => {
      try {
        const res = await api.get(`/creator/notifications?t=${Date.now()}`);
        if (res.data.success) {
          setNotifications(res.data.notifications);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
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

    // Live Chat integration
    const fetchPendingChats = async () => {
      try {
        const res = await api.get(`/chat/pending?t=${Date.now()}`);
        if (res.data.success) {
          let savedSessions = [];
          try {
            savedSessions = JSON.parse(localStorage.getItem('skriibe_dismissed_sessions') || '[]');
          } catch (e) {}
          const filtered = res.data.pendingChats.filter(c => {
            const sid = String(c.sessionId);
            if (!c.isContinueChat && savedSessions.includes(sid)) return false;
            if (c.creatorJoined || c.fanAccepted || c.status === 'ended') return false;
            return true;
          });
          setPendingChats(filtered);
        }
      } catch (err) {
        console.error('Failed to fetch pending chats:', err);
      }
    };

    const fetchMissedChats = async () => {
      try {
        const res = await api.get(`/chat/creator-history?t=${Date.now()}`);
        if (res.data.success) {
          const nowMs = Date.now();
          const missed = res.data.sessions.filter(s => {
            if (s.totalMinutes !== 0 || s.notifiedMissed) return false;
            const chatTime = new Date(s.endTime || s.startTime || s.createdAt).getTime();
            return (nowMs - chatTime) <= 24 * 60 * 60 * 1000;
          });
          setMissedChats(missed);
          
          // Calculate accepted chats this week (totalMinutes > 0 and within last 7 days)
          const now = new Date();
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          
          const acceptedThisWeek = res.data.sessions.filter(s => {
            if (s.totalMinutes === 0) return false;
            const chatTime = new Date(s.endTime || s.startTime || s.createdAt);
            return chatTime >= sevenDaysAgo;
          });
          setAcceptedChatsCount(acceptedThisWeek.length);
        }
      } catch (err) {
        console.error('Failed to fetch missed chats:', err);
      }
    };

    fetchQuestions();
    fetchNotifications();
    fetchPayouts();
    fetchPendingChats();
    fetchMissedChats();

    const interval = setInterval(() => {
      fetchQuestions();
      fetchNotifications();
      fetchPayouts();
      fetchPendingChats();
      fetchMissedChats();
    }, 5000);

    let newSocket = null;
    if (location.state?.creator || creator) {
      const currentCreator = location.state?.creator || creator;
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const socketUrl = apiUrl.replace('/api', '');
      newSocket = io(socketUrl, { transports: ['websocket', 'polling'] });

      newSocket.on('connect', () => {
        newSocket.emit('join_creator_room', { creatorId: currentCreator._id || currentCreator.id });
      });
      if (newSocket.connected) {
        newSocket.emit('join_creator_room', { creatorId: currentCreator._id || currentCreator.id });
      }

      newSocket.on('incoming_chat_request', (data) => {
        if (!data || !data.sessionId) return;
        const sid = String(data.sessionId);

        // A new chat request arrived - un-dismiss this sessionId so it displays!
        try {
          const savedSessions = JSON.parse(localStorage.getItem('skriibe_dismissed_sessions') || '[]');
          if (savedSessions.includes(sid)) {
            const updated = savedSessions.filter(s => s !== sid);
            localStorage.setItem('skriibe_dismissed_sessions', JSON.stringify(updated));
          }
        } catch (e) {}

        setCancelledSessions(prev => {
          const next = new Set(prev);
          next.delete(sid);
          return next;
        });

        setPendingChats(prev => {
          const filtered = prev.filter(c => String(c.sessionId) !== sid);
          return [data, ...filtered];
        });
      });

      newSocket.on('fan_profile_updated', (data) => {
        if (!data || !data.fanId) return;
        setPendingChats(prev => prev.map(chat => {
          const chatFanId = (chat.fanId?._id || chat.fanId || '').toString();
          if (chatFanId === String(data.fanId)) {
            return {
              ...chat,
              fanName: data.name,
              ...(data.avatarUrl ? { fanAvatarUrl: data.avatarUrl } : {})
            };
          }
          return chat;
        }));
        setTimeout(() => {
          fetchPendingChats();
          fetchQuestions();
        }, 300);
      });

      newSocket.on('creator_joined', (data) => {
        if (data && data.sessionId) {
          dismissSession(data.sessionId);
        }
        setTimeout(() => {
          fetchPendingChats();
          fetchMissedChats();
        }, 300);
      });

      newSocket.on('fan_accepted', (data) => {
        if (data && data.sessionId) {
          dismissSession(data.sessionId);
        }
        setTimeout(() => {
          fetchPendingChats();
          fetchMissedChats();
        }, 300);
      });

      newSocket.on('creator_declined', (data) => {
        if (data && data.sessionId) {
          dismissSession(data.sessionId);
        }
        setTimeout(() => {
          fetchPendingChats();
          fetchMissedChats();
        }, 300);
      });

      newSocket.on('chat_cancelled_by_fan', (data) => {
        if (data && data.sessionId) {
          dismissSession(data.sessionId);
        }
        setTimeout(() => {
          fetchPendingChats();
          fetchMissedChats();
        }, 300);
      });

      newSocket.on('chat_ended', (data) => {
        if (data && data.sessionId) {
          dismissSession(data.sessionId);
        }
        setTimeout(() => {
          fetchPendingChats();
          fetchMissedChats();
        }, 300);
      });

      newSocket.on('chat-session-ended', (data) => {
        if (data && data.sessionId) {
          dismissSession(data.sessionId);
        }
        setTimeout(() => {
          fetchPendingChats();
          fetchMissedChats();
        }, 300);
      });
    }

    return () => {
      clearInterval(interval);
      if (newSocket) newSocket.disconnect();
    };
  }, [creator?._id, creator?.id]);

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
    { label: 'CHATS', icon: '💬', route: '/creator/inbox' },
    { label: 'TRANSACTIONS', icon: '💰', route: '/creator/payouts' },
    { label: 'ANALYTICS', icon: '📊', route: '/creator/analytics' },
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

  const handleLiveChatToggle = async () => {
    const newStatus = !isLiveChatEnabled;
    setIsLiveChatEnabled(newStatus);
    setCreator(prev => ({ ...prev, liveChatEnabled: newStatus }));
    try {
      await toggleLiveChat(newStatus);
    } catch (err) {
      console.error('Failed to toggle live chat status:', err);
      setIsLiveChatEnabled(!newStatus);
      setCreator(prev => ({ ...prev, liveChatEnabled: !newStatus }));
      alert('Failed to update live chat status. Please try again.');
    }
  };

  const handleDeclineChat = async (sessionId) => {
    if (!sessionId) return;
    dismissSession(sessionId);
    try {
      await api.post('/chat/end', { sessionId, reason: 'CREATOR_DECLINED' });
    } catch (e) {
      console.error('Failed to decline chat via API', e);
    }
  };

  const handleAcceptChat = async (sessionId) => {
    if (!sessionId) return;
    dismissSession(sessionId);
    try {
      const res = await api.post('/chat/creator-accept', { sessionId });
      if (!res.data.success) {
        alert('This chat request has already ended or expired.');
        return;
      }
    } catch (e) {
      console.error('Failed to notify creator acceptance', e);
      alert('This chat request has already ended or expired.');
      return;
    }
    navigate(`/creator/dashboard/live-chat/${sessionId}`);
  };

  const handlePriceUpdate = async () => {
    try {
      const res = await updateLiveChatPrice(Number(liveChatPrice));
      if (res.data?.success || res.success) {
        setCreator(prev => ({ ...prev, liveChatPrice: Number(liveChatPrice) }));
        setIsEditingPrice(false);
      } else {
        throw new Error('Failed to update price');
      }
    } catch (err) {
      console.error('Failed to update live chat price:', err);
      alert('Failed to update price. Please try again.');
      setLiveChatPrice(creator.liveChatPrice || 5); // Revert
      setIsEditingPrice(false);
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

  const handleOpenReferrals = () => {
    navigate('/creator/analytics', { state: { creator } });
  };

  const totalReceived = questions.length;
  const pendingCount = questions.filter(q => q.status?.toLowerCase() === 'pending').length;
  const disputeCount = questions.filter(q => q.status?.toLowerCase() === 'flagged').length;
  const repliedQuestions = questions.filter(q => ['answered', 'satisfied', 'rejected'].includes(q.status?.toLowerCase()));

  const readIds = JSON.parse(localStorage.getItem('creatorReadNotifications') || '[]');
  const unreadNotificationsCount = notifications.filter(n => !readIds.includes(n.id)).length;
  
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
    <>
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
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
        }
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: #4b5563;
          transition: .4s;
          border-radius: 24px;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        input:checked + .slider {
          background-color: #22C55E;
        }
        input:checked + .slider:before {
          transform: translateX(20px);
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
                <Link to="/">
                  <TransparentLogo src="/logo.png" alt="skriibe logo" style={{ height: '24px', width: 'auto', transform: 'scale(4)', transformOrigin: 'left center' }} />
                </Link>
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
              {unreadNotificationsCount > 0 && (
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
                  {unreadNotificationsCount}
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
          background: '#0a0d14',
          borderRadius: '20px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'row',
          border: '1px solid #1E293B',
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {/* Left Side */}
          <div style={{ flex: 1, paddingRight: '12px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>
                 {currencySymbol}
              </div>
              <div style={{ color: '#93C5FD', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                EARNINGS THIS WEEK
              </div>
            </div>
            
            <div style={{ marginTop: '12px', fontSize: '2.5rem', fontWeight: 900, color: '#fff', letterSpacing: '-1px', lineHeight: '1', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
              {currencySymbol}{dynamicWeeklyEarnings || 0}
            </div>
            
            <div style={{ marginTop: '14px', marginBottom: '14px', position: 'relative', height: '1px', background: 'rgba(255,255,255,0.1)' }}>
              <div style={{ position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)', width: '24px', height: '2px', background: '#3B82F6', boxShadow: '0 0 8px 2px rgba(59,130,246,0.8)', borderRadius: '2px' }} />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '10px', padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                     <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                       <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                     </svg>
                  </div>
                  <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>Live Chat</span>
                </div>
                <span style={{ color: '#38BDF8', fontWeight: 700, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{currencySymbol}{creator.liveChatPrice || 5}/min</span>
              </div>
              
              {(creator.price > 0 || creator.pricePerQuestion > 0) && (
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '10px', padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '10px', flexShrink: 0 }}>
                       ?
                    </div>
                    <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>AMA</span>
                  </div>
                  <span style={{ color: '#38BDF8', fontWeight: 700, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{currencySymbol}{creator.pricePerQuestion || creator.price}/msg</span>
                </div>
              )}
            </div>
          </div>

          {/* Divider Line */}
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 8px', flexShrink: 0 }} />

          {/* Right Side */}
          <div 
            onClick={() => navigate('/creator/inbox')}
            style={{ flex: 1, paddingLeft: '12px', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60A5FA', flexShrink: 0 }}>
                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              </div>
              <div style={{ color: '#93C5FD', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', lineHeight: '1.3' }}>
                CHATS ACCEPTED<br/>THIS WEEK
              </div>
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '12px' }}>
              <div style={{ fontSize: '3.5rem', fontWeight: 900, color: '#fff', letterSpacing: '-1.5px', lineHeight: '1' }}>
                {acceptedChatsCount}
              </div>
              
              <div style={{ color: '#3B82F6', display: 'flex', justifyContent: 'center' }}>
                <svg width="45" height="25" viewBox="0 0 64 45" fill="#3B82F6">
                  {/* Left Person */}
                  <circle cx="14" cy="22" r="6.5" />
                  <path d="M14 31c-5 0-9 3.5-9 8v6h15v-14h-6z" />
                  {/* Right Person */}
                  <circle cx="50" cy="22" r="6.5" />
                  <path d="M50 31c5 0 9 3.5 9 8v6H44v-14h6z" />
                  {/* Center Person (drawn last to be on top) */}
                  <circle cx="32" cy="14" r="9.5" />
                  <path d="M32 26c-7.5 0-14.5 4.5-14.5 11v8h29v-8c0-6.5-7-11-14.5-11z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* LIVE TOGGLE */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>Accept Live Chats Now</div>
            <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '4px' }}>
              Available Now? Go Live!<br />
              You don’t have to wait for your scheduled slot.
            </div>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" checked={isLive} onChange={handleToggle} />
            <span className="slider"></span>
          </label>
        </div>

        {/* 3. PENDING QUEUE */}
        <div style={{
          background: '#0B0D13',
          border: '1px solid #1F2937',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: validPendingChats.length > 0 ? 'rgba(244, 63, 94, 0.1)' : 'rgba(124, 58, 237, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: validPendingChats.length > 0 ? '#F43F5E' : '#A78BFA'
              }}>
                {validPendingChats.length > 0 ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 22h14"></path>
                    <path d="M5 2h14"></path>
                    <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"></path>
                    <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"></path>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                )}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#fff', letterSpacing: '0.5px' }}>PENDING QUEUE</span>
                  {(() => {
                    const uniquePendingChats = validPendingChats.reduce((acc, chat) => {
                      if (!acc.find(c => c.fanName === chat.fanName)) acc.push(chat);
                      return acc;
                    }, []);
                    return uniquePendingChats.length > 0 ? (
                      <span style={{ background: '#F43F5E', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '999px' }}>
                        {uniquePendingChats.length}
                      </span>
                    ) : null;
                  })()}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                  Fans waiting to chat with you
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setShowPendingModal(true)}
              style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fff',
              fontSize: '11px',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {validPendingChats.length > 0 ? 'View All' : 'View All Queue'} <span style={{ fontSize: '10px' }}>{validPendingChats.length > 0 ? '>' : '→'}</span>
            </button>
          </div>

          {/* Body */}
          {validPendingChats.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
              {validPendingChats.reduce((acc, chat) => {
                const chatFanId = (chat.fanId?._id || chat.fanId || '').toString();
                if (!acc.find(c => {
                  const cFanId = (c.fanId?._id || c.fanId || '').toString();
                  return (c.sessionId && c.sessionId === chat.sessionId) || (chatFanId && cFanId === chatFanId) || c.fanName === chat.fanName;
                })) acc.push(chat);
                return acc;
              }, []).slice(0, 3).map((chat, idx) => {
                const timeDiff = Math.max(0, now - new Date(chat.time).getTime());
                const remainingMs = Math.max(0, 120000 - timeDiff);
                const remMins = Math.floor(remainingMs / 60000);
                const remSecs = String(Math.floor((remainingMs % 60000) / 1000)).padStart(2, '0');
                const isUrgent = remainingMs <= 30000;
                const fanAvatar = chat.fanAvatarUrl || chat.avatarUrl || chat.fanAvatar || chat.fanId?.avatarUrl;
                const hasFanAvatar = Boolean(fanAvatar && fanAvatar !== 'null' && fanAvatar !== 'undefined' && !fanAvatar.includes('dicebear'));
                const fanName = (chat.fanName || 'A Fan').trim();
                const fanNameLen = fanName.length;
                const fanNameFontSize = fanNameLen > 22 ? '12.5px' : fanNameLen > 15 ? '14px' : fanNameLen > 10 ? '16px' : '18px';

                return (
                  <div key={chat.sessionId || idx} style={{
                    background: '#0B0D13',
                    border: '1px solid #1c4456',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        minWidth: '44px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        flexShrink: 0,
                        background: hasFanAvatar ? '#13161C' : '#F59E0B',
                        border: hasFanAvatar ? '1.5px solid rgba(59, 168, 216, 0.4)' : '1.5px solid rgba(245, 158, 11, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '18px',
                        color: '#ffffff'
                      }}>
                        {hasFanAvatar ? (
                          <img 
                            src={getImageUrl(fanAvatar)}
                            alt={fanName}
                            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              if (e.currentTarget.parentElement) {
                                e.currentTarget.parentElement.style.background = '#F59E0B';
                                e.currentTarget.parentElement.innerText = (fanName[0] || 'F').toUpperCase();
                              }
                            }}
                          />
                        ) : (
                          (fanName[0] || 'F').toUpperCase()
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px 8px', flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
                        <span 
                          title={fanName} 
                          style={{ 
                            fontSize: fanNameFontSize, 
                            fontWeight: 800, 
                            color: '#fff', 
                            whiteSpace: 'nowrap',
                            flexShrink: fanNameLen <= 12 ? 0 : 1,
                            overflow: 'hidden',
                            textOverflow: fanNameLen > 16 ? 'ellipsis' : 'clip'
                          }}
                        >
                          {fanName}
                        </span>
                        {chat.isContinueChat && (
                          <span style={{ background: 'rgba(59, 168, 216, 0.2)', color: '#3BA8D8', border: '1px solid rgba(59, 168, 216, 0.4)', borderRadius: '6px', fontSize: '11px', fontWeight: 800, padding: '2px 8px', textTransform: 'uppercase', flexShrink: 0 }}>
                            Continue Chat
                          </span>
                        )}
                        {chat.rate !== 0 && chat.rate !== '0' && (
                          <span style={{ fontSize: '14px', color: '#29C5F6', fontWeight: 600, flexShrink: 0 }}>
                            {currencySymbol}{chat.rate !== undefined ? chat.rate : (creator.liveChatPrice || 5)}/min
                          </span>
                        )}
                        <span style={{ color: '#22C55E', fontSize: '13px', fontWeight: 600, flexShrink: 0 }}>
                          {currencySymbol}{Number(chat.walletBalance || 0).toFixed(2)} wallet
                        </span>
                        <span style={{ color: isUrgent ? '#ef4444' : '#94a3b8', fontSize: '13px', fontWeight: isUrgent ? 800 : 400, flexShrink: 0 }}>
                          Time left: {remMins}:{remSecs}
                        </span>
                        <span style={{ fontSize: '13px', color: '#64748b', flexShrink: 0 }}>
                          Requested at {new Date(chat.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} IST
                        </span>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto', paddingLeft: '24px' }}>
                          {(chat.rate === 0 || chat.rate === '0') && (
                            <span style={{ color: '#22C55E', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Free Chat</span>
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button 
                              onClick={() => handleAcceptChat(chat.sessionId)}
                              style={{
                                background: '#22C55E',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '8px 16px',
                                fontSize: '14px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                flexShrink: 0
                              }}
                            >
                              Accept
                            </button>
                            {Boolean(chat.isContinueChat) && (
                              <span style={{
                                color: '#22C55E',
                                fontSize: '12px',
                                fontWeight: 700,
                                whiteSpace: 'nowrap'
                              }}>
                                continue chat request
                              </span>
                            )}
                            <button 
                              onClick={() => handleDeclineChat(chat.sessionId)}
                              style={{
                                background: 'rgba(239, 68, 68, 0.15)',
                                color: '#ef4444',
                                border: '1px solid rgba(239, 68, 68, 0.4)',
                                borderRadius: '8px',
                                padding: '8px 16px',
                                fontSize: '14px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                flexShrink: 0
                              }}
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {missedChats.length > 0 && (
                <>
                  <div style={{ width: '100%', height: '1px', background: 'rgba(255, 255, 255, 0.1)', margin: '16px 0' }} />
                  <div style={{ width: '100%', textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(244, 63, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    </div>
                    <h4 style={{ color: '#fff', fontSize: '15px', fontWeight: 700, margin: 0 }}>Missed Chats (24 hours)</h4>
                  </div>
                  {missedChats.length > 0 && (
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '13px', fontWeight: 600 }}>
                      {missedChats.length}
                    </div>
                  )}
                </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {missedChats.slice(0, 3).map(chat => (
                        <div key={chat._id} style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img 
                              src={chat.fanId?.avatarUrl ? (chat.fanId.avatarUrl.startsWith('http') ? chat.fanId.avatarUrl : `http://localhost:5000${chat.fanId.avatarUrl}`) : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 
                              alt="Fan"
                              style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div style={{ textAlign: 'left' }}>
                              <div style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>{chat.fanId?.name || 'A Fan'}</div>
                              <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '2px' }}>
                                Missed at {new Date(chat.endTime || chat.startTime || chat.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={async (e) => {
                              const btn = e.target;
                              btn.disabled = true;
                              btn.textContent = 'Notified';
                              try {
                                await api.post('/chat/notify-missed', { fanId: chat.fanId?._id, sessionId: chat._id || chat.id });
                                setShowNotifySuccessModal(true);
                                setMissedChats(prev => prev.filter(c => c._id !== chat._id && c.id !== chat.id));
                              } catch (err) {
                                console.error(err);
                                btn.disabled = false;
                                btn.textContent = 'Notify';
                              }
                            }}
                            style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Notify
                          </button>
                        </div>
                      ))}
                      {missedChats.length > 3 && (
                        <div 
                          onClick={() => setShowMissedChatsModal(true)}
                          style={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            padding: '10px', 
                            cursor: 'pointer', 
                            background: 'rgba(255, 255, 255, 0.03)', 
                            borderRadius: '12px', 
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            marginTop: '4px'
                          }}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div style={{
              background: '#13161C',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '32px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              marginTop: '4px'
            }}>
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '1px dashed rgba(167, 139, 250, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ background: '#7C3AED', width: '42px', height: '36px', borderRadius: '10px 10px 10px 3px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ display: 'flex', gap: '3px' }}>
                        <div style={{ width: '4px', height: '4px', background: '#fff', borderRadius: '50%' }}></div>
                        <div style={{ width: '4px', height: '4px', background: '#fff', borderRadius: '50%' }}></div>
                        <div style={{ width: '4px', height: '4px', background: '#fff', borderRadius: '50%' }}></div>
                      </div>
                    </div>
                    <div style={{ position: 'absolute', bottom: '-3px', right: '-5px', background: '#22C55E', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #13161C' }}>
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                  </div>
                </div>
                {/* Decorative sparks */}
                <svg style={{ position: 'absolute', top: '4px', right: '4px' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="22" y1="12" x2="18" y2="12"></line><line x1="19.07" y1="4.93" x2="16.24" y2="7.76"></line></svg>
              </div>
              <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 700, margin: '0 0 8px 0' }}>No one in queue right now</h3>
              <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 16px 0', maxWidth: '240px', lineHeight: '1.5' }}>
                Awesome! You're all caught up.
                <br /><br />
                When fans join the queue, you'll see them here and can start chatting.
              </p>
              
              <div style={{ width: '100%', height: '1px', background: 'rgba(255, 255, 255, 0.1)', margin: '16px 0' }} />
              
              <div style={{ width: '100%', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(244, 63, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    </div>
                    <h4 style={{ color: '#fff', fontSize: '15px', fontWeight: 700, margin: 0 }}>Missed Chats (24 hours)</h4>
                  </div>
                  {missedChats.length > 0 && (
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '13px', fontWeight: 600 }}>
                      {missedChats.length}
                    </div>
                  )}
                </div>
                {missedChats.length === 0 ? (
                  <div style={{ color: '#64748b', fontSize: '12px', textAlign: 'center', padding: '16px 0' }}>
                    No missed chats recently.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {missedChats.slice(0, 3).map(chat => (
                      <div key={chat._id} style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img 
                            src={chat.fanId?.avatarUrl ? (chat.fanId.avatarUrl.startsWith('http') ? chat.fanId.avatarUrl : `http://localhost:5000${chat.fanId.avatarUrl}`) : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 
                            alt="Fan"
                            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div style={{ textAlign: 'left' }}>
                            <div style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>{chat.fanId?.name || 'A Fan'}</div>
                            <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '2px' }}>
                              Missed at {new Date(chat.endTime || chat.startTime || chat.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={async (e) => {
                            const btn = e.target;
                            btn.disabled = true;
                            btn.textContent = 'Notified';
                            try {
                              await api.post('/chat/notify-missed', { fanId: chat.fanId?._id, sessionId: chat._id || chat.id });
                              setShowNotifySuccessModal(true);
                              setMissedChats(prev => prev.filter(c => c._id !== chat._id && c.id !== chat.id));
                            } catch (err) {
                              console.error(err);
                              btn.disabled = false;
                              btn.textContent = 'Notify';
                            }
                          }}
                          style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Notify
                        </button>
                      </div>
                    ))}
                    {missedChats.length > 3 && (
                      <div 
                        onClick={() => setShowMissedChatsModal(true)}
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'center', 
                          alignItems: 'center', 
                          padding: '10px', 
                          cursor: 'pointer', 
                          background: 'rgba(255, 255, 255, 0.03)', 
                          borderRadius: '12px', 
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          marginTop: '4px'
                        }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer for populated state */}
          {validPendingChats.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '16px', marginTop: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '11px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                {validPendingChats.length} fans in queue
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '11px' }}>
                <svg width="10" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                Chats are private & secure.
              </div>
            </div>
          )}
        </div>

        {/* 4.5 AFFILIATE REFERRAL */}
        {creator?.referralCode && (
          <div style={{
            background: 'linear-gradient(145deg, #1A1C23 0%, #13161C 100%)',
            border: '1px solid #29C5F6',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>🤝</span>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: '#fff' }}>Refer & Earn</span>
              </div>
              <div style={{ background: 'rgba(41, 197, 246, 0.1)', color: '#29C5F6', padding: '4px 8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 }}>
                25% Rev Share
              </div>
            </div>
            
            <div style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.4', zIndex: 1 }}>
              Invite creators to Skriibe using your unique link. You'll get <strong style={{ color: '#fff' }}>25% of Skriibe's cut</strong> for every earning they make!
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '4px', zIndex: 1 }}>
              <div style={{ 
                flex: 1, 
                background: '#0E0E0E', 
                border: '1px solid #1F2937', 
                borderRadius: '8px', 
                padding: '10px 12px', 
                fontSize: '0.85rem', 
                color: '#cbd5e1',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {window.location.host}/creator/signup?ref={creator.referralCode}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/creator/signup?ref=${creator.referralCode}`);
                    const btn = document.getElementById('dash-copy-btn');
                    if (btn) {
                      btn.innerText = 'Copied!';
                      btn.style.background = '#22C55E';
                      setTimeout(() => {
                        btn.innerText = 'Copy';
                        btn.style.background = '#29C5F6';
                      }, 2000);
                    }
                  }}
                  id="dash-copy-btn"
                  style={{
                    background: '#29C5F6',
                    color: '#0E0E0E',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'background 0.3s'
                  }}
                >
                  Copy
                </button>
                {navigator.share && (
                  <button 
                    onClick={() => {
                      navigator.share({
                        title: 'Join Skriibe',
                        text: 'Join Skriibe using my referral link and start earning!',
                        url: `${window.location.origin}/creator/signup?ref=${creator.referralCode}`
                      }).catch(console.error);
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'background 0.3s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                  >
                    Share
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={handleOpenReferrals}
              style={{
                marginTop: '12px',
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '10px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Referred till now
            </button>

            {/* Aesthetic glow */}
            <div style={{
              position: 'absolute',
              bottom: '-20px',
              right: '-20px',
              width: '100px',
              height: '100px',
              background: 'radial-gradient(circle, rgba(41, 197, 246, 0.15) 0%, rgba(41, 197, 246, 0) 70%)',
              filter: 'blur(20px)',
              pointerEvents: 'none',
              zIndex: 0
            }} />
          </div>
        )}

        {/* SETUP PAYOUTS */}
        {!creator.bankLinked && !creator.payoutSetupCompleted && !creator.upiId && (
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
        )}

        {/* ACCOUNT HEALTH 
        <h3 style={{ margin: '4px 0 0', fontSize: '1.1rem', fontWeight: 800 }}>Account health</h3>
        <div 
          onClick={() => navigate('/creator/health')}
          style={{ background: '#13161C', border: '1px solid #1F2937', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>
                  {creator?.activeStrikesCount > 0 ? `Strike ${creator.activeStrikesCount}` : 'Looking strong'}
                </span>
                <span style={{ 
                  background: creator?.activeStrikesCount > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', 
                  color: creator?.activeStrikesCount > 0 ? '#ef4444' : '#10B981', 
                  padding: '4px 8px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800 
                }}>
                  {creator?.activeStrikesCount > 0 ? 'Warning' : 'Good'}
                </span>
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '6px', lineHeight: '1.4' }}>
                {creator?.stats?.replyRate || 100}% reply rate · {creator?.activeStrikesCount || 0} SLA breaches · {creator?.activeStrikesCount || 0} strikes
              </div>
            </div>
          </div>
          <div style={{ color: '#64748b' }}>→</div>
        </div>
        */}

        {/* 7. SHARE LINK */}
        <div style={{ background: '#13161C', border: '1px dashed #1F2937', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                fontSize: '20px'
              }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>

    </div>

      {showReferralsModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div style={{
            background: '#0E0E0E', border: '1px solid #1F2937', borderRadius: '16px',
            padding: '24px', width: '100%', maxWidth: '380px', position: 'relative'
          }}>
            <button 
              onClick={() => setShowReferralsModal(false)}
              style={{
                position: 'absolute', top: '16px', right: '16px', background: 'transparent',
                border: 'none', color: '#64748b', cursor: 'pointer'
              }}
            >
              ✕
            </button>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: '#fff', fontWeight: 800 }}>Referred Creators</h3>
            
            {loadingReferrals ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>Loading...</div>
            ) : referralsList.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>
                You haven't referred anyone yet!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '60vh', overflowY: 'auto' }}>
                {referralsList.map((ref) => (
                  <div key={ref._id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
                    background: '#16161E', borderRadius: '12px', border: '1px solid #1F2937'
                  }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%', background: '#29C5F6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0E0E0E',
                      fontWeight: 800, fontSize: '1.1rem', overflow: 'hidden'
                    }}>
                      {ref.profilePic ? (
                        <img src={ref.profilePic} alt={ref.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        (ref.name || 'C')[0].toUpperCase()
                      )}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ref.name || 'Unnamed Creator'}
                      </div>
                      <div style={{ color: '#29C5F6', fontSize: '0.8rem' }}>
                        @{ref.handle}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Missed Chats Modal */}
      {showMissedChatsModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '20px'
        }}>
          <div style={{
            background: '#0B0D13', borderRadius: '24px', width: '100%', maxWidth: '500px',
            border: '1px solid #1F2937', padding: '24px', position: 'relative',
            maxHeight: '80vh', display: 'flex', flexDirection: 'column'
          }}>
            <button 
              onClick={() => setShowMissedChatsModal(false)}
              style={{
                position: 'absolute', top: '20px', right: '20px', background: '#1c161a', border: 'none',
                color: '#fff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <h2 style={{ color: '#fff', margin: '0 0 20px 0', fontSize: '1.4rem', fontWeight: 800 }}>All Missed Chats</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', paddingRight: '4px' }}>
              {missedChats.map(chat => (
                <div key={chat._id} style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img 
                      src={chat.fanId?.avatarUrl ? (chat.fanId.avatarUrl.startsWith('http') ? chat.fanId.avatarUrl : `http://localhost:5000${chat.fanId.avatarUrl}`) : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 
                      alt="Fan"
                      style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>{chat.fanId?.name || 'A Fan'}</div>
                      <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '2px' }}>
                        Missed at {new Date(chat.endTime || chat.startTime || chat.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={async (e) => {
                      const btn = e.target;
                      btn.disabled = true;
                      btn.textContent = 'Notified';
                      try {
                        await api.post('/chat/notify-missed', { fanId: chat.fanId?._id, sessionId: chat._id || chat.id });
                        setShowNotifySuccessModal(true);
                        setMissedChats(prev => prev.filter(c => c._id !== chat._id && c.id !== chat.id));
                      } catch (err) {
                        console.error(err);
                        btn.disabled = false;
                        btn.textContent = 'Notify';
                      }
                    }}
                    style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Notify
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pending Chats Modal */}
      {showPendingModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '20px'
        }}>
          <div style={{
            background: '#0B0D13', borderRadius: '24px', width: '100%', maxWidth: '500px',
            border: '1px solid #1F2937', padding: '24px', position: 'relative',
            maxHeight: '80vh', display: 'flex', flexDirection: 'column'
          }}>
            <button 
              onClick={() => setShowPendingModal(false)}
              style={{
                position: 'absolute', top: '20px', right: '20px', background: '#1c161a', border: 'none',
                color: '#fff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <h2 style={{ color: '#fff', margin: '0 0 20px 0', fontSize: '1.4rem', fontWeight: 800 }}>Pending Queue</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', paddingRight: '4px' }}>
              {validPendingChats.reduce((acc, chat) => {
                const chatFanId = (chat.fanId?._id || chat.fanId || '').toString();
                if (!acc.find(c => {
                  const cFanId = (c.fanId?._id || c.fanId || '').toString();
                  return (c.sessionId && c.sessionId === chat.sessionId) || (chatFanId && cFanId === chatFanId) || c.fanName === chat.fanName;
                })) acc.push(chat);
                return acc;
              }, []).map((chat, idx) => {
                const timeDiff = Math.max(0, now - new Date(chat.time).getTime());
                const remainingMs = Math.max(0, 120000 - timeDiff);
                const remMins = Math.floor(remainingMs / 60000);
                const remSecs = String(Math.floor((remainingMs % 60000) / 1000)).padStart(2, '0');
                const isUrgent = remainingMs <= 30000;
                const fanAvatar = chat.fanAvatarUrl || chat.avatarUrl || chat.fanAvatar || chat.fanId?.avatarUrl;
                const hasFanAvatar = Boolean(fanAvatar && fanAvatar !== 'null' && fanAvatar !== 'undefined' && !fanAvatar.includes('dicebear'));
                const fanName = (chat.fanName || 'A Fan').trim();
                const fanNameLen = fanName.length;
                const fanNameFontSize = fanNameLen > 22 ? '12px' : fanNameLen > 15 ? '13.5px' : fanNameLen > 10 ? '14.5px' : '16px';

                return (
                  <div key={chat.sessionId || idx} style={{
                    background: '#13161C', border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px', padding: '16px', display: 'flex',
                    justifyContent: 'space-between', alignItems: 'center', gap: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        minWidth: '42px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        flexShrink: 0,
                        background: hasFanAvatar ? '#13161C' : '#F59E0B',
                        border: hasFanAvatar ? '1.5px solid rgba(59, 168, 216, 0.4)' : '1.5px solid rgba(245, 158, 11, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '17px',
                        color: '#ffffff'
                      }}>
                        {hasFanAvatar ? (
                          <img 
                            src={getImageUrl(fanAvatar)}
                            alt={fanName}
                            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              if (e.currentTarget.parentElement) {
                                e.currentTarget.parentElement.style.background = '#F59E0B';
                                e.currentTarget.parentElement.innerText = (fanName[0] || 'F').toUpperCase();
                              }
                            }}
                          />
                        ) : (
                          (fanName[0] || 'F').toUpperCase()
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px 8px', flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
                        <span 
                          title={fanName} 
                          style={{ 
                            fontSize: fanNameFontSize, 
                            fontWeight: 800, 
                            color: '#fff', 
                            whiteSpace: 'nowrap',
                            flexShrink: fanNameLen <= 12 ? 0 : 1,
                            overflow: 'hidden',
                            textOverflow: fanNameLen > 16 ? 'ellipsis' : 'clip'
                          }}
                        >
                          {fanName}
                        </span>
                        {chat.isContinueChat && (
                          <span style={{ background: 'rgba(59, 168, 216, 0.2)', color: '#3BA8D8', border: '1px solid rgba(59, 168, 216, 0.4)', borderRadius: '6px', fontSize: '10px', fontWeight: 800, padding: '2px 6px', textTransform: 'uppercase', flexShrink: 0 }}>
                            Continue Chat
                          </span>
                        )}
                        <span style={{ fontSize: '12px', color: '#29C5F6', fontWeight: 600, flexShrink: 0 }}>
                          {currencySymbol}{creator.liveChatPrice || 5}/min
                        </span>
                        <span style={{ color: '#22C55E', fontSize: '12px', fontWeight: 600, flexShrink: 0 }}>
                          {currencySymbol}{Number(chat.walletBalance || 0).toFixed(2)} wallet
                        </span>
                        <span style={{ color: isUrgent ? '#ef4444' : '#94a3b8', fontSize: '12px', fontWeight: isUrgent ? 800 : 400, flexShrink: 0 }}>
                          Time left: {remMins}:{remSecs}
                        </span>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: 'auto', paddingLeft: '24px' }}>
                          <button 
                            onClick={() => handleAcceptChat(chat.sessionId)}
                            style={{
                              background: '#22C55E', color: '#fff', border: 'none', borderRadius: '8px',
                              padding: '8px 16px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', flexShrink: 0
                            }}
                          >
                            Accept
                          </button>
                          {Boolean(chat.isContinueChat) && (
                            <span style={{
                              color: '#22C55E',
                              fontSize: '11px',
                              fontWeight: 700,
                              whiteSpace: 'nowrap'
                            }}>
                              continue chat
                            </span>
                          )}
                          <button 
                            onClick={() => handleDeclineChat(chat.sessionId)}
                            style={{
                              background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px',
                              padding: '8px 12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', flexShrink: 0
                            }}
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {validPendingChats.length === 0 && (
                <div style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>No pending chats</div>
              )}
            </div>
          </div>
        </div>
      )}

      {showNotifySuccessModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div style={{
            background: '#13161C',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '32px 24px',
            width: '100%',
            maxWidth: '360px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div style={{ width: '64px', height: '64px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800, margin: '0 0 16px 0' }}>Notification Sent!</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', margin: '0 0 24px 0' }}>
              We've let them know you're available and ready to chat.
            </p>
            <button
              onClick={() => setShowNotifySuccessModal(false)}
              style={{
                background: '#3B82F6',
                color: '#fff',
                border: 'none',
                borderRadius: '100px',
                padding: '12px 32px',
                fontWeight: 'bold',
                fontSize: '16px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CreatorDashboard;
