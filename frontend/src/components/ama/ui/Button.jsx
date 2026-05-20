import React from 'react';

/**
 * @component Button — Primary action component for skriibe AMA. Variants: primary, secondary, danger, success.
 */
export const Button = ({ variant = 'primary', disabled, onClick, children, ...props }) => {
  const baseStyle = {
    borderRadius: '14px',
    padding: '12px',
    fontSize: '14px',
    width: '100%',
    fontFamily: 'var(--font-body)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s ease',
    opacity: disabled ? 0.4 : 1,
    pointerEvents: disabled ? 'none' : 'auto',
    border: 'none',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  };

  const variants = {
    primary: { background: '#3DD9FF', color: '#000000', fontWeight: 500 },
    secondary: { background: 'var(--ink3)', color: 'var(--white)', border: '1px solid var(--ink5)', padding: '12px' },
    danger: { background: 'var(--rdim)', color: 'var(--red)', border: '1px solid rgba(239,68,68,.2)', padding: '12px' },
    success: { background: 'var(--gdim)', color: 'var(--green)', border: '1px solid rgba(34,197,94,.2)', padding: '12px' }
  };

  const [hovered, setHovered] = React.useState(false);

  const style = {
    ...baseStyle,
    ...variants[variant],
    ...(hovered && !disabled && variant === 'primary' ? { background: '#2bc8ee', transform: 'translateY(-1px)' } : {}),
    ...(hovered && !disabled && variant === 'secondary' ? { borderColor: '#3DD9FF', color: '#3DD9FF' } : {})
  };

  return (
    <button
      style={style}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      {...props}
    >
      {children}
    </button>
  );
};
