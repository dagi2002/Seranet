# 🛍️ Seranet

<p align="center">
  A modern, full-stack e-commerce platform featuring a public storefront and a comprehensive merchant dashboard.
</p>

## ✨ Features

- **Storefront:** Beautiful, responsive shopping experience for customers to browse and purchase products.
- **Merchant Dashboard:** Full-featured control panel for managing inventory, tracking orders, and configuring store settings.
- **Secure Authentication:** Robust JWT-based authentication with bcrypt password hashing.
- **Robust Database:** Powered by Prisma ORM with PostgreSQL and Prisma migrations.
- **Payment Integration:** Built-in demo payment gateway (Telebirr simulation) for seamless checkout testing.
- **Media Handling:** Cloud-backed image uploads through Multer and Cloudinary.

## 🛠 Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, TypeScript, React Router, React Query
- **Backend:** Node.js, Express, Prisma, JWT, Multer, Cloudinary
- **Database:** PostgreSQL with Prisma ORM and migrations

## Deployment Prep

Deployment guidance now lives in [docs/deployment.md](/Users/dagemamogne/Downloads/Seranet/docs/deployment.md). It includes the recommended production architecture, required env vars, migration and seed rehearsal steps, file storage considerations, build/start commands, and the production readiness checklist. For the current free Render staging path, run Prisma migrations locally against Neon before redeploying the backend.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
3. Update `.env` with your settings:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/seranet?schema=public"
   DIRECT_URL="postgresql://postgres:postgres@localhost:5432/seranet?schema=public"
   JWT_SECRET="your-super-secret-jwt-key"
   PORT="4000"
   CORS_ORIGIN="http://localhost:5173"
   ```
4. Install dependencies and initialize the database:
   ```bash
   npm install
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   ```
5. Start the API server:
   ```bash
   npm run dev
   ```
   > The backend server will be running at `http://localhost:4000`.

### 2. Frontend Setup

1. Open a new terminal and stay in the repository root.
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL="http://localhost:4000/api"
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   > The application will automatically open in your default browser.

## ✅ Quality Checks

- Root: `npm run lint`, `npm run typecheck`, `npm run build`, `npm test`
- Backend: `npm run prisma:generate`, `npm run prisma:migrate:deploy`, `npm run build`, `npm test`

## 🔌 API Documentation

### Authentication
- `POST /auth/register` - Create a new merchant account
- `POST /auth/login` - Authenticate merchant
- `GET /auth/me` - Get current merchant profile

### Merchant & Store
- `GET /merchant/:id` - Get merchant details
- `GET /merchant/slug/:slug` - Get merchant by store slug
- `PUT /merchant/:id` - Update store settings (Protected)

### Products
- `POST /products` - Create new product (Protected)
- `GET /products?merchant=:id` - List products for a store
- `GET /products/:id` - Get single product details
- `PUT /products/:id` - Update product (Protected)
- `DELETE /products/:id` - Delete product (Protected)

### Orders & Payments
- `POST /orders` - Create a new order (Server-priced)
- `GET /orders` - List store orders for the authenticated merchant (Protected)
- `GET /orders/:id` - Get order details
- `PUT /orders/:id/status` - Update order status (Protected)
- `POST /payments/demo/initiate` - Start demo payment
- `POST /payments/demo/confirm` - Confirm demo payment

### Media
- `POST /upload/image` - Upload product/store images (Protected)

## 📝 Notes & Contracts

- **Security:** All merchant endpoints are protected via JWT. Storefront endpoints remain public for customer access. Merchant responses are sanitized (`passwordHash` is never returned).
- **Orders:** `GET /orders` always returns the authenticated merchant's orders. `POST /orders` is server-priced; the backend recalculates `priceAtPurchase` and `totalAmount`, rejects mixed-store carts, invalid quantities, inactive products, and insufficient stock.
- **Payments (Demo):** `POST /payments/demo/initiate` sets payment status to `pending`, validates the order and amount, then automatically marks the payment and order as `success/paid` after 3 seconds. No real Telebirr calls are made out-of-the-box. TODO markers are included for integrating real providers.
- **Uploads:** `POST /upload/image` requires auth and only accepts common image MIME types.

---
<p align="center">Built with ❤️ for modern commerce.</p>
