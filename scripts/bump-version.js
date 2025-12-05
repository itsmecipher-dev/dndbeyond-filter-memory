#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const bumpType = args[0];

if (!bumpType || !['major', 'minor', 'patch'].includes(bumpType)) {
  console.error('❌ ERROR: Invalid bump type. Use: major, minor, or patch');
  console.log('\nUsage: npm run bump [major|minor|patch]');
  console.log('\nExamples:');
  console.log('  npm run bump patch   # 1.0.0 → 1.0.1');
  console.log('  npm run bump minor   # 1.0.0 → 1.1.0');
  console.log('  npm run bump major   # 1.0.0 → 2.0.0');
  process.exit(1);
}

const rootDir = path.join(__dirname, '..');
const manifestPath = path.join(rootDir, 'manifest.json');
const packagePath = path.join(rootDir, 'package.json');
const changelogPath = path.join(rootDir, 'CHANGELOG.md');

console.log(`🔄 Bumping ${bumpType} version...\n`);

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

const currentVersion = manifest.version;
const [major, minor, patch] = currentVersion.split('.').map(Number);

let newVersion;
switch (bumpType) {
  case 'major':
    newVersion = `${major + 1}.0.0`;
    break;
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case 'patch':
    newVersion = `${major}.${minor}.${patch + 1}`;
    break;
}

console.log(`📌 Current version: ${currentVersion}`);
console.log(`📌 New version: ${newVersion}\n`);

manifest.version = newVersion;
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log('✅ Updated manifest.json');

packageJson.version = newVersion;
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
console.log('✅ Updated package.json');

console.log('\n📝 CHANGELOG.md:');
console.log('⚠️  Please manually add release notes to CHANGELOG.md for version', newVersion);
console.log('   Format:');
console.log(`   ## [${newVersion}] - ${new Date().toISOString().split('T')[0]}`);
console.log('   ### Added/Fixed/Changed');
console.log('   - Your changes here...\n');

const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
if (gitStatus.trim()) {
  console.log('📋 Git changes detected. Creating commit and tag...\n');

  try {
    execSync('git add manifest.json package.json', { stdio: 'inherit' });
    execSync(`git commit -m "chore: bump version to ${newVersion}"`, { stdio: 'inherit' });
    execSync(`git tag v${newVersion}`, { stdio: 'inherit' });

    console.log(`\n✅ Created commit and tag v${newVersion}`);
    console.log('\n📤 To push changes:');
    console.log('   git push && git push --tags\n');
  } catch (error) {
    console.error('❌ ERROR: Failed to create git commit/tag');
    console.error('   You may need to commit manually.');
    process.exit(1);
  }
} else {
  console.log('ℹ️  No changes to commit (version already up to date?)');
}

console.log('✅ Version bump complete!\n');
console.log('📦 Next steps:');
console.log('   1. Update CHANGELOG.md with release notes');
console.log('   2. git push && git push --tags');
console.log('   3. Create GitHub release to trigger auto-publish\n');
