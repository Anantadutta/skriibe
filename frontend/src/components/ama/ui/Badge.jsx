import React from 'react';

/**
 * @component Badge — Coloured label chip. Variants: blue, green, red, amber, purple.
 */
export const Badge = ({ variant = 'blue', children }) => {
  const baseStyle = {
    display: 'inline-block',
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    padding: '3px 10px',
    borderRadius: '20px',
    fontWeight: 700,
    letterSpacing: '0.05em'
  };

  const variants = {
    blue: { background: 'var(--bdim)', color: 'var(--blue)' },
    green: { background: 'var(--gdim)', color: 'var(--green)' },
    red: { background: 'var(--rdim)', color: 'var(--red)' },
    amber: { background: 'var(--adim)', color: 'var(--amber)' },
    purple: { background: 'var(--pdim)', color: 'var(--purple)' }
  };

  return (
    <span style={{ ...baseStyle, ...variants[variant] }}>
      {children}
    </span>
  );
};
