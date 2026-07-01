import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FanNavbar from '../../components/fan/layout/FanNavbar';
import api from '../../services/api';

const FanNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/questions/notifications');
        if (res.data.success) {
          setNotifications(res.data.notifications);
        }
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      // Optimistically update local state
      setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
      // Dispatch event to update navbar immediately
      window.dispatchEvent(new Event('notificationRead'));
      
      try {
        await api.patch(`/questions/notifications/${notif._id}/read`);
        // If the notification relates to a question, mark the question as read too
        // so the global unread count badge disappears immediately.
        const qId = notif.questionId || notif.referenceId;
        if (qId) {
          await api.post(`/questions/${qId}/read`);
        }
      } catch (err) {
        console.error('Failed to mark as read', err);
        // Revert on failure
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: false } : n));
      }
    }
    // Navigate to history to see the answer
    const targetQId = notif.questionId || notif.referenceId;
    if (targetQId) {
      navigate(`/fan/history?qId=${targetQId}`);
    } else {
      navigate('/fan/history');
    }
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
      
      <main style={{ flex: 1, padding: '40px', maxWidth: '800px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
          <button 
            onClick={() => navigate(-1)} 
            style={{ 
              background: 'rgba(255, 255, 255, 0.05)', 
              border: '1px solid rgba(255, 255, 255, 0.08)', 
              borderRadius: '50%', 
              color: '#ffffff', 
              width: '40px', 
              height: '40px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontSize: '20px',
              padding: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'translateX(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            ←
          </button>
          <h1 style={{ fontSize: '36px', fontWeight: '800', margin: 0 }}>Notifications</h1>
        </div>
        <p style={{ color: '#94a3b8', marginBottom: '40px', marginLeft: '56px' }}>Stay updated on replies and creator activity.</p>
        
        {loading ? (
          <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '64px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '20px',
            border: '1px dashed rgba(255,255,255,0.1)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
            <h3 style={{ fontSize: '20px', margin: '0 0 8px' }}>All caught up!</h3>
            <p style={{ color: '#94a3b8', margin: 0 }}>You have no new notifications.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {notifications.map((notif) => (
              <div 
                key={notif._id}
                onClick={() => handleNotificationClick(notif)}
                style={{
                  background: notif.isRead ? 'rgba(255,255,255,0.03)' : 'rgba(56, 189, 248, 0.1)',
                  border: notif.isRead ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(0.99)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {!notif.isRead && (
                  <div style={{ width: '8px', height: '8px', background: '#38bdf8', borderRadius: '50%', position: 'absolute', left: '16px', top: '32px' }} />
                )}
                <div style={{ fontSize: '24px', marginLeft: notif.isRead ? '0' : '16px' }}>🔔</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '16px', color: notif.isRead ? '#e2e8f0' : '#ffffff' }}>{notif.title}</div>
                  <div style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.5' }}>{notif.message}</div>
                  <div style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>
                    {new Date(notif.createdAt).toLocaleDateString()} · {new Date(notif.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default FanNotifications;
