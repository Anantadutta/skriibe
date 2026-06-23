require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const EmailOtp = require('./models/EmailOtp');
const Fan = require('./models/Fan');

const TEST_EMAIL = 'test_brevo_otp@example.com';
const API_URL = 'http://localhost:5000/api/email-verification';

async function runTests() {
  console.log('--- Starting Email Verification Tests ---');

  // Connect DB directly to verify state
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  // Clean up previous test data
  await EmailOtp.deleteMany({ email: TEST_EMAIL });
  await Fan.deleteMany({ email: TEST_EMAIL });

  // Create a dummy Fan to test isEmailVerified flip
  await Fan.create({ email: TEST_EMAIL, password: 'password123', name: 'Test User' });
  console.log('Test fan created');

  try {
    // 1. Test sending code
    console.log('1. Testing Send Code...');
    let res = await axios.post(`${API_URL}/send-code`, { email: TEST_EMAIL });
    console.log('Send Response:', res.data);

    // 2. Test Rate Limiting (30s cooldown)
    console.log('2. Testing Rate Limiting (Cooldown)...');
    try {
      await axios.post(`${API_URL}/send-code`, { email: TEST_EMAIL });
      throw new Error('Rate limit failed to block request');
    } catch (err) {
      if (err.response && err.response.status === 429) {
        console.log('Rate limit correctly blocked second request:', err.response.data.message);
      } else {
        throw err;
      }
    }

    // Retrieve code from DB
    let otpRecord = await EmailOtp.findOne({ email: TEST_EMAIL });
    console.log('OTP generated:', otpRecord.code);

    // 3. Test Attempt Limiting (5 wrong tries)
    console.log('3. Testing Attempt Limiting...');
    for (let i = 1; i <= 5; i++) {
      try {
        await axios.post(`${API_URL}/verify-code`, { email: TEST_EMAIL, code: '000000' });
      } catch (err) {
        if (i < 5) {
          console.log(`Failed attempt ${i} caught correctly:`, err.response.data.message);
        } else {
          console.log('Attempt 5 blocked and invalidated code:', err.response.data.message);
        }
      }
    }

    // Verify code was cleared after 5 attempts
    otpRecord = await EmailOtp.findOne({ email: TEST_EMAIL });
    if (otpRecord.code !== null) {
      throw new Error('Code was not cleared after 5 attempts!');
    }

    // 4. Test Success Path
    console.log('4. Testing Success Path...');
    // We bypass cooldown manually in DB for the test to send a new code
    otpRecord.lastSentAt = new Date(Date.now() - 60000);
    await otpRecord.save();

    res = await axios.post(`${API_URL}/send-code`, { email: TEST_EMAIL });
    otpRecord = await EmailOtp.findOne({ email: TEST_EMAIL });
    
    console.log('New OTP generated:', otpRecord.code);
    
    res = await axios.post(`${API_URL}/verify-code`, { email: TEST_EMAIL, code: otpRecord.code });
    console.log('Verify Response:', res.data);

    // Check Fan collection
    const fan = await Fan.findOne({ email: TEST_EMAIL });
    if (!fan.isEmailVerified) {
      throw new Error('Fan isEmailVerified was not updated to true!');
    }
    console.log('Fan isEmailVerified successfully updated to true!');

    // 5. Test Expiry
    console.log('5. Testing Expiry...');
    otpRecord.lastSentAt = new Date(Date.now() - 60000);
    await otpRecord.save();
    await axios.post(`${API_URL}/send-code`, { email: TEST_EMAIL });
    otpRecord = await EmailOtp.findOne({ email: TEST_EMAIL });

    // Manually expire the code
    otpRecord.codeExpiresAt = new Date(Date.now() - 1000);
    await otpRecord.save();

    try {
      await axios.post(`${API_URL}/verify-code`, { email: TEST_EMAIL, code: otpRecord.code });
      throw new Error('Expired code was accepted!');
    } catch (err) {
      console.log('Expired code correctly rejected:', err.response.data.message);
    }

    console.log('--- All Tests Passed Successfully ---');

  } catch (err) {
    console.error('Test Failed:', err.message || err);
  } finally {
    // Cleanup
    await EmailOtp.deleteMany({ email: TEST_EMAIL });
    await Fan.deleteMany({ email: TEST_EMAIL });
    mongoose.connection.close();
  }
}

runTests();
