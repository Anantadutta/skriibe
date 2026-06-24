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
import TransparentLogo from '../../components/TransparentLogo';

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
  const username = (state?.creator?.handle || state?.creator?.username) ?? 'yourhandle';
  const [loading, setLoading] = useState(!creator);

  // Success states for clipboard actions
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedBio, setCopiedBio] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [shareFile, setShareFile] = useState(null);

  const qrRef = useRef(null);
  const qrRef2 = useRef(null);
  const [qrSlide, setQrSlide] = useState(0);
  const [showQRModal, setShowQRModal] = useState(location.state?.openQR || false);

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

  // Deep Link opens moved below

  const generateQRCanvas = async () => {
    const qrCanvasSrc = qrRef2.current?.querySelector('canvas');
    if (!qrCanvasSrc) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const width = 1080;
    const height = 1080;
    canvas.width = width;
    canvas.height = height;

    // Background (Black)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // Draw the Skriibe logo image
    const logoImg = new Image();
    logoImg.src = '/logo.png';
    logoImg.crossOrigin = 'Anonymous';
    await new Promise((resolve) => {
      logoImg.onload = resolve;
      logoImg.onerror = resolve;
    });
    
    if (logoImg.width) {
      const scale = Math.min(700 / logoImg.width, 560 / logoImg.height);
      const targetWidth = logoImg.width * scale;
      const targetHeight = logoImg.height * scale;
      const startX = (width - targetWidth) / 2;
      // Center the logo's internal text around Y=150, exactly in the middle of the empty space
      const logoY = 150 - (targetHeight / 2);
      ctx.drawImage(logoImg, startX, logoY, targetWidth, targetHeight);
    }

    // White rounded card for QR
    const cardWidth = 700;
    const cardHeight = 700;
    const cardX = (width - cardWidth) / 2;
    const cardY = 300;
    const radius = 40;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(cardX + radius, cardY);
    ctx.lineTo(cardX + cardWidth - radius, cardY);
    ctx.quadraticCurveTo(cardX + cardWidth, cardY, cardX + cardWidth, cardY + radius);
    ctx.lineTo(cardX + cardWidth, cardY + cardHeight - radius);
    ctx.quadraticCurveTo(cardX + cardWidth, cardY + cardHeight, cardX + cardWidth - radius, cardY + cardHeight);
    ctx.lineTo(cardX + radius, cardY + cardHeight);
    ctx.quadraticCurveTo(cardX, cardY + cardHeight, cardX, cardY + cardHeight - radius);
    ctx.lineTo(cardX, cardY + radius);
    ctx.quadraticCurveTo(cardX, cardY, cardX + radius, cardY);
    ctx.closePath();
    ctx.fill();

    // QR Canvas
    const qrSize = 520;
    const qrX = (width - qrSize) / 2;
    const qrY = cardY + 50;
    ctx.drawImage(qrCanvasSrc, qrX, qrY, qrSize, qrSize);

    // Handle / Username below QR
    ctx.font = 'bold 50px "Inter", "Segoe UI", sans-serif';
    ctx.fillStyle = '#3db4f2'; // Skriibe blue for handle
    ctx.textAlign = 'center';
    ctx.fillText(`@${handle}`, width / 2, cardY + cardHeight - 50);

    return canvas;
  };

  useEffect(() => {
    // Pre-generate the QR file for synchronous native sharing
    const timer = setTimeout(async () => {
      const canvas = await generateQRCanvas();
      if (canvas) {
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        if (blob) {
          const file = new File([blob], `${handle}-skriibe-qr.png`, { type: 'image/png' });
          setShareFile(file);
        }
      }
    }, 1000); // Give QRCodeCanvas time to render
    return () => clearTimeout(timer);
  }, [handle, fullShareUrl]);

  const shareWithQR = async (fallbackAction) => {
    try {
      if (navigator.canShare && navigator.share) {
        const canvas = await generateQRCanvas();
        if (canvas) {
          const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
          if (blob) {
            const file = new File([blob], `${handle}-skriibe-qr.png`, { type: 'image/png' });
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                title: 'My skriibe',
                text: `Ask me anything on skriibe! ${fullShareUrl}`,
                files: [file]
              });
              return;
            }
          }
        }
      }
    } catch (err) {
      console.log('Web Share API failed', err);
    }
    
    // Fallback
    fallbackAction();
  };

  const openInstagram = () => {
    shareWithQR(() => {
      window.open('https://instagram.com', '_blank');
    });
  };

  const openYouTube = () => {
    shareWithQR(() => {
      window.open('https://studio.youtube.com', '_blank');
    });
  };

  const openWhatsApp = () => {
    shareWithQR(() => {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareUrl)}`, '_blank');
    });
  };

  const openLinkedIn = () => {
    shareWithQR(() => {
      window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(fullShareUrl)}`, '_blank');
    });
  };

  const openX = () => {
    shareWithQR(() => {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(fullShareUrl)}`, '_blank');
    });
  };

  const openFacebook = () => {
    shareWithQR(() => {
      const fbUrl = creator?.facebook || creator?.socials?.facebook || creator?.socialLinks?.facebook;
      if (fbUrl) {
        const urlToOpen = fbUrl.startsWith('http') ? fbUrl : `https://facebook.com/${fbUrl}`;
        window.open(urlToOpen, '_blank');
      } else {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullShareUrl)}`, '_blank');
      }
    });
  };

  const downloadSkriibeQRCode = async () => {
    const canvas = await generateQRCanvas();
    if (!canvas) return;

    // Download the generated image
    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `${handle}-skriibe-qr.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        const shareData = {
          title: 'My skriibe',
          text: `Ask me anything on skriibe! ${fullShareUrl}`,
          url: fullShareUrl
        };

        if (shareFile && navigator.canShare && navigator.canShare({ files: [shareFile] })) {
          shareData.files = [shareFile];
        }

        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing', err);
        copyLinkToClipboard();
      }
    } else {
      copyLinkToClipboard();
    }
  };

  const scrollToQR = () => {
    if (qrRef2.current) {
      qrRef2.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
      background: '#050508',
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
        background: '#050508',
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
        height: '100dvh',
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '2px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
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
          
          <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: 700, letterSpacing: '0.2px' }}>
            My <span style={{ color: '#818cf8' }}>skriibe</span> page
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
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          position: 'relative',
          flexShrink: 0,
          marginTop: '8px'
        }}>
          {showBanner && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', marginTop: '4px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#5468ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h2 style={{
                  background: 'linear-gradient(90deg, #7c3aed, #a855f7)', WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent', fontSize: '1.5rem', fontWeight: '800', margin: 0
                }}>
                  You're live!
                </h2>
                <span style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>
                  Your page is ready to share.
                </span>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
            <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#94a3b8', letterSpacing: '0.1em', fontWeight: 700 }}>
              YOUR LINK
            </span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', background: '#0f0f13', padding: '12px 16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0', wordBreak: 'break-all' }}>
                <span style={{ color: '#94a3b8' }}>skriibe.com/</span>@{username || handle}
              </span>
              <button onClick={copyLinkToClipboard} style={{ background: '#232328', border: 'none', color: '#e2e8f0', cursor: 'pointer', display: 'flex', padding: '8px', borderRadius: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
          </div>

          <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5', marginTop: '4px', marginBottom: '4px' }}>
            Anyone with this link can ask you a <span style={{ color: '#a855f7', fontWeight: 600 }}>paid question.</span>
          </div>

          <button onClick={copyLinkToClipboard} className="copy-link-btn" style={{ background: 'linear-gradient(90deg, #7c3aed, #3b82f6)', color: 'white', padding: '12px', borderRadius: '16px', border: 'none', fontWeight: 600, width: '100%', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span>{copiedLink ? 'Copied!' : 'Copy link'}</span>
          </button>
          
        </div>

        {/* SHARE YOUR LINK SECTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0, marginTop: '16px' }}>
          <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', paddingLeft: '4px' }}>
            SHARE ON
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', marginTop: '8px' }}>
            <div onClick={openInstagram} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="ig-grad" x1="20%" y1="100%" x2="80%" y2="0%">
                      <stop offset="0%" stopColor="#f09433" />
                      <stop offset="25%" stopColor="#e6683c" />
                      <stop offset="50%" stopColor="#dc2743" />
                      <stop offset="75%" stopColor="#cc2366" />
                      <stop offset="100%" stopColor="#bc1888" />
                    </linearGradient>
                  </defs>
                  <rect x="0" y="0" width="24" height="24" rx="6" fill="url(#ig-grad)" />
                  <rect x="5.5" y="5.5" width="13" height="13" rx="3.5" stroke="#fff" strokeWidth="1.5" fill="none" />
                  <circle cx="12" cy="12" r="3" stroke="#fff" strokeWidth="1.5" fill="none" />
                  <circle cx="16" cy="8" r="1" fill="#fff" />
                </svg>
              </div>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Instagram</span>
            </div>

            <div onClick={openLinkedIn} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="0" y="0" width="24" height="24" rx="5.4" fill="#0A66C2" />
                  <path d="M7.4 19H4.1V9.5h3.3V19zM5.7 8.1c-1.1 0-2-.9-2-2 0-1.1.9-2 2-2s2 .9 2 2c0 1.1-.9 2-2 2zM20.3 19h-3.3v-4.6c0-1.1 0-2.5-1.5-2.5-1.6 0-1.8 1.2-1.8 2.4V19h-3.3V9.5h3.1v1.3h.1c.4-.8 1.5-1.6 3-1.6 3.2 0 3.8 2.1 3.8 4.8V19z" fill="#fff" />
                </svg>
              </div>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>LinkedIn</span>
            </div>

            <div onClick={openWhatsApp} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="0" y="0" width="24" height="24" rx="5.4" fill="#25D366" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M18.4 5.6A8.9 8.9 0 0 0 12 3a8.9 8.9 0 0 0-7.7 13.5l-1.3 4.5 4.6-1.2A8.9 8.9 0 0 0 12 21a8.9 8.9 0 0 0 6.4-15.4zM12 19.5c-1.4 0-2.8-.4-4-1.1l-.3-.2-3 .8.8-2.9-.2-.3A7.4 7.4 0 0 1 12 4.5 7.4 7.4 0 0 1 12 19.5zm4.1-5.6c-.2-.1-1.3-.6-1.5-.7-.2-.1-.4-.2-.5.1-.2.2-.6.7-.7.9-.2.2-.3.2-.5.1-.2-.1-1-.4-1.8-1.1-.7-.6-1.1-1.3-1.2-1.5-.1-.2 0-.3.1-.4l.3-.3c.1-.1.2-.2.2-.4.1-.1 0-.3-.1-.4-.2-.5-.7-1.8-.9-2.5-.2-.7-.5-.6-.7-.6h-.6c-.2 0-.6.1-.8.3-.3.3-1 .9-1 2.2s1 2.5 1.1 2.7c.2.2 1.8 2.8 4.4 3.9.6.2 1.1.4 1.5.5.6.2 1.1.2 1.5.1.5-.1 1.4-.6 1.6-1.2.2-.6.2-1 .1-1.2z" fill="#ffffff" />
                </svg>
              </div>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>WhatsApp</span>
            </div>

            <div onClick={openX} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="0" y="0" width="24" height="24" rx="5.4" fill="#000000" />
                  <g transform="translate(4.4, 4) scale(0.666)">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="#ffffff" />
                  </g>
                </svg>
              </div>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>X</span>
            </div>

            <div onClick={openFacebook} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="0" y="0" width="24" height="24" rx="5" fill="#1877F2" />
                  <path d="M15.5 8h-2c-1.4 0-1.5.8-1.5 1.5v2h3l-.5 3h-2.5v7h-3v-7h-2v-3h2v-2.5C9 5 10.5 4 13.5 4h2.5v4z" fill="#fff" />
                </svg>
              </div>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Facebook</span>
            </div>
          </div>
        </div>

        <button onClick={() => setShowQRModal(true)} style={{ background: '#131316', color: '#ffffff', padding: '12px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '14px', fontWeight: 600, marginTop: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          Share profile
        </button>

        <button onClick={() => navigate(`/creator/${username}?preview=true`)} style={{ background: 'linear-gradient(90deg, #7c3aed, #06b6d4)', color: '#ffffff', padding: '12px', borderRadius: '16px', border: 'none', fontSize: '14px', fontWeight: 600, marginTop: '8px', cursor: 'pointer' }}>
          Preview page →
        </button>

        <button onClick={() => navigate('/creator/dashboard', { state: { creator } })} style={{ background: '#ffffff', border: 'none', color: '#0a0a0f', fontSize: '14px', fontWeight: 800, marginTop: '8px', padding: '12px', borderRadius: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'center', width: '100%' }}>
          Go to Dashboard →
        </button>

        {/* Made with 🤍 for bold conversations Footer */}
        <div style={{
          textAlign: 'center',
          color: '#94a3b8',
          fontSize: '11px',
          fontFamily: 'var(--font-mono), monospace',
          marginTop: '8px',
          marginBottom: '8px',
          opacity: 0.75
        }}>
          Made with 🤍 from Skriibe
        </div>

        {/* PERSISTENT BOTTOM NAVIGATION (HIDDEN/NULL YET RENDERED FOR COMPATIBILITY) */}
        <BottomNav activeTab="home" />

      </div>

      {showQRModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', background: '#0a0a0f' }}>
          {/* Close button top right */}
          <button onClick={() => {
            if (location.state?.returnToSettings) {
              navigate('/creator/settings');
            } else {
              setShowQRModal(false);
            }
          }} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', zIndex: 10 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative' }}>
            {/* Skriibe Logo Heading */}
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center', width: '100%' }}>
              <TransparentLogo src="/logo.png" alt="skriibe logo" style={{ height: '90px', width: 'auto', transform: 'scale(2.2)', transformOrigin: 'center center' }} />
            </div>

            {/* White Box containing QR Code */}
            <div ref={qrRef2} style={{ background: '#ffffff', borderRadius: '16px', padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '320px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              <QRCodeCanvas 
                value={fullShareUrl}
                size={180}
                bgColor="#ffffff"
                fgColor="#000000"
                level="H"
                includeMargin={false}
              />
              <div style={{ marginTop: '24px', color: '#38bdf8', fontSize: '18px', fontWeight: 800, letterSpacing: '0.5px' }}>
                @{username || handle}
              </div>
            </div>

            {/* 3 Buttons Row */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', width: '100%', maxWidth: '320px', position: 'relative' }}>
              <button onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: 'My skriibe', text: 'Ask me anything!', url: fullShareUrl });
                } else {
                  copyLinkToClipboard();
                }
              }} style={{ flex: 1, background: '#131316', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px', color: '#38bdf8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>Share profile</span>
              </button>

              <button onClick={copyLinkToClipboard} style={{ flex: 1, background: '#131316', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px', color: '#38bdf8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>Copy link</span>
              </button>

              <button onClick={downloadSkriibeQRCode} style={{ flex: 1, background: '#38bdf8', border: 'none', borderRadius: '12px', padding: '12px', color: '#000000', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>Download</span>
              </button>

              {copiedLink && (
                <div style={{
                  position: 'absolute',
                  top: '110%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(82, 82, 91, 0.95)',
                  color: '#ffffff',
                  padding: '8px 16px',
                  borderRadius: '24px',
                  fontSize: '13px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  zIndex: 100
                }}>
                  Copied to clipboard.
                </div>
              )}
            </div>

            {/* Bottom Text */}
            <div style={{ marginTop: '32px', color: '#ffffff', fontSize: '18px', fontWeight: 800, letterSpacing: '0.5px' }}>
              Ask me anything
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorSharePage;
