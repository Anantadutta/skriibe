const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/pages/creator/CreatorSharePage.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Add state variables and new share functions
content = content.replace(
  'const qrRef = useRef(null);',
  `const qrRef = useRef(null);
  const qrRef2 = useRef(null);
  const [qrSlide, setQrSlide] = useState(0);`
);

content = content.replace(
  `  const openWhatsApp = () => {\n    window.open(\`https://wa.me/?text=\${encodeURIComponent(shareUrl)}\`, '_blank');\n  };`,
  `  const openWhatsApp = () => {
    window.open(\`https://wa.me/?text=\${encodeURIComponent(shareUrl)}\`, '_blank');
  };
  const openLinkedIn = () => {
    window.open(\`https://www.linkedin.com/feed/?shareActive=true&text=\${encodeURIComponent(fullShareUrl)}\`, '_blank');
  };
  const openX = () => {
    window.open(\`https://twitter.com/intent/tweet?url=\${encodeURIComponent(fullShareUrl)}\`, '_blank');
  };`
);

// 2. Replace Top Card & Banner (Search from {/* SUCCESS BANNER */} up to {/* SHARE YOUR LINK SECTION */})
const topCardStart = content.indexOf('{/* SUCCESS BANNER */}');
const topCardEnd = content.indexOf('{/* SHARE YOUR LINK SECTION */}');

const newTopCard = `{/* CONSOLIDATED TOP CARD */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
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
            <button onClick={() => navigate(\`/@\${username}\`)} className="copy-link-btn" style={{ flex: 1, background: 'linear-gradient(90deg, #7c3aed, #06b6d4)' }}>
              <span>View My Page →</span>
            </button>
          </div>
        </div>

        `;

if (topCardStart !== -1 && topCardEnd !== -1) {
  content = content.substring(0, topCardStart) + newTopCard + content.substring(topCardEnd);
}

// 3. Replace SHARE YOUR LINK SECTION (up to READY-TO-USE BIO TEXT SECTION)
const shareStart = content.indexOf('{/* SHARE YOUR LINK SECTION */}');
const shareEnd = content.indexOf('{/* READY-TO-USE BIO TEXT SECTION */}');

const newShareSection = `{/* SHARE YOUR LINK SECTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', paddingLeft: '4px' }}>
            SHARE ON
          </div>

          <div style={{ display: 'flex', gap: '16px', padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', justifyContent: 'center' }}>
            
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

        `;

if (shareStart !== -1 && shareEnd !== -1) {
  content = content.substring(0, shareStart) + newShareSection + content.substring(shareEnd);
}


// 4. Replace QR CODE SECTION (up to {/* Made with 🤍 from Skriibe Footer */})
const qrStart = content.indexOf('{/* QR CODE SECTION */}');
const qrEnd = content.indexOf('{/* Made with 🤍 from Skriibe Footer */}');

const newQrSection = `{/* QR CODE CAROUSEL SECTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', paddingLeft: '4px' }}>
              QR code
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: qrSlide === 0 ? '#ffffff' : 'rgba(255,255,255,0.2)', transition: 'background 0.3s' }} />
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: qrSlide === 1 ? '#ffffff' : 'rgba(255,255,255,0.2)', transition: 'background 0.3s' }} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => setQrSlide(0)} style={{ background: qrSlide === 0 ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', color: '#fff', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>&lt;</button>
            
            <div style={{ flex: 1, overflow: 'hidden' }}>
              {qrSlide === 0 ? (
                <div style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.3s ease-out' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div ref={qrRef} style={{ background: '#ffffff', padding: '10px', borderRadius: '12px', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <QRCodeCanvas value={fullShareUrl} size={80} bgColor="#ffffff" fgColor="#000000" level="H" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>{shareUrl}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>Scan to visit your page</div>
                    </div>
                  </div>
                  <button onClick={() => {
                    const canvas = qrRef.current?.querySelector('canvas');
                    if (canvas) {
                      const link = document.createElement('a'); link.download = \`qr-standard.png\`; link.href = canvas.toDataURL(); link.click();
                    }
                  }} className="download-btn" style={{ background: '#06b6d4', color: '#000', border: 'none' }}>
                    Download PNG
                  </button>
                </div>
              ) : (
                <div style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', animation: 'fadeIn 0.3s ease-out' }}>
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
                      <span style={{ fontSize: '16px' }}>🔗</span> Copy link
                    </button>
                    <button onClick={() => {
                      const canvas = qrRef2.current?.querySelector('canvas');
                      if (canvas) {
                        const link = document.createElement('a'); link.download = \`qr-ig.png\`; link.href = canvas.toDataURL(); link.click();
                      }
                    }} style={{ flex: 1, background: '#ffffff', color: '#000', border: 'none', padding: '10px 4px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '16px' }}>↓</span> Download
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => setQrSlide(1)} style={{ background: qrSlide === 1 ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', color: '#fff', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>&gt;</button>
          </div>
          <style dangerouslySetInnerHTML={{ __html: \`@keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }\` }} />
        </div>

        `;

if (qrStart !== -1 && qrEnd !== -1) {
  content = content.substring(0, qrStart) + newQrSection + content.substring(qrEnd);
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('UI Patched Successfully');
