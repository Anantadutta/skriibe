import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getFanMe } from '../../../services/fanApi';
import api from '../../../services/api';

const FanNavbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { label: 'Home', path: '/explore', icon: '🏠' },
    { label: 'History', path: '/fan/history', icon: '🕒' },
    { label: 'Notifications', path: '/fan/notifications', icon: '🔔' }
  ];

  const [fanName, setFanName] = useState(() => {
    return localStorage.getItem('cachedFanName') || 'Fan';
  });
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchFanProfile = async () => {
      try {
        const res = await getFanMe();
        if (res.success && res.fan && res.fan.name) {
          const firstName = res.fan.name.split(' ')[0];
          setFanName(firstName);
          localStorage.setItem('cachedFanName', firstName);
        }
      } catch (err) {
        console.error('Failed to fetch fan profile in navbar', err);
      }
    };
    
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/questions/notifications');
        if (res.data.success && res.data.notifications) {
          const unread = res.data.notifications.filter(n => !n.isRead).length;
          setUnreadCount(unread);
        }
      } catch (err) {}
    };

    fetchFanProfile();
    fetchNotifications();
  }, []);

  return (
    <>
      <style>{`
        .fan-navbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 40px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          background: #0a0a0f;
          flex-wrap: nowrap;
          gap: 24px;
        }
        .fan-nav-right {
          display: flex;
          align-items: center;
          gap: 32px;
          flex-wrap: nowrap;
        }
        .fan-nav-links {
          display: flex;
          gap: 12px;
          flex-wrap: nowrap;
        }
        .fan-nav-link-item {
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 14px;
          transition: all 0.2s;
          font-size: 20px;
        }
        .fan-nav-link-item:hover {
          background: rgba(255,255,255,0.05);
        }
        @media (max-width: 768px) {
          .fan-navbar {
            padding: 12px 10px;
            gap: 6px;
            justify-content: space-between;
            overflow-x: hidden;
          }
          .fan-navbar-logo {
            font-size: 22px !important;
            letter-spacing: -0.5px !important;
          }
          .fan-nav-right {
            gap: 8px;
          }
          .fan-nav-links {
            gap: 2px;
          }
          .fan-nav-link-item {
            padding: 6px 8px;
            font-size: 10px;
            gap: 4px;
          }
          .fan-nav-link-item span {
            font-size: 12px;
          }
          .fan-avatar {
            width: 32px !important;
            height: 32px !important;
            font-size: 14px !important;
            min-width: 32px !important;
          }
        }
      `}</style>
      <header className="fan-navbar">
        <Link to="/explore" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <span className="fan-navbar-logo" style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px', color: '#ffffff' }}>
            skr<span style={{ color: '#06b6d4' }}>ii</span>be
          </span>
        </Link>
        
        {/* Right side: Navigation Links & Profile */}
        <div className="fan-nav-right">
          <nav className="fan-nav-links">
          {navItems.map(item => {
            const isActive = currentPath === item.path;
            const isNotification = item.label === 'Notifications';
            return (
              <Link key={item.path} to={item.path} className="fan-nav-link-item" title={item.label} style={{
                background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                position: 'relative'
              }}>
                <span style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.icon}
                  {isNotification && unreadCount > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-8px',
                      background: '#ef4444',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontWeight: '800',
                      minWidth: '16px',
                      height: '16px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #0a0a0f',
                      padding: '0 2px'
                    }}>
                      {unreadCount}
                    </div>
                  )}
                </span>
              </Link>
            );
          })}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="fan-avatar" style={{
              background: '#fb923c',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              color: '#000',
              fontSize: '18px'
            }}>
            {fanName.charAt(0).toUpperCase()}
          </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default FanNavbar;
