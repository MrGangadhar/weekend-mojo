Deployment guide — Weekend Mojo

Goal: Make the frontend public on Vercel and host the Express backend (with sockets) on a separate host (Render/Railway). Then set `VITE_API_URL` in Vercel to the backend URL so the frontend talks to the API.

1) Fix Vercel 401 / "Authentication Required"
- In the Vercel dashboard open your Project → Settings → Protection (Deployment Protection)
- Disable the protection option (SSO / password) or remove the rule that requires authentication.
- Alternatively keep protection and configure Trusted Sources or a Protection Bypass token (see Vercel docs).

2) Deploy the backend (recommended: Render or Railway)
Why: Your backend uses WebSockets (`socket.io`) and maintains persistent connections, which are not suitable for Vercel Serverless functions. Use a hosted Node service that supports long-running processes.

Render (recommended)
- Sign in to https://dashboard.render.com and "New +" → "Web Service".
- Connect your GitHub repo and select the repo `MrGangadhar/weekend-mojo` and branch (main).
- In "Environment" choose "Docker" and set the Dockerfile path to `backend/Dockerfile`.
- Health check path: `/health`
- Set environment variables in Render (see list below).
- Deploy.

Railway (alternative)
- Create new project, connect GitHub repo, select `backend` as service, and set start command `node server.js` or use the Dockerfile. Add env vars and deploy.

3) Required environment variables (backend)
Set these in the host's Environment / Secrets (replace placeholders):
- MONGO_URI or MONGODB_URI
- FRONTEND_URL = https://<your-frontend-domain> (e.g. https://weekend-mojo.vercel.app)
- BACKEND_URL = https://<your-backend-domain>
- JWT_SECRET
- JWT_EXPIRE (e.g. 7d)
- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_PHONE_NUMBER
- FIREBASE_PRIVATE_KEY (store as a single-line escaped string or secret)
- FIREBASE_CLIENT_EMAIL
- FIREBASE_PROJECT_ID
- Any other secrets referenced in `backend/utils/notifications.js` or `backend/config/*` files

4) Configure frontend to talk to backend (Vercel)
- In Vercel Project Settings → Environment Variables add:
  - `VITE_API_URL` = `https://<your-backend-domain>/api` (or just backend root)
- Then Trigger a redeploy (push commit or click "Redeploy" in Deployments).

5) Verify
- After backend is live, call `<backend_url>/health` (should return JSON {status: 'OK'}).
- In browser open the frontend URL (public) and confirm pages load and API calls succeed.

6) Notes / Troubleshooting
- CORS: backend uses `cors()` — ensure `FRONTEND_URL` is set correctly to avoid CORS issues.
- Sockets: Use the backend's public URL for Socket.io client connection; ensure host supports WebSockets.
- If you prefer to host backend on Vercel, you'll need to convert your server to serverless functions and remove persistent socket usage.

If you want, I can:
- Prepare a `render.yaml` or `README` snippet to speed Render deploy.
- Help you create the Render web service steps and list exact env var values to paste.
- Or convert backend into serverless functions (not recommended due to sockets).

