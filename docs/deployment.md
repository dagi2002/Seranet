# Seranet Deployment Guide

This guide is limited to deployment preparation and operational readiness for the current app shape. It does not change product scope.

## Recommended Architecture

- Frontend: static Vite build deployed to Vercel, Netlify, or Cloudflare Pages.
- Backend: Node/Express service deployed as a long-running web service on Render, Railway, Fly.io, or a container platform.
- Database: managed PostgreSQL such as Neon, Supabase Postgres, Railway Postgres, Render Postgres, or AWS RDS.
- File storage: Cloudinary image hosting for uploaded media.

Recommended baseline:

1. Frontend on Vercel or Netlify.
2. Backend on Render or Railway.
3. Managed Postgres on Neon, Supabase, Railway, or Render.
4. Cloudinary-backed uploads so media survives deploys and restarts.

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
| `DATABASE_URL` | Yes | `postgresql://user:pass@ep-...-pooler.us-east-2.aws.neon.tech/seranet?sslmode=require` | Runtime database connection string. For Neon, this should usually be the pooled URL used by the app. |
| `DIRECT_URL` | Yes for Neon or other pooled Postgres setups | `postgresql://user:pass@ep-....us-east-2.aws.neon.tech/seranet?sslmode=require` | Direct database connection string used by Prisma migrations. |
| `JWT_SECRET` | Yes | `long-random-secret-value` | Must be a strong secret in production. |
| `PORT` | Yes | `4000` | Service listen port. Most platforms inject this automatically. |
| `CORS_ORIGIN` | Conditional | `https://app.example.com` | Required when frontend is hosted on a different origin. Comma-separated values are supported. |
| `UPLOAD_STORAGE_PROVIDER` | Yes | `cloudinary` | Use `cloudinary` for staging and deployment. `local` remains available for tests/local fallback only. |
| `CLOUDINARY_CLOUD_NAME` | Yes | `your-cloud-name` | Cloudinary account cloud name. |
| `CLOUDINARY_API_KEY` | Yes | `your-api-key` | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | Yes | `your-api-secret` | Cloudinary API secret. |
| `CLOUDINARY_UPLOAD_FOLDER` | Optional | `seranet-staging` | Folder/prefix used for uploaded assets in Cloudinary. |
| `ALLOW_DESTRUCTIVE_SEED` | No | `true` | Only set for intentional rehearsal seeding against non-local databases. The seed script deletes existing data. |

## Postgres Migration And Seed Rehearsal

Important for the current staging stack:

- Render free web services do not support the pre-deploy command workflow used on paid plans.
- For free staging on Render + Neon, run Prisma migrations manually from a local checkout before redeploying the backend service.
- Use `DATABASE_URL` for the pooled runtime connection and `DIRECT_URL` for the direct migration connection.

### Production migration flow

1. Provision the Postgres database.
2. Set `DATABASE_URL` on the backend service.
3. Set `DIRECT_URL` when the provider exposes a separate direct connection string, including Neon.
4. Run `npm install`.
5. Run `npm run prisma:migrate:deploy`.
6. Start the backend with `npm run start`.
7. Verify `GET /health` and `GET /ready`.

### Seed rehearsal flow

Use a staging database, never the production database.

1. Clone production env shape into staging.
2. Point `DATABASE_URL` at the staging Postgres instance.
3. Set `DIRECT_URL` to the direct connection string if staging uses Neon or another pooled Postgres URL.
4. Run `npm install`.
5. Run `npm run prisma:migrate:deploy`.
6. Run `ALLOW_DESTRUCTIVE_SEED=true npm run prisma:seed`.
7. Smoke test auth, product CRUD, checkout, payment simulation, and Cloudinary-backed uploads.

Important:

- `backend/prisma/seed.ts` deletes existing users, merchants, products, orders, and payments before reseeding demo data.
- The seed script now refuses to run against non-local databases unless `ALLOW_DESTRUCTIVE_SEED=true` is set explicitly.

### Render free staging workflow

Use this flow for the current staging setup: Vercel frontend, Render backend, Neon database, Cloudinary uploads.

1. Pull the latest staging branch locally.
2. Export both database URLs locally:
   - `DATABASE_URL=<Neon pooled URL>`
   - `DIRECT_URL=<Neon direct URL>`
3. Run `npm install` in `backend` if dependencies are not already present.
4. Run `npm run prisma:migrate:deploy` from `backend`.
5. If staging demo data is needed, run `ALLOW_DESTRUCTIVE_SEED=true npm run prisma:seed`.
6. After migrations complete successfully, trigger the Render backend redeploy.
7. Verify `GET /health` and `GET /ready` after the new instance starts.

This is the cleanest low-cost workflow because it keeps the free Render service simple and moves schema changes to an explicit operator step before deployment.

## File Upload And Storage Considerations

Current deployment path uses Cloudinary for uploaded media.

Why this fits the current app well:

- Uploaded files survive deploys and restarts.
- The frontend already accepts absolute asset URLs without changes.
- No persistent disk is required on the backend service.

Tradeoff:

- Cloudinary introduces an external SaaS dependency and API credentials.
- If you later want tighter control over storage policy or to colocate files with your database stack, S3-compatible storage or Supabase Storage may be a better long-term move.

## Exact Deployment Steps

### 1. Prepare secrets and infrastructure

1. Create a managed Postgres database.
2. Choose frontend hosting.
3. Choose backend hosting.
4. Create a Cloudinary account and collect the API credentials.

### 2. Deploy backend

1. Create a backend service from `/Users/dagemamogne/Downloads/Seranet/backend`.
2. Set env vars:
   - `NODE_ENV=production`
   - `DATABASE_URL=...`
   - `DIRECT_URL=...`
   - `JWT_SECRET=...`
   - `PORT=4000` or platform default
   - `CORS_ORIGIN=https://your-frontend-domain`
   - `UPLOAD_STORAGE_PROVIDER=cloudinary`
   - `CLOUDINARY_CLOUD_NAME=...`
   - `CLOUDINARY_API_KEY=...`
   - `CLOUDINARY_API_SECRET=...`
   - `CLOUDINARY_UPLOAD_FOLDER=seranet-staging`
3. On paid Render plans, run migrations with `npm run prisma:migrate:deploy` as a pre-deploy step.
4. On free Render plans, run migrations manually from a local checkout against Neon before triggering the deploy.
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
5. Validate uploaded images still load after backend restart.

## Production Readiness Checklist

- Frontend build succeeds with `VITE_API_BASE_URL` set correctly.
- Backend build succeeds and starts with `npm run start`.
- `DATABASE_URL` points to managed Postgres, not local development.
- `DIRECT_URL` is set when the database provider exposes a separate direct connection for migrations, including Neon.
- `JWT_SECRET` is strong and unique to the environment.
- `CORS_ORIGIN` matches the real frontend origin when split-domain deployment is used.
- Prisma migrations are committed and applied with `npm run prisma:migrate:deploy`.
- Seed script is never run against production data unless explicitly intended.
- Cloudinary credentials are configured correctly and uploads succeed from the staging backend.
- Health check endpoints are wired into the deployment platform.
- Logs are captured by the hosting platform.
- Backups and rollback path exist for the database.
- Demo payment simulation is acceptable for the target environment, or real provider work is scheduled before launch.

## Known Blockers Before Real Production Launch

1. Payments are still simulated. `backend/src/routes/payments.ts` is a demo flow, not a real Telebirr integration.
2. The seed script is destructive by design. It is now guarded, but it still must not be used as a normal production task.
