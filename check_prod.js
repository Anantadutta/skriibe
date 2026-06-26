const https = require('https');

https.get('https://skriibe.com/api/auth/status', (res) => {
  console.log('Status code:', res.statusCode);
}).on('error', (e) => {
  console.error(e);
});
