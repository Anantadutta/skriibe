import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

const CreatorNotifications = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const pendingQuestions = questions.filter(q => q.status?.toLowerCase() === 'submitted');
  const satisfiedQuestions = questions.filter(q => q.status?.toLowerCase() === 'satisfied' && !q.creatorReadSatisfied);
  const allNotifications = [...pendingQuestions, ...satisfiedQuestions].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

  const handleNotificationClick = async (q) => {
    let updatedQ = q;
    if (q.status?.toLowerCase() === 'satisfied' && !q.creatorReadSatisfied) {
      try {
        const res = await api.patch(`/creator/questions/${q._id || q.id}/read-satisfied`);
        if (res.data?.question) {
          updatedQ = res.data.question;
        }
      } catch (err) {
        console.error('Failed to mark satisfied as read', err);
      }
    }
    const rootQuestion = q.isFollowUp ? questions.find(r => (r._id || r.id) === q.parentQuestionId) : null;
    navigate(`/creator/dashboard/reply/${q._id || q.id}`, { state: { question: updatedQ, rootQuestion } });
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
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Notifications</h2>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
              You have {allNotifications.length} new notification(s)
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '100px' }}>
          {allNotifications.length === 0 ? (
            <div style={{ color: '#64748b', textAlign: 'center', marginTop: '20px' }}>No new notifications.</div>
          ) : (
            allNotifications.map((q) => {
              const isSatisfied = q.status?.toLowerCase() === 'satisfied';
              return (
                <div 
                  key={q._id || q.id}
                  onClick={() => handleNotificationClick(q)}
                  style={{
                    background: '#16161e',
                    border: '1px solid #2A2A2A',
                    borderLeft: `4px solid ${isSatisfied ? '#10b981' : '#FBBF24'}`,
                    borderRadius: '16px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ color: isSatisfied ? '#10b981' : '#FBBF24', fontSize: '0.8rem', fontWeight: 600 }}>
                      {isSatisfied ? 'Fan Satisfied' : (q.isFollowUp ? 'New Follow-up Question' : 'New Question')}
                    </div>
                    <div style={{ background: isSatisfied ? 'rgba(16, 185, 129, 0.15)' : 'rgba(251, 191, 36, 0.15)', color: isSatisfied ? '#10b981' : '#FBBF24', padding: '4px 8px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700 }}>
                      Unread
                    </div>
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                    {isSatisfied ? `${q.buyerName || q.handle || 'A fan'} is satisfied with your reply` : `From ${q.buyerName || q.followerName || 'A fan'}`}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.4' }}>
                    Click to view {isSatisfied ? 'the thread' : 'and reply'} in your inbox.
                  </div>
                </div>
              );
            })
          )}
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
          const isActive = location.pathname === item.route || (item.route === '/creator/notifications' && location.pathname === '/creator/notifications');
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

export default CreatorNotifications;
