#!/usr/bin/env node
// Usage: node render_set_envs.js ./env.json --service-id <id> --api-key <key>
const fs = require('fs');
const path = require('path');
const https = require('https');

const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Usage: node render_set_envs.js ./env.json --service-id <id> --api-key <key>');
  process.exit(1);
}

const envFile = args[0];
const getArg = (name) => {
  const idx = args.indexOf(name);
  if (idx === -1) return process.env[name.replace(/^-+/, '')];
  return args[idx + 1];
};
const serviceId = getArg('--service-id') || process.env.RENDER_SERVICE_ID;
const apiKey = getArg('--api-key') || process.env.RENDER_API_KEY;
if (!serviceId || !apiKey) {
  console.error('Missing --service-id or --api-key (or RENDER_SERVICE_ID/RENDER_API_KEY env vars)');
  process.exit(1);
}

const fullPath = path.resolve(process.cwd(), envFile);
if (!fs.existsSync(fullPath)) {
  console.error('Env file not found:', fullPath);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

const postEnv = (key, value) => {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ key, value, scope: 'RENDER' });
    const options = {
      hostname: 'api.render.com',
      path: `/v1/services/${serviceId}/env-vars`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`Render API ${res.statusCode}: ${body}`));
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
};

(async () => {
  for (const [k, v] of Object.entries(data)) {
    try {
      process.stdout.write(`Setting ${k}... `);
      await postEnv(k, String(v));
      console.log('OK');
    } catch (err) {
      console.error('FAILED');
      console.error(err.message);
    }
  }
})();
