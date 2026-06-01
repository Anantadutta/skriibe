import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const FanNavbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { label: 'Home', path: '/explore', icon: '🏠' },
    { label: 'History', path: '/fan/history', icon: '🕒' },
    { label: 'Notifications', path: '/fan/notifications', icon: '🔔' }
  ];

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '24px 40px',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      background: '#0a0a0f'
    }}>
      <Link to="/explore" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px', color: '#ffffff' }}>
          skr<span style={{ color: '#06b6d4' }}>ii</span>be
        </span>
      </Link>
      
      {/* Right side: Navigation Links & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <nav style={{ display: 'flex', gap: '8px' }}>
          {navItems.map(item => {
            const isActive = currentPath === item.path;
            return (
              <Link key={item.path} to={item.path} style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '20px',
                background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: isActive ? '#fff' : '#94a3b8',
                fontWeight: isActive ? '700' : '600',
                transition: 'all 0.2s',
                fontSize: '15px'
              }}>
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
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
            F
          </div>
        </div>
      </div>
    </header>
  );
};

export default FanNavbar;
