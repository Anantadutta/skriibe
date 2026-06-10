/**
 * @file CreatorSharePage.jsx
 * @description My skriibe page dashboard & sharing controls (C10 → C10b).
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BottomNav } from '../../components/ama/layout/BottomNav';
import { getMe } from '../../services/creatorApi';
import { QRCodeCanvas } from 'qrcode.react';
import confetti from 'canvas-confetti';

const CreatorSharePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  if (location.state?.creator && !location.state.creator.username) {
    location.state.creator.username = location.state.creator.handle;
  }
  const [creator, setCreator] = useState(location.state?.creator || null);
  
  useEffect(() => {
    if (creator && !location.state?.creator) {
      if (!location.state) {
        location.state = {};
      }
      location.state.creator = {
        ...creator,
        username: creator.username || creator.handle
      };
    }
  }, [creator]);

  const { state } = useLocation();
  const username = state?.creator?.username ?? 'yourhandle';
  const [loading, setLoading] = useState(!creator);

  // Success states for clipboard actions
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedBio, setCopiedBio] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  const qrRef = useRef(null);
  const qrRef2 = useRef(null);
  const [qrSlide, setQrSlide] = useState(0);

  useEffect(() => {
    if (location.state?.isNewlyLive) {
      setShowBanner(true);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.3 } });
      // Clear the flag so banner doesn't reappear on refresh
      navigate(location.pathname, {
        replace: true,
        state: { ...location.state, isNewlyLive: false }
      });
    }
  }, []);

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

  const shareUrl = `skriibe.com/@${handle}`;
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

  const openLinkedIn = () => {
    window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(fullShareUrl)}`, '_blank');
  };

  const openX = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(fullShareUrl)}`, '_blank');
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
      color: '#ffffff',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
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
        {/* Aurora purple, deep violet, electric blue waves */}
        <div style={{
          position: 'absolute',
          width: '180%',
          height: '180%',
          top: '-40%',
          left: '-40%',
          background: 'radial-gradient(circle at 30% 20%, rgba(124, 58, 237, 0.18) 0%, transparent 40%), radial-gradient(circle at 70% 80%, rgba(6, 182, 212, 0.18) 0%, transparent 40%), radial-gradient(circle at 50% 50%, rgba(147, 51, 234, 0.15) 0%, transparent 50%), radial-gradient(circle at 10% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 45%)',
          filter: 'blur(90px)',
          animation: 'aurora-flow 25s infinite alternate ease-in-out'
        }} />
        {/* Subtle noise/grain texture overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          opacity: 0.035,
          mixBlendMode: 'overlay',
          pointerEvents: 'none'
        }} />
        {/* Sparkle dots scattered */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div className="sparkle" style={{ top: '12%', left: '8%', animationDelay: '0s' }} />
          <div className="sparkle" style={{ top: '22%', left: '85%', animationDelay: '1.5s' }} />
          <div className="sparkle" style={{ top: '48%', left: '15%', animationDelay: '3s' }} />
          <div className="sparkle" style={{ top: '72%', left: '88%', animationDelay: '0.8s' }} />
          <div className="sparkle" style={{ top: '88%', left: '10%', animationDelay: '2.2s' }} />
          <div className="sparkle" style={{ top: '60%', left: '78%', animationDelay: '4s' }} />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes aurora-flow {
          0% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
          33% { transform: translate(20px, -30px) rotate(120deg) scale(1.05); }
          66% { transform: translate(-15px, 15px) rotate(240deg) scale(0.98); }
          100% { transform: translate(0px, 0px) rotate(360deg) scale(1); }
        }
        @keyframes sparkle-pulse {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2) rotate(45deg); }
        }
        .sparkle {
          position: absolute;
          width: 3px;
          height: 3px;
          background: #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 6px #06b6d4, 0 0 10px #7c3aed;
          animation: sparkle-pulse 4s infinite ease-in-out;
        }
        .card-sparkle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 4px #06b6d4;
          animation: sparkle-pulse 3s infinite ease-in-out;
        }
        .copy-link-btn {
          width: 100%;
          padding: 12px 24px;
          border-radius: 9999px;
          background: linear-gradient(90deg, #7c3aed 0%, #2563eb 100%);
          color: #ffffff;
          font-weight: 700;
          font-size: 14px;
          border: none;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.15);
        }
        .copy-link-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 20px #7c3aed;
        }
        .copy-link-btn:active {
          transform: translateY(0);
        }
        .copy-bio-btn {
          padding: 8px 16px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
          font-weight: 600;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .copy-bio-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(6, 182, 212, 0.5);
          box-shadow: 0 0 12px rgba(6, 182, 212, 0.3);
          color: #06b6d4;
        }
        .copy-bio-btn:active {
          transform: scale(0.98);
        }
        .grid-share-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          position: relative;
          height: 140px;
          box-sizing: border-box;
          text-align: left;
        }
        .grid-share-card.ig-card {
          border: 1px solid rgba(225, 48, 108, 0.2);
          background: rgba(225, 48, 108, 0.03);
        }
        .grid-share-card.ig-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(225, 48, 108, 0.25);
          border-color: rgba(225, 48, 108, 0.5);
        }
        .grid-share-card.yt-card {
          border: 1px solid rgba(255, 0, 0, 0.2);
          background: rgba(255, 0, 0, 0.03);
        }
        .grid-share-card.yt-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(255, 0, 0, 0.25);
          border-color: rgba(255, 0, 0, 0.5);
        }
        .grid-share-card.wa-card {
          border: 1px solid rgba(37, 211, 102, 0.2);
          background: rgba(37, 211, 102, 0.03);
        }
        .grid-share-card.wa-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(37, 211, 102, 0.25);
          border-color: rgba(37, 211, 102, 0.5);
        }
        .grid-share-card.other-card {
          border: 1px solid rgba(124, 58, 237, 0.2);
          background: rgba(124, 58, 237, 0.03);
        }
        .grid-share-card.other-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(124, 58, 237, 0.25);
          border-color: rgba(124, 58, 237, 0.5);
        }
        .download-btn {
          width: 100%;
          padding: 12px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.05);
          color: #ffffff;
          font-weight: 600;
          font-size: 13px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .download-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(6, 182, 212, 0.4);
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.25);
        }
        .gradient-title {
          font-family: var(--font-heading);
          font-size: 20px;
          font-weight: 800;
          background: linear-gradient(90deg, #7c3aed 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .live-dot-pulse {
          width: 8px;
          height: 8px;
          background-color: #22c55e;
          border-radius: 50%;
          box-shadow: 0 0 8px #22c55e;
          animation: pulse-dot 1.5s infinite ease-in-out;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 0.4; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}} />

      {/* Main Page Container */}
      <div style={{
        width: '100%',
        maxWidth: '480px',
        minHeight: '100vh',
        padding: '24px 16px 100px', // comfortable padding on sides: 16px
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 1
      }}>
        
        {/* HEADER WITH BACK CHEVRON & LIVE BADGE */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          height: '32px',
          justifyContent: 'space-between'
        }}>
          {/* Back button */}
          <button
            onClick={() => navigate('/creator/dashboard', { state: { creator } })}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '50%',
              color: '#ffffff',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              padding: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'translateX(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            ←
          </button>
          
          <div className="gradient-title">
            My skriibe page
          </div>

          {/* LIVE pulse badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(34, 197, 94, 0.08)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            borderRadius: '6px',
            padding: '4px 10px'
          }}>
            <div className="live-dot-pulse" />
            <span style={{
              color: '#22c55e',
              fontSize: '10px',
              fontWeight: 800,
              fontFamily: 'monospace, var(--font-mono)'
            }}>
              LIVE
            </span>
          </div>
        </div>

        {/* CONSOLIDATED TOP CARD */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '24px 20px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: showBanner ? '0 0 25px rgba(124, 58, 237, 0.2)' : 'none'
        }}>
          {showBanner && (
            <div style={{ position: 'relative', marginBottom: '8px' }}>
              <button
                onClick={() => setShowBanner(false)}
                style={{
                  position: 'absolute', top: '-10px', right: '-10px', background: 'transparent',
                  border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer'
                }}
              >&times;</button>
              <h2 style={{
                background: 'linear-gradient(90deg, #7c3aed, #a855f7)', WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent', fontSize: '1.4rem', fontWeight: '800', margin: 0
              }}>You're live! <span style={{ WebkitTextFillColor: 'initial' }}>🎉</span></h2>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '85%' }}>
            <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#94a3b8', letterSpacing: '0.1em', fontWeight: 700 }}>
              YOUR LINK
            </span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '15px', fontWeight: 600, color: '#ffffff', wordBreak: 'break-all' }}>
                {shareUrl}
              </span>
              <button onClick={copyLinkToClipboard} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', padding: '2px' }}>
                📋
              </button>
            </div>
          </div>

          <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5', marginTop: '4px' }}>
            Anyone with this link can ask you a <span style={{ color: '#a855f7', fontWeight: 700 }}>paid question</span>
          </div>

          <button onClick={copyLinkToClipboard} className="copy-link-btn" style={{ marginTop: '8px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span>{copiedLink ? 'Copied Link! ✓' : 'Copy link'}</span>
          </button>

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button onClick={() => navigate('/creator/dashboard', { state: { creator } })} className="copy-link-btn" style={{ flex: 1, background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#ffffff', boxShadow: 'none' }}>
              <span>Open Dashboard</span>
            </button>
            <button onClick={() => navigate(`/@${username}`)} className="copy-link-btn" style={{ flex: 1, background: 'linear-gradient(90deg, #7c3aed, #06b6d4)' }}>
              <span>View My Page →</span>
            </button>
          </div>
        </div>

        {/* SHARE YOUR LINK SECTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', paddingLeft: '4px' }}>
            SHARE ON
          </div>

          <div style={{ display: 'flex', gap: '48px', padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', justifyContent: 'center' }}>
            
            <div onClick={openWhatsApp} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(37, 211, 102, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(37, 211, 102, 0.2)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.012 5.5a6.477 6.477 0 00-5.632 9.68l-.74 2.701 2.766-.726a6.467 6.467 0 003.606 1.085h.003a6.48 6.48 0 006.478-6.475 6.48 6.48 0 00-6.481-6.465zm3.435 8.784c-.147.414-.737.76-1.012.808-.25.044-.575.08-.925-.033a5.522 5.522 0 01-2.483-1.636 5.86 5.86 0 01-1.282-2.128c-.148-.445-.443-.9-.42-1.391.025-.522.285-.776.388-.88.103-.105.227-.156.34-.156.113 0 .227.006.326.012.103.006.242-.038.379.293.137.331.472 1.15.513 1.233.041.083.067.18.012.289-.053.11-.12.22-.24.36-.12.14-.242.313-.36.42-.12.12-.247.25-.106.491.14.241.625 1.026 1.34 1.662.923.82 1.7.172 1.942.062.242-.11.267-.282.4-.44.133-.158.267-.34.4-.51.133-.17.267-.14.4-.083.133.057.84.396.984.468.144.072.24.11.276.172.036.062.036.363-.11.777z" fill="#25D366"/>
                </svg>
              </div>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>WhatsApp</span>
            </div>

            <div onClick={openLinkedIn} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(10, 102, 194, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(10, 102, 194, 0.2)' }}>
                <span style={{ color: '#0a66c2', fontWeight: 800, fontSize: '20px' }}>in</span>
              </div>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>LinkedIn</span>
            </div>

            <div onClick={openYouTube} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255, 0, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255, 0, 0, 0.2)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.5 8v8l6.5-4-6.5-4z" fill="#FF0000"/>
                </svg>
              </div>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>YouTube</span>
            </div>

            <div onClick={openX} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                <span style={{ color: '#ffffff', fontWeight: 800, fontSize: '20px', fontFamily: 'sans-serif' }}>𝕏</span>
              </div>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>X</span>
            </div>

          </div>
        </div>



        {/* QR CODE SECTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
          <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', paddingLeft: '4px' }}>
            QR code
          </div>

          <div style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div ref={qrRef2} style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%', boxSizing: 'border-box' }}>
              <QRCodeCanvas value={fullShareUrl} size={150} bgColor="#ffffff" fgColor="#e6683c" level="H" />
              <div style={{ color: '#e6683c', fontSize: '16px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                @{handle}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'space-between' }}>
              <button onClick={handleNativeShare} style={{ flex: 1, background: '#ffffff', color: '#000', border: 'none', padding: '10px 4px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '16px' }}>↑</span> Share profile
              </button>
              <button onClick={copyLinkToClipboard} style={{ flex: 1, background: '#ffffff', color: '#000', border: 'none', padding: '10px 4px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '16px' }}>🔗</span> {copiedLink ? 'Copied! ✓' : 'Copy link'}
              </button>
              <button onClick={() => {
                const canvas = qrRef2.current?.querySelector('canvas');
                if (canvas) {
                  const link = document.createElement('a'); link.download = `qr-ig.png`; link.href = canvas.toDataURL(); link.click();
                }
              }} style={{ flex: 1, background: '#ffffff', color: '#000', border: 'none', padding: '10px 4px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '16px' }}>↓</span> Download
              </button>
            </div>
          </div>
        </div>

        {/* Made with 🤍 for bold conversations Footer */}
        <div style={{
          textAlign: 'center',
          color: '#94a3b8',
          fontSize: '11px',
          fontFamily: 'var(--font-mono), monospace',
          marginTop: '16px',
          marginBottom: '24px',
          opacity: 0.75
        }}>
          Made with 🤍 for bold conversations
        </div>

        {/* PERSISTENT BOTTOM NAVIGATION (HIDDEN/NULL YET RENDERED FOR COMPATIBILITY) */}
        <BottomNav activeTab="home" />

      </div>
    </div>
  );
};

export default CreatorSharePage;
