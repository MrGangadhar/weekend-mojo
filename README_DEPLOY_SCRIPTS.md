Automated scripts to set Render and Vercel environment variables

Prerequisites
- Node.js 18+ (the repo CI uses Node 24)
- `npx vercel` available (the `vercel_set_envs.js` script calls `npx vercel`)

1) Create a JSON file `deploy.env.render.json` with keys:
```
{
  "MONGODB_URI": "mongodb+srv://...",
  "RAZORPAY_KEY_ID": "...",
  "RAZORPAY_KEY_SECRET": "...",
  "TWILIO_ACCOUNT_SID": "...",
  "TWILIO_AUTH_TOKEN": "...",
  "FIREBASE_SERVICE_ACCOUNT": "{...}",
  "JWT_SECRET": "..."
}
```

2) Run the Render script (requires `RENDER_API_KEY` and `RENDER_SERVICE_ID` env vars):
```bash
RENDER_API_KEY="<key>" RENDER_SERVICE_ID="<id>" node scripts/render_set_envs.js deploy.env.render.json --service-id <id> --api-key <key>
```

3) After Render deployment, create `deploy.env.vercel.json` containing only frontend env vars (e.g., `VITE_API_URL`):
```
{ "VITE_API_URL": "https://your-backend.onrender.com/api" }
```

4) Run the Vercel script (requires `VERCEL_TOKEN`):
```bash
VERCEL_TOKEN="<token>" node scripts/vercel_set_envs.js deploy.env.vercel.json --token <token> --cwd frontend
```

Notes
- The Render script uses the official API endpoint `/v1/services/:id/env-vars` and will create env vars.
- The Vercel script uses the Vercel CLI (`npx vercel env add`) and will add variables to the `frontend` project linked in `frontend/.vercel` or via the Vercel account used by the token.
