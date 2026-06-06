import React, { useState } from 'react';

/**
 * @component Field — Styled input field container for AMA forms.
 */
export const Field = ({ label, value, placeholder, onChange, type = 'text', required }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div 
      style={{
        background: '#0f0f1a',
        border: `1px solid ${isFocused ? '#7c3aed' : 'rgba(255, 255, 255, 0.08)'}`,
        borderRadius: '12px',
        padding: '14px 16px',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isFocused ? '0 0 10px rgba(124, 58, 237, 0.3)' : 'inset 0 2px 4px rgba(0,0,0,0.4)',
        boxSizing: 'border-box',
        width: '100%'
      }}
    >
      <label style={{
        fontFamily: 'monospace, var(--font-mono)',
        fontSize: '10px',
        color: '#06b6d4',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginBottom: '6px',
        display: 'block',
        fontWeight: 700,
        textAlign: 'left'
      }}>
        {typeof label === 'string' && label.includes('*') ? (
          <>
            {label.split('*')[0]}<span style={{ color: '#ef4444' }}>*</span>{label.split('*')[1]}
          </>
        ) : (
          label
        )}
      </label>
      {onChange || type !== 'text' ? (
        <input
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          style={{
            fontSize: '14px',
            color: '#ffffff',
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
            color: placeholder ? '#94a3b8' : '#ffffff',
            fontWeight: 500,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            width: '100%',
            fontStyle: placeholder ? 'italic' : 'normal',
            fontFamily: 'var(--font-body)',
            textAlign: 'left'
        }}>
            {value}
        </div>
      )}
    </div>
  );
};
