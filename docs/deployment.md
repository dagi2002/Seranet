# Seranet Deployment Guide

This guide is limited to deployment preparation and operational readiness for the current app shape. It does not change product scope.

## Recommended Architecture

- Frontend: static Vite build deployed to Vercel, Netlify, or Cloudflare Pages.
- Backend: Node/Express service deployed as a long-running web service on Render, Railway, Fly.io, or a container platform.
- Database: managed PostgreSQL such as Neon, Supabase Postgres, Railway Postgres, Render Postgres, or AWS RDS.
- File storage:
  - Minimum viable: persistent disk mounted to the backend service and exposed from `/uploads`.
  - Preferred for production: S3-compatible object storage plus a public asset URL or CDN.

Recommended baseline:

1. Frontend on Vercel or Netlify.
2. Backend on Render or Railway.
3. Managed Postgres on Neon, Supabase, Railway, or Render.
4. Persistent upload storage before multi-instance scaling.

## Build And Start Commands

### Frontend

- Install: `npm install`
- Build: `npm run build`
- Preview check: `npm run preview`

### Backend

- Install: `npm install`
- Build: `npm run build`
- Start: `npm run start`
- Apply migrations in production: `npm run prisma:migrate:deploy`
- Seed demo data: `npm run prisma:seed`

## Required Environment Variables

### Frontend

| Variable | Required | Example | Notes |
| --- | --- | --- | --- |
| `VITE_API_BASE_URL` | Yes | `https://api.example.com/api` | Public API base URL used by the SPA. If frontend and backend are behind the same domain/reverse proxy, `/api` also works. |

### Backend

| Variable | Required | Example | Notes |
| --- | --- | --- | --- |
| `NODE_ENV` | Yes | `production` | Enables production-safe env validation. |
| `DATABASE_URL` | Yes | `postgresql://user:pass@host:5432/seranet?schema=public` | Managed Postgres connection string. |
| `JWT_SECRET` | Yes | `long-random-secret-value` | Must be a strong secret in production. |
| `PORT` | Yes | `4000` | Service listen port. Most platforms inject this automatically. |
| `CORS_ORIGIN` | Conditional | `https://app.example.com` | Required when frontend is hosted on a different origin. Comma-separated values are supported. |
| `UPLOADS_DIR` | Yes | `./uploads` | Local directory for uploaded files when using disk storage. Back this with persistent storage if used in production. |
| `UPLOADS_BASE_URL` | Optional | `https://api.example.com/uploads` | Public base URL for uploaded files. Useful behind a reverse proxy, CDN, or external asset host. |
| `ALLOW_DESTRUCTIVE_SEED` | No | `true` | Only set for intentional rehearsal seeding against non-local databases. The seed script deletes existing data. |

## Postgres Migration And Seed Rehearsal

### Production migration flow

1. Provision the Postgres database.
2. Set `DATABASE_URL` on the backend service.
3. Run `npm install`.
4. Run `npm run prisma:migrate:deploy`.
5. Start the backend with `npm run start`.
6. Verify `GET /health` and `GET /ready`.

### Seed rehearsal flow

Use a staging database, never the production database.

1. Clone production env shape into staging.
2. Point `DATABASE_URL` at the staging Postgres instance.
3. Run `npm install`.
4. Run `npm run prisma:migrate:deploy`.
5. Run `ALLOW_DESTRUCTIVE_SEED=true npm run prisma:seed`.
6. Smoke test auth, product CRUD, checkout, payment simulation, and uploads.

Important:

- `backend/prisma/seed.ts` deletes existing users, merchants, products, orders, and payments before reseeding demo data.
- The seed script now refuses to run against non-local databases unless `ALLOW_DESTRUCTIVE_SEED=true` is set explicitly.

## File Upload And Storage Considerations

Current implementation uses Multer disk storage and serves files from `/uploads`.

This is acceptable only when all of the following are true:

- The backend runs as a single instance.
- The deployment platform provides persistent disk storage.
- Uploaded assets are expected to stay on the same service instance.

This becomes a blocker when:

- The backend is scaled horizontally.
- The platform filesystem is ephemeral.
- Assets need CDN delivery or independent retention.

Production recommendation:

1. Short term: mount persistent disk to the backend service and keep `UPLOADS_DIR` on that disk.
2. Medium term: move uploads to S3-compatible storage and set `UPLOADS_BASE_URL` to the public asset host.

## Exact Deployment Steps

### 1. Prepare secrets and infrastructure

1. Create a managed Postgres database.
2. Choose frontend hosting.
3. Choose backend hosting.
4. Decide whether uploads will use persistent disk or object storage.

### 2. Deploy backend

1. Create a backend service from `/Users/dagemamogne/Downloads/Seranet/backend`.
2. Set env vars:
   - `NODE_ENV=production`
   - `DATABASE_URL=...`
   - `JWT_SECRET=...`
   - `PORT=4000` or platform default
   - `CORS_ORIGIN=https://your-frontend-domain`
   - `UPLOADS_DIR=./uploads`
   - `UPLOADS_BASE_URL=https://your-api-domain/uploads` if needed
3. Install dependencies with `npm install`.
4. Run migrations with `npm run prisma:migrate:deploy`.
5. Build with `npm run build`.
6. Start with `npm run start`.
7. Verify:
   - `GET /health`
   - `GET /ready`
   - authenticated API flow
   - upload flow

### 3. Deploy frontend

1. Create a frontend site from `/Users/dagemamogne/Downloads/Seranet`.
2. Set `VITE_API_BASE_URL` to the backend public API origin, for example `https://api.example.com/api`.
3. Install dependencies with `npm install`.
4. Build with `npm run build`.
5. Publish the generated `dist` output.

### 4. Rehearse staging cutover

1. Point staging frontend to staging API.
2. Run migrations on staging.
3. Run `ALLOW_DESTRUCTIVE_SEED=true npm run prisma:seed` on staging only.
4. Validate end-to-end user flows.
5. Validate upload persistence after backend restart.

## Production Readiness Checklist

- Frontend build succeeds with `VITE_API_BASE_URL` set correctly.
- Backend build succeeds and starts with `npm run start`.
- `DATABASE_URL` points to managed Postgres, not local development.
- `JWT_SECRET` is strong and unique to the environment.
- `CORS_ORIGIN` matches the real frontend origin when split-domain deployment is used.
- Prisma migrations are committed and applied with `npm run prisma:migrate:deploy`.
- Seed script is never run against production data unless explicitly intended.
- Upload storage is persistent and backed up, or replaced with object storage.
- Health check endpoints are wired into the deployment platform.
- Logs are captured by the hosting platform.
- Backups and rollback path exist for the database.
- Demo payment simulation is acceptable for the target environment, or real provider work is scheduled before launch.

## Known Blockers Before Real Production Launch

1. Payments are still simulated. `backend/src/routes/payments.ts` is a demo flow, not a real Telebirr integration.
2. Uploads are still local-disk based. Without persistent storage or object storage, uploaded media is not production-safe.
3. The seed script is destructive by design. It is now guarded, but it still must not be used as a normal production task.
