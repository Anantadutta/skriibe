const { exec } = require('child_process');
exec('npm run build', { cwd: 'c:\\Users\\dutta\\Downloads\\skriibe-main\\skriibe-main\\frontend' }, (error, stdout, stderr) => {
  console.log('STDOUT:', stdout);
  console.log('STDERR:', stderr);
  if (error) {
    console.error('ERROR:', error);
  }
});
