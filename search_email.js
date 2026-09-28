const fs = require('fs');
const path = require('path');
function walk(dir) {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory() && !file.includes('node_modules')) {
            walk(file);
        } else if (file.endsWith('.jsx')) {
            const content = fs.readFileSync(file, 'utf8');
            if (content.includes('EMAIL ID')) {
                console.log(file);
            }
        }
    });
}
walk('./frontend/src');
