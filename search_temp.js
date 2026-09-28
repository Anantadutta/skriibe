const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.resolve(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git') && !file.includes('.next')) {
            results = results.concat(walk(file));
        } else if (stat && stat.isFile() && file.match(/\.(tsx|jsx|ts|js|html)$/)) {
            const content = fs.readFileSync(file, 'utf8');
            if (content.includes('Join as a') || content.includes('Create an account')) {
                results.push(file);
            }
        }
    });
    return results;
}
console.log(walk('./frontend/src'));
