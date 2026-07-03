const axios = require('axios');

async function testAdmin() {
  try {
    const res = await axios.get('http://localhost:5000/api/admin/creators', {
      headers: {
        // Mocking admin authentication if possible, or just seeing if we get a 401
      }
    });
    console.log("Success! Data length:", res.data.length);
  } catch (err) {
    console.log("Error:", err.response ? err.response.status : err.message);
  }
}
testAdmin();
