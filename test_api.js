const axios = require('axios');
axios.get('http://localhost:5000/api/admin/transactions')
  .then(res => console.log('Transactions fetched successfully, count:', res.data.length))
  .catch(err => console.error('Error fetching transactions:', err.message, err.response?.data));
