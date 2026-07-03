require('dotenv').config();
const axios = require('axios');

const testApiLogin = async () => {
  try {
    console.log('Logging in to get a fresh token...');
    // Log in as Annie using the known test password (usually Test@123 or whatever they use).
    // Or we can just bypass login by signing our own token.
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { creatorId: '6a439f5f270f621b4b6d61b8', email: 'duttananta@gmail.com', role: 'creator' },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '30d' }
    );
    
    console.log('Calling /creators/me with fresh token...');
    try {
      const res = await axios.get('http://localhost:5000/api/creators/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('SUCCESS! /creators/me works. Output:', Object.keys(res.data.creator));
    } catch (e) {
      console.log('CRASH on /creators/me! Error code:', e.response?.status);
      console.log('Error message:', e.response?.data);
    }

    console.log('Calling /creator/me with fresh token...');
    try {
      const res2 = await axios.get('http://localhost:5000/api/creator/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('SUCCESS! /creator/me works. Output:', Object.keys(res2.data.creator));
    } catch (e) {
      console.log('CRASH on /creator/me! Error code:', e.response?.status);
      console.log('Error message:', e.response?.data);
    }
  } catch (err) {
    console.error('Fatal error:', err.message);
  }
};
testApiLogin();
