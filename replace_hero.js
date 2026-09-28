const fs = require('fs'); 
const f = './frontend/src/components/Hero.jsx'; 
let c = fs.readFileSync(f, 'utf8'); 
c = c.replace(/to="\/fan\/login"/g, 'to="/explore"'); 
fs.writeFileSync(f, c);
