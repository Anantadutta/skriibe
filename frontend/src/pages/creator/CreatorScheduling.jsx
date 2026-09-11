import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getMe, saveLiveChatPreferences } from '../../services/creatorApi';

const CreatorScheduling = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [creator, setCreator] = useState(null);
  
  const defaultSchedule = {
    Sun: [], Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: []
  };
  
  const [schedule, setSchedule] = useState({ ...defaultSchedule });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    getMe().then(res => {
      if (res.success && res.creator) {
        setCreator(res.creator);
        const newSchedule = { ...defaultSchedule };
        if (res.creator.liveChatTimeSlots && res.creator.liveChatTimeSlots.length > 0) {
          res.creator.liveChatTimeSlots.forEach(slot => {
            const [day, timeRange] = slot.split('|');
            if (newSchedule[day] && !newSchedule[day].includes(timeRange)) {
              newSchedule[day].push(timeRange);
            }
          });
        }
        setSchedule(newSchedule);
      }
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navItems = [
    { label: 'HOME', icon: '🏠', route: '/creator/dashboard' },
    { label: 'CHATS', icon: '💬', route: '/creator/inbox' },
    { label: 'TRANSACTIONS', icon: '💰', route: '/creator/payouts' },
    { label: 'ANALYTICS', icon: '📊', route: '/creator/analytics' },
    { label: 'SETTINGS', icon: '⚙️', route: '/creator/settings' },
  ];

  const addWindow = (day) => {
    setSchedule(prev => ({
      ...prev,
      [day]: [...prev[day], '10:00-18:00']
    }));
  };

  const removeWindow = (day, index) => {
    setSchedule(prev => {
      const newDaySchedule = [...prev[day]];
      newDaySchedule.splice(index, 1);
      return { ...prev, [day]: newDaySchedule };
    });
  };

  const updateWindow = (day, index, field, value) => {
    setSchedule(prev => {
      const newDaySchedule = [...prev[day]];
      const [from, to] = newDaySchedule[index].split('-');
      if (field === 'from') {
        newDaySchedule[index] = `${value}-${to}`;
      } else {
        newDaySchedule[index] = `${from}-${value}`;
      }
      return { ...prev, [day]: newDaySchedule };
    });
  };

  const handleSave = async () => {
    if (!creator) return;
    setSaving(true);
    try {
      const formattedSlots = [];
      for (const day of days) {
        const uniqueRanges = [...new Set(schedule[day])];
        
        // Validate ranges and check for overlaps
        const parsedRanges = [];
        for (const timeRange of uniqueRanges) {
          const [from, to] = timeRange.split('-');
          if (!from || !to) continue;
          
          const [fromH, fromM] = from.split(':').map(Number);
          const [toH, toM] = to.split(':').map(Number);
          const fromTotal = fromH * 60 + fromM;
          const toTotal = toH * 60 + toM;

          if (fromTotal >= toTotal) {
            throw new Error(`Invalid time range on ${day}: End time (${to}) must be after start time (${from}).`);
          }
          parsedRanges.push({ from: fromTotal, to: toTotal, original: timeRange });
        }

        // Check for overlaps
        for (let i = 0; i < parsedRanges.length; i++) {
          for (let j = i + 1; j < parsedRanges.length; j++) {
            const a = parsedRanges[i];
            const b = parsedRanges[j];
            if (a.from < b.to && b.from < a.to) {
              throw new Error(`Overlapping time slots on ${day}: ${a.original} and ${b.original}.`);
            }
          }
        }

        uniqueRanges.forEach(timeRange => {
          const [from, to] = timeRange.split('-');
          if (from && to) {
            formattedSlots.push(`${day}|${timeRange}`);
          }
        });
      }

      await saveLiveChatPreferences({
        liveChatPrice: creator.liveChatPrice || 5,
        liveChatDevotedHours: creator.liveChatDevotedHours || 2,
        liveChatTimeSlots: formattedSlots,
        freeFirst5Mins: creator.freeFirst5Mins || false
      });
      setAlertMsg('Schedule saved successfully!');
    } catch (err) {
      setAlertMsg(err.response?.data?.message || err.message || 'Failed to save schedule');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0E0E0E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        Loading...
      </div>
    );
  }

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
      <style dangerouslySetInnerHTML={{__html: `
        input[type="time"]::-webkit-calendar-picker-indicator {
          display: none;
          -webkit-appearance: none;
        }
      `}} />
      <div style={{
        width: '100%',
        maxWidth: '390px',
        background: '#0E0E0E',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxSizing: 'border-box',
        borderLeft: '1px solid #1A1A1A',
        borderRight: '1px solid #1A1A1A'
      }}>
        {/* Header */}
        <div style={{ padding: '24px 20px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div 
            onClick={() => navigate('/creator/settings')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#38bdf8',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '1px',
              cursor: 'pointer',
              textTransform: 'uppercase'
            }}
          >
            <span style={{ fontSize: '1.2rem', marginTop: '-2px' }}>‹</span>
            SCHEDULING
          </div>
          
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 8px', fontFamily: 'serif', color: '#ffffff' }}>
              Working hours
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
              When fans can book a call with you. Times are IST.
            </p>
          </div>
        </div>

        {/* Days List */}
        <div style={{ padding: '0 20px 100px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {days.map((day) => (
            <div key={day} style={{
              background: '#0d1527',
              borderRadius: '16px',
              border: '1px solid rgba(56, 189, 248, 0.16)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>{day}</span>
                <button 
                  onClick={() => addWindow(day)}
                  style={{
                  background: 'rgba(56, 189, 248, 0.12)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.28)',
                  borderRadius: '20px',
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>
                  <span style={{ fontSize: '1rem', marginTop: '-2px' }}>+</span> Add window
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {schedule[day] && schedule[day].length > 0 ? (
                  schedule[day].map((timeRange, idx) => {
                    const [from, to] = timeRange.split('-');
                    return (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          border: '1px solid rgba(56, 189, 248, 0.2)',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          flex: 1,
                          background: '#070c18'
                        }}>
                          <input 
                            type="time"
                            value={from}
                            onChange={(e) => updateWindow(day, idx, 'from', e.target.value)}
                            style={{ 
                              fontWeight: 600, 
                              fontSize: '0.9rem', 
                              color: '#e2e8f0',
                              background: 'transparent',
                              border: 'none',
                              outline: 'none',
                              width: '100%',
                              colorScheme: 'dark'
                            }} 
                          />
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        </div>
                        <span style={{ color: '#64748b', fontWeight: 500 }}>–</span>
                        <div style={{
                          border: '1px solid rgba(56, 189, 248, 0.2)',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          flex: 1,
                          background: '#070c18'
                        }}>
                          <input 
                            type="time"
                            value={to}
                            onChange={(e) => updateWindow(day, idx, 'to', e.target.value)}
                            style={{ 
                              fontWeight: 600, 
                              fontSize: '0.9rem', 
                              color: '#e2e8f0',
                              background: 'transparent',
                              border: 'none',
                              outline: 'none',
                              width: '100%',
                              colorScheme: 'dark'
                            }} 
                          />
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        </div>
                        <button 
                          onClick={() => removeWindow(day, idx)}
                          style={{
                          background: '#0d1527',
                          border: '1px solid rgba(56, 189, 248, 0.2)',
                          borderRadius: '8px',
                          width: '36px',
                          height: '36px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#94a3b8',
                          cursor: 'pointer'
                        }}>
                          ✕
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic', padding: '4px 0' }}>
                    Unavailable
                  </div>
                )}
              </div>
            </div>
          ))}

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
              marginTop: '8px',
              boxShadow: '0 4px 16px rgba(56, 189, 248, 0.3)'
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* BOTTOM NAV BAR */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          margin: '0 auto',
          width: '100%',
          maxWidth: '390px',
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
                  fontSize: '20px'
                }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Alert Modal */}
      {alertMsg && (
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 200,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div style={{
            background: '#0d1527',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '320px',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
          }}>
            <div style={{ color: '#fff', fontSize: '15px', lineHeight: '1.5', marginBottom: '24px' }}>
              {alertMsg}
            </div>
            <button
              onClick={() => setAlertMsg('')}
              style={{
                background: 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)',
                border: 'none',
                borderRadius: '999px',
                color: '#fff',
                padding: '10px 32px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(56, 189, 248, 0.3)'
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorScheduling;
