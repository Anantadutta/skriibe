import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

const CreatorNotifications = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

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
    const fetchNotifications = async (isBackground = false) => {
      if (!isBackground) setLoading(true);
      try {
        const res = await api.get(`/creator/notifications?t=${Date.now()}`);
        if (res.data.success) {
          setNotifications(res.data.notifications);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
      } finally {
        if (!isBackground) setLoading(false);
      }
    };
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const [readIds, setReadIds] = useState(() => JSON.parse(localStorage.getItem('creatorReadNotifications') || '[]'));

  const handleNotificationClick = async (notif) => {
    if (!readIds.includes(notif.id)) {
      const newReadIds = [...readIds, notif.id];
      localStorage.setItem('creatorReadNotifications', JSON.stringify(newReadIds));
      setReadIds(newReadIds);
    }

    if (notif.type === 'ama') {
      navigate(`/creator/dashboard/reply/${notif.id}`);
    } else if (notif.type === 'live_chat') {
      navigate(`/creator/dashboard`);
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
              You have {notifications.length} notification(s)
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '100px' }}>
          {notifications.length === 0 ? (
            <div style={{ color: '#64748b', textAlign: 'center', marginTop: '20px' }}>No new notifications.</div>
          ) : (
            notifications.map((notif) => {
              const isRead = readIds.includes(notif.id);
              let icon = '🔔';
              if (notif.type === 'ama') icon = '?';
              if (notif.type === 'live_chat') icon = '💬';
              if (notif.type === 'tip') icon = '💰';
              if (notif.type === 'review') icon = '⭐';

              return (
                <div 
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  style={{
                    background: '#16161e',
                    border: '1px solid #2A2A2A',
                    borderLeft: `4px solid ${isRead ? '#475569' : '#38BDF8'}`,
                    borderRadius: '16px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    cursor: 'pointer',
                    opacity: isRead ? 0.7 : 1
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ color: isRead ? '#94a3b8' : '#38BDF8', fontSize: '1rem', fontWeight: 600, display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.2rem' }}>{icon}</span>
                      {notif.type.replace('_', ' ').toUpperCase()}
                    </div>
                    <div style={{ 
                      background: isRead ? 'rgba(148, 163, 184, 0.15)' : 'rgba(56, 189, 248, 0.15)', 
                      color: isRead ? '#94a3b8' : '#38BDF8', 
                      padding: '4px 8px', 
                      borderRadius: '8px', 
                      fontSize: '0.7rem', 
                      fontWeight: 700 
                    }}>
                      {isRead ? 'Read' : 'Unread'}
                    </div>
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: isRead ? '#cbd5e1' : '#fff', lineHeight: '1.4' }}>
                    {notif.title}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem', lineHeight: '1.4' }}>
                    {new Date(notif.timestamp).toLocaleString()}
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

export default CreatorNotifications;
