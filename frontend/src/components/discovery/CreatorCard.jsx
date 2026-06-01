import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
    stats,
    verified,
    bgColor = '#1a1a1a', // fallback background for avatar if no image
    initials
  } = creator;

  const displayExpertise = expertise && expertise.length > 0 ? expertise[0] : 'General';
  
  // Format reply time (e.g. 1.4h)
  const formatTime = (time) => {
    if (typeof time === 'string') return time;
    if (time < 1) return `${Math.round(time * 60)}m`;
    return `${time.toFixed(1)}h`;
  };

  return (
    <div style={{
      background: '#131313',
      border: '1px solid #2a2a2a',
      borderRadius: '20px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      color: '#ffffff',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.4)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'none';
      e.currentTarget.style.boxShadow = 'none';
    }}>
      
      {/* Avatar & Live Badge */}
      <div style={{ position: 'relative', width: '64px', height: '64px' }}>
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
          border: '2px solid #06b6d4', // The glowing ring
          boxShadow: '0 0 10px rgba(6, 182, 212, 0.3)'
        }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            initials || name.substring(0, 2).toUpperCase()
          )}
        </div>
        <div style={{
          position: 'absolute',
          bottom: '-6px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#0ea5e9',
          color: '#000000',
          fontSize: '10px',
          fontWeight: '800',
          padding: '2px 6px',
          borderRadius: '8px',
          letterSpacing: '0.5px'
        }}>
          LIVE
        </div>
      </div>

      {/* Name and Handle */}
      <div style={{ marginTop: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', letterSpacing: '-0.3px' }}>{name}</h3>
          {(verified || true) && ( // Mock verified for now to match screenshot
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.5 12L20.4 9.4L20.7 6.1L17.5 5.4L15.6 2.7L12 3.9L8.4 2.7L6.5 5.4L3.3 6.1L3.6 9.4L1.5 12L3.6 14.6L3.3 17.9L6.5 18.6L8.4 21.3L12 20.1L15.6 21.3L17.5 18.6L20.7 17.9L20.4 14.6L22.5 12ZM10.5 16.5L6.8 12.8L8.1 11.5L10.5 13.9L16.2 8.2L17.5 9.5L10.5 16.5Z" fill="#0ea5e9"/>
            </svg>
          )}
        </div>
        <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '2px' }}>@{handle}</div>
      </div>

      {/* Topic Tag */}
      <div>
        <span style={{
          display: 'inline-block',
          background: 'rgba(6, 182, 212, 0.1)',
          color: '#06b6d4',
          fontSize: '11px',
          fontWeight: '600',
          padding: '4px 10px',
          borderRadius: '12px',
          border: '1px solid rgba(6, 182, 212, 0.2)'
        }}>
          {displayExpertise}
        </span>
      </div>

      {/* Bio */}
      <div style={{
        color: '#e2e8f0',
        fontSize: '13px',
        lineHeight: '1.5',
        height: '40px', // fixed height to align bottoms
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical'
      }}>
        {bio}
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '8px',
        marginTop: '8px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '15px', fontWeight: '700' }}>₹{pricePerQuestion}</span>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>per Q</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '15px', fontWeight: '700' }}>{stats?.replyRate || 95}%</span>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>reply rate</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '15px', fontWeight: '700' }}>{formatTime(stats?.avgReplyTime || '2h')}</span>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>avg reply</span>
        </div>
      </div>

      {/* CTA Button */}
      <button 
        onClick={() => navigate(`/creator/${handle}`)}
        style={{
          background: 'linear-gradient(90deg, #00e5cc, #38bdf8)',
          color: '#000',
          border: 'none',
          borderRadius: '100px',
          padding: '12px 24px',
          fontWeight: '700',
          fontSize: '14px',
          width: '100%',
          cursor: 'pointer',
          transition: 'transform 0.2s',
          boxShadow: '0 4px 14px rgba(0, 229, 204, 0.25)',
          marginTop: 'auto'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        Ask a question →
      </button>
    </div>
  );
};

export default CreatorCard;
