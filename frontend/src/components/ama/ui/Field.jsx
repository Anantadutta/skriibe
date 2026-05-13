import React, { useState } from 'react';

/**
 * @component Field — Styled input field container for AMA forms.
 */
export const Field = ({ label, value, placeholder, onChange, type = 'text', required }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div 
      style={{
        background: 'var(--ink3)',
        border: `1px solid ${isFocused ? 'var(--blue)' : 'var(--ink5)'}`,
        borderRadius: 'var(--radius-md)',
        padding: '14px 16px',
        transition: 'border-color 0.15s ease'
      }}
    >
      <label style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '9px',
        color: 'var(--g3)',
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        marginBottom: '6px',
        display: 'block'
      }}>
        {label}
      </label>
      {onChange || type !== 'text' ? (
        <input
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            fontSize: '14px',
            color: 'var(--white)',
            fontWeight: 500,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            width: '100%',
            fontFamily: 'var(--font-body)'
          }}
        />
      ) : (
        <div style={{
            fontSize: '14px',
            color: placeholder ? 'var(--g4)' : 'var(--white)',
            fontWeight: 500,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            width: '100%',
            fontStyle: placeholder ? 'italic' : 'normal',
            fontFamily: 'var(--font-body)'
        }}>
            {value}
        </div>
      )}
    </div>
  );
};
