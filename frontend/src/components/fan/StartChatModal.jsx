import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

const StartChatModal = ({ creatorName, onConfirm, onClose }) => {
  // Prevent body scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const modalContent = (
    <div 
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center', // Centered on screen
        justifyContent: 'center',
        zIndex: 999999, // Very high z-index to ensure it is above everything
        padding: '20px' // Add padding so it doesn't touch screen edges on mobile
      }}
      onClick={onClose}
    >
      <div 
        style={{
          position: 'relative', // for absolute positioning of close button
          width: '100%',
          maxWidth: '400px', // slightly smaller max-width for centered modal
          backgroundColor: '#fafafa',
          borderRadius: '24px', // Rounded on all sides
          padding: '48px 24px 32px 24px', // extra top padding for close button space
          animation: 'popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          boxSizing: 'border-box',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            color: '#6b7280', // gray-500
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'background-color 0.2s, color 0.2s'
          }}
          onMouseOver={e => {
            e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)';
            e.currentTarget.style.color = '#111';
          }}
          onMouseOut={e => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#6b7280';
          }}
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <button
          onClick={onConfirm}
          style={{
            width: '100%',
            backgroundColor: '#facc15', // Vibrant yellow button
            color: '#111', // Dark text for contrast
            border: 'none',
            borderRadius: '16px',
            padding: '18px',
            fontSize: '17px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, filter 0.15s ease',
            boxShadow: '0 4px 14px rgba(250, 204, 21, 0.25)'
          }}
          onMouseOver={e => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.filter = 'brightness(1.05)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.filter = 'brightness(1)';
          }}
          onMouseDown={e => {
            e.currentTarget.style.transform = 'scale(0.98)';
          }}
        >
          Start Chat with {creatorName}
        </button>
      </div>
      <style>
        {`
          @keyframes popIn {
            0% { transform: scale(0.9); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
    </div>
  );

  // Mount to document.body so it breaks out of any parent bounds/transforms
  return ReactDOM.createPortal(modalContent, document.body);
};

export default StartChatModal;
