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
    // Instagram doesn't support web share intents, so we just open the site
    window.open('https://instagram.com', '_blank');
  };

  const openYouTube = () => {
    window.open('https://studio.youtube.com', '_blank');
  };

  const generateQRCanvas = () => {
    const qrCanvasSrc = qrRef2.current?.querySelector('canvas');
    if (!qrCanvasSrc) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const width = 1080;
    const height = 1080;
    canvas.width = width;
    canvas.height = height;

    // Background (Black)
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);

    // skriibe wordmark — white "skr"/"be" with cyan "ii", chained with measured widths so there are no gaps
    const fontSize = 150;
    ctx.font = `300 ${fontSize}px "DM Sans", "Segoe UI", Arial, sans-serif`;
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';

    const part1 = 'skr';
    const part2 = 'ii';
    const part3 = 'be';
    const w1 = ctx.measureText(part1).width;
    const w2 = ctx.measureText(part2).width;
    const w3 = ctx.measureText(part3).width;
    const totalWidth = w1 + w2 + w3;
    let logoX = (width - totalWidth) / 2;
    const baselineY = 240;

    ctx.fillStyle = '#ffffff';
    ctx.fillText(part1, logoX, baselineY);
    logoX += w1;

    ctx.fillStyle = '#3db4f2';
    ctx.fillText(part2, logoX, baselineY);
    logoX += w2;

    ctx.fillStyle = '#ffffff';
    ctx.fillText(part3, logoX, baselineY);

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
      const canvas = generateQRCanvas();
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

  const openWhatsApp = async () => {
    try {
      if (navigator.canShare && navigator.share) {
        const canvas = generateQRCanvas();
        if (canvas) {
          const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
          if (blob) {
            const file = new File([blob], `${handle}-skriibe-qr.png`, { type: 'image/png' });
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                title: 'My skriibe',
                text: shareUrl,
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
    window.open(`https://wa.me/?text=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const openLinkedIn = () => {
    window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(fullShareUrl)}`, '_blank');
  };

  const openX = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(fullShareUrl)}`, '_blank');
  };

  const downloadSkriibeQRCode = () => {
    const canvas = generateQRCanvas();
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
        height: '100dvh',
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '12px 16px 80px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
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
          padding: '12px 16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
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
            <button onClick={scrollToQR} className="copy-link-btn" style={{ flex: 1, background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#ffffff', boxShadow: 'none' }}>
              <span>Share Profile</span>
            </button>
            <button onClick={() => navigate(`/creator/${username}?preview=true`)} className="copy-link-btn" style={{ flex: 1, background: 'linear-gradient(90deg, #7c3aed, #06b6d4)' }}>
              <span>Preview Page →</span>
            </button>
          </div>
          
        </div>

        {/* SHARE YOUR LINK SECTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flexShrink: 0 }}>
          <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', paddingLeft: '4px' }}>
            SHARE ON
          </div>

          <div style={{ display: 'flex', gap: '24px', padding: '12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', justifyContent: 'center' }}>
            
            <div onClick={openInstagram} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="ig-grad2" x1="20%" y1="100%" x2="80%" y2="0%">
                    <stop offset="0%" stopColor="#f09433" />
                    <stop offset="25%" stopColor="#e6683c" />
                    <stop offset="50%" stopColor="#dc2743" />
                    <stop offset="75%" stopColor="#cc2366" />
                    <stop offset="100%" stopColor="#bc1888" />
                  </linearGradient>
                </defs>
                <rect width="24" height="24" rx="5" fill="url(#ig-grad2)"/>
                <rect x="5" y="5" width="14" height="14" rx="4" stroke="#fff" strokeWidth="1.5" />
                <circle cx="12" cy="12" r="3.5" stroke="#fff" strokeWidth="1.5" />
                <circle cx="16.5" cy="7.5" r="1.1" fill="#fff" />
              </svg>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Instagram</span>
            </div>

            <div onClick={openLinkedIn} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="24" height="24" rx="4" fill="#0A66C2"/>
                <path d="M7 20H4V9h3v11zM5.5 7.73a1.74 1.74 0 1 1 0-3.48 1.74 1.74 0 0 1 0 3.48zM20 20h-3v-5.6c0-1.34-.03-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.96V20h-3V9h2.88v1.5h.04c.4-.76 1.38-1.56 2.84-1.56 3.04 0 3.6 2 3.6 4.6V20z" fill="#fff"/>
              </svg>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>LinkedIn</span>
            </div>

            <div onClick={openWhatsApp} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'transform 0.2s', ':hover': { transform: 'scale(1.05)' } }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.01 2.002c-5.518 0-10 4.48-10 9.998 0 1.754.453 3.42 1.314 4.908L2 22l5.247-1.376a9.966 9.966 0 0 0 4.763 1.206h.004c5.517 0 10-4.48 10-9.998 0-5.518-4.483-9.998-10-9.998z" fill="#25D366"/>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" fill="#fff"/>
              </svg>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>WhatsApp</span>
            </div>

            <div onClick={openX} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="24" height="24" rx="4" fill="#000000"/>
                <path d="M16 4h2.5l-5.5 6.5L19 20h-4.5l-3.5-4.5-4 4.5H4.5l6-7L5 4h4.5l3 4.5L16 4Zm-1.5 14h1.5L8.5 5.5h-1.5L14.5 18Z" fill="#ffffff"/>
              </svg>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>X</span>
            </div>

          </div>
        </div>

        {/* Go to Dashboard Button */}
        <div style={{ display: 'flex', marginTop: '4px', marginBottom: '4px' }}>
          <button onClick={() => navigate('/creator/dashboard', { state: { creator } })} className="copy-link-btn" style={{ width: '100%', background: '#ffffff', border: 'none', color: '#0a0a0f', fontWeight: 800, fontSize: '16px', padding: '16px', borderRadius: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 20px rgba(255, 255, 255, 0.15)', transition: 'all 0.2s' }}>
            <span>Go to Dashboard →</span>
          </button>
        </div>



        {/* QR CODE SECTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', flexShrink: 0 }}>
          <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', paddingLeft: '4px' }}>
            QR code
          </div>

          <div style={{ background: '#0a0a0f', border: '1px solid #3db4f2', borderRadius: '16px', padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', boxShadow: '0 8px 32px rgba(61, 180, 242, 0.15)' }}>
            <div ref={qrRef2} style={{ background: '#ffffff', padding: '12px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%', boxSizing: 'border-box' }}>
              <QRCodeCanvas value={fullShareUrl} size={110} bgColor="#ffffff" fgColor="#000000" level="H" />
              <div style={{ color: '#3db4f2', fontSize: '16px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                @{handle}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'space-between' }}>
              <button onClick={handleNativeShare} style={{ flex: 1, background: 'rgba(61, 180, 242, 0.1)', color: '#3db4f2', border: '1px solid rgba(61, 180, 242, 0.2)', padding: '10px 4px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
                <span style={{ fontSize: '16px' }}>↑</span> Share profile
              </button>
              <button onClick={copyLinkToClipboard} style={{ flex: 1, background: 'rgba(61, 180, 242, 0.1)', color: '#3db4f2', border: '1px solid rgba(61, 180, 242, 0.2)', padding: '10px 4px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
                <span style={{ fontSize: '16px' }}>🔗</span> {copiedLink ? 'Copied! ✓' : 'Copy link'}
              </button>
              <button onClick={downloadSkriibeQRCode} style={{ flex: 1, background: '#3db4f2', color: '#0a0a0f', border: 'none', padding: '10px 4px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
                <span style={{ fontSize: '16px' }}>↓</span> Download
              </button>
            </div>
            <div style={{ color: '#FAFAF8', fontSize: '14px', fontWeight: 600, marginTop: '8px', letterSpacing: '0.02em' }}>
              Ask me anything
            </div>
          </div>
        </div>

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
    </div>
  );
};

export default CreatorSharePage;
