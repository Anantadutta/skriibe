const axios = require('axios');

const sendOTPviaMSG91 = async (phone, otp) => {
  const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
  const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID;

  if (!MSG91_AUTH_KEY || MSG91_AUTH_KEY === 'mock') {
    console.log(`[MOCK MSG91] OTP for ${phone}: ${otp}`);
    return;
  }

  try {
    const url = `https://control.msg91.com/api/v5/otp?template_id=${MSG91_TEMPLATE_ID}&mobile=91${phone}&authkey=${MSG91_AUTH_KEY}&otp=${otp}`;
    const response = await axios.get(url);
    const fs = require('fs');
    fs.writeFileSync('msg91_debug.txt', JSON.stringify(response.data, null, 2));
    console.log('MSG91 response:', response.data);
  } catch (err) {
    const fs = require('fs');
    fs.writeFileSync('msg91_debug.txt', JSON.stringify(err.response?.data || err.message, null, 2));
    console.error('Failed to send MSG91 OTP:', err.response?.data || err.message);
    throw err;
  }
};

module.exports = { sendOTPviaMSG91 };
