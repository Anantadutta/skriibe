import React, { useEffect, useRef, useState } from 'react';

const TransparentLogo = ({ src, alt, style, className }) => {
  const canvasRef = useRef(null);
  const [dataUrl, setDataUrl] = useState(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        
        // Un-premultiply alpha assuming a black background
        const alpha = Math.max(r, g, b);
        if (alpha > 0) {
          data[i] = (r / alpha) * 255;
          data[i+1] = (g / alpha) * 255;
          data[i+2] = (b / alpha) * 255;
        }
        data[i+3] = alpha;
      }
      ctx.putImageData(imageData, 0, 0);
      setDataUrl(canvas.toDataURL('image/png'));
    };
    img.src = src;
  }, [src]);

  if (dataUrl) {
    return <img src={dataUrl} alt={alt} style={style} className={className} />;
  }

  return (
    <div style={{ display: 'inline-block', ...style }}>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default TransparentLogo;
