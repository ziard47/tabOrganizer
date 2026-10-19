import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// 1. Copy icons directory
const iconsSrc = path.join(rootDir, 'icons');
const iconsDest = path.join(distDir, 'icons');
if (fs.existsSync(iconsSrc)) {
  fs.cpSync(iconsSrc, iconsDest, { recursive: true });
}

// 2. Copy background.js and rules.js
fs.copyFileSync(path.join(rootDir, 'background.js'), path.join(distDir, 'background.js'));
fs.copyFileSync(path.join(rootDir, 'rules.js'), path.join(distDir, 'rules.js'));

// 3. Generate dist/manifest.json with default_popup: "index.html"
const manifestRaw = fs.readFileSync(path.join(rootDir, 'manifest.json'), 'utf8');
const manifest = JSON.parse(manifestRaw);
manifest.name = "Voltrex Harmony";
manifest.version = "2.0.0";
manifest.action.default_popup = "index.html";

fs.writeFileSync(path.join(distDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

console.log('✅ Extension assets successfully copied to dist/');
