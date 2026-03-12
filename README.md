# Seranet v2 — Stabilized MVP

This version removes Supabase and uses a traditional stack with a hardened checkout flow:

- **Backend:** Node.js + Express, Prisma ORM, SQLite for local dev (PostgreSQL ready)
- **Frontend:** React + Vite + React Router
- **Auth:** JWT with bcrypt password hashing
- **Payments:** Demo Telebirr simulation (pending → success after 3s)
- **Uploads:** Local disk via Multer

## Structure
- `frontend` code lives at the repo root in `src/`.
- `backend/` contains the Express API and Prisma schema.

## Backend setup
1. `cd backend`
2. Copy `.env.example` to `.env` and set:
   - `DATABASE_URL="file:./dev.db"` (default SQLite path)
   - `JWT_SECRET=your-jwt-secret`
3. Install deps and generate Prisma client:
   ```bash
   npm install
   npm run prisma:generate
   npx prisma db push
   ```
4. Start the API:
   ```bash
   npm run dev
   ```
   The server listens on `http://localhost:4000`.

### Demo Telebirr
`POST /payments/demo/initiate` sets payment status to `pending`, then automatically marks the payment and order `success/paid` after 3 seconds. No real Telebirr calls are made.

## Frontend setup
1. From the repo root: `npm install`
2. Create `.env` with `VITE_API_URL=http://localhost:4000`
3. Run the dev server with `npm run dev`

## Quality checks
- Root: `npm run lint`, `npm run typecheck`, `npm run build`, `npm test`
- Backend: `npm run prisma:generate`, `npm run build`, `npm test`

## Available API routes
- **Auth:** `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- **Merchant:** `GET /merchant/:id`, `GET /merchant/slug/:slug`, `PUT /merchant/:id`
- **Products:** `POST /products`, `GET /products?merchant=:id`, `GET /products/:id`, `PUT /products/:id`, `DELETE /products/:id`
- **Orders:** `POST /orders`, `GET /orders`, `GET /orders/:id`, `PUT /orders/:id/status`
- **Payments (demo):** `POST /payments/demo/initiate`
- **Uploads:** `POST /upload/image`

## Contract notes
- Merchant responses are sanitized. `passwordHash` is never returned from auth or merchant endpoints.
- `GET /orders` always returns the authenticated merchant's orders. The old `merchant` query parameter is ignored.
- `POST /orders` is server-priced. Send:
  ```json
  {
    "customerName": "Customer",
    "customerPhone": "0911222333",
    "customerAddress": "Addis Ababa",
    "items": [
      { "productId": "prod_123", "quantity": 2 }
    ]
  }
  ```
- The backend recalculates `priceAtPurchase` and `totalAmount`, rejects mixed-store carts, invalid quantities, inactive products, and insufficient stock.
- `POST /payments/demo/initiate` validates the order and amount before starting the demo payment.
- `POST /upload/image` now requires auth and only accepts common image MIME types.

## Notes
- JWT protects merchant endpoints; public storefront endpoints are open.
- Payments are demo-only. TODO markers can replace logic when integrating real Telebirr or another provider.
