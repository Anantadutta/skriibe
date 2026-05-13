import React from 'react';

/**
 * @component PhoneFrame — Mobile phone frame wrapper matching the skriibe prototype exactly.
 */
export const PhoneFrame = ({ children }) => {
  return (
    <div style={{
      width: '335px',
      height: '680px',
      background: 'var(--ink2)',
      borderRadius: '48px',
      border: '1.5px solid var(--ink5)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 48px 96px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '110px',
        height: '34px',
        background: 'var(--ink2)',
        borderRadius: '0 0 22px 22px',
        zIndex: 10
      }} />
      <div style={{
        height: '44px',
        padding: '0 22px 8px',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        flexShrink: 0,
        fontFamily: 'var(--font-mono)',
        fontSize: '10px',
        color: 'var(--g4)'
      }}>
        <span>9:41</span>
        <span>skriibe</span>
      </div>
      <div style={{
        flex: 1,
        overflowY: 'auto',
        position: 'relative'
      }}>
        {children}
      </div>
      <div style={{
        height: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <div style={{
          width: '110px',
          height: '4px',
          background: 'var(--ink5)',
          borderRadius: '2px'
        }} />
      </div>
    </div>
  );
};
