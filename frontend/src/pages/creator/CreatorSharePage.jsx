/**
 * @file CreatorSharePage.jsx
 * @description My skriibe page dashboard & sharing controls (C10 → C10b).
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
            onClick={() => navigate('/dashboard')}
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

        {/* TOP CARD: SKRIIBE PAGE CARD */}
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
          overflow: 'hidden'
        }}>
          {/* Username / URL with copy icon next to it */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '75%' }}>
            <span style={{
              fontFamily: 'monospace, var(--font-mono)',
              fontSize: '10px',
              color: '#94a3b8',
              letterSpacing: '0.1em',
              fontWeight: 700
            }}>
              YOUR LINK
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontFamily: 'var(--font-mono), monospace',
                fontSize: '16px',
                fontWeight: 800,
                color: '#ffffff',
                wordBreak: 'break-all'
              }}>
                {shareUrl}
              </span>
              <button
                onClick={copyLinkToClipboard}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#06b6d4',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'transform 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                title="Copy URL"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
            </div>
          </div>

          {/* 3D Link illustration top-right with floating sparkles */}
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}>
            {/* Sparkles around link */}
            <div className="card-sparkle" style={{ top: '-4px', left: '10px', animationDelay: '0.3s' }} />
            <div className="card-sparkle" style={{ bottom: '2px', right: '-4px', animationDelay: '1.2s' }} />
            <div className="card-sparkle" style={{ bottom: '16px', left: '-6px', animationDelay: '2.5s' }} />
            
            {/* SVG Link icon */}
            <svg width="46" height="46" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="glow-link-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
                <filter id="link-shadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <g filter="url(#link-shadow)" transform="rotate(-15 12 12)">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="url(#glow-link-grad)" strokeWidth="3" strokeLinecap="round" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="url(#glow-link-grad)" strokeWidth="3" strokeLinecap="round" />
              </g>
            </svg>
          </div>

          {/* Subtext emphasizing paid question in cyan */}
          <div style={{
            fontSize: '13px',
            color: '#94a3b8',
            lineHeight: '1.5',
            marginTop: '8px',
            textAlign: 'left'
          }}>
            Anyone with this link can ask you a <span style={{ color: '#06b6d4', fontWeight: 700 }}>paid question</span>
          </div>

          {/* "Copy link" button within the card, full width */}
          <button
            onClick={copyLinkToClipboard}
            className="copy-link-btn"
            style={{ marginTop: '4px' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span>{copiedLink ? 'Copied Link! ✓' : 'Copy link'}</span>
          </button>
        </div>

        {/* SHARE YOUR LINK SECTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{
            color: '#94a3b8',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            textAlign: 'left',
            paddingLeft: '4px'
          }}>
            Share your link
          </div>

          {/* 2x2 GRID OF BRAND CARDS */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px'
          }}>
            
            {/* Instagram Bio */}
            <div
              onClick={openInstagram}
              className="grid-share-card ig-card"
            >
              {/* Brand icon top-left (40px proper SVG) */}
              <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="ig-gradient-svg" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f09433"/>
                      <stop offset="25%" stopColor="#e6683c"/>
                      <stop offset="50%" stopColor="#dc2743"/>
                      <stop offset="75%" stopColor="#cc2366"/>
                      <stop offset="100%" stopColor="#bc1888"/>
                    </linearGradient>
                  </defs>
                  <rect width="24" height="24" rx="6" fill="url(#ig-gradient-svg)"/>
                  <path d="M12 6.865A5.135 5.135 0 1017.135 12 5.14 5.14 0 0012 6.865zm0 8.469A3.334 3.334 0 1115.334 12 3.338 3.338 0 0112 15.334z" fill="white"/>
                  <circle cx="17.635" cy="6.365" r="0.635" fill="white"/>
                </svg>
              </div>
              {/* Title below icon */}
              <div style={{ marginTop: 'auto', fontWeight: 'bold', fontSize: '13px', color: '#ffffff' }}>
                Instagram bio
              </div>
              {/* Muted description below title */}
              <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '2px' }}>
                Auto-opens IG
              </div>
              {/* Arrow bottom-right */}
              <div style={{ position: 'absolute', bottom: '16px', right: '16px', fontSize: '14px', color: '#94a3b8', fontWeight: 600 }}>
                ↗
              </div>
            </div>

            {/* YouTube Description */}
            <div
              onClick={openYouTube}
              className="grid-share-card yt-card"
            >
              <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="24" height="24" rx="6" fill="#FF0000"/>
                  <path d="M9.5 8v8l6.5-4-6.5-4z" fill="white"/>
                </svg>
              </div>
              <div style={{ marginTop: 'auto', fontWeight: 'bold', fontSize: '13px', color: '#ffffff' }}>
                YouTube
              </div>
              <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '2px' }}>
                Opens YouTube Studio
              </div>
              <div style={{ position: 'absolute', bottom: '16px', right: '16px', fontSize: '14px', color: '#94a3b8', fontWeight: 600 }}>
                ↗
              </div>
            </div>

            {/* WhatsApp */}
            <div
              onClick={openWhatsApp}
              className="grid-share-card wa-card"
            >
              <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="24" height="24" rx="6" fill="#25D366"/>
                  <path d="M12.012 5.5a6.477 6.477 0 00-5.632 9.68l-.74 2.701 2.766-.726a6.467 6.467 0 003.606 1.085h.003a6.48 6.48 0 006.478-6.475 6.48 6.48 0 00-6.481-6.465zm3.435 8.784c-.147.414-.737.76-1.012.808-.25.044-.575.08-.925-.033a5.522 5.522 0 01-2.483-1.636 5.86 5.86 0 01-1.282-2.128c-.148-.445-.443-.9-.42-1.391.025-.522.285-.776.388-.88.103-.105.227-.156.34-.156.113 0 .227.006.326.012.103.006.242-.038.379.293.137.331.472 1.15.513 1.233.041.083.067.18.012.289-.053.11-.12.22-.24.36-.12.14-.242.313-.36.42-.12.12-.247.25-.106.491.14.241.625 1.026 1.34 1.662.923.82 1.7.172 1.942.062.242-.11.267-.282.4-.44.133-.158.267-.34.4-.51.133-.17.267-.14.4-.083.133.057.84.396.984.468.144.072.24.11.276.172.036.062.036.363-.11.777z" fill="white"/>
                </svg>
              </div>
              <div style={{ marginTop: 'auto', fontWeight: 'bold', fontSize: '13px', color: '#ffffff' }}>
                WhatsApp
              </div>
              <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '2px' }}>
                Share with audience
              </div>
              <div style={{ position: 'absolute', bottom: '16px', right: '16px', fontSize: '14px', color: '#94a3b8', fontWeight: 600 }}>
                ↗
              </div>
            </div>

            {/* Other Apps */}
            <div
              onClick={handleNativeShare}
              className="grid-share-card other-card"
            >
              <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="24" height="24" rx="6" fill="#7C3AED"/>
                  {/* Clean purple grid icon */}
                  <rect x="6" y="6" width="4" height="4" rx="1" fill="white"/>
                  <rect x="14" y="6" width="4" height="4" rx="1" fill="white"/>
                  <rect x="6" y="14" width="4" height="4" rx="1" fill="white"/>
                  <rect x="14" y="14" width="4" height="4" rx="1" fill="white"/>
                </svg>
              </div>
              <div style={{ marginTop: 'auto', fontWeight: 'bold', fontSize: '13px', color: '#ffffff' }}>
                Other apps
              </div>
              <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '2px' }}>
                System share sheet
              </div>
              <div style={{ position: 'absolute', bottom: '16px', right: '16px', fontSize: '14px', color: '#94a3b8', fontWeight: 600 }}>
                ↗
              </div>
            </div>

          </div>
        </div>

        {/* READY-TO-USE BIO TEXT SECTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{
            color: '#94a3b8',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            textAlign: 'left',
            paddingLeft: '4px'
          }}>
            Ready-to-use bio text
          </div>

          {/* Bio card */}
          <div style={{
            background: '#0f0f1a',
            border: '1px solid rgba(6, 182, 212, 0.4)',
            borderRadius: '16px',
            padding: '24px 20px 20px',
            boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.6), 0 0 15px rgba(6, 182, 212, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            position: 'relative'
          }}>
            {/* Large cyan quotation mark top-left */}
            <span style={{
              position: 'absolute',
              top: '-4px',
              left: '12px',
              fontFamily: 'Georgia, serif',
              fontSize: '64px',
              fontWeight: 'bold',
              color: 'rgba(6, 182, 212, 0.15)',
              lineHeight: 1,
              pointerEvents: 'none'
            }}>
              “
            </span>

            <pre style={{
              margin: 0,
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace, var(--font-mono)',
              fontSize: '12px',
              color: '#06b6d4',
              lineHeight: '1.6',
              textAlign: 'left',
              position: 'relative',
              zIndex: 1,
              paddingTop: '16px'
            }}>
              {bioText}
            </pre>

            {/* Copy bio text as a small pill button bottom-right */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', zIndex: 2 }}>
              <button
                onClick={copyBioToClipboard}
                className="copy-bio-btn"
              >
                <span>📋</span>
                <span>{copiedBio ? 'Copied Bio! ✓' : 'Copy bio text'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* QR CODE SECTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{
            color: '#94a3b8',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            textAlign: 'left',
            paddingLeft: '4px'
          }}>
            QR code
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            
            {/* QR details row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              textAlign: 'left'
            }}>
              {/* Canvas container with ref */}
              <div
                ref={qrRef}
                style={{
                  background: '#ffffff',
                  padding: '10px',
                  borderRadius: '12px',
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'content-box',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{
                  fontFamily: 'monospace, var(--font-mono)',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#ffffff',
                  wordBreak: 'break-all'
                }}>
                  {shareUrl}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#94a3b8'
                }}>
                  Scan to visit your page
                </div>
              </div>
            </div>

            {/* Download CTA */}
            <button
              onClick={downloadQRCode}
              className="download-btn"
            >
              Download PNG
            </button>

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
