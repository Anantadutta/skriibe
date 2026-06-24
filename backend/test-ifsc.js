require('dotenv').config({ path: 'c:\\Users\\dutta\\Downloads\\skriibe-main\\skriibe-main\\backend\\.env' });
const axios = require('axios');

async function testIfsc(ifsc) {
  const isProd = process.env.CASHFREE_ENV === 'production';
  const baseUrl = isProd 
    ? 'https://api.cashfree.com/verification/ifsc' 
    : 'https://sandbox.cashfree.com/verification/ifsc';

  const headers = {
    'Content-Type': 'application/json',
    'x-client-id': process.env.CASHFREE_CLIENT_ID,
    'x-client-secret': process.env.CASHFREE_CLIENT_SECRET
  };

  const payload = {
    verification_id: `ifsc_${Date.now()}`,
    ifsc: ifsc
  };

  try {
    const response = await axios.post(baseUrl, payload, { headers });
    console.log(`[Valid API Test - ${ifsc}] Response:`, JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response) {
      console.log(`[Invalid API Test - ${ifsc}] Error Response:`, JSON.stringify(error.response.data, null, 2));
    } else {
      console.log(`[Error - ${ifsc}]`, error.message);
    }
  }
}

async function run() {
  console.log('Testing valid IFSC...');
  await testIfsc('HDFC0000001');

  console.log('\nTesting invalid IFSC...');
  await testIfsc('ABCD0999999');
}

run();
