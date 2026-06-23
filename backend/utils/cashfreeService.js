const axios = require('axios');

/**
 * Calls the Cashfree Bank Account Verification Sync API.
 * @param {Object} params
 * @param {string} params.bank_account
 * @param {string} params.ifsc
 * @param {string} params.name (optional)
 * @param {string} params.phone (optional)
 * @returns {Promise<Object>} The response data from Cashfree.
 */
const verifyBankAccount = async ({ bank_account, ifsc, name, phone }) => {
  const isProd = process.env.CASHFREE_ENV === 'production';
  const baseUrl = isProd 
    ? 'https://api.cashfree.com/verification/bank-account/sync' 
    : 'https://sandbox.cashfree.com/verification/bank-account/sync';

  const headers = {
    'Content-Type': 'application/json',
    'x-client-id': process.env.CASHFREE_CLIENT_ID,
    'x-client-secret': process.env.CASHFREE_CLIENT_SECRET
  };

  try {
    if (isProd && process.env.CASHFREE_PRIVATE_KEY) {
      const crypto = require('crypto');
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const dataToEncrypt = `${process.env.CASHFREE_CLIENT_ID}.${timestamp}`;
      
      // Support keys pasted directly into .env (which might have literal \n strings)
      let publicKey = process.env.CASHFREE_PRIVATE_KEY.replace(/\\n/g, '\n').trim();
      
      // Add PEM headers if missing
      if (!publicKey.includes('BEGIN')) {
        publicKey = `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`;
      }
      
      try {
        // Cashfree requires the payload to be encrypted using the provided Public Key
        const buffer = Buffer.from(dataToEncrypt, 'utf8');
        const encrypted = crypto.publicEncrypt(
          {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
          },
          buffer
        );
        const signature = encrypted.toString('base64');
        
        headers['x-cf-signature'] = signature;
        headers['x-request-id'] = `req_${timestamp}`;
      } catch (cryptoErr) {
        console.warn('Failed to generate x-cf-signature. Check if CASHFREE_PRIVATE_KEY is a valid RSA Public Key.', cryptoErr.message);
        // Will continue without signature. If Cashfree requires it, it will return a 4xx error.
      }
    }
    const response = await axios.post(
      baseUrl,
      {
        bank_account,
        ifsc,
        name,
        phone
      },
      { headers }
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      // Return the error from Cashfree (e.g. 400 Bad Request) so we can process it
      return error.response.data;
    }
    throw error;
  }
};

/**
 * Calls the Cashfree PAN Verification Sync API.
 * @param {Object} params
 * @param {string} params.pan
 * @param {string} params.name
 * @returns {Promise<Object>} The response data from Cashfree.
 */
const verifyPan = async ({ pan, name }) => {
  const isProd = process.env.CASHFREE_ENV === 'production';
  const baseUrl = isProd 
    ? 'https://api.cashfree.com/verification/pan' 
    : 'https://sandbox.cashfree.com/verification/pan';

  const headers = {
    'Content-Type': 'application/json',
    'x-client-id': process.env.CASHFREE_CLIENT_ID,
    'x-client-secret': process.env.CASHFREE_CLIENT_SECRET
  };

  try {
    if (isProd && process.env.CASHFREE_PRIVATE_KEY) {
      const crypto = require('crypto');
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const dataToEncrypt = `${process.env.CASHFREE_CLIENT_ID}.${timestamp}`;
      
      // Support keys pasted directly into .env (which might have literal \n strings)
      let publicKey = process.env.CASHFREE_PRIVATE_KEY.replace(/\\n/g, '\n').trim();
      
      // Add PEM headers if missing
      if (!publicKey.includes('BEGIN')) {
        publicKey = `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`;
      }
      
      try {
        // Cashfree requires the payload to be encrypted using the provided Public Key
        const buffer = Buffer.from(dataToEncrypt, 'utf8');
        const encrypted = crypto.publicEncrypt(
          {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
          },
          buffer
        );
        const signature = encrypted.toString('base64');
        
        headers['x-cf-signature'] = signature;
        headers['x-request-id'] = `req_${timestamp}`;
      } catch (cryptoErr) {
        console.warn('Failed to generate x-cf-signature. Check if CASHFREE_PRIVATE_KEY is a valid RSA Public Key.', cryptoErr.message);
        // Will continue without signature. If Cashfree requires it, it will return a 4xx error.
      }
    }
    const response = await axios.post(
      baseUrl,
      {
        pan,
        name
      },
      { headers }
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      // Return the error from Cashfree
      return error.response.data;
    }
    throw error;
  }
};

module.exports = {
  verifyBankAccount,
  verifyPan
};
