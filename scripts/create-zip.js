#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const rootDir = path.join(__dirname, '..');
const manifestPath = path.join(rootDir, 'manifest.json');
const distDir = path.join(rootDir, 'dist');

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const version = manifest.version;
const zipFileName = `dndbeyond-filter-v${version}.zip`;
const zipPath = path.join(distDir, zipFileName);

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

console.log(`📦 Creating release package for v${version}...\n`);

const output = fs.createWriteStream(zipPath);
const archive = archiver('zip', {
  zlib: { level: 9 }
});

output.on('close', () => {
  const sizeInKB = (archive.pointer() / 1024).toFixed(2);
  console.log(`\n✅ Package created successfully!`);
  console.log(`📁 File: ${zipFileName}`);
  console.log(`📊 Size: ${sizeInKB} KB`);
  console.log(`📍 Location: ${zipPath}\n`);
});

archive.on('error', (err) => {
  console.error('❌ ERROR creating ZIP:', err);
  process.exit(1);
});

archive.on('warning', (err) => {
  if (err.code === 'ENOENT') {
    console.warn('⚠️  WARNING:', err);
  } else {
    throw err;
  }
});

archive.pipe(output);

const filesToInclude = [
  'manifest.json',
  'background.js',
  'content-sources.js',
  'content-filter.js',
  'popup.html',
  'popup.css',
  'popup.js',
  'options.html',
  'options.css',
  'options.js'
];

console.log('📝 Including files:');
filesToInclude.forEach(file => {
  const filePath = path.join(rootDir, file);
  if (fs.existsSync(filePath)) {
    archive.file(filePath, { name: file });
    console.log(`   ✅ ${file}`);
  } else {
    console.error(`   ❌ Missing: ${file}`);
  }
});

const iconsDir = path.join(rootDir, 'icons');
if (fs.existsSync(iconsDir)) {
  archive.directory(iconsDir, 'icons');
  console.log(`   ✅ icons/`);
} else {
  console.error(`   ❌ Missing: icons/`);
}

console.log('\n📦 Compressing...');
archive.finalize();
