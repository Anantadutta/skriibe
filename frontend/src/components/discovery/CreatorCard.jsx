import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getImageUrl } from '../../utils/imageUtils';
import { checkIfLiveNow } from '../../utils/timeUtils';
import { getExpertiseIcon } from '../../utils/expertiseIcons';
import { normalizeExpertiseList } from '../../utils/expertiseConstants';

const CreatorCard = ({ creator, isFirstTimeUser = false }) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Use exact dummy data fields if provided, else use the raw backend object
  const {
    handle,
    name,
    avatarUrl,
    expertise,
    pricePerQuestion,
    price,
    verified,
    bgColor = '#1a1a1a',
    initials,
    liveChatEnabled,
    liveChatPrice,
    liveChatTimeSlots,
    inSession,
    instagramFollowers
  } = creator;

  const displayPrice = price || pricePerQuestion;
  const isLiveChatEnabled = liveChatEnabled === true;
  const displayLiveChatPrice = liveChatPrice || 5;
  
  const normalizedExpertise = normalizeExpertiseList(
    Array.isArray(expertise) ? expertise : (expertise ? expertise.split(',') : [])
  );
  const displayExpertise = normalizedExpertise.length > 0 ? normalizedExpertise.join(' & ') : 'Creator';

  let dynamicallyLive = false;
  if (creator.isPaused) {
    dynamicallyLive = false;
  } else if (creator.isLive === true) {
    dynamicallyLive = true;
  } else {
    dynamicallyLive = checkIfLiveNow(liveChatTimeSlots);
  }

  return (
    <div 
      style={{
        background: '#13131A',
        border: '1px solid #1E1E28',
        borderRadius: '24px',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        color: '#ffffff',
        transition: 'transform 0.2s, box-shadow 0.2s',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        height: '100%',
        boxSizing: 'border-box',
        cursor: 'pointer'
      }}
      onClick={() => navigate(`/creator/${handle}`)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.4)';
        setIsHovered(true);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
        setIsHovered(false);
      }}
    >
      
      {/* Top Left: Session in progress */}
      {inSession && dynamicallyLive && (
        <div style={{
          position: 'absolute',
          top: '18px',
          left: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '11px',
          fontWeight: '600',
          color: '#94a3b8',
          background: 'rgba(0,0,0,0.4)',
          padding: '4px 10px',
          borderRadius: '12px'
        }}>
          <div style={{ 
            width: '24px', 
            height: '4px', 
            borderRadius: '4px', 
            background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)',
            animation: 'pulseBar 1.5s infinite ease-in-out'
          }} />
          Session in progress
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes pulseBar {
              0% { width: 12px; opacity: 0.6; }
              50% { width: 28px; opacity: 1; }
              100% { width: 12px; opacity: 0.6; }
            }
          `}} />
        </div>
      )}

      {/* Top Right: Status Badge (LIVE / AWAY) */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px'
      }}>
        {dynamicallyLive ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            padding: '4px 10px',
            borderRadius: '100px',
            color: '#4ADE80',
            fontSize: '10px',
            fontWeight: '700',
            letterSpacing: '0.5px'
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 8px #4ADE80' }} />
            LIVE
          </div>
        ) : (
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '4px 12px',
            borderRadius: '100px',
            color: '#64748B',
            fontSize: '10px',
            fontWeight: '700',
            letterSpacing: '0.5px'
          }}>
            AWAY
          </div>
        )}
      </div>

      {/* Center Section: Avatar, Name, Expertise */}
      <div style={{
        marginTop: '20px',
        marginBottom: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{
          width: '76px',
          height: '76px',
          borderRadius: '50%',
          padding: '3px',
          background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
          marginBottom: '16px'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: bgColor || '#2A2A35',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            fontWeight: '700',
            border: '2px solid #13131A'
          }}>
            {avatarUrl && avatarUrl !== 'null' && avatarUrl !== 'undefined' && !avatarUrl.includes('dicebear') && !imgError ? (
              <img 
                src={getImageUrl(avatarUrl)} 
                alt={name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                onError={() => setImgError(true)}
              />
            ) : (
              initials || (name ? name.charAt(0).toUpperCase() : '?')
            )}
          </div>
        </div>

        <h3 style={{
          margin: '0 0 4px 0',
          fontSize: '18px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          {name}
          {verified !== false && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15 4.5L18.5 4L20 7L23 9L21.5 12L23 15L20 17L18.5 20L15 19.5L12 22L9 19.5L5.5 20L4 17L1 15L2.5 12L1 9L4 7L5.5 4L9 4.5L12 2Z" fill="#3B82F6"/>
              <path d="M10 15L7 12L8.41 10.59L10 12.17L15.59 6.58L17 8L10 15Z" fill="#13131A"/>
            </svg>
          )}
        </h3>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          justifyContent: 'center',
          marginTop: '2px'
        }}>
          {(!normalizedExpertise || normalizedExpertise.length === 0) ? (
            <div style={{
              background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.2)',
              borderRadius: '12px', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px',
              color: '#06b6d4', fontSize: '11px', fontWeight: 600
            }}>
              Creator
            </div>
          ) : (
            normalizedExpertise.slice(0, 3).map((exp, idx) => {
              const icon = getExpertiseIcon(exp, 12);
              return (
                <div 
                  key={idx}
                  style={{ 
                    background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.2)',
                    borderRadius: '12px', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px',
                    color: '#06b6d4', fontSize: '11px', fontWeight: 600
                  }}
                >
                  {icon}
                  {exp}
                </div>
              );
            })
          )}
        </div>

        {instagramFollowers && (
          <div style={{
            color: '#CBD5E1',
            fontSize: '12.5px',
            marginTop: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontWeight: '600',
            width: '100%',
            maxWidth: '100%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            boxSizing: 'border-box'
          }}>
            <span style={{
              color: '#F1F5F9',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              minWidth: 0,
              flexShrink: 1
            }}>
              <span style={{ color: '#38BDF8', fontWeight: '700', marginRight: '3px' }}>@</span>{handle}
            </span>

            <span style={{ color: 'rgba(255, 255, 255, 0.2)', fontWeight: '300', flexShrink: 0 }}>|</span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <svg 
                width="15" 
                height="15" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                style={{ flexShrink: 0, borderRadius: '4px', overflow: 'hidden' }}
              >
                <defs>
                  <linearGradient id={`igCardIconGrad-${handle || 'creator'}`} x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f09433" />
                    <stop offset="25%" stopColor="#e6683c" />
                    <stop offset="50%" stopColor="#dc2743" />
                    <stop offset="75%" stopColor="#cc2366" />
                    <stop offset="100%" stopColor="#bc1888" />
                  </linearGradient>
                </defs>
                <rect width="24" height="24" rx="6" fill={`url(#igCardIconGrad-${handle || 'creator'})`} />
                <rect x="4.5" y="4.5" width="15" height="15" rx="4" stroke="#ffffff" strokeWidth="1.8" fill="none" />
                <circle cx="12" cy="12" r="3.4" stroke="#ffffff" strokeWidth="1.8" fill="none" />
                <circle cx="16" cy="8" r="1.1" fill="#ffffff" />
              </svg>
              <span style={{
                color: '#94A3B8',
                fontWeight: '500',
                flexShrink: 0,
                whiteSpace: 'nowrap'
              }}>
                {(() => {
                  const raw = String(instagramFollowers || '').trim();
                  const num = typeof instagramFollowers === 'number'
                    ? instagramFollowers
                    : parseFloat(raw.replace(/[^0-9.]/g, ''));
                  if (!isNaN(num)) {
                    const countStr = num >= 1000000
                      ? (num / 1000000).toFixed(1).replace('.0', '') + 'M'
                      : (num >= 1000 ? (num / 1000).toFixed(1).replace('.0', '') + 'k' : num.toLocaleString());
                    return `${countStr} followers`;
                  }
                  return raw.toLowerCase().includes('follower') ? raw : `${raw} followers`;
                })()}
              </span>
            </div>
          </div>
        )}
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ width: '100%' }}>
        {dynamicallyLive || (creator.ama_enabled === false && !creator.isPaused) ? (
          <div
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              if (!dynamicallyLive) return;
              navigate(`/${handle}`, { state: { intent: 'live' } });
            }}
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              cursor: dynamicallyLive ? 'pointer' : 'not-allowed',
              opacity: dynamicallyLive ? 1 : 0.6,
            }}
            onMouseEnter={(e) => {
              if (dynamicallyLive && !isFirstTimeUser && e.currentTarget.children[1]) {
                e.currentTarget.children[0].style.borderColor = 'rgba(59, 130, 246, 0.5)';
                e.currentTarget.children[0].style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.35)';
                e.currentTarget.children[1].style.background = 'linear-gradient(90deg, #2563EB 0%, #00BFFF 100%)';
              }
            }}
            onMouseLeave={(e) => {
              if (dynamicallyLive && !isFirstTimeUser && e.currentTarget.children[1]) {
                e.currentTarget.children[0].style.borderColor = 'rgba(59, 130, 246, 0.25)';
                e.currentTarget.children[0].style.boxShadow = '0 4px 15px rgba(37, 99, 235, 0.2)';
                e.currentTarget.children[1].style.background = 'linear-gradient(90deg, #3B82F6 0%, #00D4FF 100%)';
              }
            }}
          >
            {/* Top box: Price (always stays as is) */}
            <div style={{
              width: '100%',
              background: '#0F0C1B',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              borderRadius: '16px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              boxShadow: dynamicallyLive ? '0 4px 15px rgba(37, 99, 235, 0.2)' : 'none',
              boxSizing: 'border-box'
            }}>
              {/* Subtle bottom wave lines */}
              <svg
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  width: '100%',
                  height: '32px',
                  pointerEvents: 'none',
                  opacity: 0.35
                }}
                viewBox="0 0 300 32"
                fill="none"
                preserveAspectRatio="none"
              >
                <path d="M0 22 C 60 12, 120 30, 180 18 C 230 8, 270 24, 300 16" stroke="#3B82F6" strokeWidth="1" strokeDasharray="2 3" fill="none" />
                <path d="M0 26 C 50 16, 110 32, 170 20 C 220 10, 260 26, 300 18" stroke="#2563EB" strokeWidth="0.8" strokeDasharray="3 3" fill="none" />
                <path d="M0 30 C 40 20, 100 34, 160 22 C 210 12, 250 28, 300 20" stroke="#1D4ED8" strokeWidth="0.8" strokeDasharray="2 2" fill="none" />
              </svg>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', zIndex: 1 }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '16px',
                  fontWeight: '700',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)'
                }}>
                  ₹
                </div>
                <span style={{
                  color: '#ffffff',
                  fontSize: '15px',
                  fontWeight: '700',
                  letterSpacing: '-0.2px',
                  whiteSpace: 'nowrap'
                }}>
                  ₹ {displayLiveChatPrice}/min
                </span>
              </div>
            </div>

            {/* Bottom box: LIVE CHAT turns into purple Free Chat on hover ONLY for online creators */}
            <div style={{
              width: '100%',
              background: (dynamicallyLive && isFirstTimeUser && isHovered)
                ? 'linear-gradient(135deg, #A855F7 0%, #8B5CF6 50%, #6D28D9 100%)'
                : 'linear-gradient(90deg, #3B82F6 0%, #00D4FF 100%)',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: '700',
              transition: 'all 0.25s ease',
              boxShadow: (dynamicallyLive && isFirstTimeUser && isHovered)
                ? '0 4px 20px rgba(147, 51, 234, 0.5), 0 0 15px rgba(168, 85, 247, 0.35)'
                : 'none',
              boxSizing: 'border-box'
            }}>
              {!dynamicallyLive ? (
                'Offline'
              ) : (isFirstTimeUser && isHovered) ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 3C6.48 3 2 6.81 2 11.5C2 13.91 3.25 16.08 5.25 17.58V22L9.12 19.38C10.03 19.78 11 20 12 20C17.52 20 22 16.19 22 11.5C22 6.81 17.52 3 12 3ZM8 12.5C7.17 12.5 6.5 11.83 6.5 11C6.5 10.17 7.17 9.5 8 9.5C8.83 9.5 9.5 10.17 9.5 11C9.5 11.83 8.83 12.5 8 12.5ZM12 12.5C11.17 12.5 10.5 11.83 10.5 11C10.5 10.17 11.17 9.5 12 9.5C12.83 9.5 13.5 10.17 13.5 11C13.5 11.83 12.83 12.5 12 12.5ZM16 12.5C15.17 12.5 14.5 11.83 14.5 11C14.5 10.17 15.17 9.5 16 9.5C16.83 9.5 17.5 10.17 17.5 11C17.5 11.83 16.83 12.5 16 12.5Z"/>
                  </svg>
                  Free Chat
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 3C6.48 3 2 6.81 2 11.5C2 13.91 3.25 16.08 5.25 17.58V22L9.12 19.38C10.03 19.78 11 20 12 20C17.52 20 22 16.19 22 11.5C22 6.81 17.52 3 12 3ZM8 12.5C7.17 12.5 6.5 11.83 6.5 11C6.5 10.17 7.17 9.5 8 9.5C8.83 9.5 9.5 10.17 9.5 11C9.5 11.83 8.83 12.5 8 12.5ZM12 12.5C11.17 12.5 10.5 11.83 10.5 11C10.5 10.17 11.17 9.5 12 9.5C12.83 9.5 13.5 10.17 13.5 11C13.5 11.83 12.83 12.5 12 12.5ZM16 12.5C15.17 12.5 14.5 11.83 14.5 11C14.5 10.17 15.17 9.5 16 9.5C16.83 9.5 17.5 10.17 17.5 11C17.5 11.83 16.83 12.5 16 12.5Z"/>
                  </svg>
                  Start Live Chat
                </>
              )}
            </div>
          </div>
        ) : (
          <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {/* Top box: Price with circular Rs symbol */}
            <div style={{
              width: '100%',
              background: '#0F0C1B',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              borderRadius: '16px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              boxSizing: 'border-box'
            }}>
              {/* Subtle bottom wave lines */}
              <svg
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  width: '100%',
                  height: '32px',
                  pointerEvents: 'none',
                  opacity: 0.35
                }}
                viewBox="0 0 300 32"
                fill="none"
                preserveAspectRatio="none"
              >
                <path d="M0 22 C 60 12, 120 30, 180 18 C 230 8, 270 24, 300 16" stroke="#3B82F6" strokeWidth="1" strokeDasharray="2 3" fill="none" />
                <path d="M0 26 C 50 16, 110 32, 170 20 C 220 10, 260 26, 300 18" stroke="#2563EB" strokeWidth="0.8" strokeDasharray="3 3" fill="none" />
                <path d="M0 30 C 40 20, 100 34, 160 22 C 210 12, 250 28, 300 20" stroke="#1D4ED8" strokeWidth="0.8" strokeDasharray="2 2" fill="none" />
              </svg>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', zIndex: 1 }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '16px',
                  fontWeight: '700',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)'
                }}>
                  ₹
                </div>
                <span style={{
                  color: '#ffffff',
                  fontSize: '15px',
                  fontWeight: '700',
                  letterSpacing: '-0.2px',
                  whiteSpace: 'nowrap'
                }}>
                  ₹ {displayPrice}/msg
                </span>
              </div>
            </div>
            
            {/* Bottom box: Ask Me Anything Button (never hovers to Free Chat) */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/${handle}?autoAsk=true`);
              }}
              style={{
                width: '100%',
                background: 'linear-gradient(90deg, #00FFA3 0%, #00D4FF 100%)',
                color: '#000000',
                border: 'none',
                borderRadius: '12px',
                padding: '12px',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 4px 14px rgba(0, 212, 255, 0.3)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 212, 255, 0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 212, 255, 0.3)';
              }}
            >
              Ask Me Anything
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatorCard;
