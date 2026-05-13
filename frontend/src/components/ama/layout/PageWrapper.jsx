import React from 'react';

/**
 * @component PageWrapper — Full-screen wrapper for AMA dashboard and admin pages.
 */
export const PageWrapper = ({ children }) => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--ink)',
      color: 'var(--white)',
      fontFamily: 'var(--font-body)'
    }}>
      {children}
    </div>
  );
};
