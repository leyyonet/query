import * as fs from "node:fs";
import path from "node:path";

const dir = __dirname.split('/')
    .filter(part => !!part)
    .filter(part => part !== 'commands')
    .pop();
const src = path.normalize(__dirname + '../../src/assets');
if (fs.existsSync(src)) {
    if (fs.existsSync(path.normalize(__dirname + '../../dist'))) {
        const dest = path.normalize(__dirname + '../../dist/assets');
        fs.cpSync(src, dest, {recursive: true});
        console.log(`[${dir}]: \x1b[32massets are copied\x1b[0m`);
    }
    else {
        console.warn(`[${dir}]: \x1b[33mdist folder is not created yet\x1b[0m`);
    }
}
else {
    console.warn(`[${dir}]: \x1b[34massets folder does not exists in src\x1b[0m`);
}
