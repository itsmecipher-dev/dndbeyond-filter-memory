#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, '..', 'manifest.json');
const rootDir = path.join(__dirname, '..');

console.log('🔍 Validating manifest.json...\n');

let hasErrors = false;

try {
  const manifestContent = fs.readFileSync(manifestPath, 'utf8');
  const manifest = JSON.parse(manifestContent);

  console.log(`📦 Extension: ${manifest.name} v${manifest.version}`);
  console.log(`📝 Description: ${manifest.description}\n`);

  if (manifest.manifest_version !== 3) {
    console.error('❌ ERROR: manifest_version must be 3');
    hasErrors = true;
  } else {
    console.log('✅ Manifest version: 3');
  }

  const requiredFields = ['name', 'version', 'description', 'permissions', 'host_permissions', 'background', 'content_scripts', 'action', 'icons'];
  requiredFields.forEach(field => {
    if (!manifest[field]) {
      console.error(`❌ ERROR: Missing required field: ${field}`);
      hasErrors = true;
    }
  });

  if (manifest.background) {
    const serviceWorker = manifest.background.service_worker;
    if (!serviceWorker) {
      console.error('❌ ERROR: background.service_worker is required for Manifest v3');
      hasErrors = true;
    } else {
      const workerPath = path.join(rootDir, serviceWorker);
      if (!fs.existsSync(workerPath)) {
        console.error(`❌ ERROR: Service worker not found: ${serviceWorker}`);
        hasErrors = true;
      } else {
        console.log(`✅ Service worker exists: ${serviceWorker}`);
      }
    }
  }

  if (manifest.content_scripts) {
    manifest.content_scripts.forEach((script, index) => {
      console.log(`\n📄 Content Script #${index + 1}:`);
      console.log(`   Matches: ${script.matches.join(', ')}`);

      script.js.forEach(jsFile => {
        const filePath = path.join(rootDir, jsFile);
        if (!fs.existsSync(filePath)) {
          console.error(`   ❌ ERROR: Script not found: ${jsFile}`);
          hasErrors = true;
        } else {
          console.log(`   ✅ Script exists: ${jsFile}`);
        }
      });
    });
  }

  if (manifest.action && manifest.action.default_popup) {
    const popupPath = path.join(rootDir, manifest.action.default_popup);
    if (!fs.existsSync(popupPath)) {
      console.error(`❌ ERROR: Popup HTML not found: ${manifest.action.default_popup}`);
      hasErrors = true;
    } else {
      console.log(`\n✅ Popup HTML exists: ${manifest.action.default_popup}`);
    }
  }

  const iconSizes = ['16', '32', '48', '128'];
  console.log('\n🖼️  Checking icons:');

  if (manifest.icons) {
    iconSizes.forEach(size => {
      const iconPath = manifest.icons[size];
      if (!iconPath) {
        console.error(`   ❌ ERROR: Missing icon size: ${size}x${size}`);
        hasErrors = true;
      } else {
        const fullPath = path.join(rootDir, iconPath);
        if (!fs.existsSync(fullPath)) {
          console.error(`   ❌ ERROR: Icon not found: ${iconPath}`);
          hasErrors = true;
        } else {
          console.log(`   ✅ Icon ${size}x${size}: ${iconPath}`);
        }
      }
    });
  } else {
    console.error('❌ ERROR: No icons defined in manifest');
    hasErrors = true;
  }

  console.log('\n🔐 Permissions:');
  if (manifest.permissions) {
    manifest.permissions.forEach(perm => {
      console.log(`   • ${perm}`);
    });
  }

  console.log('\n🌐 Host Permissions:');
  if (manifest.host_permissions) {
    manifest.host_permissions.forEach(host => {
      console.log(`   • ${host}`);
    });
  }

} catch (error) {
  console.error('❌ ERROR: Failed to read or parse manifest.json');
  console.error(error.message);
  hasErrors = true;
}

if (hasErrors) {
  console.log('\n❌ Validation FAILED\n');
  process.exit(1);
} else {
  console.log('\n✅ Validation PASSED - manifest.json is valid!\n');
  process.exit(0);
}
