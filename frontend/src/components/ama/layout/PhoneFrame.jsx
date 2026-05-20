import React from 'react';

/**
 * @component PhoneFrame — Refactored wrapper to render full-width responsive layout without mobile frames.
 */
export const PhoneFrame = ({ children }) => {
  return (
    <div className="creator-theme" style={{
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
      position: 'relative',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100%',
      background: 'transparent'
    }}>
      {/* Decorative Background Blobs */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '-5%',
        width: '280px',
        height: '280px',
        borderRadius: '50%',
        background: '#3DD9FF',
        filter: 'blur(100px)',
        opacity: 0.15,
        pointerEvents: 'none',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '-5%',
        width: '320px',
        height: '320px',
        borderRadius: '50%',
        background: '#7c3aed',
        filter: 'blur(100px)',
        opacity: 0.15,
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Main Content Area */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        flex: 1,
        width: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {children}
      </div>
    </div>
  );
};

