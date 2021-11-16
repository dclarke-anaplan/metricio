import paths from './config/paths';
import path from 'path';
import fs from 'fs';

let fileContents = "module.exports = {";

fs.readdirSync(paths.jobs)
  .filter(f => f.includes('.js'))
  .forEach(f => {
    const fileName = path.basename(f, '.js');
    fileContents += ` '${fileName}': require('${path.join(paths.jobs, f)}'),`   
  }); 

fileContents += " };";

const targetDir = paths.dist + '/server/jobs/';

try {
    fs.mkdirSync(targetDir, { recursive: true });
} catch (err) {
    if (err.code === 'EEXIST') { // curDir already exists!
        console.log("Directory already exists - continuing")
        // Do nothing as we're OK
    } else {
        throw err;
    }
}

const fileName = targetDir + '/jobs.js';

fs.writeFileSync(fileName, fileContents);

while(!fs.existsSync(fileName)) { /* Wait until the file exists */ }

console.log(`Successfully extracted jobs under "${paths.jobs}" and wrote file to "${fileName}"`);
