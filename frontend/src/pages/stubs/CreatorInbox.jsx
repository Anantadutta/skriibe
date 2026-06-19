import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';

const CreatorInbox = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('All');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedThreads, setExpandedThreads] = useState({});
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
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
    { label: 'INBOX', icon: '💬', route: '/creator/inbox' },
    { label: 'PAYOUTS', icon: '💰', route: '/creator/payouts' },
    { label: 'SETTINGS', icon: '⚙️', route: '/creator/settings' },
  ];

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/creator/questions?t=${Date.now()}`);
        if (res.data.success) {
          setQuestions(res.data.questions);
        }
      } catch (err) {
        console.error('Error fetching questions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
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
     const isResolvedAbusive = (q) => q.status?.toLowerCase() === 'resolved' && q.adminDecision === 'abusive';
     if (isResolvedAbusive(root) || children.some(isResolvedAbusive)) return 'resolved_abusive';
     const isFlaggedOrRejected = (q) => q.status?.toLowerCase() === 'flagged' || q.status?.toLowerCase() === 'rejected';
     if (isFlaggedOrRejected(root) || children.some(isFlaggedOrRejected)) return 'flagged';
     if (children.length > 0) {
       const lastChildStatus = children[children.length - 1].status?.toLowerCase();
       return lastChildStatus === 'rejected' ? 'flagged' : lastChildStatus;
     }
     const rootStatus = root.status?.toLowerCase();
     return rootStatus === 'rejected' ? 'flagged' : rootStatus;
  };

  const pendingRoots = roots.filter(r => getThreadStatus(r, childrenMap[r._id || r.id] || []) === 'submitted');
  const repliedRoots = roots.filter(r => getThreadStatus(r, childrenMap[r._id || r.id] || []) === 'answered');
  const flaggedRoots = roots.filter(r => {
    const s = getThreadStatus(r, childrenMap[r._id || r.id] || []);
    return s === 'flagged' || s === 'resolved_abusive';
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
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Question inbox</h2>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
              <span style={{ color: '#FBBF24', fontWeight: 600 }}>{pendingRoots.length}</span> awaiting your reply · ₹{pendingRoots.length * 99} protected
            </div>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </span>
          <input 
            type="text" 
            placeholder="Search questions..." 
            style={{
              width: '100%',
              background: '#1A1A1A',
              border: '1px solid #2A2A2A',
              borderRadius: '16px',
              padding: '14px 16px 14px 44px',
              color: '#ffffff',
              fontSize: '0.95rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: '#1A1A1A', borderRadius: '16px', padding: '6px', gap: '4px', border: '1px solid #2A2A2A' }}>
          {['All', 'Pending', 'Replied', 'Flagged'].map((tabName) => {
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
          {activeTab === 'All' ? 'ALL QUESTIONS' : activeTab.toUpperCase() + ' QUESTIONS'}
        </div>

        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '100px' }}>
          {(() => {
            const displayedQuestions = activeTab === 'All' ? roots : roots.filter(q => {
              const status = getThreadStatus(q, childrenMap[q._id || q.id] || []);
              if (activeTab === 'Pending') return status === 'submitted';
              if (activeTab === 'Replied') return status === 'answered';
              if (activeTab === 'Flagged') return status === 'flagged' || status === 'resolved_abusive';
              return true;
            });

            if (displayedQuestions.length === 0) {
               return <div style={{ color: '#64748b', textAlign: 'center', marginTop: '20px' }}>No questions found.</div>
            }

            return displayedQuestions.map((rootQuestion) => {
              const children = childrenMap[rootQuestion._id || rootQuestion.id] || [];
              const threadStatus = getThreadStatus(rootQuestion, children);
              
              const isPending = threadStatus === 'submitted';
              const isReplied = threadStatus === 'answered';
              const isFlagged = threadStatus === 'flagged';
              
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
              }

              const renderMessage = (q, isChild, rootQ = null) => {
                const qIsPending = q.status?.toLowerCase() === 'submitted';
                const qIsReplied = q.status?.toLowerCase() === 'answered';
                const qIsFlagged = q.status?.toLowerCase() === 'flagged';

                let subtitle = '';
                if (qIsPending) subtitle = 'new question';
                else if (qIsReplied) subtitle = 'replied earlier';
                else if (qIsFlagged) subtitle = 'reported by you';

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
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#2a2a35', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                          {(q.buyerName || q.followerName || 'A')[0].toUpperCase()}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <div style={{ color: '#FBBF24', fontSize: '0.8rem', fontWeight: 600, marginBottom: '2px' }}>
                            {isChild ? 'Follow-up Question' : (qIsPending ? 'New Question' : (qIsReplied ? 'Replied' : 'Reported by you'))}
                          </div>
                          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                            {q.buyerName || q.followerName} <span style={{ color: '#38BDF8' }}>· {isChild ? 'Free' : `₹${q.amountPaid || q.pricePaid || 99}`}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isChild && (
                          <div style={{ background: qIsPending ? 'rgba(251, 191, 36, 0.15)' : (qIsReplied ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)'), color: qIsPending ? '#FBBF24' : (qIsReplied ? '#22C55E' : '#EF4444'), padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>
                            {qIsPending ? 'Pending' : (qIsReplied ? 'Done' : 'Flagged')}
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

                    {/* Flagged Section */}
                    {(qIsFlagged || threadStatus === 'resolved_abusive') && (
                      <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {threadStatus === 'resolved_abusive' ? (
                          <div style={{ marginTop: '8px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '12px', padding: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38BDF8', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                              New Message from Admin
                            </div>
                            <div style={{ color: '#e2e8f0', fontSize: '0.95rem', lineHeight: '1.5' }}>
                              <strong>You get the payment, and the question stays closed.</strong><br/>
                              The fan ({q.buyerName || q.followerName}) is banned.<br/><br/>
                              Thank you for keeping Skriibe safe.
                            </div>
                          </div>
                        ) : (
                          <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#EF4444', fontSize: '0.85rem', fontWeight: 600 }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
                              Flagged — hidden from your queue, under review
                            </div>
                            <button style={{ background: '#2a2a35', border: 'none', borderRadius: '12px', color: '#94a3b8', fontWeight: 600, fontSize: '0.95rem', padding: '14px', cursor: 'pointer' }}>
                              Restore to pending
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
                  cursor: children.length > 0 ? 'pointer' : 'default'
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
    </div>
  );
};

export default CreatorInbox;
