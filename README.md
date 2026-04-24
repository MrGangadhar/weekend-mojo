## Weekend Mojo

### Local run

This project is set up to run with Docker Compose:

```bash
docker compose up -d --build
```

That starts MongoDB, the backend, the frontend, and nginx.

### Demo setup

To load the demo employee accounts into the database, run:

```bash
cd backend
npm run seed:demo-users
```

Use [backend/.env.example](backend/.env.example) as the starting point for local environment variables.

### Employee login

Use the internal login page for staff roles:

- Management: `management01` / `demo1234`
- Conductor: `conductor01` / `demo1234`
- Editor: `editor01` / `demo1234`

Open the internal login page from the public login screen or go directly to `/internal-login`.
