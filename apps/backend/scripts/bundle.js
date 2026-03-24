const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, '../lambda-package.zip');
const rootModules = path.join(__dirname, '../../../node_modules');
const localModules = path.join(__dirname, '../node_modules');

const output = fs.createWriteStream(OUTPUT_FILE);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2);
  console.log(`✅ lambda-package.zip created (${sizeMB} MB)`);
  console.log(`📦 Ready to upload to AWS Lambda`);
});

archive.on('error', (err) => { throw err; });

archive.pipe(output);

archive.directory('src/', 'src');
archive.file('lambda.js', { name: 'lambda.js' });
archive.file('package.json', { name: 'package.json' });

// Root node_modules first (hoisted workspace deps like @vendia/serverless-express)
if (fs.existsSync(rootModules)) {
  archive.directory(rootModules, 'node_modules');
}
// Local node_modules on top (overrides root for any conflicts)
if (fs.existsSync(localModules)) {
  archive.directory(localModules, 'node_modules');
}

archive.finalize();
