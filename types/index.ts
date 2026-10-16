export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: 'customer' | 'admin';
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  stock: number;
  category_id: string | null;
  brand: string | null;
  images: string[];
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: number;
  user_id: string | null;
  guest_email: string | null;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  total: number | null;
  shipping_fee: number;
  shipping_name: string | null;
  shipping_phone: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  payment_method: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string | null;
  product_id: string | null;
  product_name: string | null;
  price: number | null;
  quantity: number | null;
}
