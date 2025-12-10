export interface Database {
  public: {
    Tables: {
      merchants: {
        Row: {
          id: string;
          business_name: string;
          owner_name: string;
          email: string;
          phone: string;
          password_hash: string;
          store_url_slug: string;
          logo_url: string | null;
          store_description: string | null;
          primary_color: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_name: string;
          owner_name: string;
          email: string;
          phone: string;
          password_hash: string;
          store_url_slug: string;
          logo_url?: string | null;
          store_description?: string | null;
          primary_color?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_name?: string;
          owner_name?: string;
          email?: string;
          phone?: string;
          password_hash?: string;
          store_url_slug?: string;
          logo_url?: string | null;
          store_description?: string | null;
          primary_color?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          merchant_id: string;
          name: string;
          description: string;
          price: number;
          stock_quantity: number;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          merchant_id: string;
          name: string;
          description?: string;
          price: number;
          stock_quantity?: number;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          merchant_id?: string;
          name?: string;
          description?: string;
          price?: number;
          stock_quantity?: number;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          merchant_id: string;
          customer_name: string;
          customer_phone: string;
          customer_address: string | null;
          order_status: 'pending' | 'paid' | 'cancelled' | 'fulfilled';
          total_amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          merchant_id: string;
          customer_name: string;
          customer_phone: string;
          customer_address?: string | null;
          order_status?: 'pending' | 'paid' | 'cancelled' | 'fulfilled';
          total_amount: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          merchant_id?: string;
          customer_name?: string;
          customer_phone?: string;
          customer_address?: string | null;
          order_status?: 'pending' | 'paid' | 'cancelled' | 'fulfilled';
          total_amount?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price_at_purchase: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price_at_purchase: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          price_at_purchase?: number;
          created_at?: string;
        };
      };
      payments_telebirr: {
        Row: {
          id: string;
          order_id: string;
          merchant_id: string;
          telebirr_txn_id: string | null;
          status: 'initiated' | 'success' | 'failed' | 'timeout' | 'cancelled';
          amount: number;
          customer_phone: string;
          request_payload: any | null;
          callback_payload: any | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          merchant_id: string;
          telebirr_txn_id?: string | null;
          status?: 'initiated' | 'success' | 'failed' | 'timeout' | 'cancelled';
          amount: number;
          customer_phone: string;
          request_payload?: any | null;
          callback_payload?: any | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          merchant_id?: string;
          telebirr_txn_id?: string | null;
          status?: 'initiated' | 'success' | 'failed' | 'timeout' | 'cancelled';
          amount?: number;
          customer_phone?: string;
          request_payload?: any | null;
          callback_payload?: any | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
