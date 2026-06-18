import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getImageUrl } from '../../utils/imageUtils';

const CreatorCard = ({ creator }) => {
  const navigate = useNavigate();

  // Use exact dummy data fields if provided, else use the raw backend object
  const {
    handle,
    name,
    avatarUrl,
    bio,
    expertise,
    pricePerQuestion,
    price,
    stats,
    verified,
    isLive,
    bgColor = '#1a1a1a', // fallback background for avatar if no image
    initials
  } = creator;

  const expertiseList = expertise && expertise.length > 0 ? expertise : [];
  const displayPrice = price || pricePerQuestion || 99;
  
  // Format reply time (e.g. 1.4h)
  const formatTime = (time) => {
    if (typeof time === 'string') return time;
    if (time < 1) return `${Math.round(time * 60)}m`;
    return `${time.toFixed(1)}h`;
  };

  return (
    <div style={{
      background: '#0B0B14',
      border: '1px solid #1E1E28',
      borderRadius: '24px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      color: '#ffffff',
      transition: 'transform 0.2s, box-shadow 0.2s',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.4)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'none';
      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
    }}>
      
      {/* Top Section: Avatar and Info */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        {/* Avatar & Live Badge */}
        <div style={{ position: 'relative', width: '76px', height: '76px', flexShrink: 0 }}>
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: bgColor || `linear-gradient(135deg, #7c3aed, #06b6d4)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: '700',
            color: '#ffffff',
            overflow: 'hidden',
            border: isLive ? '2px solid #00FFA3' : '2px solid transparent',
            boxShadow: isLive ? '0 0 14px rgba(0, 255, 163, 0.3)' : 'none'
          }}>
            {avatarUrl ? (
              <img src={getImageUrl(avatarUrl)} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              initials || name.substring(0, 2).toUpperCase()
            )}
          </div>
          {isLive && (
            <div style={{
              position: 'absolute',
              bottom: '-6px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#00FFA3',
              color: '#000000',
              fontSize: '10px',
              fontWeight: '800',
              padding: '3px 8px',
              borderRadius: '12px',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
            }}>
              <div style={{ width: '4px', height: '4px', background: '#000', borderRadius: '50%' }}></div>
              LIVE
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', lineHeight: 1.1, display: 'flex', alignItems: 'center', gap: '6px' }}>
            {name}
            {verified !== false && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15 4.5L18.5 4L20 7L23 9L21.5 12L23 15L20 17L18.5 20L15 19.5L12 22L9 19.5L5.5 20L4 17L1 15L2.5 12L1 9L4 7L5.5 4L9 4.5L12 2Z" fill="#0066FF"/>
                <path d="M10 15L7 12L8.41 10.59L10 12.17L15.59 6.58L17 8L10 15Z" fill="white"/>
              </svg>
            )}
          </h3>
          <div style={{ color: '#64748b', fontSize: '13px' }}>@{handle}</div>
          <div style={{ marginTop: '2px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {expertiseList.map((exp, idx) => (
              <span key={idx} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(6, 182, 212, 0.1)',
                color: '#06b6d4',
                fontSize: '11px',
                fontWeight: '600',
                padding: '4px 10px',
                borderRadius: '100px',
                border: '1px solid rgba(6, 182, 212, 0.2)'
              }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path>
                </svg>
                {exp}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bio */}
      <div style={{
        color: '#94a3b8',
        fontSize: '14px',
        lineHeight: '1.5',
        marginTop: '20px',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {bio || 'Helping people with fitness, nutrition & healthy habits.'}
      </div>

      {/* Stats Inner Card */}
      <div style={{
        background: '#15151D',
        border: '1px solid #232330',
        borderRadius: '16px',
        padding: '16px 12px',
        marginTop: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)'
      }}>
        {/* Price */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>
            ₹
          </div>
          <span style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>₹{displayPrice}</span>
          <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Per Question</span>
        </div>
        
        <div style={{ width: '1px', height: '40px', background: '#2a2a35' }}></div>

        {/* Reply Rate */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
              <polyline points="16 7 22 7 22 13"></polyline>
            </svg>
          </div>
          <span style={{ fontSize: '18px', fontWeight: '800', color: '#00FFA3' }}>{stats?.replyRate ?? 0}%</span>
          <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Reply Rate</span>
        </div>

        <div style={{ width: '1px', height: '40px', background: '#2a2a35' }}></div>

        {/* Avg Response */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <span style={{ fontSize: '18px', fontWeight: '800', color: '#fbbf24' }}>{formatTime(stats?.avgReplyTime || '2h')}</span>
          <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Avg Response</span>
        </div>
      </div>

      {/* CTA Button */}
      <button 
        onClick={() => navigate(`/creator/${handle}`)}
        style={{
          background: 'linear-gradient(90deg, #00FFA3 0%, #00B8FF 100%)',
          color: '#000000',
          border: 'none',
          borderRadius: '12px',
          padding: '14px 20px',
          fontWeight: '800',
          fontSize: '15px',
          width: '100%',
          cursor: 'pointer',
          transition: 'transform 0.2s',
          boxShadow: '0 6px 20px rgba(0, 255, 163, 0.25)',
          marginTop: '20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '6px'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        Ask a Question
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </button>
    </div>
  );
};

export default CreatorCard;
