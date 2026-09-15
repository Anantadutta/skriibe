import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveLiveChatPreferences } from '../../services/creatorApi';
import { PhoneFrame } from '../../components/ama/layout/PhoneFrame';

const CreatorOnboardLiveChat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [creatorData, setCreatorData] = useState(location.state?.creator || null);

  const initialPrice = location.state?.creator?.liveChatPrice;
  const [price, setPrice] = useState(initialPrice === 10 ? 5 : (initialPrice || 5));
  const [freeFirst5Mins, setFreeFirst5Mins] = useState(location.state?.creator?.freeFirst5Mins || false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [timeFrom, setTimeFrom] = useState('');
  const [timeTo, setTimeTo] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (creatorData) {
      if (creatorData.liveChatPrice) {
        setPrice(creatorData.liveChatPrice === 10 ? 5 : creatorData.liveChatPrice);
      }
      if (creatorData.freeFirst5Mins !== undefined) {
        setFreeFirst5Mins(creatorData.freeFirst5Mins);
      }
      if (creatorData.liveChatTimeSlots && creatorData.liveChatTimeSlots.length > 0) {
        const slots = creatorData.liveChatTimeSlots;
        const days = [];
        let from = '10:00';
        let to = '12:00';
        
        slots.forEach(slot => {
          if (slot.includes('|')) {
            const [day, timeRange] = slot.split('|');
            if (!days.includes(day)) days.push(day);
            if (timeRange && timeRange.includes('-')) {
               const [tFrom, tTo] = timeRange.split('-');
               from = tFrom;
               to = tTo;
            }
          } else if (slot.includes('-')) {
             const [tFrom, tTo] = slot.split('-');
             from = tFrom;
             to = tTo;
          }
        });
        
        setSelectedDays(days);
        setTimeFrom(from);
        setTimeTo(to);
      }
    }
  }, [creatorData]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    import('../../services/creatorApi').then(({ getMe }) => {
      getMe().then(res => {
        if (res.success && res.creator) {
          setCreatorData(res.creator);
        } else if (!creatorData) {
          navigate('/onboard/profile');
        }
      }).catch(() => {
        if (!creatorData) navigate('/onboard/profile');
      });
    });
  }, [navigate]);

  const pricingOptions = [5, 10, 15, 25, 50];

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const TIME_OPTIONS = [];
  for (let i = 0; i < 24; i++) {
    const h = i.toString().padStart(2, '0');
    TIME_OPTIONS.push(`${h}:00`);
  }

  const toggleDay = (day) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const [alertMsg, setAlertMsg] = useState('');

  const handleTimeChange = (setter, value) => {
    if (!value) {
      setter('');
      return;
    }
    const [h, m] = value.split(':');
    if (m !== '00' && m !== '30') {
      const mins = parseInt(m) || 0;
      const snappedMins = mins >= 15 && mins < 45 ? '30' : '00';
      setter(`${h}:${snappedMins}`);
    } else {
      setter(value);
    }
  };

  const handleContinue = async () => {
    if (selectedDays.length === 0) {
      setAlertMsg("Please select at least one day.");
      return;
    }
    if (!timeFrom || !timeTo) {
      setAlertMsg("Please select both 'From' and 'To' times.");
      return;
    }
    
    const [fromH, fromM] = timeFrom.split(':').map(Number);
    const [toH, toM] = timeTo.split(':').map(Number);
    const fromTotal = fromH * 60 + fromM;
    const toTotal = toH * 60 + toM;
    
    if (toTotal <= fromTotal) {
      setAlertMsg("The 'To' time must be after the 'From' time, and they cannot be the same.");
      return;
    }
    
    if (toTotal - fromTotal < 60) {
      setAlertMsg("There must be at least 1 hour of difference between 'From' and 'To' times.");
      return;
    }

    setLoading(true);
    try {
      const formattedSlots = selectedDays.map(day => `${day}|${timeFrom}-${timeTo}`);
      const calcHours = Math.round((toTotal - fromTotal) / 60);

      await saveLiveChatPreferences({ 
        liveChatPrice: price, 
        liveChatDevotedHours: calcHours, 
        liveChatTimeSlots: formattedSlots,
        freeFirst5Mins
      });
      if (location.state?.returnTo) {
        navigate(location.state.returnTo, {
          state: {
            creator: { ...creatorData, liveChatPrice: price, liveChatDevotedHours: calcHours, liveChatTimeSlots: formattedSlots, freeFirst5Mins }
          }
        });
      } else {
        navigate('/onboard/pricing', {
          state: {
            creator: { ...creatorData, liveChatPrice: price, liveChatDevotedHours: calcHours, liveChatTimeSlots: formattedSlots, freeFirst5Mins }
          }
        });
      }
    } catch (err) {
      setAlertMsg(err.response?.data?.message || err.message || 'Failed to save Live Chat preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Background Shader & Noise */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        background: '#0a0a0f',
        overflow: 'hidden',
        pointerEvents: 'none'
      }}>
        <div style={{
          position: 'absolute',
          width: '180%',
          height: '180%',
          top: '-40%',
          left: '-40%',
          background: 'radial-gradient(circle at 30% 20%, rgba(124, 58, 237, 0.18) 0%, transparent 40%), radial-gradient(circle at 70% 80%, rgba(6, 182, 212, 0.18) 0%, transparent 40%), radial-gradient(circle at 50% 50%, rgba(147, 51, 234, 0.15) 0%, transparent 50%), radial-gradient(circle at 10% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 45%)',
          filter: 'blur(90px)',
        }} />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .activate-btn {
          width: 100%;
          max-width: 280px;
          padding: 14px 28px;
          border-radius: 999px;
          background: linear-gradient(90deg, #7c3aed 0%, #06b6d4 100%);
          color: #ffffff;
          font-weight: 700;
          font-size: 14px;
          border: none;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2);
        }
        .activate-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 0 20px #7c3aed;
        }
        .activate-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .price-btn {
          flex: 1;
          padding: 12px 0;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #fff;
          font-weight: 600;
          font-family: monospace;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .price-btn.selected {
          background: rgba(6, 182, 212, 0.15);
          border-color: #06b6d4;
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.3);
        }
        .time-slot {
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #fff;
          font-size: 13px;
          font-family: monospace;
          cursor: pointer;
          text-align: center;
          transition: all 0.2s;
        }
        .time-slot.selected {
          background: rgba(124, 58, 237, 0.2);
          border-color: #7c3aed;
        }
        
        /* Checkbox day selector styles */
        .day-checkbox-label {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
          min-width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #fff;
          font-size: 13px;
          font-family: monospace;
          cursor: pointer;
          transition: all 0.2s;
          user-select: none;
        }
        .day-checkbox-input {
          display: none;
        }
        .day-checkbox-input:checked + .day-checkbox-label {
          background: rgba(124, 58, 237, 0.2);
          border-color: #7c3aed;
          box-shadow: 0 0 10px rgba(124, 58, 237, 0.3);
        }
        
        .time-input {
          flex: 1;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 12px;
          color: #fff;
          font-size: 16px;
          font-family: monospace;
          outline: none;
          box-sizing: border-box;
          color-scheme: dark;
        }
        .time-input:focus {
          border-color: #7c3aed;
          box-shadow: 0 0 10px rgba(124, 58, 237, 0.3);
        }
        .time-select {
          flex: 1;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 12px;
          color: #fff;
          font-size: 16px;
          font-family: monospace;
          outline: none;
          box-sizing: border-box;
          appearance: none;
          cursor: pointer;
        }
        .time-select:focus {
          border-color: #7c3aed;
          box-shadow: 0 0 10px rgba(124, 58, 237, 0.3);
        }
        .time-select option {
          background: #1a1a24;
          color: #fff;
        }
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
        }
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: rgba(255,255,255,0.1);
          transition: .4s;
          border-radius: 24px;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        input:checked + .slider {
          background-color: #06b6d4;
        }
        input:checked + .slider:before {
          transform: translateX(20px);
        }
      `}} />

      <div style={{
        width: '100%',
        maxWidth: '480px',
        minHeight: '100vh',
        padding: '24px 16px 100px',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 1
      }}>
        <PhoneFrame>
          <div style={{
            padding: '16px 20px 100px',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            boxSizing: 'border-box'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', position: 'relative', height: '32px' }}>
              <button
                onClick={() => navigate(-1)}
                style={{
                  position: 'absolute', left: 0,
                  background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '50%', color: '#ffffff', width: '32px', height: '32px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  padding: 0
                }}
              >←</button>
              <div style={{
                fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 800, margin: '0 auto',
                background: 'linear-gradient(90deg, #7c3aed 0%, #06b6d4 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>
                Live Chat Setup
              </div>
            </div>

            {/* Progress */}
            <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', marginBottom: '20px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '75%', background: 'linear-gradient(90deg, #7c3aed 0%, #06b6d4 100%)', borderRadius: '999px' }} />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', marginBottom: '24px' }}>
              
              {/* Pricing Section */}
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
                <div style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '2px', fontWeight: 700, marginBottom: '16px' }}>
                  YOUR PER-MINUTE RATE
                </div>
                
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '32px', fontWeight: 800, color: '#fff' }}>₹{price}</span>
                  <span style={{ color: '#06b6d4', fontWeight: 600 }}>/ min</span>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                  {pricingOptions.map(opt => (
                    <button 
                      key={opt} 
                      className={`price-btn ${price === opt ? 'selected' : ''}`}
                      onClick={() => setPrice(opt)}
                    >
                      ₹{opt}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '16px', lineHeight: '1.5' }}>
                  Fans are billed to the second from their wallet — they pay only for the minutes they actually chat.
                </div>
                
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <div style={{ fontSize: '14px', color: '#fff', fontWeight: '600' }}>Your first chat free</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Every new fan gets their first 2 minutes of Live Chat with you free to build trust &amp; get your first review</div>
                  </div>
                </div>
              </div>

              {/* Availability Section */}
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '20px' }}>
                <div style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '2px', fontWeight: 700, marginBottom: '16px' }}>
                  DAILY AVAILABILITY
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', color: '#fff', fontSize: '14px', marginBottom: '12px' }}>
                    Select Days
                  </label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {DAYS.map(day => (
                      <label key={day} style={{ display: 'inline-block' }}>
                        <input 
                          type="checkbox" 
                          className="day-checkbox-input"
                          checked={selectedDays.includes(day)}
                          onChange={() => toggleDay(day)}
                        />
                        <div className="day-checkbox-label">{day}</div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#fff', fontSize: '14px', marginBottom: '12px' }}>
                    Select Time Range
                  </label>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>FROM</div>
                      <select 
                        className="time-select"
                        value={timeFrom}
                        onChange={e => setTimeFrom(e.target.value)}
                        required
                      >
                        <option value="" disabled>Select</option>
                        {TIME_OPTIONS.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '16px' }}>to</div>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>TO</div>
                      <select 
                        className="time-select"
                        value={timeTo}
                        onChange={e => setTimeTo(e.target.value)}
                        required
                      >
                        <option value="" disabled>Select</option>
                        {TIME_OPTIONS.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>

            {/* Bottom CTA */}
            <div style={{ position: 'absolute', bottom: '40px', left: 0, right: 0, zIndex: 10, padding: '0 20px', boxSizing: 'border-box' }}>
              <button
                onClick={handleContinue}
                disabled={loading}
                className="activate-btn"
              >
                {loading ? 'Saving...' : (location.state?.returnTo ? 'Save Changes' : 'Continue →')}
              </button>
            </div>
          </div>
          
          {/* Custom Alert Modal */}
          {alertMsg && (
            <div style={{
              position: 'absolute',
              inset: 0,
              zIndex: 100,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px'
            }}>
              <div style={{
                background: '#1a1a24',
                border: '1px solid rgba(255, 255, 255, 0.1)',
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
                    background: 'linear-gradient(90deg, #7c3aed 0%, #06b6d4 100%)',
                    border: 'none',
                    borderRadius: '999px',
                    color: '#fff',
                    padding: '10px 32px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  OK
                </button>
              </div>
            </div>
          )}
        </PhoneFrame>
      </div>
    </div>
  );
};

export default CreatorOnboardLiveChat;
