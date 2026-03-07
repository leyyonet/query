import fs from 'fs';
import path from 'path';
import { minify } from 'terser';
import JavaScriptObfuscator from 'javascript-obfuscator';

const DIST_DIR = path.resolve('./dist');

const USE_OBFUSCATOR = false;
const obfuscatorOptions = {
  compact: true,
  controlFlowFlattening: true, // flows
  stringArray: true, // save static strings
  rotateStringArray: true,
  renameGlobals: false, // save names
};

/**
 * @param {string} dir
 * @param {string} file
 * */
async function processFile(dir, file) {
  const fullPath = path.join(dir, file);
  const code = fs.readFileSync(fullPath, 'utf-8');
  const lengths = [code.length];

  const minified = await minify(code, {
    compress: true,
    mangle: false, // save names
    module: true,
    sourceMap: true,
  });
  lengths.push(minified.code.length);

  if (USE_OBFUSCATOR) {
    const obfuscated = JavaScriptObfuscator.obfuscate(minified.code, obfuscatorOptions);
    const obfuscatedCode = obfuscated.getObfuscatedCode();
    fs.writeFileSync(fullPath, obfuscatedCode);
    lengths.push(obfuscatedCode.length);
  }
  else {
    fs.writeFileSync(fullPath, minified.code);
  }
  console.log(`\x1b[33mMinified: ${file} [${lengths.join(', ')}]\x1b[0m`);
}

async function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      await walkDir(path.join(dir, entry.name));
    }
    else if (entry.isFile() && entry.name.endsWith('.js')) {
      await processFile(dir, entry.name);
    }
  }
}

// Top-level await (ESM)
await walkDir(DIST_DIR);
