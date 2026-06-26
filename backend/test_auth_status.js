const axios = require('axios');
const jwt = require('jsonwebtoken');

async function test() {
  try {
    // Generate a mock token exactly like the backend does
    const token = jwt.sign(
      { creatorId: '60d5ecb54b204200155b8a00', email: 'test@example.com' },
      'secret', // fallback secret
      { expiresIn: '7d' }
    );

    console.log("Mock token generated:", token);

    // Call the endpoint
    const res = await axios.get('http://localhost:5000/api/auth/status', {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("Response Status:", res.status);
    console.log("Response Data:", res.data);
  } catch (err) {
    console.error("Error calling endpoint:", err.response ? err.response.status + " " + err.response.data : err.message);
  }
}

test();
