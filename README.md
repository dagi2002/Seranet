# Seranet - Ethiopian E-commerce Platform

A Shopify-like multi-merchant e-commerce platform built specifically for Ethiopia, featuring Telebirr payment integration.

## Features

### For Merchants
- **Merchant Authentication**: Secure registration and login system
- **Product Management**: Full CRUD operations for products with image support
- **Order Management**: Track customer orders with real-time status updates
- **Store Customization**: Customize store name, description, logo, and primary color
- **Dashboard Analytics**: View sales metrics, order counts, and recent activity
- **Telebirr Integration**: Accept payments via Telebirr mobile wallet

### For Customers
- **Public Storefronts**: Each merchant gets a unique storefront URL
- **Product Browsing**: Browse products with images, descriptions, and pricing
- **Shopping Cart**: Add products to cart with quantity management
- **Secure Checkout**: Complete orders with Telebirr payment integration
- **Order Confirmation**: Receive order confirmation after successful payment

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Authentication + Edge Functions)
- **Payment**: Telebirr Edge Function (mock implementation for MVP)
- **Icons**: Lucide React

## Database Schema

### Tables
1. **merchants** - Store merchant information and authentication
2. **products** - Product catalog with pricing and inventory
3. **orders** - Customer order records
4. **order_items** - Junction table linking orders to products
5. **payments_telebirr** - Telebirr payment transaction logs

All tables include Row Level Security (RLS) policies for secure data access.

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 2. Database Setup

The database schema has already been created with the following tables:
- merchants
- products
- orders
- order_items
- payments_telebirr

All tables have RLS enabled with appropriate policies.

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Usage Guide

### Merchant Registration

1. Navigate to `/register`
2. Fill in:
   - Business name
   - Owner name
   - Email
   - Phone (format: 09XXXXXXXX)
   - Password
   - Store URL slug (unique identifier)
3. Click "Create Store"

### Merchant Dashboard

After login, merchants can:
- View sales statistics
- Manage products (add, edit, delete)
- Track orders
- Customize store appearance
- Access their public storefront

### Product Management

1. Go to Products page
2. Click "Add Product"
3. Enter product details:
   - Name
   - Description
   - Price (in Ethiopian Birr)
   - Stock quantity
   - Image URL
   - Active status
4. Products appear immediately in the storefront

### Public Storefront

Each merchant gets a storefront at:
```
/store/[store_url_slug]
```

Customers can:
- Browse products
- Add items to cart
- Proceed to checkout
- Complete payment via Telebirr

## Telebirr Payment Integration

The MVP includes a Telebirr edge function at `/functions/telebirr-payment` with two endpoints:

### `/initiate`
Initiates a payment request
```json
POST /functions/v1/telebirr-payment/initiate
{
  "orderId": "uuid",
  "customerPhone": "0912345678"
}
```

### `/callback`
Receives payment confirmation from Telebirr
```json
POST /functions/v1/telebirr-payment/callback
{
  "outTradeNo": "order-id",
  "tradeStatus": "SUCCESS",
  "transactionId": "TB1234567890",
  "totalAmount": "450.00",
  "paymentTime": "2025-03-01 10:32:22",
  "message": "Payment successful"
}
```

## Key Features Implemented

### Authentication
- Supabase Auth integration
- JWT token-based sessions
- Protected routes for merchant dashboard
- Public routes for storefronts

### Product Catalog
- Image upload support
- Stock management
- Active/inactive toggle
- Search functionality

### Order Management
- Order creation and tracking
- Order status workflow: pending → paid → fulfilled
- Order details with customer information
- Payment status tracking

### Store Customization
- Unique store URL for each merchant
- Custom business name and description
- Logo upload
- Primary color selection
- Real-time preview

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Clean, modern UI
- Ethiopian user-friendly design

## Deployment

### Build for Production

```bash
npm run build
```

The production build will be created in the `dist` folder.

## Future Enhancements

- **Image Upload**: Direct image upload to Supabase Storage
- **Product Variants**: Support for sizes, colors, etc.
- **Inventory Management**: Low stock alerts
- **Shipping Integration**: Delivery tracking
- **Analytics Dashboard**: Advanced sales reports
- **Multi-language**: Amharic support
- **Customer Accounts**: Order history and tracking
- **Discount Codes**: Promotional pricing
- **Real Telebirr Integration**: Production API integration with RSA signatures

## Security Features

- Row Level Security (RLS) on all tables
- JWT authentication
- Secure password hashing
- Protected API routes
- CORS configuration
- Input validation

## Contributing

This is an MVP implementation. For production use, consider:
1. Implementing real Telebirr API integration
2. Adding proper image upload to Supabase Storage
3. Implementing email notifications
4. Adding more comprehensive error handling
5. Setting up monitoring and logging
6. Adding automated tests

## License

MIT

## Support

For issues or questions, please contact the development team.
