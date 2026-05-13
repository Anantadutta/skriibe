import React from 'react';

/**
 * @component SLABadge — Shows time remaining on creator's 24hr reply SLA with auto-colour.
 */
export const SLABadge = ({ hoursRemaining }) => {
  let style = {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    padding: '4px 10px',
    borderRadius: '20px',
    fontWeight: 600
  };

  if (hoursRemaining > 16) {
    style.background = 'var(--gdim)';
    style.color = 'var(--green)';
    style.border = '1px solid rgba(34,197,94,.2)';
  } else if (hoursRemaining >= 6) {
    style.background = 'var(--adim)';
    style.color = 'var(--amber)';
    style.border = '1px solid rgba(245,158,11,.2)';
  } else {
    style.background = 'var(--rdim)';
    style.color = 'var(--red)';
    style.border = '1px solid rgba(239,68,68,.2)';
  }

  return (
    <span style={style}>
      {hoursRemaining}h left
    </span>
  );
};
