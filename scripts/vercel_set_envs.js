#!/usr/bin/env node
// Usage: node vercel_set_envs.js ./env.json --token <token> --cwd frontend
// This uses the Vercel CLI (`npx vercel env add`) so you must have network access.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Usage: node vercel_set_envs.js ./env.json --token <token> [--cwd frontend]');
  process.exit(1);
}
const envFile = args[0];
const getArg = (name) => {
  const idx = args.indexOf(name);
  if (idx === -1) return process.env[name.replace(/^-+/, '')];
  return args[idx + 1];
};
const token = getArg('--token') || process.env.VERCEL_TOKEN;
const cwd = getArg('--cwd') || 'frontend';
if (!token) {
  console.error('Missing --token or VERCEL_TOKEN env var');
  process.exit(1);
}

const fullPath = path.resolve(process.cwd(), envFile);
if (!fs.existsSync(fullPath)) {
  console.error('Env file not found:', fullPath);
  process.exit(1);
}
const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

for (const [k, v] of Object.entries(data)) {
  console.log(`Adding ${k} to Vercel (production)...`);
  const res = spawnSync('npx', ['vercel', 'env', 'add', k, String(v), 'production', '--token', token, '--yes'], { cwd, stdio: 'inherit', shell: true });
  if (res.status !== 0) {
    console.error(`Failed to add ${k}. exit ${res.status}`);
  }
}
