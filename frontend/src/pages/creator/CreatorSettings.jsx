/**
 * @file CreatorSettings.jsx
 * @description Settings placeholder page.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhoneFrame } from '../../components/ama/layout/PhoneFrame';
import { BottomNav } from '../../components/ama/layout/BottomNav';
import { getMe } from '../../services/creatorApi';

const formatLiveChatTimings = (slots) => {
  if (!slots || slots.length === 0) return 'Not set';
  
  const daysOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const slotsByTime = {};
  
  slots.forEach(slot => {
    const parts = slot.split('|');
    if (parts.length === 2) {
      const [day, time] = parts;
      if (!slotsByTime[time]) slotsByTime[time] = [];
      slotsByTime[time].push(day);
    }
  });

  const formattedParts = [];
  
  for (const [time, days] of Object.entries(slotsByTime)) {
    const sortedDays = days.sort((a, b) => daysOrder.indexOf(a) - daysOrder.indexOf(b));
    let groups = [];
    let tempGroup = [sortedDays[0]];

    for (let i = 1; i < sortedDays.length; i++) {
      const prevDayIdx = daysOrder.indexOf(sortedDays[i - 1]);
      const currDayIdx = daysOrder.indexOf(sortedDays[i]);
      
      if (currDayIdx === prevDayIdx + 1) {
        tempGroup.push(sortedDays[i]);
      } else {
        if (tempGroup.length >= 2) {
          groups.push(`${tempGroup[0]} to ${tempGroup[tempGroup.length - 1]}`);
        } else {
          groups.push(tempGroup[0]);
        }
        tempGroup = [sortedDays[i]];
      }
    }
    
    if (tempGroup.length >= 2) {
      groups.push(`${tempGroup[0]} to ${tempGroup[tempGroup.length - 1]}`);
    } else {
      groups.push(tempGroup[0]);
    }
    
    formattedParts.push(`${groups.join(', ')} ${time}`);
  }
  
  return formattedParts.join('; ');
};

const CreatorSettings = () => {
  const navigate = useNavigate();
  const [creator, setCreator] = useState(null);

  useEffect(() => {
    getMe().then(res => {
      if (res.success && res.creator) {
        setCreator(res.creator);
      }
    }).catch(console.error);
  }, []);

  const username = creator?.username || creator?.handle || '';

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0B0B10',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative'
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '13px',
        color: 'var(--g3)',
        letterSpacing: '0.1em',
        marginBottom: '20px',
        textTransform: 'uppercase',
        fontWeight: 'bold'
      }}>
        C11 — SETTINGS
      </div>

      <PhoneFrame>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: '20px',
          boxSizing: 'border-box',
          position: 'relative',
          gap: '24px'
        }}>
          <div>
            <span style={{ fontSize: '40px', marginBottom: '16px', display: 'block' }}>⚙️</span>
            <h2 style={{ color: '#ffffff', fontSize: '18px', fontWeight: 'bold', margin: '0 0 16px' }}>
              Account Settings
            </h2>
            
            {/* LIVE CHAT TIMINGS BANNER */}
            <div style={{
              background: '#13161C',
              border: '1px solid #1F2937',
              borderRadius: '16px',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginBottom: '16px',
              textAlign: 'left',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#38BDF8'
                  }} />
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#ffffff' }}>
                    Live Chat Timings
                  </span>
                </div>
                <button 
                  onClick={() => navigate('/onboard/live-chat', { state: { creator, returnTo: '/creator/settings' } })}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                  Edit
                </button>
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.5' }}>
                Your live chat timings are <strong style={{ color: '#fff' }}>{formatLiveChatTimings(creator?.liveChatTimeSlots)}</strong>. You will be shown online on the platform during these hours.
              </div>
            </div>
            
            {/* SCHEDULING BANNER */}
            <div style={{
              background: '#13161C',
              border: '1px solid #1F2937',
              borderRadius: '16px',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginBottom: '16px',
              textAlign: 'left',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#A855F7'
                  }} />
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#ffffff' }}>
                    Scheduling
                  </span>
                </div>
                <button 
                  onClick={() => navigate('/creator/scheduling')}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                  Edit
                </button>
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.5' }}>
                Set your working hours for fans to book a call with you.
              </div>
            </div>

            {/* AMA PRICING BANNER */}
            <div style={{
              background: '#13161C',
              border: '1px solid #1F2937',
              borderRadius: '16px',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginBottom: '16px',
              textAlign: 'left',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#F59E0B'
                  }} />
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#ffffff' }}>
                    Ask Me Anything
                  </span>
                </div>
                <button 
                  onClick={() => navigate('/onboard/pricing', { state: { creator, returnTo: '/creator/settings' } })}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {(!(creator?.price || creator?.pricePerQuestion) || (creator.price === 0 && creator.pricePerQuestion === 0)) ? (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      Setup
                    </>
                  ) : (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                      </svg>
                      Edit
                    </>
                  )}
                </button>
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.5' }}>
                {(!(creator?.price || creator?.pricePerQuestion) || (creator.price === 0 && creator.pricePerQuestion === 0)) ? (
                  <>You have <strong style={{ color: '#fff' }}>not set up</strong> Ask Me Anything. Set it up to allow fans to send paid questions while you're offline.</>
                ) : (
                  <>Your AMA price is <strong style={{ color: '#fff' }}>{creator.price || creator.pricePerQuestion}</strong>. Fans can send you questions for this amount while you are offline.</>
                )}
              </div>
            </div>
            
          </div>

          <button 
            onClick={() => {
              if (username) navigate(`/${username}?preview=true`);
            }}
            style={{
              background: 'linear-gradient(90deg, #7c3aed 0%, #06b6d4 100%)',
              border: 'none',
              borderRadius: '9999px',
              padding: '16px 40px',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 4px 20px rgba(124, 58, 237, 0.3)',
              transition: 'transform 0.2s',
              marginTop: '16px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span style={{ fontSize: '18px', fontWeight: '800' }}>Preview Page</span>
            <span style={{ fontSize: '16px', fontWeight: '800' }}>→</span>
          </button>

          <BottomNav activeTab="settings" />
        </div>
      </PhoneFrame>
    </div>
  );
};

export default CreatorSettings;
