const https = require('https');

https.get('https://api.skriibe.com/api/auth/status', (res) => {
  console.log('Status code:', res.statusCode);
  res.on('data', d => process.stdout.write(d));
}).on('error', (e) => {
  console.error(e);
});
