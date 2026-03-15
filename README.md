# Seranet

Seranet is a full-stack local commerce workspace with:

- a Vite web storefront and merchant dashboard
- an Express + Prisma backend API
- an Expo mobile storefront app for Expo Go

The full project handoff and setup documentation now lives here:

- [Project Documentation](./docs/PROJECT_DOCUMENTATION.md)

## Quick Start
### Backend
```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

### Web
```bash
npm install
npm run dev
```

### Mobile
```bash
cd mobile
npm install
npm run start
```

## Environment Files
- root web env: `.env`
- backend env: `backend/.env`
- mobile env: `mobile/.env`

For the full env reference, LAN mobile setup, UI overhaul notes, QA status, and next steps, use the main documentation file above.
