const fs = require('fs');

const filesToUpdate = [
  './frontend/src/App.jsx',
  './frontend/src/components/NewFansOnly.jsx',
  './frontend/src/components/StopTypingSection.jsx'
];

filesToUpdate.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (file.includes('App.jsx')) {
    content = content.replace(/to=\{isAuthenticated \? "\/explore" : "\/fan\/login"\}/g, 'to="/explore"');
  } else {
    content = content.replace(/to="\/fan\/login"/g, 'to="/explore"');
  }
  fs.writeFileSync(file, content);
  console.log('Updated', file);
});
