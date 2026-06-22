import { parsePhoneNumberFromString } from 'libphonenumber-js';

export const COUNTRIES = [
  { code: 'IN', dialCode: '+91', name: 'India', flag: '🇮🇳' },
  { code: 'US', dialCode: '+1', name: 'USA', flag: '🇺🇸' },
  { code: 'CA', dialCode: '+1', name: 'Canada', flag: '🇨🇦' },
  { code: 'GB', dialCode: '+44', name: 'UK', flag: '🇬🇧' },
  { code: 'AE', dialCode: '+971', name: 'UAE', flag: '🇦🇪' }
];

export const getCurrencySymbol = (phoneStr) => {
  if (!phoneStr) return '₹';
  const parsed = parsePhoneNumberFromString(phoneStr.startsWith('+') ? phoneStr : '+' + phoneStr);
  if (parsed && parsed.country) {
    switch (parsed.country) {
      case 'US': return '$';
      case 'CA': return 'C$';
      case 'GB': return '£';
      case 'AE': return 'AED ';
      case 'IN': return '₹';
      default: return '₹';
    }
  }
  return '₹';
};

export const normalizePhoneNumber = (rawInput, countryCode) => {
  let cleaned = rawInput.replace(/[^0-9]/g, '');
  if (['GB', 'AE'].includes(countryCode) && cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  return cleaned;
};

export const validatePhoneNumber = (localValue, countryCode) => {
  const dial = COUNTRIES.find(c => c.code === countryCode)?.dialCode;
  if (!dial) return 'Invalid country';

  const phoneNumber = parsePhoneNumberFromString(`${dial}${localValue}`);
  
  if (['IN', 'US', 'CA'].includes(countryCode)) {
    if (localValue.length !== 10) return 'Must be exactly 10 digits';
  } else {
    if (!phoneNumber || !phoneNumber.isValid() || phoneNumber.country !== countryCode) {
      return 'Invalid phone number pattern';
    }
  }
  return null; // Valid
};
