# Seranet Project Documentation

## Overview
Seranet is a local-first commerce stack with three active parts:

- `backend/`: Express + Prisma API for auth, merchants, products, orders, payments, and uploads
- repository root `src/`: Vite + React web app for the public storefront and merchant dashboard
- `mobile/`: Expo Router React Native app for the customer storefront flow on Expo Go

The current local setup is working end to end:

- web frontend can connect to the local backend
- mobile storefront can connect to the local backend over LAN
- cart, checkout, and order-status flows work on mobile
- the storefront UI has been overhauled to match the web design system more closely

## Architecture
### Web
- Framework: React + Vite + TypeScript
- Routing: React Router
- Data: TanStack Query
- Styling: Tailwind CSS with custom design tokens in `src/index.css`
- Main customer-facing route pattern: `/s/:slug`

### Backend
- Framework: Express + TypeScript
- ORM: Prisma
- Database: PostgreSQL
- Auth: JWT
- Media: Multer + local uploads directory
- Payments: simulated Telebirr-style flow for development

### Mobile
- Framework: Expo SDK 54 + Expo Router + React Native
- Data: TanStack Query
- State: Zustand for cart/session persistence
- Styling: shared theme tokens and `StyleSheet`-based UI primitives under `mobile/src`
- Device access: Expo Go over LAN to the local backend

## Repository Map
### Root web app
- `src/pages/Storefront.tsx`: public storefront page
- `src/pages/ProductDetail.tsx`: public product detail page
- `src/pages/Checkout.tsx`: web checkout page
- `src/index.css`: web design tokens and shared visual language

### Backend
- `backend/src/server.ts`: API entry point
- `backend/src/routes/`: route handlers
- `backend/prisma/schema.prisma`: database schema
- `backend/prisma/seed.ts`: seed data

### Mobile
- `mobile/app/`: Expo Router screens
- `mobile/src/theme/theme.ts`: shared mobile design tokens
- `mobile/src/components/ui/`: shared mobile UI primitives
- `mobile/src/components/ProductCard.tsx`: reusable storefront card
- `mobile/src/config/env.ts`: mobile env validation

## Local Development Setup
### Prerequisites
- Node.js installed
- PostgreSQL running locally
- npm available
- Expo Go installed on the phone if testing on a real device

### Backend setup
1. Copy `backend/.env.example` to `backend/.env`.
2. Configure:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `PORT`
   - `CORS_ORIGIN`
3. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
4. Generate Prisma client and apply migrations:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```
5. Seed local data:
   ```bash
   npm run prisma:seed
   ```
6. Start the backend:
   ```bash
   npm run dev
   ```

Default local API base:
```text
http://localhost:4000/api
```

### Web setup
1. Copy `.env.example` to `.env`.
2. Set:
   ```env
   VITE_API_BASE_URL=http://localhost:4000/api
   ```
3. Install dependencies in the repo root:
   ```bash
   npm install
   ```
4. Start the web app:
   ```bash
   npm run dev
   ```

Default local web URL:
```text
http://localhost:5173
```

### Mobile setup
1. Copy `mobile/.env.example` to `mobile/.env`.
2. Set:
   - `EXPO_PUBLIC_API_BASE_URL` to a LAN URL reachable by the phone
   - `EXPO_PUBLIC_DEFAULT_STORE_SLUG` to the store to open by default
3. Example:
   ```env
   EXPO_PUBLIC_API_BASE_URL=http://192.168.x.x:4000/api
   EXPO_PUBLIC_DEFAULT_STORE_SLUG=addis-market-studio
   ```
4. Install mobile dependencies:
   ```bash
   cd mobile
   npm install
   ```
5. Start Expo:
   ```bash
   npm run start
   ```
6. Open Expo Go on the phone and connect over the same Wi‑Fi network.

## Environment Variables
### Root web app
`/.env`
```env
VITE_API_BASE_URL=http://localhost:4000/api
```

### Backend
`/backend/.env`
```env
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/seranet?schema=public
JWT_SECRET=seranet-local-dev-secret
PORT=4000
CORS_ORIGIN=http://localhost:5173
UPLOADS_DIR=./uploads
```

### Mobile
`/mobile/.env`
```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.x.x:4000/api
EXPO_PUBLIC_DEFAULT_STORE_SLUG=addis-market-studio
```

## Important Local Networking Notes
- Mobile must not use `localhost` for the API when running on a physical phone.
- The mobile app must point to the computer's current LAN IP address.
- If the Wi‑Fi network changes, `mobile/.env` may need to be updated again.
- The mobile env parser strips trailing slashes and validates the slug format.

## Problems Solved During This Setup
### 1. Mobile dependency installation conflict
There was a React peer-version mismatch in the mobile dependency tree. The local install was completed with:

```bash
npm install --legacy-peer-deps
```

This was used to finish installation despite a minor peer dependency conflict.

### 2. Wrong mobile backend target
The mobile app originally pointed to the wrong local IP address. Updating `mobile/.env` to the machine's active LAN IP fixed the connection issue.

### 3. Mobile storefront UI mismatch
The mobile customer experience was visually basic and did not match the web storefront. A full UI overhaul was implemented to align the mobile app with the web design language.

## Mobile UI Overhaul Summary
### What was added
- shared theme tokens in `mobile/src/theme/theme.ts`
- bundled `Manrope` font files under `mobile/assets/fonts`
- global font loading in `mobile/app/_layout.tsx`
- shared `StyleSheet`-based UI primitives under `mobile/src/components/ui`
- redesigned `ProductCard`, `EmptyState`, `AppScreen`, and `PriceText`

### Visual direction
- `slate-50` style page background
- dark slate text
- teal brand color `#0d9488`
- white / translucent surfaces
- rounded premium cards and panels
- denser product grids for storefront and related-products sections

