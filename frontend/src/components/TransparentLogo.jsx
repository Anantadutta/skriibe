import React, { useRef, useEffect, useState } from 'react';

const TransparentLogo = ({ src, alt, style, className }) => {
  const canvasRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    // Since the image is served from the same origin (e.g. /logo.png), we don't need crossOrigin.
    // But setting it to 'Anonymous' helps if it happens to be on a CDN.
    img.crossOrigin = 'Anonymous';
    
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i+1];
          const b = data[i+2];
          
          // The brightness (max color channel) represents the alpha
          // since the image is assumed to be rendered over a black background.
          const alpha = Math.max(r, g, b);
          
          if (alpha === 0) {
            data[i+3] = 0; // Pure black becomes fully transparent
          } else {
            // Un-premultiply the RGB values to remove the black tint
            data[i] = (r / alpha) * 255;
            data[i+1] = (g / alpha) * 255;
            data[i+2] = (b / alpha) * 255;
            data[i+3] = alpha;
          }
        }
        
        ctx.putImageData(imageData, 0, 0);
        setLoaded(true);
      } catch (e) {
        console.error("Canvas pixel manipulation failed:", e);
      }
    };
    
    img.src = src;
  }, [src]);

  return (
    <>
      <canvas 
        ref={canvasRef} 
        style={{ 
          ...style, 
          // Disable mixBlendMode since the background is now genuinely transparent
          mixBlendMode: 'normal',
          display: loaded ? 'block' : 'none',
          width: style?.width || '100%',
          height: style?.height || 'auto'
        }} 
        className={className} 
      />
    </>
  );
};

export default TransparentLogo;
