import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getFanMe } from '../../../services/fanApi';

const FanNavbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { label: 'Home', path: '/explore', icon: '🏠' },
    { label: 'History', path: '/fan/history', icon: '🕒' },
    { label: 'Notifications', path: '/fan/notifications', icon: '🔔' }
  ];

  const [fanName, setFanName] = useState('Fan');

  useEffect(() => {
    const fetchFanProfile = async () => {
      try {
        const res = await getFanMe();
        if (res.success && res.fan && res.fan.name) {
          setFanName(res.fan.name.split(' ')[0]);
        }
      } catch (err) {
        console.error('Failed to fetch fan profile in navbar', err);
      }
    };
    fetchFanProfile();
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
          gap: 8px;
          flex-wrap: nowrap;
        }
        .fan-nav-link-item {
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 20px;
          transition: all 0.2s;
          font-size: 15px;
          white-space: nowrap;
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
            return (
              <Link key={item.path} to={item.path} className="fan-nav-link-item" style={{
                background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: isActive ? '#fff' : '#94a3b8',
                fontWeight: isActive ? '700' : '600',
              }}>
                <span>{item.icon}</span>
                {item.label}
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
