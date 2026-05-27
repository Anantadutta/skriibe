/**
 * @file CreatorDashboard.jsx
 * @description Creator dashboard route showing mock data if username matches mockCreator.username, else 404.
 */

import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { mockCreator, mockQuestions } from '../mock/questions';

const CreatorDashboard = () => {
  const { username } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const cleanUsername = username ? username.replace('@', '') : '';
  const creator = location.state?.creator || mockCreator;
  const show404 = username ? (cleanUsername !== creator.username && cleanUsername !== mockCreator.username) : false;

  const [isLive, setIsLive] = useState(creator.isLive);
  const [btnHover, setBtnHover] = useState(false);

  const navItems = [
    { label: 'HOME', icon: '🏠', route: '/creator/dashboard' },
    { label: 'INBOX', icon: '💬', route: '/creator/inbox' },
    { label: 'ANALYTICS', icon: '📊', route: '/creator/analytics' },
    { label: 'PAYOUTS', icon: '💰', route: '/creator/payouts' },
    { label: 'SETTINGS', icon: '⚙️', route: '/creator/settings' },
  ];

  const handleToggle = () => {
    setIsLive(!isLive);
  };

  if (show404) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0E0E0E',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600 }}>Creator not found</h2>
      </div>
    );
  }

  // Cyan filter: to make emojis turn cyan #29C5F6
  const cyanFilter = 'invert(69%) sepia(87%) saturate(2714%) hue-rotate(164deg) brightness(99%) contrast(98%)';
  // Gray filter
  const grayFilter = 'invert(31%) sepia(13%) saturate(760%) hue-rotate(181deg) brightness(96%) contrast(85%)';

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
      <style dangerouslySetInnerHTML={{ __html: `
        ::-webkit-scrollbar {
          display: none;
        }
        * {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes ripple-dot {
          0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
          100% { box-shadow: 0 0 0 14px rgba(34, 197, 94, 0); }
        }
      `}} />
      
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

        {/* 1. TOP BAR */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 0 4px 0'
        }}>
          {/* Logo */}
          <div style={{
            fontSize: '1.6rem',
            fontWeight: '600',
            fontStyle: 'normal',
            letterSpacing: '-0.03em',
            color: '#fff'
          }}>
            skr<span style={{ color: '#29C5F6' }}>ii</span>be
          </div>

          {/* Avatar with Status Dot */}
          <div style={{ position: 'relative', cursor: 'pointer' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#1A1A1A',
              border: '2px solid #2A2A2A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              color: '#ffffff',
              fontSize: '16px'
            }}>
              {creator.avatarInitial || (creator.displayName ? creator.displayName[0] : 'T')}
            </div>
            <div style={{
              position: 'absolute',
              top: '0px',
              right: '0px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: isLive ? '#22C55E' : '#94a3b8',
              border: '2px solid #0E0E0E',
              animation: isLive ? 'ripple-dot 1.5s infinite ease-out' : 'none'
            }} />
          </div>
        </div>

        {/* 2. STATS ROW */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '10px'
        }}>
          <div style={{
            background: '#1A1A1A',
            border: '1px solid #2A2A2A',
            borderRadius: '14px',
            padding: '16px 12px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#29C5F6', letterSpacing: '-1px' }}>
              <span style={{ fontSize: '1.4rem' }}>₹</span>{creator.weeklyEarnings}
            </div>
            <div style={{ fontSize: '0.6rem', color: '#64748b', marginTop: '4px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
              THIS WEEK
            </div>
          </div>

          <div style={{
            background: '#1A1A1A',
            border: '1px solid #2A2A2A',
            borderRadius: '14px',
            padding: '16px 12px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#EF4444' }}>
              3
            </div>
            <div style={{ fontSize: '0.6rem', color: '#64748b', marginTop: '4px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
              PENDING
            </div>
          </div>

          <div style={{
            background: '#1A1A1A',
            border: '1px solid #2A2A2A',
            borderRadius: '14px',
            padding: '16px 12px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#22C55E' }}>
              {creator.replyRate}%
            </div>
            <div style={{ fontSize: '0.6rem', color: '#64748b', marginTop: '4px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
              REPLY RATE
            </div>
          </div>
        </div>

        {/* 3. LIVE STATUS BANNER */}
        <div style={{
          background: '#1A1A1A',
          border: '1px solid #2A2A2A',
          boxShadow: 'none',
          borderRadius: '16px',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'all 0.2s ease'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isLive ? '#22C55E' : '#94a3b8',
                transition: 'background-color 0.2s ease'
              }} />
              <span style={{ fontWeight: 700, fontSize: '1rem', color: '#ffffff' }}>
                You're {isLive ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
              {isLive ? `Accepting questions · ₹${creator.pricePerQuestion}/question` : 'Currently offline'}
            </div>
          </div>

          <div 
            onClick={handleToggle}
            style={{
              width: '48px',
              height: '28px',
              borderRadius: '14px',
              background: isLive ? '#22C55E' : '#2A2A2A',
              position: 'relative',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: '#ffffff',
              position: 'absolute',
              top: '4px',
              left: isLive ? '24px' : '4px',
              transition: 'all 0.2s ease'
            }} />
          </div>
        </div>

        {/* 4. PRIMARY ACTIONS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          <div 
            onClick={() => navigate('/creator/payouts')}
            style={{
              background: 'linear-gradient(90deg, rgba(41, 197, 246, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
              border: '1px solid rgba(41, 197, 246, 0.3)',
              borderRadius: '16px',
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(0.98)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <span style={{ fontWeight: 700, fontSize: '1rem', color: '#ffffff' }}>
                  Setup payouts
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                Link your bank account
              </div>
            </div>
            <div style={{
              background: '#ffffff',
              color: '#0E0E0E',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700
            }}>
              Setup →
            </div>
          </div>

          <div 
            onClick={() => navigate('/creator/health')}
            style={{
              background: '#13131f',
              border: '1px solid #2A2A2A',
              borderRadius: '16px',
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(0.98)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <span style={{ fontWeight: 700, fontSize: '1rem', color: '#ffffff' }}>
                  Account health
                </span>
                <span style={{
                  background: 'rgba(34, 197, 94, 0.2)',
                  color: '#4ade80',
                  padding: '2px 6px',
                  borderRadius: '12px',
                  fontSize: '0.7rem',
                  fontWeight: 600
                }}>
                  Good
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                Review metrics and SLAs
              </div>
            </div>
            <div style={{
              background: '#2A2A2A',
              color: '#ffffff',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 600
            }}>
              View →
            </div>
          </div>
        </div>

      </div>

      {/* 5. BOTTOM NAV BAR */}
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

export default CreatorDashboard;
