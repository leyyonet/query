import * as fs from "node:fs";
import path from "node:path";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const dir = __dirname.split('/')
    .filter(part => !!part)
    .filter(part => part !== 'commands')
    .pop();
const src = path.normalize(__dirname + '../../src/assets');
if (fs.existsSync(src)) {
    if (fs.existsSync(path.normalize(__dirname + '../../dist'))) {
        const dest = path.normalize(__dirname + '../../dist/assets');
        const files = fs.readdirSync(src);
        if (files.length < 1 || (files.length === 1 && files[0] === '.gitkeep')) {
            console.log(`\x1b[33m[${dir}]: assets folder is empty\x1b[0m`);
        }
        else {
            fs.cpSync(src, dest, {recursive: true});
            console.log(`\x1b[32m[${dir}]: assets are copied\x1b[0m`);
        }
    }
    else {
        console.warn(`\x1b[31m[${dir}]: dist folder is not created yet\x1b[0m`);
    }
}
else {
    console.warn(`\x1b[35m[${dir}]: assets folder does not exists in src\x1b[0m`);
}
