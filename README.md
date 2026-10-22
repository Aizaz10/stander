# Stander - Modern Electronics & Gadgets Store

**Stander** is a production-ready, full-featured e-commerce platform built with the Next.js 16 App Router, React 19, TypeScript, and Supabase. It offers a shopping experience for electronics, laptops, smartphones, and accessories, paired with an administrative suite for catalog, inventory, and order management.

---

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack, Server Actions, Partial Prerendering)
- **Frontend**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (Persistent client-side cart)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, Auth, Stored Procedures via RPC)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict typing throughout)

---

## Core Features

### Storefront & Shopping Experience
- **Responsive Navigation**: Desktop navigation bar with category quick-links, interactive search, cart badge, user menu, and an accessible mobile hamburger drawer.
- **Product Catalog**: Live search filtering by query, category, price range, and sorting (price low/high, newest).
- **Product Details**: Multi-image gallery with fallbacks, sale badges, discount calculation, stock availability indicators, and related product recommendations.
- **Shopping Cart**: Client-side Zustand cart with local persistence, item quantity adjustments, and real-time subtotal calculation.
- **Checkout & Orders**: Frictionless checkout with Cash on Delivery (COD) payment method, atomic RPC transactions, and real-time order confirmation.
- **Order Tracking**: Customer order history with tracking statuses (`pending`, `confirmed`, `shipped`, `delivered`, `cancelled`).
- **Static & Information Pages**: Dedicated `/contact` (direct WhatsApp support and order tracking help), `/faq` (orders, delivery, payment and WhatsApp support questions), and `/shipping-returns` (delivery times, rates across Pakistan, and COD details).
- **SEO & Metadata**: Dynamic OpenGraph tags, title templates (`%s | Stander`), and SVG favicon (`app/icon.svg`).

### Admin Dashboard (`/admin`)
- **Executive Metrics**: Total revenue, order count, pending order queues, and inventory levels.
- **Product Management**: Create, edit, and delete catalog items with image URLs, stock tracking, categories, and featured flags.
- **Order Fulfillment**: Filter orders by status or search customer details, view order breakdown, and update statuses with automatic stock rollback on cancellation.
- **User Management**: Inspect customer accounts, registration dates, and role assignments.

---

## Getting Started

### 1. Prerequisites
- Node.js 20+ installed
- A [Supabase](https://supabase.com/) account and project

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone <repository-url>
cd Stander
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Supabase Database Setup

To initialize the database schema, security policies, and stored procedures, execute the SQL migration scripts in your **Supabase SQL Editor** in the following exact order:

### Step 1: Run `supabase/schema.sql`
Creates:
- Core tables (`profiles`, `categories`, `products`, `orders`, `order_items`)
- Row Level Security (RLS) policies for secure data access
- Automatic profile creation trigger on `auth.users` signup
- Helper functions (`is_admin()`, category and product seed data)

### Step 2: Run `supabase/orders.sql`
Creates:
- The `place_order` transactional stored procedure (RPC)
- Validates user authentication, verifies stock, inserts orders, and decrements product inventory atomically.

### Step 3: Run `supabase/admin-orders.sql`
Creates:
- The `admin_update_order_status` stored procedure (RPC)
- Enforces admin authorization, validates status transitions, and automatically restores inventory stock if an order is cancelled.

---

## Granting Admin Privileges

By default, every new user registers with the `customer` role. To promote a user to `admin`:

1. Sign up a new user via `/signup` (or navigate to Supabase Dashboard > Authentication > Users).
2. Open the **SQL Editor** in your Supabase dashboard and run:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'your-admin-email@example.com'
);
```

3. Sign out and sign back in on Stander. The user menu will now display the **Admin Panel** link leading to `/admin`.

---

## Development & Production Commands

- **Development server**:
  ```bash
  npm run dev
  ```
- **Run linting**:
  ```bash
  npm run lint
  ```
- **Build production bundle**:
  ```bash
  npm run build
  ```
- **Start production server**:
  ```bash
  npm run start
  ```

---

## License
MIT License. Built for Stander Store.
