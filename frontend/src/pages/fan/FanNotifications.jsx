import React from 'react';
import FanNavbar from '../../components/fan/layout/FanNavbar';

const FanNotifications = () => {
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
        <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '8px' }}>Notifications</h1>
        <p style={{ color: '#94a3b8', marginBottom: '40px' }}>Stay updated on answers and creator activity.</p>
        
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
      </main>
    </div>
  );
};

export default FanNotifications;
