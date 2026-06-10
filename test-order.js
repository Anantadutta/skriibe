const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('https://skriibe-backend.onrender.com/api/create-order', {
      amount: 4900
    });
    console.log(res.data);
  } catch (e) {
    console.log(e.response ? e.response.data : e.message);
  }
}
test();
