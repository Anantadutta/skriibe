const { exec } = require('child_process');
const fs = require('fs');

exec('node backend/routes/admin.js', (error, stdout, stderr) => {
  fs.writeFileSync('test-output.txt', `ERROR:\n${error}\nSTDOUT:\n${stdout}\nSTDERR:\n${stderr}`);
});
