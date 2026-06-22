import React, { useState, useRef } from 'react';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { normalizePhoneNumber, validatePhoneNumber } from '../../../utils/phoneValidation';

const COUNTRIES = [
  { code: 'IN', dialCode: '+91', name: 'India', flag: '🇮🇳' },
  { code: 'US', dialCode: '+1', name: 'USA', flag: '🇺🇸' },
  { code: 'CA', dialCode: '+1', name: 'Canada', flag: '🇨🇦' },
  { code: 'GB', dialCode: '+44', name: 'UK', flag: '🇬🇧' },
  { code: 'AE', dialCode: '+971', name: 'UAE', flag: '🇦🇪' }
];

/**
 * @component Field — Styled input field container for AMA forms.
 */
export const Field = ({ label, value, placeholder, onChange, type = 'text', required, subtitle }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('IN'); // Default IN as requested
  const [isTouched, setIsTouched] = useState(false);
  const inputRef = useRef(null);

  const handleContainerClick = (e) => {
    // Prevent stealing focus if the user clicks on the select dropdown
    if (e.target.tagName && e.target.tagName.toLowerCase() === 'select') return;
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  let activeCountry = selectedCountry;
  let localValue = value || '';

  if (type === 'phone' && value && value.startsWith('+')) {
    const phoneNumber = parsePhoneNumberFromString(value);
    if (phoneNumber && phoneNumber.country) {
      activeCountry = phoneNumber.country;
      localValue = phoneNumber.nationalNumber;
    } else {
      const matchedCountry = COUNTRIES.find(c => value.startsWith(c.dialCode));
      if (matchedCountry) {
        activeCountry = matchedCountry.code;
        localValue = value.substring(matchedCountry.dialCode.length);
      }
    }
  } else if (type === 'phone' && value && !value.startsWith('+')) {
     localValue = value.replace(/[^0-9]/g, '');
  }

  let errorMsg = null;
  if (type === 'phone' && isTouched && localValue) {
    errorMsg = validatePhoneNumber(localValue, activeCountry);
  }

  const handlePhoneChange = (e) => {
    const raw = normalizePhoneNumber(e.target.value, activeCountry);
    const dial = COUNTRIES.find(c => c.code === activeCountry).dialCode;
    const newE164 = raw ? `${dial}${raw}` : '';
    onChange({ target: { value: newE164 } });
  };

  const handleCountryChange = (e) => {
    const newCountryCode = e.target.value;
    setSelectedCountry(newCountryCode);
    const dial = COUNTRIES.find(c => c.code === newCountryCode).dialCode;
    const newE164 = localValue ? `${dial}${localValue}` : '';
    onChange({ target: { value: newE164 } });
  };

  return (
    <div 
      onClick={handleContainerClick}
      style={{
        background: '#0f0f1a',
        border: `1px solid ${isFocused ? '#7c3aed' : errorMsg ? '#ef4444' : 'rgba(255, 255, 255, 0.08)'}`,
        borderRadius: '12px',
        padding: '14px 16px',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isFocused ? '0 0 10px rgba(124, 58, 237, 0.3)' : 'inset 0 2px 4px rgba(0,0,0,0.4)',
        boxSizing: 'border-box',
        width: '100%',
        cursor: 'text'
      }}
    >
      <label style={{
        fontFamily: 'monospace, var(--font-mono)',
        fontSize: '10px',
        color: errorMsg ? '#ef4444' : '#06b6d4',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginBottom: subtitle ? '4px' : '6px',
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
      {subtitle && (
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: '12px',
          color: '#94a3b8',
          marginBottom: '8px',
          textAlign: 'left',
          textTransform: 'none'
        }}>
          {subtitle}
        </div>
      )}
      
      {onChange || type !== 'text' ? (
        type === 'phone' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              padding: '4px 8px',
            }}>
              <select
                value={activeCountry}
                onChange={handleCountryChange}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  outline: 'none',
                  fontSize: '14px',
                  cursor: 'pointer',
                  appearance: 'none',
                  fontFamily: 'var(--font-body)',
                  paddingRight: '8px'
                }}
              >
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code} style={{ color: '#000' }}>
                    {c.flag} {c.dialCode}
                  </option>
                ))}
              </select>
            </div>
            <input
              ref={inputRef}
              type="tel"
              value={localValue}
              onChange={handlePhoneChange}
              required={required}
              onFocus={() => setIsFocused(true)}
              onBlur={() => { setIsFocused(false); setIsTouched(true); }}
              placeholder={placeholder}
              style={{
                flex: 1,
                fontSize: '14px',
                color: '#ffffff',
                fontWeight: 500,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontFamily: 'var(--font-body)'
              }}
            />
          </div>
        ) : (
          <input
            ref={inputRef}
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
        )
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
      
      {errorMsg && (
        <div style={{
          color: '#ef4444',
          fontSize: '11px',
          marginTop: '8px',
          fontFamily: 'var(--font-body)',
          fontWeight: 500
        }}>
          {errorMsg}
        </div>
      )}
    </div>
  );
};
