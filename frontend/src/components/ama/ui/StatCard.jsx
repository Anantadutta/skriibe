import React from 'react';

/**
 * @component StatCard — Displays a single creator stat with value and label.
 */
export const StatCard = ({ value, label }) => {
  return (
    <div style={{
      background: 'var(--ink3)',
      border: '1px solid var(--ink4)',
      borderRadius: '12px',
      padding: '12px',
      textAlign: 'center',
      minWidth: '72px'
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '20px',
        fontWeight: 600,
        color: 'var(--white)'
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '9px',
        color: 'var(--g3)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        marginTop: '4px',
        display: 'block'
      }}>
        {label}
      </div>
    </div>
  );
};
