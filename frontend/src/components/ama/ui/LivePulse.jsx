import React from 'react';

/**
 * @component LivePulse — Animated green availability indicator dot.
 */
export const LivePulse = () => {
  return (
    <>
      <style>
        {`
          @keyframes lp {
            0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
            50% { box-shadow: 0 0 0 5px rgba(34,197,94,0); }
          }
        `}
      </style>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: 'var(--green)',
        display: 'inline-block',
        animation: 'lp 2s ease infinite'
      }} />
    </>
  );
};
