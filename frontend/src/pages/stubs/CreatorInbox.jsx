import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { mockQuestions } from '../../mock/questions';

const CreatorInbox = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('All');

  // Cyan filter for active bottom nav icons
  const cyanFilter = 'invert(69%) sepia(87%) saturate(2714%) hue-rotate(164deg) brightness(99%) contrast(98%)';
  const grayFilter = 'invert(31%) sepia(13%) saturate(760%) hue-rotate(181deg) brightness(96%) contrast(85%)';

  const navItems = [
    { label: 'HOME', icon: '🏠', route: '/creator/dashboard' },
    { label: 'INBOX', icon: '💬', route: '/creator/inbox' },
    { label: 'ANALYTICS', icon: '📊', route: '/creator/analytics' },
    { label: 'PAYOUTS', icon: '💰', route: '/creator/payouts' },
    { label: 'SETTINGS', icon: '⚙️', route: '/creator/settings' },
  ];

  const repliedQuestions = [
    {
      id: 'r1',
      followerName: 'Rohan M.',
      pricePaid: 99,
      questionText: 'NPS vs PPF for retirement?',
      status: 'replied'
    },
    {
      id: 'r2',
      followerName: 'Sana B.',
      pricePaid: 99,
      questionText: 'Best index fund for beginners?',
      status: 'replied'
    }
  ];

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
      {/* Container to restrict width */}
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
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#1A1A1A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <span style={{ fontSize: '1.2rem', color: '#94a3b8' }}>‹</span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 auto', paddingRight: '40px' }}>
            Question inbox
          </h2>
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#64748b'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </span>
          <input 
            type="text" 
            placeholder="Search questions..." 
            style={{
              width: '100%',
              background: '#1A1A1A',
              border: '1px solid #2A2A2A',
              borderRadius: '24px',
              padding: '12px 16px 12px 44px',
              color: '#ffffff',
              fontSize: '0.95rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          background: '#1A1A1A',
          borderRadius: '12px',
          padding: '4px',
          gap: '4px'
        }}>
          {['All (12)', 'Pending (3)', 'Replied (8)', 'Flagged (1)'].map((tab) => {
            const isActive = activeTab === tab.split(' ')[0];
            return (
              <div 
                key={tab}
                onClick={() => setActiveTab(tab.split(' ')[0])}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '12px 4px',
                  borderRadius: '10px',
                  background: isActive ? '#2A2A2A' : 'transparent',
                  color: isActive ? '#ffffff' : '#64748b',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>{tab.split(' ')[0]}</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{tab.split(' ')[1]}</span>
              </div>
            );
          })}
        </div>

        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '100px' }}>
          
          {/* URGENT SECTION */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#EF4444', letterSpacing: '1px' }}>
                URGENT — REPLY NEEDED
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {mockQuestions.map((q) => {
                const borderLeftColor = q.slaStatus === 'urgent' ? '#EF4444' : '#00e5ff';
                const slaColor = q.slaStatus === 'urgent' ? '#EF4444' : '#F59E0B'; // Changed ok to yellow matching image
                const slaBg = q.slaStatus === 'urgent' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)';
                
                return (
                  <div 
                    key={q.id} 
                    onClick={() => navigate(`/creator/dashboard/reply/${q.id}`)}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(0.98)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                    style={{
                    background: '#13131f',
                    border: '1px solid #2A2A2A',
                    borderLeft: `4px solid ${borderLeftColor}`,
                    borderRadius: '16px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'transform 0.1s ease'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: '#1A1A1A',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.9rem'
                        }}>
                          {q.followerName.charAt(0)}
                        </div>
                        <div style={{ color: '#00e5ff', fontSize: '0.95rem', fontWeight: 600 }}>
                          {q.followerName} <span style={{ color: '#64748b' }}>·</span> ₹{q.pricePaid}
                        </div>
                      </div>
                      <div style={{
                        color: slaColor,
                        background: slaBg,
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        {q.slaHoursLeft}h
                      </div>
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.4, paddingLeft: '44px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {q.questionText}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* REPLIED SECTION */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', letterSpacing: '1px' }}>
                REPLIED · EARLIER
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {repliedQuestions.map((q) => {
                return (
                  <div 
                    key={q.id} 
                    style={{
                    background: '#13131f',
                    border: '1px solid #2A2A2A',
                    borderLeft: `4px solid #22C55E`,
                    borderRadius: '16px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: '#1A1A1A',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.9rem'
                        }}>
                          {q.followerName.charAt(0)}
                        </div>
                        <div style={{ color: '#00e5ff', fontSize: '0.95rem', fontWeight: 600 }}>
                          {q.followerName} <span style={{ color: '#64748b' }}>·</span> ₹{q.pricePaid}
                        </div>
                      </div>
                      <div style={{
                        color: '#22C55E',
                        background: 'rgba(34, 197, 94, 0.1)',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        Done
                      </div>
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.4, paddingLeft: '44px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {q.questionText}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* BOTTOM NAV BAR */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '390px',
        background: '#0E0E0E',
        borderTop: '1px solid #1A1A1A',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '12px 0 20px',
        zIndex: 100
      }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.route;
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
                fontSize: '20px',
                filter: isActive ? cyanFilter : grayFilter
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

export default CreatorInbox;
