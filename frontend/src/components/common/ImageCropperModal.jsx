import React, { useState, useRef, useEffect } from 'react';

const ImageCropperModal = ({ imageSrc, onCropComplete, onClose }) => {
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgSize, setImgSize] = useState({ width: 0, height: 0, naturalWidth: 0, naturalHeight: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const CROP_SIZE = 250; // Visual size of the crop box
  const OUTPUT_SIZE = 800; // Output image size (px), 800x800 is 0.64 Megapixels, well within 5 Megapixel limit

  useEffect(() => {
    if (containerRef.current) {
      setContainerSize({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight
      });
    }
  }, []);

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    
    // Fit image to container initially to calculate base size
    const containerW = containerSize.width || window.innerWidth * 0.8;
    const containerH = containerSize.height || window.innerHeight * 0.5;
    
    // Calculate scale to "cover" the crop area
    const scale = Math.max(CROP_SIZE / naturalWidth, CROP_SIZE / naturalHeight);
    
    setImgSize({
      width: naturalWidth * scale,
      height: naturalHeight * scale,
      naturalWidth,
      naturalHeight,
      baseScale: scale
    });
    
    // Center it initially
    setPosition({
      x: 0,
      y: 0
    });
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    let newX = e.clientX - dragStart.x;
    let newY = e.clientY - dragStart.y;
    
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y });
  };
  
  const handleTouchMove = (e) => {
    if (!isDragging) return;
    let newX = e.touches[0].clientX - dragStart.x;
    let newY = e.touches[0].clientY - dragStart.y;
    setPosition({ x: newX, y: newY });
  };

  const handleCrop = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext('2d');
    
    // Create an image element to draw from
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    
    await new Promise(resolve => { img.onload = resolve; });
    
    // Calculate the crop coordinates
    // We have: visual image width = imgSize.width * zoom
    // visual image height = imgSize.height * zoom
    // container center is containerSize.width / 2
    // crop box is centered.
    
    const visualWidth = imgSize.width * zoom;
    const visualHeight = imgSize.height * zoom;
    
    // Center of container
    const cx = containerSize.width / 2;
    const cy = containerSize.height / 2;
    
    // Top-left of the image visually, relative to container
    const imgX = cx + position.x - visualWidth / 2;
    const imgY = cy + position.y - visualHeight / 2;
    
    // Top-left of crop box visually, relative to container
    const cropX = cx - CROP_SIZE / 2;
    const cropY = cy - CROP_SIZE / 2;
    
    // Offset of crop box relative to image visual start
    const offsetX = cropX - imgX;
    const offsetY = cropY - imgY;
    
    // Scale from visual to natural
    const scaleToNatural = img.naturalWidth / visualWidth;
    
    const sourceX = offsetX * scaleToNatural;
    const sourceY = offsetY * scaleToNatural;
    const sourceW = CROP_SIZE * scaleToNatural;
    const sourceH = CROP_SIZE * scaleToNatural;
    
    ctx.drawImage(img, sourceX, sourceY, sourceW, sourceH, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    
    canvas.toBlob((blob) => {
      onCropComplete(blob);
    }, 'image/webp', 0.9);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)',
      zIndex: 9999,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        width: '90%', maxWidth: '500px', backgroundColor: '#0F172A',
        borderRadius: '16px', overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: '#fff', margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Crop Photo</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '24px', lineHeight: 1 }}>&times;</button>
        </div>
        
        <div 
          ref={containerRef}
          style={{ position: 'relative', width: '100%', height: '350px', overflow: 'hidden', backgroundColor: '#000', cursor: isDragging ? 'grabbing' : 'grab' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
        >
          {containerSize.width > 0 && (
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop source"
              onLoad={handleImageLoad}
              crossOrigin="anonymous"
              draggable={false}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: `${imgSize.width * zoom}px`,
                height: `${imgSize.height * zoom}px`,
                transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
                pointerEvents: 'none',
                willChange: 'transform'
              }}
            />
          )}
          
          {/* Circular Overlay Mask */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            boxShadow: `0 0 0 9999px rgba(0,0,0,0.6)`,
            borderRadius: '50%',
            width: `${CROP_SIZE}px`, height: `${CROP_SIZE}px`,
            margin: 'auto',
            pointerEvents: 'none',
            border: '2px solid rgba(255,255,255,0.5)'
          }} />
        </div>
        
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <span style={{ color: '#94A3B8' }}>-</span>
            <input 
              type="range" 
              min="1" max="3" step="0.01" 
              value={zoom} 
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              style={{ flex: 1 }}
            />
            <span style={{ color: '#94A3B8' }}>+</span>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={onClose}
              style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button 
              onClick={handleCrop}
              style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#3DD9FF', color: '#07070E', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Apply & Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropperModal;
