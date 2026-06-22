import { describe, it } from 'node:test';
import assert from 'node:assert';
import { validatePhoneNumber, normalizePhoneNumber } from './phoneValidation.js';

describe('Phone Number Validation', () => {
  it('validates IN properly', () => {
    assert.strictEqual(validatePhoneNumber('9876543210', 'IN'), null); // Valid
    assert.strictEqual(validatePhoneNumber('98765', 'IN'), 'Must be exactly 10 digits'); // Invalid length
  });

  it('validates US properly', () => {
    assert.strictEqual(validatePhoneNumber('2025550111', 'US'), null); // Valid
    assert.strictEqual(validatePhoneNumber('202555', 'US'), 'Must be exactly 10 digits'); // Invalid
  });

  it('validates CA properly', () => {
    assert.strictEqual(validatePhoneNumber('4165550111', 'CA'), null); // Valid
    assert.strictEqual(validatePhoneNumber('41655', 'CA'), 'Must be exactly 10 digits'); // Invalid
  });

  it('validates GB properly', () => {
    // libphonenumber-js correctly validates +447400123456
    assert.strictEqual(validatePhoneNumber('7400123456', 'GB'), null); // Valid mobile
    assert.strictEqual(validatePhoneNumber('123', 'GB'), 'Invalid phone number pattern'); // Invalid
  });

  it('validates AE properly', () => {
    assert.strictEqual(validatePhoneNumber('501234567', 'AE'), null); // Valid UAE mobile
    assert.strictEqual(validatePhoneNumber('12345', 'AE'), 'Invalid phone number pattern'); // Invalid
  });
});

describe('Phone Number Normalization', () => {
  it('strips non-digits for all countries', () => {
    assert.strictEqual(normalizePhoneNumber('(202) 555-0111', 'US'), '2025550111');
    assert.strictEqual(normalizePhoneNumber('98 765 43210', 'IN'), '9876543210');
  });

  it('strips leading zeros for GB and AE', () => {
    // GB leading zero
    assert.strictEqual(normalizePhoneNumber('07400123456', 'GB'), '7400123456');
    // AE leading zero
    assert.strictEqual(normalizePhoneNumber('0501234567', 'AE'), '501234567');
  });

  it('preserves leading zeros for other countries if typed', () => {
    // US or IN generally do not use leading zeros like this, but if typed it shouldn't be automatically stripped by country rules
    assert.strictEqual(normalizePhoneNumber('02025550111', 'US'), '02025550111');
  });
});
