import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { switchRole } from '../../../services/fanApi';
import UpgradePromptModal from '../../UpgradePromptModal';
import { useAuth } from '../../../context/AuthContext';

const FanBottomNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const { roles, setAuthData } = useAuth();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/questions/unread-count');
        if (res.data.success) {
          setUnreadCount(res.data.count);
        }
      } catch (err) {}
    };

    const handleNotificationRead = () => {
      setUnreadCount(prev => Math.max(0, prev - 1));
    };

    fetchNotifications();
    window.addEventListener('notificationRead', handleNotificationRead);
    return () => {
      window.removeEventListener('notificationRead', handleNotificationRead);
    };
  }, []);

  const navItems = [
    { label: 'Home', path: '/discovery', icon: (active) => <HomeIcon active={active} /> },
    { label: 'Explore', path: '/explore', icon: (active) => <ExploreIcon active={active} /> },
    { label: 'Create', isAction: true, icon: () => <UploadIcon /> },
    { label: 'Inbox', path: '/fan/history', icon: (active) => <InboxIcon active={active} />, hasBadge: true },
    { label: 'Profile', path: '/fan/profile', icon: (active) => <ProfileIcon active={active} /> }
  ];

  return (
    <>
      <style>{`
        .fan-bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 70px;
          background: #0a0a0f;
          border-top: 1px solid rgba(255,255,255,0.05);
          display: flex;
          justify-content: space-around;
          align-items: center;
          z-index: 1000;
          padding-bottom: env(safe-area-inset-bottom);
        }
        .fan-bottom-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          color: #64748b;
          width: 60px;
          height: 100%;
          position: relative;
          transition: color 0.2s;
        }
        .fan-bottom-nav-item.active {
          color: #ffffff; /* White text for active */
          font-weight: 800; /* Bolder text for active */
        }
        .nav-indicator {
          display: none; /* Hide top indicator as it's not in the design */
        }
        .nav-icon {
          margin-bottom: 4px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .nav-label {
          font-size: 11px;
          font-weight: 600;
        }
        .nav-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 8px;
          height: 8px;
          background: #ef4444;
          border-radius: 50%;
        }
      `}</style>
      <nav className="fan-bottom-nav">
        {navItems.map(item => {
          if (item.isAction) {
            return (
              <div 
                key={item.label} 
                className="fan-bottom-nav-item" 
                onClick={async () => {
                  if (roles && roles.includes('creator')) {
                    try {
                      const res = await switchRole('creator');
                      if (res.success) {
                        setAuthData(roles, 'creator', res.token);
                        window.location.href = '/creator/dashboard';
                      } else {
                        navigate('/creator/dashboard');
                      }
                    } catch (err) {
                      navigate('/creator/dashboard');
                    }
                  } else {
                    navigate('/fan/upgrade');
                  }
                }}
                style={{ cursor: 'pointer', transform: 'translateY(-10px)' }}
              >
                <div className="nav-icon" style={{ marginBottom: '0px' }}>
                  {item.icon()}
                </div>
                <span className="nav-label">{item.label}</span>
              </div>
            );
          }

          const isActive = currentPath === item.path || (item.path === '/fan/history' && currentPath.includes('/history'));
          return (
            <Link key={item.path} to={item.path} className={`fan-bottom-nav-item ${isActive ? 'active' : ''}`}>
              {isActive && <div className="nav-indicator" />}
              <div className="nav-icon">
                {item.icon(isActive)}
                {item.hasBadge && unreadCount > 0 && <div className="nav-badge" />}
              </div>
              <span className="nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      {/* Spacer to prevent content from hiding behind fixed nav */}
      <div style={{ height: '70px', flexShrink: 0 }} />
    </>
  );
};

// SVG Icons
const HomeIcon = ({ active }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ filter: active ? 'brightness(1.1)' : 'brightness(0.8) grayscale(0.2)', transition: 'all 0.2s' }}>
    <rect x="3" y="18" width="18" height="3" rx="1.5" fill="#22C55E" />
    <rect x="5" y="10" width="14" height="9" fill="#EF4444" />
    <rect x="9" y="13" width="6" height="6" fill="#B91C1C" rx="0.5" />
    <polygon points="12,2 2,10 22,10" fill="#EAB308" />
  </svg>
);

const ExploreIcon = ({ active }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ filter: active ? 'brightness(1.1)' : 'brightness(0.8) grayscale(0.2)', transition: 'all 0.2s' }}>
    <defs>
      <linearGradient id="explore-ring" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#C084FC" />
        <stop offset="100%" stopColor="#38BDF8" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="9" stroke="url(#explore-ring)" strokeWidth="2.5" />
    <polygon points="12,5 14.5,12 9.5,12" fill="#F97316" />
    <polygon points="12,19 14.5,12 9.5,12" fill="#8B5CF6" />
    <circle cx="12" cy="12" r="1.5" fill="#FFFFFF" />
  </svg>
);

const InboxIcon = ({ active }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ filter: active ? 'brightness(1.1)' : 'brightness(0.8) grayscale(0.2)', transition: 'all 0.2s' }}>
    <rect x="2" y="6" width="20" height="13" rx="2" fill="#F97316" />
    <polygon points="2,6 12,13 22,6" fill="#FBBF24" />
  </svg>
);

const ProfileIcon = ({ active }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ filter: active ? 'brightness(1.1)' : 'brightness(0.8) grayscale(0.2)', transition: 'all 0.2s' }}>
    <defs>
      <linearGradient id="profile-body" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#60A5FA" />
        <stop offset="100%" stopColor="#3B82F6" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="7" r="4.5" fill="#D946EF" />
    <path d="M4,21 C4,15 7.58,13 12,13 C16.42,13 20,15 20,21" fill="url(#profile-body)" />
  </svg>
);

const UploadIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="20" r="18" fill="linear-gradient(90deg, #7c3aed 0%, #06b6d4 100%)" stroke="none" />
    <circle cx="20" cy="20" r="18" fill="#7c3aed" />
    <path d="M20 12v16m-8-8h16" stroke="white" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export default FanBottomNav;