### Screens updated
- storefront
- product detail
- cart
- checkout
- order status

### Notable storefront changes
- removed the extra promo strip that wasted vertical space
- changed product browsing to a compact two-column layout on suitable phone widths
- fixed the floating cart CTA so it does not cover the final product row
- applied the same compact grid treatment to related products
- removed the duplicate top route headers from the storefront experience

## Current Mobile Behavior
### Storefront
- reads the merchant by slug
- fetches product list
- supports client-side search
- supports category chip filtering
- shows compact two-column product cards on wider phone widths
- shows a floating cart CTA when the cart has items

### Product detail
- supports gallery images from `image_urls`
- supports quantity stepping
- supports add-to-cart and buy-now
- shows related products from the same store

### Cart
- persists items with Zustand + AsyncStorage
- supports quantity changes and removal
- calculates totals locally from fetched product pricing already stored in cart items

### Checkout
- anonymous checkout flow
- validated with Zod
- creates an order against the existing backend
- attempts payment initiation immediately after order creation

### Order status
- polls order status
- polls payment status
- displays payment warnings if initiation failed

## Store Slugs
### Confirmed seeded local slug
- `addis-market-studio`

### Other slug seen in test fixtures
- `dagi-ertib`

`dagi-ertib` can be used in Expo Go only if a merchant with that slug exists in the currently running backend database. If the DB only contains `addis-market-studio`, then the mobile env must continue pointing at that slug.

## Commands
### Web
```bash
npm run dev
npm run typecheck
npm test
```

### Backend
```bash
cd backend
npm run dev
npm run build
npm run test
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### Mobile
```bash
cd mobile
npm run start
npm run android
npm run ios
npm run web
npm run typecheck
```

## Verification Status
### Confirmed in this workspace
- mobile TypeScript passes:
  ```bash
  npm --prefix mobile run typecheck
  ```
- storefront layout issues reported during QA were fixed:
  - stacked product cards changed to real side-by-side rows
  - related products changed to side-by-side rows
  - floating cart CTA no longer overlaps products
  - duplicate storefront headers removed

### Confirmed by user during QA
- web works locally
- mobile storefront works
- mobile checkout flow works
- overall mobile experience is functioning

## Known Technical Debt
- `mobile/src/components/ui/Icon.tsx` currently uses a local text-glyph fallback instead of real `@expo/vector-icons` rendering. This avoids Metro resolution issues immediately, but should be replaced after a clean `npm install` confirms the package is available at the expected top-level path.
- `mobile/.env.example` still shows the original placeholder LAN IP and should be updated to more clearly explain that the IP must match the current machine on the local network.
- The root `README.md` that existed before this handoff described an older setup and did not cover the mobile work.

## Recommended Next Tasks
1. Replace the temporary icon implementation with direct `@expo/vector-icons` imports after a clean mobile dependency install.
2. Update `mobile/.env.example` with a clearer comment about LAN IP changes.
3. Run a final mobile QA pass on both Android and iPhone screen sizes.
4. Document or automate store seeding for additional slugs such as `dagi-ertib` if they should be available in local development.
5. Prepare deployment environment documentation if the next goal is staging or production.

## Quick Start Checklist
- Start PostgreSQL
- Start backend on port `4000`
- Start web app from the repo root
- Set `mobile/.env` to the current LAN IP and desired store slug
- Start Expo from `mobile/`
- Open Expo Go on the same Wi‑Fi network

## Ownership / Handoff Notes
If someone continues from this point, they should assume:

- local development is the current priority, not production deployment
- the mobile UI overhaul is complete enough for active QA
- the backend/storefront contract was not intentionally changed during the mobile UI work
- the next meaningful work is cleanup, deployment prep, or adding more store seeds and merchant scenarios
