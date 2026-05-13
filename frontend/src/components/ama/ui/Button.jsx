import React from 'react';

/**
 * @component Button — Primary action component for skriibe AMA. Variants: primary, secondary, danger, success.
 */
export const Button = ({ variant = 'primary', disabled, onClick, children, ...props }) => {
  const baseStyle = {
    borderRadius: 'var(--radius-md)',
    padding: '15px',
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
    primary: { background: 'var(--blue)', color: 'var(--ink)', fontWeight: 700 },
    secondary: { background: 'var(--ink3)', color: 'var(--white)', border: '1px solid var(--ink5)' },
    danger: { background: 'var(--rdim)', color: 'var(--red)', border: '1px solid rgba(239,68,68,.2)' },
    success: { background: 'var(--gdim)', color: 'var(--green)', border: '1px solid rgba(34,197,94,.2)' }
  };

  const [hovered, setHovered] = React.useState(false);

  const style = {
    ...baseStyle,
    ...variants[variant],
    ...(hovered && !disabled && variant === 'primary' ? { background: 'var(--blue2)', transform: 'translateY(-1px)' } : {}),
    ...(hovered && !disabled && variant === 'secondary' ? { borderColor: 'var(--blue)', color: 'var(--blue)' } : {})
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
