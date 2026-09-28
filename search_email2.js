const fs = require('fs');
const path = require('path');
function walk(dir) {
    let list;
    try { list = fs.readdirSync(dir); } catch(e){ return; }
    list.forEach(file => {
        file = path.join(dir, file);
        let stat;
        try { stat = fs.statSync(file); } catch(e){ return; }
        if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git')) {
            walk(file);
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            try {
                const content = fs.readFileSync(file, 'utf8');
                if (content.includes('EMAIL ID')) {
                    console.log(file);
                }
            } catch(e){}
        }
    });
}
walk('c:/Users/dutta/Downloads/skriibe-main');
