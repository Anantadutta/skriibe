/**
 * @file CreatorSharePage.jsx
 * @description My skriibe page dashboard & sharing controls (C10 → C10b).
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PhoneFrame } from '../../components/ama/layout/PhoneFrame';
import { BottomNav } from '../../components/ama/layout/BottomNav';
import { getMe } from '../../services/creatorApi';
import { QRCodeCanvas } from 'qrcode.react';

const CreatorSharePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [creator, setCreator] = useState(location.state?.creator || null);
  const [loading, setLoading] = useState(!creator);

  // Success states for clipboard actions
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedBio, setCopiedBio] = useState(false);

  const qrRef = useRef(null);

  useEffect(() => {
    if (!creator) {
      getMe()
        .then((res) => {
          if (res.success && res.creator) {
            setCreator(res.creator);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error('Failed to load creator profile:', err);
          setLoading(false);
        });
    }
  }, [creator]);

  const handle = creator?.handle || 'creator';
  const price = creator?.price || 99;
  const expertiseList = creator?.expertise
    ? (Array.isArray(creator.expertise) ? creator.expertise : creator.expertise.split(',').map(e => e.trim()))
    : [];
  const primaryExpertise = expertiseList[0] || 'expertise';

  const shareUrl = `skriibe.in/@${handle}`;
  const fullShareUrl = `https://${shareUrl}`;

  // Bio template to display & copy
  const bioText = `Ask me anything about ${primaryExpertise} 👇\n₹${price} · Guaranteed reply in 24hrs\n👇 ${shareUrl}`;

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(fullShareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyBioToClipboard = () => {
    navigator.clipboard.writeText(bioText);
    setCopiedBio(true);
    setTimeout(() => setCopiedBio(false), 2000);
  };

  // Deep Link opens
  const openInstagram = () => {
    const start = Date.now();
    window.location.href = 'instagram://app';
    setTimeout(() => {
      if (Date.now() - start < 1000) {
        window.open('https://instagram.com', '_blank');
      }
    }, 500);
  };

  const openYouTube = () => {
    window.open('https://studio.youtube.com', '_blank');
  };

  const openWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'skriibe profile',
          text: 'Ask me anything on skriibe!',
          url: fullShareUrl
        });
      } catch (err) {
        copyLinkToClipboard();
      }
    } else {
      copyLinkToClipboard();
    }
  };

  const downloadQRCode = () => {
    const canvas = qrRef.current ? qrRef.current.querySelector('canvas') : null;
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `skriibe-qr-@${handle}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff'
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px' }}>Loading page...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative'
    }}>
      {/* MONOSPACED LABEL OUTSIDE PHONE FRAME */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '13px',
        color: 'var(--g3)',
        letterSpacing: '0.1em',
        marginBottom: '20px',
        textTransform: 'uppercase',
        fontWeight: 'bold'
      }}>
        
      </div>

      <PhoneFrame>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          position: 'relative',
          boxSizing: 'border-box'
        }}>
          
          {/* SCROLLABLE INNER PAGE */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 20px 88px', // Bottom padding to prevent bottom navigation overlap
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            
            {/* HEADER WITH BACK CHEVRON */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              height: '24px'
            }}>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  position: 'absolute',
                  left: 0,
                  background: 'none',
                  border: 'none',
                  color: 'var(--white)',
                  fontSize: '18px',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                ←
              </button>
              <div style={{
                margin: '0 auto',
                fontFamily: 'var(--font-heading)',
                fontSize: '15px',
                fontWeight: 700,
                color: 'var(--white)'
              }}>
                My skriibe page
              </div>
            </div>

            {/* TOP CARD: YOUR SKRIIBE PAGE */}
            <div style={{
              background: '#141420',
              border: '1px solid #2a2a3e',
              borderRadius: '14px',
              padding: '18px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9px',
                  color: 'var(--g3)',
                  letterSpacing: '0.08em',
                  fontWeight: 700
                }}>
                  YOUR SKRIIBE PAGE
                </span>
                <span style={{
                  background: 'rgba(34, 197, 94, 0.08)',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  color: '#22C55E',
                  fontSize: '8px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}>
                  LIVE
                </span>
              </div>

              <div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'var(--white)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginBottom: '4px'
                }}>
                  {shareUrl}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: 'var(--g2)',
                  lineHeight: '1.4'
                }}>
                  Anyone with this link can ask you a paid question
                </div>
              </div>

              <button
                onClick={copyLinkToClipboard}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '14px',
                  background: '#3DD9FF',
                  color: '#000000',
                  fontWeight: 500,
                  fontSize: '13px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {copiedLink ? 'Copied! ✓' : 'Copy link'}
              </button>
            </div>

            {/* SHARE YOUR LINK SECTION */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                color: 'var(--white)',
                fontSize: '13px',
                fontWeight: 'bold',
                textAlign: 'left'
              }}>
                Share your link
              </div>

              {/* 2x2 GRID OF TILE CARDS */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px'
              }}>
                
                {/* Instagram Bio */}
                <div
                  onClick={openInstagram}
                  style={{
                    background: '#2d0a1a',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '14px',
                    padding: '14px 12px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'opacity 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = 0.9}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = 1}
                >
                  <span style={{ fontSize: '18px', display: 'block', marginBottom: '8px' }}>📷</span>
                  <div style={{ color: '#ffffff', fontSize: '12px', fontWeight: 500, marginBottom: '2px' }}>
                    Instagram bio
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px' }}>
                    Auto-opens Instagram
                  </div>
                </div>

                {/* YouTube Description */}
                <div
                  onClick={openYouTube}
                  style={{
                    background: '#2d0a0a',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '14px',
                    padding: '14px 12px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'opacity 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = 0.9}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = 1}
                >
                  <span style={{ fontSize: '16px', display: 'block', marginBottom: '8px', color: '#FF0000' }}>▶</span>
                  <div style={{ color: '#ffffff', fontSize: '12px', fontWeight: 500, marginBottom: '2px' }}>
                    YouTube description
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px' }}>
                    Opens YouTube Studio
                  </div>
                </div>

                {/* WhatsApp */}
                <div
                  onClick={openWhatsApp}
                  style={{
                    background: '#0a2d0a',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '14px',
                    padding: '14px 12px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'opacity 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = 0.9}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = 1}
                >
                  <span style={{ fontSize: '18px', display: 'block', marginBottom: '8px' }}>💬</span>
                  <div style={{ color: '#ffffff', fontSize: '12px', fontWeight: 500, marginBottom: '2px' }}>
                    WhatsApp
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px' }}>
                    Send to your audience
                  </div>
                </div>

                {/* Other Apps */}
                <div
                  onClick={handleNativeShare}
                  style={{
                    background: '#1a1a2e',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '14px',
                    padding: '14px 12px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'opacity 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = 0.9}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = 1}
                >
                  <span style={{ fontSize: '18px', display: 'block', marginBottom: '8px' }}>🔗</span>
                  <div style={{ color: '#ffffff', fontSize: '12px', fontWeight: 500, marginBottom: '2px' }}>
                    Other apps
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px' }}>
                    Native share sheet
                  </div>
                </div>

              </div>
            </div>

            {/* READY-TO-USE BIO TEXT SECTION */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                color: 'var(--white)',
                fontSize: '13px',
                fontWeight: 500,
                textAlign: 'left'
              }}>
                Ready-to-use bio text
              </div>

              {/* Bio card */}
              <div style={{
                background: '#141420',
                border: '1px solid #2a2a3e',
                borderRadius: '14px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                textAlign: 'left'
              }}>
                <pre style={{
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit',
                  fontSize: '11px',
                  color: 'var(--white)',
                  lineHeight: '1.6'
                }}>
                  {bioText}
                </pre>

                <button
                  onClick={copyBioToClipboard}
                  style={{
                    width: '100%',
                    padding: '11px',
                    borderRadius: '14px',
                    background: '#141420',
                    color: copiedBio ? '#00FF88' : 'var(--white)',
                    fontWeight: 500,
                    fontSize: '12px',
                    border: '1px solid #2a2a3e',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span>📋</span>
                  <span>{copiedBio ? 'Copied! ✓' : 'Copy bio text'}</span>
                </button>
              </div>
            </div>

            {/* QR CODE SECTION */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                color: 'var(--white)',
                fontSize: '13px',
                fontWeight: 500,
                textAlign: 'left'
              }}>
                QR code
              </div>

              <div style={{
                background: '#141420',
                border: '1px solid #2a2a3e',
                borderRadius: '14px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                
                {/* QR details row */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  textAlign: 'left'
                }}>
                  {/* Canvas container with ref */}
                  <div
                    ref={qrRef}
                    style={{
                      background: '#ffffff',
                      padding: '8px',
                      borderRadius: '8px',
                      width: '80px',
                      height: '80px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxSizing: 'content-box',
                      flexShrink: 0
                    }}
                  >
                    <QRCodeCanvas
                      value={fullShareUrl}
                      size={80}
                      bgColor="#ffffff"
                      fgColor="#000000"
                      level="H"
                    />
                  </div>

                  <div>
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--white)',
                      marginBottom: '4px',
                      wordBreak: 'break-all'
                    }}>
                      {shareUrl}
                    </div>
                    <div style={{
                      fontSize: '10px',
                      color: 'var(--g3)'
                    }}>
                      Scan to visit your page
                    </div>
                  </div>
                </div>

                {/* Download CTA */}
                <button
                  onClick={downloadQRCode}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '14px',
                    background: '#3DD9FF',
                    color: '#000000',
                    fontWeight: 500,
                    fontSize: '13px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  Download PNG
                </button>

              </div>
            </div>

          </div>

          {/* PERSISTENT BOTTOM NAVIGATION */}
          <BottomNav activeTab="home" />

        </div>
      </PhoneFrame>
    </div>
  );
};

export default CreatorSharePage;
