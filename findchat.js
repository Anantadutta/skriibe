const fs = require('fs');
const path = require('path');
function search(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.next') search(fullPath);
        } else {
            if (fullPath.endsWith('.js') || fullPath.endsWith('.ts')) {
                const content = fs.readFileSync(fullPath, 'utf8');
                if (content.includes('fan_recharging_pause') || content.includes('FREE_TRIAL_ENDED')) {
                    console.log(fullPath);
                }
            }
        }
    }
}
search('./backend');
