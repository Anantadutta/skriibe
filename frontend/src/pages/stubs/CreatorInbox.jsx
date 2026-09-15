import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';
import { io } from 'socket.io-client';

const CreatorInbox = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('Pending');
  const [inboxMode, setInboxMode] = useState('liveChat');
  const [liveChatTab, setLiveChatTab] = useState('history');
  const [flaggedSubFilter, setFlaggedSubFilter] = useState('All');
  const [questions, setQuestions] = useState([]);
  const [liveChats, setLiveChats] = useState([]);
  const [pendingChats, setPendingChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedThreads, setExpandedThreads] = useState({});
  const [now, setNow] = useState(Date.now());

  const validPendingChats = pendingChats.filter(chat => {
    if (!chat || !chat.sessionId) return false;
    const chatTimeMs = chat.time ? new Date(chat.time).getTime() : 0;
    if (!chatTimeMs || isNaN(chatTimeMs)) return false;
    const timeDiff = now - chatTimeMs;
    return timeDiff >= 0 && timeDiff < 120000;
  });

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleThread = (id) => {
    setExpandedThreads(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Cyan filter for active bottom nav icons
  const cyanFilter = 'invert(69%) sepia(87%) saturate(2714%) hue-rotate(164deg) brightness(99%) contrast(98%)';
  const grayFilter = 'invert(31%) sepia(13%) saturate(760%) hue-rotate(181deg) brightness(96%) contrast(85%)';

  const navItems = [
    { label: 'HOME', icon: '🏠', route: '/creator/dashboard' },
    { label: 'CHATS', icon: '💬', route: '/creator/inbox' },
    { label: 'TRANSACTIONS', icon: '💰', route: '/creator/payouts' },
    { label: 'ANALYTICS', icon: '📊', route: '/creator/analytics' },
    { label: 'SETTINGS', icon: '⚙️', route: '/creator/settings' },
  ];

  useEffect(() => {
    let socket = null;
    const fetchQuestions = async (isBackground = false) => {
      if (!isBackground) setLoading(true);
      try {
        const [qRes, chatRes, pendingRes, meRes] = await Promise.all([
          api.get(`/creator/questions?t=${Date.now()}`),
          api.get(`/chat/creator-history?t=${Date.now()}`),
          api.get(`/chat/pending?t=${Date.now()}`),
          api.get(`/creator/me?t=${Date.now()}`).catch(() => ({ data: {} }))
        ]);
        if (qRes.data.success) {
          setQuestions(qRes.data.questions);
        }
        if (chatRes.data.success) {
          const nowMs = Date.now();
          const filteredSessions = chatRes.data.sessions.filter(s => {
            if (!s.totalMinutes || s.totalMinutes === 0) {
              const chatTime = new Date(s.endTime || s.startTime || s.createdAt).getTime();
              return (nowMs - chatTime) <= 30 * 24 * 60 * 60 * 1000;
            }
            return true;
          });
          setLiveChats(filteredSessions);
        }
        if (pendingRes.data.success) {
          setPendingChats(pendingRes.data.pendingChats);
        }
        const cId = meRes.data?.creator?._id || meRes.data?.creator?.id;
        if (cId && !socket) {
          const socketUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
          socket = io(socketUrl);
          socket.emit('join_creator_room', { creatorId: cId });
          socket.on('connect', () => {
            socket.emit('join_creator_room', { creatorId: cId });
          });
          socket.on('incoming_chat_request', (data) => {
            setPendingChats(prev => {
              const filtered = prev.filter(c => c.sessionId !== data.sessionId);
              return [data, ...filtered];
            });
          });
          socket.on('fan_profile_updated', (data) => {
            if (!data || !data.fanId) return;
            setPendingChats(prev => prev.map(c => {
              const chatFanId = (c.fanId?._id || c.fanId || '').toString();
              if (chatFanId === String(data.fanId)) {
                return {
                  ...c,
                  fanName: data.name,
                  ...(data.avatarUrl ? { fanAvatarUrl: data.avatarUrl } : {})
                };
              }
              return c;
            }));
            fetchQuestions(true);
          });
          const removePending = (data) => {
            if (data?.sessionId) {
              setPendingChats(prev => prev.filter(c => String(c.sessionId) !== String(data.sessionId)));
            }
          };
          socket.on('chat_cancelled_by_fan', removePending);
          socket.on('chat_ended', removePending);
          socket.on('chat-session-ended', removePending);
          socket.on('creator_joined', removePending);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        if (!isBackground) setLoading(false);
      }
    };
    fetchQuestions();
    const interval = setInterval(() => {
      fetchQuestions(true);
    }, 15000);
    return () => {
      clearInterval(interval);
      if (socket) socket.disconnect();
    };
  }, []);

  const buildThreads = (qs) => {
    const roots = [];
    const childrenMap = {};

    qs.forEach(q => {
      if (q.isFollowUp && q.parentQuestionId) {
        if (!childrenMap[q.parentQuestionId]) childrenMap[q.parentQuestionId] = [];
        childrenMap[q.parentQuestionId].push(q);
      } else {
        roots.push(q);
      }
    });

    qs.forEach(q => {
      if (q.isFollowUp && q.parentQuestionId && !roots.find(r => (r._id || r.id) === q.parentQuestionId)) {
        roots.push(q);
      }
    });

    Object.values(childrenMap).forEach(children => {
      children.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    });

    roots.sort((a, b) => {
      const aChildren = childrenMap[a._id || a.id] || [];
      const bChildren = childrenMap[b._id || b.id] || [];
      const aLatest = aChildren.length > 0 ? new Date(aChildren[aChildren.length - 1].createdAt || Date.now()) : new Date(a.createdAt || Date.now());
      const bLatest = bChildren.length > 0 ? new Date(bChildren[bChildren.length - 1].createdAt || Date.now()) : new Date(b.createdAt || Date.now());
      return bLatest - aLatest;
    });

    return { roots, childrenMap };
  };

  const { roots, childrenMap } = buildThreads(questions);

  const getThreadStatus = (root, children) => {
     const isResolvedAbusive = (q) => q.adminDecision === 'abusive';
     if (isResolvedAbusive(root) || children.some(isResolvedAbusive)) return 'resolved_abusive';
     
     const isFlagged = (q) => q.status?.toLowerCase() === 'flagged';
     if (isFlagged(root) || children.some(isFlagged)) return 'flagged';
     
     const isRejected = (q) => q.status?.toLowerCase() === 'rejected';
     if (isRejected(root) || children.some(isRejected)) return 'rejected';

     if (children.length > 0) {
       return children[children.length - 1].status?.toLowerCase();
     }
     return root.status?.toLowerCase();
  };

  const pendingRoots = roots.filter(r => getThreadStatus(r, childrenMap[r._id || r.id] || []) === 'submitted');
  const repliedRoots = roots.filter(r => {
    const s = getThreadStatus(r, childrenMap[r._id || r.id] || []);
    return ['answered', 'satisfied', 'resolved'].includes(s);
  });
  const flaggedRoots = roots.filter(r => {
    const s = getThreadStatus(r, childrenMap[r._id || r.id] || []);
    return s === 'flagged' || s === 'resolved_abusive' || s === 'rejected';
  });

  const tabCounts = {
    'All': roots.length,
    'Pending': pendingRoots.length,
    'Replied': repliedRoots.length,
    'Flagged': flaggedRoots.length
  };

  const getRelativeTime = (dateStr) => {
    const date = new Date(dateStr);
    const diffHours = Math.floor((new Date() - date) / (1000 * 60 * 60));
    if (diffHours < 1) {
        const diffMins = Math.floor((new Date() - date) / (1000 * 60));
        return diffMins > 0 ? `${diffMins}m` : 'now';
    }
    if (diffHours > 24) return `${Math.floor(diffHours / 24)}d`;
    return `${diffHours}h`;
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
        gap: '20px'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <div 
            onClick={() => navigate('/creator/dashboard')}
            style={{
              width: '40px', height: '40px', borderRadius: '12px', background: '#1A1A1A',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              marginRight: '12px'
            }}
          >
            <span style={{ fontSize: '1.2rem', color: '#94a3b8' }}>‹</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Message inbox</h2>
          </div>
        </div>

        {/* Inbox Mode Switcher */}
        <div style={{ display: 'flex', background: '#1A1A1A', borderRadius: '30px', padding: '4px', marginBottom: '8px', border: '1px solid #2A2A2A' }}>
          <div 
            onClick={() => setInboxMode('liveChat')}
            style={{ 
              flex: 1, 
              padding: '10px 0', 
              textAlign: 'center', 
              cursor: 'pointer',
              background: inboxMode === 'liveChat' ? '#2A2A35' : 'transparent',
              color: inboxMode === 'liveChat' ? '#ffffff' : '#94a3b8',
              borderRadius: '30px',
              fontWeight: inboxMode === 'liveChat' ? 700 : 600,
              fontSize: '0.95rem',
              transition: 'all 0.2s ease',
            }}
          >
            Live chat
          </div>
          <div 
            onClick={() => setInboxMode('messages')}
            style={{ 
              flex: 1, 
              padding: '10px 0', 
              textAlign: 'center', 
              cursor: 'pointer',
              background: inboxMode === 'messages' ? '#2A2A35' : 'transparent',
              color: inboxMode === 'messages' ? '#ffffff' : '#94a3b8',
              borderRadius: '30px',
              fontWeight: inboxMode === 'messages' ? 700 : 600,
              fontSize: '0.95rem',
              transition: 'all 0.2s ease',
            }}
          >
            Ask me anything
          </div>
        </div>

        {inboxMode === 'messages' ? (
          <>


        {/* Tabs */}
        <div style={{ display: 'flex', background: '#1A1A1A', borderRadius: '16px', padding: '6px', gap: '4px', border: '1px solid #2A2A2A' }}>
          {['Pending', 'Replied'].map((tabName) => {
            const isActive = activeTab === tabName;
            const count = tabCounts[tabName] || 0;
            return (
              <div 
                key={tabName}
                onClick={() => setActiveTab(tabName)}
                style={{
                  flex: 1, textAlign: 'center', padding: '10px 4px', borderRadius: '12px',
                  background: isActive ? '#2A2A35' : 'transparent',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  fontSize: '0.85rem', fontWeight: isActive ? 700 : 600,
                  cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '4px',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>{tabName}</span>
                <span style={{ fontSize: '0.8rem', color: isActive ? '#38bdf8' : '#64748b' }}>{count}</span>
              </div>
            );
          })}
        </div>

        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '1px', marginTop: '8px' }}>
          {activeTab.toUpperCase() + ' MESSAGES'}
        </div>

        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '100px' }}>
          {(() => {
            const displayedQuestions = activeTab === 'All' ? roots : roots.filter(q => {
              const status = getThreadStatus(q, childrenMap[q._id || q.id] || []);
              if (activeTab === 'Pending') return status === 'submitted';
              if (activeTab === 'Replied') return ['answered', 'satisfied', 'resolved'].includes(status);
              if (activeTab === 'Flagged') {
                if (flaggedSubFilter === 'Flagged') return status === 'flagged' || status === 'resolved_abusive';
                if (flaggedSubFilter === 'Rejected') return status === 'rejected';
                return status === 'flagged' || status === 'resolved_abusive' || status === 'rejected';
              }
              return true;
            });

            if (displayedQuestions.length === 0) {
               return <div style={{ color: '#64748b', textAlign: 'center', marginTop: '20px' }}>No messages found.</div>
            }

            return displayedQuestions.map((rootQuestion) => {
              const children = childrenMap[rootQuestion._id || rootQuestion.id] || [];
              const threadStatus = getThreadStatus(rootQuestion, children);
              
              const isPending = threadStatus === 'submitted';
              const isReplied = ['answered', 'satisfied', 'resolved'].includes(threadStatus);
              const isFlagged = threadStatus === 'flagged' || threadStatus === 'resolved_abusive';
              const isRejected = threadStatus === 'rejected';
              
              let borderColor = '#333';
              let badgeText = '';
              let badgeColor = '';
              let badgeBg = '';

              if (isPending) {
                borderColor = '#FBBF24'; // yellow
                badgeText = 'Pending';
                badgeColor = '#FBBF24';
                badgeBg = 'rgba(251, 191, 36, 0.15)';
              } else if (isReplied) {
                borderColor = '#22C55E'; // green
                badgeText = 'Done';
                badgeColor = '#22C55E';
                badgeBg = 'rgba(34, 197, 94, 0.15)';
              } else if (isFlagged) {
                borderColor = '#EF4444'; // red
                badgeText = 'Flagged';
                badgeColor = '#EF4444';
                badgeBg = 'rgba(239, 68, 68, 0.15)';
              } else if (isRejected) {
                borderColor = '#F97316'; // orange
                badgeText = 'Rejected';
                badgeColor = '#F97316';
                badgeBg = 'rgba(249, 115, 22, 0.15)';
              }

              const renderMessage = (q, isChild, rootQ = null) => {
                const qIsPending = q.status?.toLowerCase() === 'submitted';
                const qIsReplied = ['answered', 'satisfied', 'resolved'].includes(q.status?.toLowerCase());
                const qIsFlagged = q.status?.toLowerCase() === 'flagged' || q.status?.toLowerCase() === 'resolved_abusive';
                const qIsRejected = q.status?.toLowerCase() === 'rejected';
                const qIsExpired = q.status?.toLowerCase() === 'expired';

                let subtitle = '';
                if (qIsPending) subtitle = 'New Question';
                else if (qIsReplied) subtitle = 'Replied';
                else if (qIsFlagged) subtitle = 'Flagged by Fan';
                else if (qIsRejected) subtitle = 'Rejected by you';
                else if (qIsExpired) subtitle = 'Expired';
                else subtitle = q.status || '';

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

                let timeBadgeColor = '#10B981'; // Green for recent
                let timeBadgeBg = 'rgba(16, 185, 129, 0.15)';
                if (hoursAgo > 20) {
                  timeBadgeColor = '#EF4444'; // Red for urgent (close to 24h limit)
                  timeBadgeBg = 'rgba(239, 68, 68, 0.15)';
                } else if (hoursAgo > 12) {
                  timeBadgeColor = '#F59E0B'; // Yellow
                  timeBadgeBg = 'rgba(245, 158, 11, 0.15)';
                }

                return (
                  <div key={q._id || q.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
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
                        <div style={{ display: q.fanId?.avatarUrl ? 'none' : 'flex', width: '40px', height: '40px', borderRadius: '8px', background: '#2a2a35', color: '#94a3b8', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', flexShrink: 0 }}>
                          {(q.buyerName || q.followerName || 'A')[0].toUpperCase()}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <div style={{ color: '#FBBF24', fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px', paddingRight: '120px' }}>
                            {isChild ? 'Follow-up Question' : subtitle}
                          </div>
                          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                            {q.buyerName || q.followerName} <span style={{ color: '#38BDF8' }}>· {isChild ? 'Free' : `₹${q.amountPaid || q.pricePaid}`}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isChild && (
                          <div style={{ background: qIsPending ? 'rgba(251, 191, 36, 0.15)' : (qIsReplied ? 'rgba(34, 197, 94, 0.15)' : (qIsFlagged ? 'rgba(239, 68, 68, 0.15)' : 'rgba(249, 115, 22, 0.15)')), color: qIsPending ? '#FBBF24' : (qIsReplied ? '#22C55E' : (qIsFlagged ? '#EF4444' : '#F97316')), padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>
                            {qIsPending ? 'Pending' : (qIsReplied ? 'Done' : (qIsFlagged ? 'Flagged' : 'Rejected'))}
                          </div>
                        )}

                      </div>
                    </div>

                    <div style={{ color: '#e2e8f0', fontSize: '0.95rem', lineHeight: '1.5', wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                      {q.questionText}
                    </div>

                    {/* Pending Action Row */}
                    {qIsPending && (
                      <>
                        <div style={{ alignSelf: 'flex-start', background: timeBadgeBg, color: timeBadgeColor, padding: '4px 8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {timeBadgeColor === '#EF4444' ? <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: timeBadgeColor }} /> : 
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>}
                          {timeText}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/creator/dashboard/reply/${q._id || q.id}`, { state: { question: q, rootQuestion: rootQ } });
                            }}
                            style={{ flex: 1, background: 'linear-gradient(90deg, #38BDF8 0%, #34D399 100%)', border: 'none', borderRadius: '12px', color: '#0F172A', fontWeight: 800, fontSize: '0.95rem', padding: '14px', cursor: 'pointer' }}
                          >
                            Reply
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/creator/dashboard/reply/${q._id || q.id}`, { state: { question: q, rootQuestion: rootQ, initialView: 'flag' } });
                            }}
                            style={{ width: '48px', background: '#2a2a35', border: 'none', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
                          </button>
                        </div>
                      </>
                    )}

                    {/* Replied Section */}
                    {qIsReplied && q.answerText && (
                      <div style={{ marginTop: '4px', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                        <span style={{ color: '#22C55E', fontWeight: 700, fontSize: '0.9rem' }}>You replied:</span>
                        <span style={{ color: '#94a3b8', fontSize: '0.9rem', marginLeft: '4px' }}>
                          {q.answerText}
                        </span>
                      </div>
                    )}

                    {/* Flagged/Rejected Section */}
                    {(qIsFlagged || qIsRejected || threadStatus === 'resolved_abusive') && (
                      <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {q.adminDecision && q.adminDecision !== 'pending' ? (
                          <div style={{ marginTop: '8px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '12px', padding: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38BDF8', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                              New Message from Admin
                            </div>
                            <div style={{ color: '#e2e8f0', fontSize: '0.95rem', lineHeight: '1.5' }}>
                              <strong>Decision: {q.adminDecision === 'fan_wins' ? 'Issued full refund to buyer' : q.adminDecision === 'creator_wins' ? 'Dismiss — payout to creator' : q.adminDecision === 'partial_refund' ? 'Partial refund to the buyer/creator' : q.adminDecision === 'abusive' ? `You get the payment, and the question stays closed. The fan (${q.buyerName || q.followerName}) is banned.` : q.adminDecision}</strong><br/>
                            </div>
                          </div>
                        ) : (
                          <>
                            <button style={{ background: '#2a2a35', border: 'none', borderRadius: '12px', color: '#94a3b8', fontWeight: 600, fontSize: '0.95rem', padding: '14px', cursor: 'pointer', width: '100%' }}>
                              Under Review by Skriibe admin team
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              };

              return (
              <div 
                key={rootQuestion._id || rootQuestion.id} 
                onClick={(e) => {
                  if (children.length > 0) {
                    toggleThread(rootQuestion._id || rootQuestion.id);
                  } else if (isFlagged || isRejected) {
                    navigate(`/creator/dashboard/reply/${rootQuestion._id || rootQuestion.id}`, { state: { question: rootQuestion, rootQuestion: rootQuestion, initialView: 'readonly_flagged' } });
                  }
                }}
                style={{
                  background: '#16161e',
                  border: '1px solid #2A2A2A',
                  borderLeft: `4px solid ${borderColor}`,
                  borderRadius: '16px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  position: 'relative',
                  cursor: (children.length > 0 || isFlagged || isRejected) ? 'pointer' : 'default'
                }}>
                <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {children.length > 0 && (
                    <div style={{
                      background: 'rgba(56, 189, 248, 0.1)',
                      color: '#38bdf8',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span>💬</span> {children.length + 1} Messages
                    </div>
                  )}
                  <div style={{ background: badgeBg, color: badgeColor, padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>
                    {badgeText}
                  </div>
                </div>
                {renderMessage(rootQuestion, false)}

                {children.length > 0 && expandedThreads[rootQuestion._id || rootQuestion.id] && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '19px', top: '0', bottom: '24px', width: '2px', background: 'rgba(255,255,255,0.1)' }} />
                    {children.map(child => (
                      <div key={child._id || child.id} style={{ paddingLeft: '32px', position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '19px', top: '20px', width: '13px', height: '2px', background: 'rgba(255,255,255,0.1)' }} />
                        {renderMessage(child, true, rootQuestion)}
                      </div>
                    ))}
                  </div>
                )}
                
                {children.length > 0 && !expandedThreads[rootQuestion._id || rootQuestion.id] && (
                  <div style={{ color: '#38bdf8', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center', marginTop: '8px' }}>
                    Click to expand {children.length} follow-up{children.length > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            );
          });
          })()}
        </div>
          </>
        ) : (validPendingChats.length > 0) || (liveChats && liveChats.some(c => c.totalMinutes > 0)) ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '100px' }}>
            
            {validPendingChats.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Live Chat Requests
                  <span style={{ background: '#FACC15', color: '#000', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>
                    {validPendingChats.length}
                  </span>
                </h3>
                {Array.from(
                   new Map(
                     validPendingChats
                       .sort((a, b) => new Date(a.time) - new Date(b.time)) // Oldest first so newest overwrites in Map
                       .map(chat => [chat.sessionId || (chat.fanId?._id || chat.fanId) || chat.fanName, chat])
                   ).values()
                 )
                 .sort((a, b) => new Date(b.time) - new Date(a.time)) // Sort descending again for display
                 .map((chat) => {
                  const chatTimeMs = new Date(chat.time).getTime();
                  const waitingMs = Math.max(0, now - chatTimeMs);
                  const remainingMs = Math.max(0, 120000 - waitingMs);
                  const remMins = Math.floor(remainingMs / 60000);
                  const remSecs = String(Math.floor((remainingMs % 60000) / 1000)).padStart(2, '0');
                  const formattedTime = new Date(chat.time).toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });

                  const fanAvatar = chat.fanAvatarUrl || chat.avatarUrl || chat.fanAvatar || chat.fanId?.avatarUrl;
                  const hasFanAvatar = Boolean(fanAvatar && fanAvatar !== 'null' && fanAvatar !== 'undefined' && !fanAvatar.includes('dicebear'));
                  const fanName = (chat.fanName || 'A Fan').trim();
                  const fanNameLen = fanName.length;
                  const fanNameFontSize = fanNameLen > 22 ? '0.82rem' : fanNameLen > 15 ? '0.88rem' : fanNameLen > 10 ? '0.95rem' : '1.05rem';

                  return (
                    <div key={chat.sessionId} style={{ background: '#13161C', border: '1px solid #3BA8D8', borderRadius: '16px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
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
                              color: '#fff', 
                              fontWeight: 800, 
                              fontSize: fanNameFontSize, 
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
                          {chat.rate !== 0 && chat.rate !== '0' && (
                            <span style={{ color: '#3BA8D8', fontSize: '0.85rem', fontWeight: 600, flexShrink: 0 }}>₹{chat.rate}/min</span>
                          )}
                          <span style={{ color: remainingMs <= 30000 ? '#EF4444' : '#94a3b8', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0 }}>Time left: {remMins}:{remSecs}</span>
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem', flexShrink: 0 }}>Requested at {formattedTime} IST</span>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: 'auto', paddingLeft: '24px' }}>
                            {(chat.rate === 0 || chat.rate === '0') && (
                              <span style={{ color: '#22C55E', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Free Chat</span>
                            )}
                            <button 
                              onClick={async () => {
                                try {
                                  await api.post('/chat/creator-accept', { sessionId: chat.sessionId });
                                } catch (e) {}
                                setPendingChats(prev => prev.filter(c => c.sessionId !== chat.sessionId));
                                navigate(`/creator/dashboard/live-chat/${chat.sessionId}`);
                              }}
                              style={{ background: '#22C55E', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 800, cursor: 'pointer', flexShrink: 0 }}
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
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {liveChats && liveChats.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #1F2937', marginBottom: '8px' }}>
                  <button 
                    onClick={() => setLiveChatTab('history')}
                    style={{ 
                      background: 'none', border: 'none', color: liveChatTab === 'history' ? '#3BA8D8' : '#94a3b8', 
                      fontWeight: 800, fontSize: '1rem', padding: '0 0 8px 0', cursor: 'pointer',
                      borderBottom: liveChatTab === 'history' ? '2px solid #3BA8D8' : '2px solid transparent'
                    }}
                  >
                    History
                  </button>
                  <button 
                    onClick={() => setLiveChatTab('missed')}
                    style={{ 
                      background: 'none', border: 'none', color: liveChatTab === 'missed' ? '#3BA8D8' : '#94a3b8', 
                      fontWeight: 800, fontSize: '1rem', padding: '0 0 8px 0', cursor: 'pointer',
                      borderBottom: liveChatTab === 'missed' ? '2px solid #3BA8D8' : '2px solid transparent'
                    }}
                  >
                    Missed Chats
                  </button>
                </div>
            {liveChats.filter(c => liveChatTab === 'history' ? c.totalMinutes > 0 : (!c.totalMinutes || c.totalMinutes === 0)).length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px 0', fontSize: '0.9rem' }}>
                {liveChatTab === 'history' ? 'No history found.' : 'No missed chats found.'}
              </div>
            ) : liveChats.filter(c => liveChatTab === 'history' ? c.totalMinutes > 0 : (!c.totalMinutes || c.totalMinutes === 0)).map(chat => {
              if (liveChatTab === 'missed') {
                const missedDate = new Date(chat.endTime || chat.startTime || chat.createdAt);
                const formattedMissedDate = missedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + missedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

                return (
                  <div 
                    key={chat._id || chat.id} 
                    style={{ 
                      background: '#13161C', 
                      border: '1px solid #1F2937', 
                      borderRadius: '16px', 
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ position: 'relative', width: '48px', height: '48px' }}>
                        {chat.fanId?.avatarUrl ? (
                          <img 
                            src={chat.fanId.avatarUrl.startsWith('http') ? chat.fanId.avatarUrl : `http://localhost:5000${chat.fanId.avatarUrl}`} 
                            alt={chat.fanId?.name} 
                            style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#D1D5DB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ color: '#fff', fontWeight: 600, fontSize: '1.1rem' }}>{chat.fanId?.name || 'Fan'}</div>
                        <div style={{ color: '#EF4444', fontSize: '0.85rem' }}>Missed at {formattedMissedDate}</div>
                      </div>
                    </div>
                    <button 
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          const res = await api.post('/chat/notify-missed', { fanId: chat.fanId?._id || chat.fanId?.id || chat.fanId, sessionId: chat._id || chat.id || chat.sessionId });
                          if (res.data.success) {
                            alert('Notification sent!');
                          }
                        } catch (err) {
                          console.error(err);
                          alert('Failed to send notification');
                        }
                      }}
                      style={{ 
                        background: '#1A2234', 
                        border: '1px solid #29354F', 
                        color: '#38BDF8', 
                        padding: '8px 16px', 
                        borderRadius: '8px', 
                        fontSize: '0.9rem', 
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Notify
                    </button>
                  </div>
                );
              }

              const formattedDate = new Date(chat.endTime || chat.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
              return (
                <div 
                  key={chat._id || chat.id} 
                  onClick={() => navigate(`/creator/dashboard/live-chat/${chat.sessionId || chat._id}`)}
                  style={{ 
                  background: '#13161C', 
                  border: '1px solid #1F2937', 
                  borderRadius: '16px', 
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  cursor: 'pointer'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ position: 'relative', width: '40px', height: '40px' }}>
                        {chat.fanId?.avatarUrl ? (
                          <img 
                            src={chat.fanId.avatarUrl.startsWith('http') ? chat.fanId.avatarUrl : `http://localhost:5000${chat.fanId.avatarUrl}`} 
                            alt={chat.fanId?.name} 
                            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#3BA8D8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>
                            {chat.fanId?.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                        )}
                      </div>
                      <div>
                        <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.05rem' }}>{chat.fanId?.name || 'Fan'}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{formattedDate}</div>
                      </div>
                    </div>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>
                      ₹{Number(chat.totalCost || 0).toFixed(2)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', background: '#0E0E0E', padding: '12px', borderRadius: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '4px' }}>DURATION</div>
                      <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>
                        {Math.floor(chat.totalMinutes || 0)}m {Math.round(((chat.totalMinutes || 0) % 1) * 60)}s
                      </div>
                    </div>
                    <div style={{ width: '1px', background: '#1F2937' }}></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '4px' }}>RATE</div>
                      <div style={{ color: '#3BA8D8', fontWeight: 700, fontSize: '0.9rem' }}>
                        ₹{chat.ratePerMinute || 0}/min
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '60px 0', fontSize: '0.9rem' }}>
            No live chats found.
          </div>
        )}

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
  );
};

export default CreatorInbox;
