-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- 1. Tables

-- profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  phone text,
  role text default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz default now()
);

-- categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text unique,
  slug text unique,
  image_url text,
  created_at timestamptz default now()
);

-- products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text,
  slug text unique,
  description text,
  price numeric(10,2),
  compare_at_price numeric(10,2),
  stock int default 0,
  category_id uuid references public.categories(id),
  brand text,
  images text[] default '{}',
  is_featured boolean default false,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  status text default 'pending' check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total numeric(10,2),
  shipping_name text,
  shipping_phone text,
  shipping_address text,
  shipping_city text,
  payment_method text default 'cod',
  created_at timestamptz default now()
);

-- order_items
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  product_name text,
  price numeric(10,2),
  quantity int
);

-- 2. Functions & Triggers

-- Trigger: auto-create profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    'customer'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function: is_admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- 3. Row Level Security (RLS)

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- profiles
create policy "Users can SELECT their own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can UPDATE their own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins can SELECT all profiles" on public.profiles for select using (public.is_admin());

-- categories
create policy "Everyone can SELECT categories" on public.categories for select using (true);
create policy "Admins can INSERT categories" on public.categories for insert with check (public.is_admin());
create policy "Admins can UPDATE categories" on public.categories for update using (public.is_admin());
create policy "Admins can DELETE categories" on public.categories for delete using (public.is_admin());

-- products
create policy "Everyone can SELECT products" on public.products for select using (true);
create policy "Admins can INSERT products" on public.products for insert with check (public.is_admin());
create policy "Admins can UPDATE products" on public.products for update using (public.is_admin());
create policy "Admins can DELETE products" on public.products for delete using (public.is_admin());

-- orders
create policy "Users can SELECT their own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Users can INSERT their own orders" on public.orders for insert with check (auth.uid() = user_id);
create policy "Admins can SELECT all orders" on public.orders for select using (public.is_admin());
create policy "Admins can UPDATE all orders" on public.orders for update using (public.is_admin());

-- order_items
create policy "Users can SELECT their own order items" on public.order_items for select using (
  exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);
create policy "Users can INSERT their own order items" on public.order_items for insert with check (
  exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);
create policy "Admins can SELECT all order items" on public.order_items for select using (public.is_admin());

-- 4. Storage

insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true) on conflict do nothing;

create policy "Anyone can read product-images" on storage.objects for select using (bucket_id = 'product-images');
create policy "Admins can upload to product-images" on storage.objects for insert with check (bucket_id = 'product-images' and public.is_admin());
create policy "Admins can update product-images" on storage.objects for update using (bucket_id = 'product-images' and public.is_admin());
create policy "Admins can delete product-images" on storage.objects for delete using (bucket_id = 'product-images' and public.is_admin());

-- 5. Seed Data

-- Clear existing data if re-running
delete from public.products;
delete from public.categories;

insert into public.categories (id, name, slug) values
  ('c1000000-0000-0000-0000-000000000001', 'Smartphones', 'smartphones'),
  ('c2000000-0000-0000-0000-000000000002', 'Laptops', 'laptops'),
  ('c3000000-0000-0000-0000-000000000003', 'Audio', 'audio'),
  ('c4000000-0000-0000-0000-000000000004', 'Wearables', 'wearables'),
  ('c5000000-0000-0000-0000-000000000005', 'Accessories', 'accessories');

insert into public.products (id, name, slug, description, price, compare_at_price, stock, category_id, brand, is_featured) values
  ('a1000000-0000-0000-0000-000000000001', 'Stander ProX Smartphone', 'stander-prox', 'Flagship smartphone with 120Hz display and advanced camera system.', 999.00, 1099.00, 50, 'c1000000-0000-0000-0000-000000000001', 'Stander', true),
  ('a2000000-0000-0000-0000-000000000002', 'Stander Lite 5G', 'stander-lite-5g', 'Affordable 5G connectivity with long-lasting battery.', 399.00, null, 100, 'c1000000-0000-0000-0000-000000000001', 'Stander', false),
  ('a3000000-0000-0000-0000-000000000003', 'UltraBook Z15', 'ultrabook-z15', 'Thin, light, and incredibly powerful laptop for professionals.', 1299.00, 1499.00, 30, 'c2000000-0000-0000-0000-000000000002', 'TechCorp', true),
  ('a4000000-0000-0000-0000-000000000004', 'DevMachine Pro 16', 'devmachine-pro-16', 'High-performance laptop tailored for developers and creators.', 1899.00, null, 20, 'c2000000-0000-0000-0000-000000000002', 'TechCorp', false),
  ('a5000000-0000-0000-0000-000000000005', 'SonicBuds Active', 'sonicbuds-active', 'True wireless earbuds with active noise cancellation.', 149.00, 199.00, 200, 'c3000000-0000-0000-0000-000000000003', 'AudioTech', true),
  ('a6000000-0000-0000-0000-000000000006', 'BassMax Over-Ear Studio', 'bassmax-studio', 'Studio-quality over-ear headphones for audiophiles.', 249.00, null, 80, 'c3000000-0000-0000-0000-000000000003', 'AudioTech', false),
  ('a7000000-0000-0000-0000-000000000007', 'FitWatch Series 5', 'fitwatch-series-5', 'Comprehensive health and fitness tracking on your wrist.', 299.00, 349.00, 150, 'c4000000-0000-0000-0000-000000000004', 'WearOS', true),
  ('a8000000-0000-0000-0000-000000000008', 'SportBand Essential', 'sportband-essential', 'Lightweight and durable fitness tracker.', 49.00, null, 300, 'c4000000-0000-0000-0000-000000000004', 'WearOS', false),
  ('a9000000-0000-0000-0000-000000000009', 'FastCharge 100W Adapter', 'fastcharge-100w', 'Super fast GaN charger for all your devices.', 59.00, 79.00, 400, 'c5000000-0000-0000-0000-000000000005', 'PowerPlus', false),
  ('a0000000-0000-0000-0000-000000000010', 'Braided USB-C Cable (2m)', 'braided-usbc-2m', 'Durable, tangle-free charging and data cable.', 19.00, null, 500, 'c5000000-0000-0000-0000-000000000005', 'PowerPlus', false);
