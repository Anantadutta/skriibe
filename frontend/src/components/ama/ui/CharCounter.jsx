import React from 'react';

/**
 * @component CharCounter — Live character count display for textareas.
 */
export const CharCounter = ({ count, min, max }) => {
  return (
    <span style={{
      fontFamily: 'var(--font-mono)',
      fontSize: '11px',
      textAlign: 'right',
      display: 'block',
      color: count < min ? 'var(--red)' : 'var(--green)'
    }}>
      {count} / {max}
    </span>
  );
};
