import React from 'react';

/**
 * @component Avatar — Circular avatar showing image or initials fallback.
 */
export const Avatar = ({ name, src, size = 52 }) => {
  const getInitials = (str) => {
    if (!str) return '';
    const words = str.trim().split(' ');
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return words[0][0].toUpperCase();
  };

  if (src) {
    return (
      <img 
        src={src} 
        alt={name} 
        style={{ width: `${size}px`, height: `${size}px`, borderRadius: '50%', objectFit: 'cover' }} 
      />
    );
  }

  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      background: 'var(--bdim)',
      color: 'var(--blue)',
      fontFamily: 'var(--font-mono)',
      fontWeight: 700,
      fontSize: `${size * 0.35}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {getInitials(name)}
    </div>
  );
};
