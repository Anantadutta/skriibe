import React from 'react';

const TransparentLogo = ({ src, alt, style, className }) => {
  return (
    <img 
      src={src || '/logo.png'} 
      alt={alt || 'skriibe logo'} 
      style={{ 
        ...style, 
        display: 'block'
      }} 
      className={className}
      fetchPriority="high"
      loading="eager"
    />
  );
};

export default TransparentLogo;
