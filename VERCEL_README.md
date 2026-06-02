Vercel deployment instructions

1) Create a Vercel project for this repository (or connect GitHub via Vercel).

2) Obtain these values from the Vercel dashboard and add them as GitHub repository secrets:
   - `VERCEL_TOKEN` (from Personal Tokens in your Vercel account)
   - `VERCEL_ORG_ID` (from the Project Settings -> General -> Organization ID)
   - `VERCEL_PROJECT_ID` (from the Project Settings -> General -> Project ID)

3) The included GitHub Action will run on push to `main`/`master` and build the `frontend` folder then deploy to Vercel.

Manual quick deploy (local):

```bash
cd frontend
npm install
npm run build
vercel --prod --confirm
```

If you prefer Vercel UI: connect the repo, set the Framework to `Other` or leave default, and set Build Command to `npm run build` and Output Directory to `dist` (or let vercel detect the frontend package.json).
