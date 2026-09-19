import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import TransparentLogo from '../../TransparentLogo';
import { getFanMe } from '../../../services/fanApi';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

const FanNavbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { isAuthenticated } = useAuth();

  const navItems = [
    { label: 'Notifications', path: '/fan/notifications', icon: '🔔' }
  ];

  const [fanName, setFanName] = useState(() => {
    return localStorage.getItem('cachedFanName') || 'Fan';
  });
  const [fanAvatar, setFanAvatar] = useState(() => {
    return localStorage.getItem('skriibe_fan_avatar') || null;
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    const fetchFanProfile = async () => {
      try {
        const res = await getFanMe();
        if (res.success && res.fan) {
          if (res.fan.name) {
            const firstName = res.fan.name.split(' ')[0];
            setFanName(firstName);
            localStorage.setItem('cachedFanName', firstName);
          }
          if (res.fan.avatarUrl) {
            setFanAvatar(res.fan.avatarUrl);
            localStorage.setItem('skriibe_fan_avatar', res.fan.avatarUrl);
          }
        }
      } catch (err) {
        console.error('Failed to fetch fan profile in navbar', err);
      }
    };
    
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/questions/unread-count');
        if (res.data.success) {
          setUnreadCount(res.data.count);
        }
      } catch (err) {}
    };

    const handleNotificationRead = () => {
      fetchNotifications();
    };

    const fetchWallet = async () => {
      try {
        const res = await api.get('/wallet/balance');
        if (res.data.success) {
          setWalletBalance(res.data.balance || 0);
        }
      } catch (err) {}
    };

    if (!isAuthenticated) return;

    fetchFanProfile();
    fetchNotifications();
    fetchWallet();

    const interval = setInterval(() => {
      fetchNotifications();
      fetchWallet();
    }, 15000);

    const handleProfileUpdate = (e) => {
      const updatedName = e?.detail?.name || localStorage.getItem('cachedFanName') || 'Fan';
      const firstName = updatedName.split(' ')[0];
      setFanName(firstName);
      const updatedAvatar = e?.detail?.avatarUrl || localStorage.getItem('skriibe_fan_avatar');
      if (updatedAvatar) setFanAvatar(updatedAvatar);
    };

    window.addEventListener('notificationRead', handleNotificationRead);
    window.addEventListener('fanProfileUpdated', handleProfileUpdate);
    window.addEventListener('storage', handleProfileUpdate);
    return () => {
      window.removeEventListener('notificationRead', handleNotificationRead);
      window.removeEventListener('fanProfileUpdated', handleProfileUpdate);
      window.removeEventListener('storage', handleProfileUpdate);
      clearInterval(interval);
    };
  }, [location.pathname, isAuthenticated]);

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
          gap: 24px;
          flex-wrap: nowrap;
        }
        .fan-nav-link-item {
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
          border-radius: 16px;
          transition: all 0.2s;
          font-size: 28px;
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
            font-size: 20px;
            gap: 4px;
          }
          .fan-nav-link-item span {
            font-size: 22px;
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
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <span className="fan-navbar-logo" style={{ display: 'flex', alignItems: 'center' }}>
            <TransparentLogo src="/logo.png" alt="skriibe logo" style={{ height: '24px', width: 'auto', transform: 'scale(4)', transformOrigin: 'left center' }} />
          </span>
        </Link>
        
        {/* Right side: Navigation Links & Profile */}
        <div className="fan-nav-right">
          {isAuthenticated ? (
          <>
          <Link to="/fan/wallet" style={{
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(56, 189, 248, 0.05) 100%)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '20px',
            padding: '6px 12px',
            textDecoration: 'none',
            color: '#fff',
            fontWeight: '700',
            fontSize: '14px',
            transition: 'transform 0.2s',
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span style={{ color: '#38BDF8', fontSize: '13px' }}>₹</span>
            {Math.round(walletBalance * 100) / 100}
            <div style={{
              background: '#38BDF8',
              color: '#000',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: '900',
              marginLeft: '4px'
            }}>+</div>
          </Link>
          
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

          <Link to="/fan/profile" style={{ 
            textDecoration: 'none', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '4px 12px 4px 4px',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
          title="Your Profile"
          >
            <div className="fan-avatar" style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '14px',
              color: '#ffffff',
              overflow: 'hidden',
              flexShrink: 0
            }}>
              {fanAvatar ? (
                <img src={fanAvatar} alt={fanName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                (fanName || 'F').charAt(0).toUpperCase()
              )}
            </div>
            <span style={{ 
              color: '#ffffff', 
              fontWeight: '700', 
              fontSize: '13px', 
              maxWidth: '100px', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap' 
            }}>
              {fanName}
            </span>
          </Link>
          </>
          ) : null}
        </div>
      </header>
    </>
  );
};

export default FanNavbar;
