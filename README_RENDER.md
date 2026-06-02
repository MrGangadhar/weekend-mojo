Render deployment steps for weekend-mojo backend

1) Create service from GitHub
- Go to Render dashboard → New → Web Service
- Connect your GitHub account and select repository `MrGangadhar/weekend-mojo`
- Render will detect `render.yaml` in the repo. Confirm service `weekend-mojo-backend` and choose `Docker` environment.

2) Required settings
- Start command: `node server.js`
- Health check path: `/health`
- Set plan: `starter` (or your preferred plan)

3) Environment variables (provide values from your providers)
- `PORT` = `10000`
- `MONGODB_URI` = <your MongoDB URI>
- `RAZORPAY_KEY_ID` = <razorpay key id>
- `RAZORPAY_KEY_SECRET` = <razorpay key secret>
- `TWILIO_ACCOUNT_SID` = <twilio sid>
- `TWILIO_AUTH_TOKEN` = <twilio token>
- `FIREBASE_SERVICE_ACCOUNT` = <contents of backend/firebase-service-account.json (string)> 
- `JWT_SECRET` = <random secret>
- `FRONTEND_URL` = `https://weekend-mojo-gangadhars-projects-da006e70.vercel.app`

4) Optional: create a custom domain in Render after deployment.

5) Example: set Render env vars via API (replace placeholders)

```bash
# set these before running:
export RENDER_API_KEY="<your-render-api-key>"
export RENDER_SERVICE_ID="<your-render-service-id>"

curl -X POST \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"key":"MONGODB_URI","value":"<your-mongo-uri>","scope":"RENDER"}' \
  "https://api.render.com/v1/services/$RENDER_SERVICE_ID/env-vars"
```

6) After Render gives you a public backend URL (e.g. `https://weekend-mojo.onrender.com`):
- In Vercel project settings → Environment Variables, set `VITE_API_URL` = `https://<your-backend-domain>/api` for Production.
- Redeploy the frontend in Vercel (trigger a redeploy or push a trivial commit).

7) Verification
- Visit the frontend URL and confirm API calls succeed and socket connections establish.

If you want, I can add scripts to automate setting Render env vars via the Render API — you'll need to provide a Render API key.
