/**
 * @file CreatorDashboard.jsx
 * @description Creator dashboard route showing mock data if username matches mockCreator.username, else 404.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { mockCreator, mockQuestions } from '../mock/questions';
import { getMe, toggleLive } from '../services/creatorApi';
import api from '../services/api';

const CreatorDashboard = () => {
  const { username } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [creator, setCreator] = useState(location.state?.creator || mockCreator);
  const [isLive, setIsLive] = useState(creator.isLive);
  const [btnHover, setBtnHover] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    const fetchCreator = async () => {
      try {
        const res = await getMe();
        if (res.success) {
          setCreator(prev => ({ ...prev, ...res.creator }));
          setIsLive(res.creator.isLive);
        }
      } catch (error) {
        console.error('Failed to fetch creator:', error);
      }
    };
    if (!location.state?.creator) {
      fetchCreator();
    }

    const fetchQuestions = async () => {
      try {
        const res = await api.get('/creator/questions');
        if (res.data.success) {
          setQuestions(res.data.questions);
        }
      } catch (err) {
        console.error('Error fetching questions:', err);
      }
    };
    fetchQuestions();
  }, [location.state?.creator]);

  const cleanUsername = username ? username.replace('@', '') : '';
  const show404 = username ? (cleanUsername !== creator.handle && cleanUsername !== mockCreator.username) : false;

  const navItems = [
    { label: 'HOME', icon: '🏠', route: '/creator/dashboard' },
    { label: 'INBOX', icon: '💬', route: '/creator/inbox' },
    { label: 'ANALYTICS', icon: '📊', route: '/creator/analytics' },
    { label: 'PAYOUTS', icon: '💰', route: '/creator/payouts' },
    { label: 'SETTINGS', icon: '⚙️', route: '/creator/settings' },
  ];

  const handleToggle = async () => {
    const newStatus = !isLive;
    setIsLive(newStatus); // Optimistic UI update
    setCreator(prev => ({ ...prev, isLive: newStatus }));
    try {
      await toggleLive(newStatus);
    } catch (err) {
      console.error('Failed to toggle live status:', err);
      // Revert on failure
      setIsLive(!newStatus);
      setCreator(prev => ({ ...prev, isLive: !newStatus }));
      alert('Failed to update live status. Please try again.');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`skriibe.com/@${creator.handle || 'tanvi'}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  const displayUserName = creator.name || creator.displayName || creator.handle || 'Tanvi';
  const avatarLetter = (displayUserName[0] || 'T').toUpperCase();

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
        padding: '24px 20px 120px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>

        {/* 1. TOP BAR */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          padding: '0 0 4px 0'
        }}>
          {/* Logo & Greeting */}
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
            {/* Aesthetic Glow Shader */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '180px',
              height: '120px',
              background: 'radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, rgba(56, 189, 248, 0) 70%)',
              filter: 'blur(24px)',
              pointerEvents: 'none',
              zIndex: 0
            }} />
            
            <div style={{
              position: 'relative',
              zIndex: 1,
              fontSize: '1.6rem',
              fontWeight: '600',
              fontStyle: 'normal',
              letterSpacing: '-0.03em',
              color: '#fff',
              lineHeight: '1'
            }}>
              skr<span style={{ color: '#29C5F6' }}>ii</span>be
            </div>
            <div style={{ position: 'relative', zIndex: 1, color: '#94a3b8', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              Good afternoon
              <div style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '1rem' }}>
                {displayUserName}
              </div>
            </div>
          </div>

          {/* Icons: Bell and Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Bell */}
            <div 
              onClick={() => navigate('/creator/inbox')}
              style={{
                position: 'relative',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#1A1A1A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                cursor: 'pointer'
              }}
            >
              <span style={{ filter: 'grayscale(100%) sepia(100%) hue-rotate(350deg) saturate(500%) brightness(1.2)' }}>🔔</span>
              {questions.filter(q => q.status?.toLowerCase() === 'submitted').length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#EF4444',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  border: '2px solid #0E0E0E'
                }}>
                  {questions.filter(q => q.status?.toLowerCase() === 'submitted').length}
                </div>
              )}
            </div>

            {/* Avatar */}
            <div 
              onClick={() => navigate('/creator/settings')}
              style={{ position: 'relative', cursor: 'pointer' }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#29C5F6',
                border: '2px solid #0E0E0E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                color: '#0E0E0E',
                fontSize: '18px'
              }}>
                {avatarLetter}
              </div>
              <div style={{
                position: 'absolute',
                bottom: '0px',
                right: '0px',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: isLive ? '#22C55E' : '#EF4444',
                border: '2px solid #0E0E0E',
                transition: 'background-color 0.3s ease'
              }} />
            </div>
          </div>
        </div>

        {/* 2. EARNINGS CARD */}
        <div style={{
          background: 'linear-gradient(145deg, #13161C 0%, #0B0D13 100%)',
          borderRadius: '20px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          border: '1px solid #1F2937',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Aesthetic glow in the corner */}
          <div style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '150px',
            height: '150px',
            background: 'radial-gradient(circle, rgba(41, 197, 246, 0.15) 0%, rgba(41, 197, 246, 0) 70%)',
            filter: 'blur(30px)',
            pointerEvents: 'none'
          }} />

          <div>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
              EARNINGS · THIS WEEK
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', marginTop: '4px' }}>
              <span style={{ fontSize: '2.2rem', color: '#29C5F6', marginRight: '4px' }}>₹</span>
              <span style={{ fontSize: '3rem', fontWeight: 900, color: '#fff', letterSpacing: '-1.5px' }}>{creator.weeklyEarnings || 890}</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.15)', padding: '4px 10px', borderRadius: '8px', marginTop: '8px' }}>
              <span style={{ color: '#10B981', fontSize: '0.7rem' }}>▲</span>
              <span style={{ color: '#10B981', fontWeight: 700, fontSize: '0.75rem' }}>+24% vs last week</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8' }}>
              <span>Weekly goal</span>
              <span><strong style={{ color: '#fff' }}>₹{creator.weeklyEarnings || 890}</strong> / ₹1,500</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: '#1F2937', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, ((creator.weeklyEarnings || 890) / 1500) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, #29C5F6 0%, #38BDF8 100%)', borderRadius: '4px' }} />
            </div>
          </div>
        </div>

        {/* 3. STATS ROW */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '10px'
        }}>
          <div style={{
            background: '#13161C',
            border: '1px solid #1F2937',
            borderRadius: '16px',
            padding: '16px 8px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#F87171' }}>3</div>
            <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: '4px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>PENDING</div>
          </div>
          <div style={{
            background: '#13161C',
            border: '1px solid #1F2937',
            borderRadius: '16px',
            padding: '16px 8px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#34D399' }}>{creator.replyRate || 94}%</div>
            <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: '4px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>REPLY RATE</div>
          </div>
          <div style={{
            background: '#13161C',
            border: '1px solid #1F2937',
            borderRadius: '16px',
            padding: '16px 8px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FBBF24' }}>4.9★</div>
            <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: '4px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>RATING</div>
          </div>
        </div>

        {/* 4. LIVE STATUS BANNER */}
        <div style={{
          background: isLive ? 'rgba(45, 212, 191, 0.04)' : '#13161C',
          border: isLive ? '1px solid rgba(45, 212, 191, 0.3)' : '1px solid #1F2937',
          borderRadius: '16px',
          padding: '14px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'all 0.3s ease'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isLive ? '#2DD4BF' : '#94a3b8',
                transition: 'background-color 0.3s ease'
              }} />
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#ffffff' }}>
                You're {isLive ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
              {isLive ? `Accepting questions · ₹${creator.pricePerQuestion || 99}/question` : 'Currently offline'}
            </div>
          </div>

          <div 
            onClick={handleToggle}
            style={{
              width: '44px',
              height: '26px',
              borderRadius: '13px',
              background: isLive ? '#2DD4BF' : '#1F2937',
              position: 'relative',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              background: '#ffffff',
              position: 'absolute',
              top: '2px',
              left: isLive ? '20px' : '2px',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }} />
          </div>
        </div>

        {/* SETUP PAYOUTS */}
        {!creator.bankLinked ? (
          <div 
            onClick={() => navigate('/creator/payouts')}
            style={{ 
              background: '#13161C', 
              border: '1px dashed #F59E0B', 
              borderRadius: '16px', 
              padding: '20px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              cursor: 'pointer',
              marginTop: '4px'
            }}
          >
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', minWidth: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B', fontSize: '1.5rem' }}>
                🏦
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff' }}>Setup payouts</div>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '4px', lineHeight: '1.4' }}>
                  Link your bank account to start receiving earnings.
                </div>
              </div>
            </div>
            <div style={{ background: '#F59E0B', color: '#0F172A', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800 }}>
              Setup
            </div>
          </div>
        ) : (
          <div 
            style={{ 
              background: '#13161C', 
              border: '1px solid #1F2937', 
              borderRadius: '16px', 
              padding: '16px 20px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginTop: '4px'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff' }}>HDFC Bank - Savings</div>
              <div style={{ color: '#10B981', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                ✓ Verified via penny drop
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800 }}>
                Linked
              </div>
              <span 
                onClick={() => navigate('/creator/payouts')}
                style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Edit details
              </span>
            </div>
          </div>
        )}

        {/* ACCOUNT HEALTH */}
        <h3 style={{ margin: '4px 0 0', fontSize: '1.1rem', fontWeight: 800 }}>Account health</h3>
        <div 
          onClick={() => navigate('/creator/health')}
          style={{ background: '#13161C', border: '1px solid #1F2937', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', minWidth: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid #10B981', color: '#10B981', fontWeight: 800, fontSize: '1.2rem', boxSizing: 'border-box' }}>
              86
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>Looking strong</span>
                <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', padding: '4px 8px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800 }}>Good</span>
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '6px', lineHeight: '1.4' }}>
                94% reply rate · 0 SLA breaches · 1 strike-free month
              </div>
            </div>
          </div>
          <div style={{ color: '#64748b' }}>→</div>
        </div>

        {/* 5. ANSWER & EARN (Inbox preview) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            Answer & earn 
            <span style={{ background: '#2A2A2A', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', color: '#94a3b8' }}>
              {questions.filter(q => q.status?.toLowerCase() === 'submitted').length}
            </span>
          </h3>
          <span 
            onClick={() => navigate('/creator/inbox')}
            style={{ color: '#29C5F6', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
          >
            Go to inbox →
          </span>
        </div>
        
        {/* Render 2 pending questions */}
        {(() => {
          const pendingQuestions = questions.filter(q => q.status?.toLowerCase() === 'submitted');
          if (pendingQuestions.length === 0) {
            return (
              <div style={{ background: '#1A1A1A', border: '1px dashed #2A2A2A', borderRadius: '16px', padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                No pending questions right now.
              </div>
            );
          }
          return pendingQuestions.slice(0, 2).map((q, idx) => {
            const timeDiff = Math.max(0, 48 - Math.floor((new Date() - new Date(q.createdAt || Date.now())) / (1000 * 60 * 60)));
            let timerColor = '#10B981'; // Green for > 12h
            let timerBg = 'rgba(16, 185, 129, 0.15)';
            if (timeDiff < 4) {
              timerColor = '#EF4444'; // Red for urgent
              timerBg = 'rgba(239, 68, 68, 0.15)';
            } else if (timeDiff < 12) {
              timerColor = '#F59E0B'; // Yellow for < 12h
              timerBg = 'rgba(245, 158, 11, 0.15)';
            }

            return (
              <div key={q._id || idx} style={{ background: '#13161C', border: '1px solid #1F2937', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#1E293B', color: '#38BDF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                      {(q.buyerName || q.followerName || 'A')[0].toUpperCase()}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>{q.buyerName || q.followerName}</span>
                      <span style={{ color: '#10B981', fontSize: '0.8rem', fontWeight: 700 }}>paid ₹{q.amountPaid || q.pricePaid}</span>
                    </div>
                  </div>
                  <div style={{ background: timerBg, color: timerColor, padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    ⏱ {timeDiff}h left
                  </div>
                </div>
                <div style={{ fontSize: '0.95rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                  "{q.questionText}"
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={() => navigate('/creator/inbox')}
                    style={{ flex: 1, background: 'linear-gradient(90deg, #38BDF8 0%, #34D399 100%)', color: '#0F172A', border: 'none', borderRadius: '12px', padding: '14px', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer' }}
                  >
                    Reply & earn ₹{q.amountPaid || q.pricePaid}
                  </button>
                </div>
              </div>
            );
          });
        })()}



        {/* 7. SHARE LINK */}
        <div style={{ background: '#13161C', border: '1px dashed #1F2937', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {/* Fake QR code */}
            <div style={{ width: '48px', height: '48px', background: '#ffffff', borderRadius: '12px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2px', padding: '6px', boxSizing: 'border-box' }}>
              <div style={{ background: '#0E0E0E', borderRadius: '2px' }}/><div style={{ background: 'transparent' }}/><div style={{ background: '#0E0E0E', borderRadius: '2px' }}/><div style={{ background: '#0E0E0E', borderRadius: '2px' }}/>
              <div style={{ background: '#0E0E0E', borderRadius: '2px' }}/><div style={{ background: '#0E0E0E', borderRadius: '2px' }}/><div style={{ background: 'transparent' }}/><div style={{ background: '#0E0E0E', borderRadius: '2px' }}/>
              <div style={{ background: 'transparent' }}/><div style={{ background: '#0E0E0E', borderRadius: '2px' }}/><div style={{ background: '#0E0E0E', borderRadius: '2px' }}/><div style={{ background: 'transparent' }}/>
              <div style={{ background: '#0E0E0E', borderRadius: '2px' }}/><div style={{ background: 'transparent' }}/><div style={{ background: '#0E0E0E', borderRadius: '2px' }}/><div style={{ background: '#0E0E0E', borderRadius: '2px' }}/>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>Share your link & get more questions</div>
              <div style={{ color: '#38BDF8', fontSize: '0.85rem', marginTop: '4px' }}>skriibe.com/@{creator.handle || 'tanvi'}</div>
            </div>
          </div>
          <button 
            onClick={handleCopy}
            style={{ 
              background: copied ? 'rgba(16, 185, 129, 0.15)' : '#1E293B', 
              color: copied ? '#10B981' : '#E2E8F0', 
              border: 'none', 
              borderRadius: '12px', 
              padding: '10px 16px', 
              fontWeight: 700, 
              fontSize: '0.85rem', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s ease',
              minWidth: '64px',
              justifyContent: 'center'
            }}
          >
            {copied ? (
              <>
                <span style={{ fontSize: '0.9rem', fontWeight: 900 }}>✓</span> Copied
              </>
            ) : (
              'Copy'
            )}
          </button>
        </div>



      </div>

      {/* 9. BOTTOM NAV BAR */}
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
        padding: '12px 0 24px',
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
                fontSize: '0.65rem',
                letterSpacing: '1px',
                fontWeight: 800,
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
