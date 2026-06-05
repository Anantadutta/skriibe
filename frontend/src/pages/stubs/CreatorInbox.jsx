import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';

const CreatorInbox = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('All');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const pendingQuestions = questions.filter(q => q.status?.toLowerCase() === 'submitted');
  const repliedQuestions = questions.filter(q => q.status?.toLowerCase() === 'answered');
  const flaggedQuestions = questions.filter(q => q.status?.toLowerCase() === 'flagged');

  const tabCounts = {
    'All': questions.length,
    'Pending': pendingQuestions.length,
    'Replied': repliedQuestions.length,
    'Flagged': flaggedQuestions.length
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
              <span style={{ color: '#FBBF24', fontWeight: 600 }}>{pendingQuestions.length}</span> awaiting your reply · ₹{pendingQuestions.length * 99} in escrow
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
            const displayedQuestions = activeTab === 'All' ? questions : questions.filter(q => {
              if (activeTab === 'Pending') return q.status?.toLowerCase() === 'submitted';
              if (activeTab === 'Replied') return q.status?.toLowerCase() === 'answered';
              if (activeTab === 'Flagged') return q.status?.toLowerCase() === 'flagged';
              return true;
            });

            if (displayedQuestions.length === 0) {
               return <div style={{ color: '#64748b', textAlign: 'center', marginTop: '20px' }}>No questions found.</div>
            }

            return displayedQuestions.map((q) => {
              const isPending = q.status?.toLowerCase() === 'submitted';
              const isReplied = q.status?.toLowerCase() === 'answered';
              const isFlagged = q.status?.toLowerCase() === 'flagged';

              let borderColor = '#333';
              let badgeText = '';
              let badgeColor = '';
              let badgeBg = '';
              let subtitle = '';

              if (isPending) {
                borderColor = '#FBBF24'; // yellow
                badgeText = 'Pending';
                badgeColor = '#FBBF24';
                badgeBg = 'rgba(251, 191, 36, 0.15)';
                subtitle = 'new question';
              } else if (isReplied) {
                borderColor = '#22C55E'; // green
                badgeText = 'Done';
                badgeColor = '#22C55E';
                badgeBg = 'rgba(34, 197, 94, 0.15)';
                subtitle = 'replied earlier';
              } else if (isFlagged) {
                borderColor = '#EF4444'; // red
                badgeText = 'Flagged';
                badgeColor = '#EF4444';
                badgeBg = 'rgba(239, 68, 68, 0.15)';
                subtitle = 'reported by you';
              }

              // Mock time for demo matching screenshots
              let timeText = '39m left';
              let timeBadgeColor = '#EF4444';
              let timeBadgeBg = 'rgba(239, 68, 68, 0.15)';
              if (q.buyerName?.startsWith('S') || q.followerName?.startsWith('S')) {
                timeText = '4h 59m left';
                timeBadgeColor = '#22C55E';
                timeBadgeBg = 'rgba(34, 197, 94, 0.15)';
              }

              return (
                <div key={q._id || q.id} style={{
                  background: '#16161e',
                  border: '1px solid #2A2A2A',
                  borderLeft: `4px solid ${borderColor}`,
                  borderRadius: '16px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#2a2a35', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                        {(q.buyerName || q.followerName || 'A')[0].toUpperCase()}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                          {q.buyerName || q.followerName} <span style={{ color: '#38BDF8' }}>· ₹{q.amountPaid || q.pricePaid || 99}</span>
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{subtitle}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ background: badgeBg, color: badgeColor, padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>
                        {badgeText}
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/creator/inbox/delete/${q._id || q.id}`, { state: { question: q } });
                        }}
                        style={{
                          background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s', borderRadius: '4px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                        title="Delete Question"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div style={{ color: '#e2e8f0', fontSize: '0.95rem', lineHeight: '1.5' }}>
                    {q.questionText}
                  </div>

                  {/* Pending Action Row */}
                  {isPending && (
                    <>
                      <div style={{ alignSelf: 'flex-start', background: timeBadgeBg, color: timeBadgeColor, padding: '4px 8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {timeBadgeColor === '#EF4444' ? <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: timeBadgeColor }} /> : 
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>}
                        {timeText}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <button 
                          onClick={() => navigate(`/creator/dashboard/reply/${q._id || q.id}`, { state: { question: q } })}
                          style={{ flex: 1, background: 'linear-gradient(90deg, #38BDF8 0%, #34D399 100%)', border: 'none', borderRadius: '12px', color: '#0F172A', fontWeight: 800, fontSize: '0.95rem', padding: '14px', cursor: 'pointer' }}
                        >
                          Reply & earn ₹{q.amountPaid || q.pricePaid || 99}
                        </button>
                        <button style={{ width: '48px', background: '#2a2a35', border: 'none', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
                        </button>
                      </div>
                    </>
                  )}

                  {/* Replied Section */}
                  {isReplied && (
                    <div style={{ marginTop: '4px' }}>
                      <span style={{ color: '#22C55E', fontWeight: 700, fontSize: '0.9rem' }}>You replied:</span>
                      <span style={{ color: '#94a3b8', fontSize: '0.9rem', marginLeft: '4px' }}>
                        {q.replyText || 'Start with HTML & CSS, then JavaScript fundamentals before any framework. DM me if you want a 30-day plan!'}
                      </span>
                    </div>
                  )}

                  {/* Flagged Section */}
                  {isFlagged && (
                    <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#EF4444', fontSize: '0.85rem', fontWeight: 600 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
                        Flagged — hidden from your queue, under review
                      </div>
                      <button style={{ background: '#2a2a35', border: 'none', borderRadius: '12px', color: '#94a3b8', fontWeight: 600, fontSize: '0.95rem', padding: '14px', cursor: 'pointer' }}>
                        Restore to pending
                      </button>
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
