import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

const AdminLayout = () => {
  const location = useLocation();
  const isDisputeDrilldown = location.pathname.includes('/admin/dispute/');

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { name: 'Alerts', path: '/admin/alerts', icon: '🔔', badge: 7 },
    { name: 'Verification', path: '/admin/verification', icon: '✅' },
    { name: 'Creators', path: '/admin/creators', icon: '👥' },
    { name: 'Buyers', path: '/admin/buyers', icon: '🛒' },
    { name: 'Analytics', path: '/admin/analytics', icon: '📈' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0f', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Sidebar */}
      <div style={{ 
        width: '240px', 
        background: '#13131A', 
        borderRight: '1px solid #1E1E2D', 
        display: 'flex', 
        flexDirection: 'column',
        padding: '24px 16px',
        flexShrink: 0
      }}>
        <div style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-0.05em', marginBottom: '32px', padding: '0 12px' }}>
          skriibe
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {menuItems.map(item => (
            <NavLink 
              key={item.name}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: isActive ? '#fff' : '#64748b',
                background: isActive ? '#1E1E2D' : 'transparent',
                fontWeight: isActive ? 'bold' : '500',
                transition: 'all 0.2s'
              })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.2rem', filter: location.pathname === item.path ? 'none' : 'grayscale(100%) opacity(0.7)' }}>{item.icon}</span>
                {item.name}
              </div>
              {item.badge && (
                <div style={{ background: '#EF4444', color: '#fff', fontSize: '0.7rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '12px' }}>
                  {item.badge}
                </div>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, position: 'relative', overflowY: 'auto', background: '#0a0a0f' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
