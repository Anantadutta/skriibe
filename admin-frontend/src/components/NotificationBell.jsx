import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const NotificationBell = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/alerts`, { withCredentials: true });
        const unread = res.data.filter(a => !a.isRead).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error('Failed to fetch unread alerts count:', err);
      }
    };
    fetchUnread();
  }, [location.pathname]);

  return (
    <div 
      onClick={() => navigate('/admin/alerts')}
      style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#1A1A1A', border: '1px solid #2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}
    >
      <span style={{ fontSize: '1.2rem' }}>🔔</span>
      {unreadCount > 0 && (
        <div style={{ position: 'absolute', top: -4, right: -4, background: '#EF4444', color: '#fff', fontSize: '0.65rem', fontWeight: 'bold', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #13131A' }}>
          {unreadCount}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
