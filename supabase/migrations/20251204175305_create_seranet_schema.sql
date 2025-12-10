/*
  # Seranet E-commerce Platform - Complete Database Schema

  ## Overview
  This migration creates the complete database structure for Seranet, an Ethiopian e-commerce platform
  similar to Shopify, with support for multi-merchant stores, products, orders, and Telebirr payments.

  ## New Tables Created

  ### 1. `merchants`
  Stores merchant/business owner information and authentication details
  - `id` (uuid, primary key)
  - `business_name` (text) - Store/business name
  - `owner_name` (text) - Owner's full name
  - `email` (text, unique) - For login and notifications
  - `phone` (text) - Ethiopian phone format
  - `password_hash` (text) - Bcrypt hashed password
  - `store_url_slug` (text, unique) - URL-friendly store identifier (e.g., 'ethoclothes')
  - `logo_url` (text, nullable) - Logo stored in Supabase storage
  - `store_description` (text, nullable) - Store description
  - `primary_color` (text) - Store theme color
  - `is_active` (boolean) - Account status
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `products`
  Merchant products available for sale
  - `id` (uuid, primary key)
  - `merchant_id` (uuid, foreign key) - References merchants
  - `name` (text) - Product name
  - `description` (text) - Product details
  - `price` (decimal) - Price in Ethiopian Birr
  - `stock_quantity` (integer) - Inventory count
  - `image_url` (text, nullable) - Product image
  - `is_active` (boolean) - Visibility toggle
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `orders`
  Customer order records
  - `id` (uuid, primary key)
  - `merchant_id` (uuid, foreign key) - Which merchant received the order
  - `customer_name` (text) - Customer full name
  - `customer_phone` (text) - Customer contact
  - `customer_address` (text, nullable) - Delivery address
  - `order_status` (text) - Status: 'pending', 'paid', 'cancelled', 'fulfilled'
  - `total_amount` (decimal) - Total order value in Birr
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. `order_items`
  Junction table linking orders to products
  - `id` (uuid, primary key)
  - `order_id` (uuid, foreign key) - References orders
  - `product_id` (uuid, foreign key) - References products
  - `quantity` (integer) - Amount ordered
  - `price_at_purchase` (decimal) - Price snapshot at time of order
  - `created_at` (timestamptz)

  ### 5. `payments_telebirr`
  Telebirr payment transaction logs
  - `id` (uuid, primary key)
  - `order_id` (uuid, foreign key) - Associated order
  - `merchant_id` (uuid, foreign key) - Associated merchant
  - `telebirr_txn_id` (text, nullable) - Telebirr transaction ID
  - `status` (text) - Status: 'initiated', 'success', 'failed', 'timeout', 'cancelled'
  - `amount` (decimal) - Payment amount in Birr
  - `customer_phone` (text) - Telebirr account phone number
  - `request_payload` (jsonb, nullable) - API request sent to Telebirr
  - `callback_payload` (jsonb, nullable) - Telebirr response
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable Row Level Security (RLS) on all tables
  - Merchants can only access their own data
  - Public can view active products and storefronts
  - Orders and payments are private to merchants

  ## Indexes
  - Indexed on all foreign keys for performance
  - Unique indexes on email and store_url_slug
  - Index on order_status and payment status for filtering
*/

-- Create merchants table
CREATE TABLE IF NOT EXISTS merchants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL,
  owner_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  password_hash text NOT NULL,
  store_url_slug text UNIQUE NOT NULL,
  logo_url text,
  store_description text,
  primary_color text DEFAULT '#2563eb',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  price decimal(10,2) NOT NULL CHECK (price >= 0),
  stock_quantity integer NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_address text,
  order_status text NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'paid', 'cancelled', 'fulfilled')),
  total_amount decimal(10,2) NOT NULL CHECK (total_amount >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  price_at_purchase decimal(10,2) NOT NULL CHECK (price_at_purchase >= 0),
  created_at timestamptz DEFAULT now()
);

-- Create payments_telebirr table
CREATE TABLE IF NOT EXISTS payments_telebirr (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  merchant_id uuid NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  telebirr_txn_id text,
  status text NOT NULL DEFAULT 'initiated' CHECK (status IN ('initiated', 'success', 'failed', 'timeout', 'cancelled')),
  amount decimal(10,2) NOT NULL CHECK (amount >= 0),
  customer_phone text NOT NULL,
  request_payload jsonb,
  callback_payload jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_merchant_id ON products(merchant_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_merchant_id ON orders(merchant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments_telebirr(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_merchant_id ON payments_telebirr(merchant_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments_telebirr(status);
CREATE INDEX IF NOT EXISTS idx_merchants_slug ON merchants(store_url_slug);
CREATE INDEX IF NOT EXISTS idx_merchants_email ON merchants(email);

-- Create unique index on telebirr transaction ID
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_telebirr_txn_id ON payments_telebirr(telebirr_txn_id) WHERE telebirr_txn_id IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments_telebirr ENABLE ROW LEVEL SECURITY;

-- RLS Policies for merchants table
CREATE POLICY "Merchants can view own profile"
  ON merchants FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Merchants can update own profile"
  ON merchants FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can view merchant public info for storefronts"
  ON merchants FOR SELECT
  TO anon
  USING (is_active = true);

-- RLS Policies for products table
CREATE POLICY "Merchants can view own products"
  ON products FOR SELECT
  TO authenticated
  USING (merchant_id = auth.uid());

CREATE POLICY "Merchants can insert own products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (merchant_id = auth.uid());

CREATE POLICY "Merchants can update own products"
  ON products FOR UPDATE
  TO authenticated
  USING (merchant_id = auth.uid())
  WITH CHECK (merchant_id = auth.uid());

CREATE POLICY "Merchants can delete own products"
  ON products FOR DELETE
  TO authenticated
  USING (merchant_id = auth.uid());

CREATE POLICY "Public can view active products"
  ON products FOR SELECT
  TO anon
  USING (is_active = true);

-- RLS Policies for orders table
CREATE POLICY "Merchants can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (merchant_id = auth.uid());

CREATE POLICY "Merchants can update own orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (merchant_id = auth.uid())
  WITH CHECK (merchant_id = auth.uid());

CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  TO anon
  WITH CHECK (true);

-- RLS Policies for order_items table
CREATE POLICY "Merchants can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.merchant_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT
  TO anon
  WITH CHECK (true);

-- RLS Policies for payments_telebirr table
CREATE POLICY "Merchants can view own payments"
  ON payments_telebirr FOR SELECT
  TO authenticated
  USING (merchant_id = auth.uid());

CREATE POLICY "Anyone can create payment records"
  ON payments_telebirr FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "System can update payment records"
  ON payments_telebirr FOR UPDATE
  TO anon
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_merchants_updated_at
  BEFORE UPDATE ON merchants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments_telebirr
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();