const fs = require('fs');
try {
  require('./backend/routes/admin.js');
  console.log('No syntax errors in admin.js');
} catch (e) {
  console.error('Syntax error:', e);
}
