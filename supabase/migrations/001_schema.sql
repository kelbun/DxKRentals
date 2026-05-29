-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text unique,
  role text check (role in ('customer', 'admin', 'partner')) default 'customer',
  phone text,
  created_at timestamp with time zone default now()
);

-- Partners table
create table public.partners (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  business_name text,
  created_at timestamp with time zone default now()
);

-- Cars table
create table public.cars (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references public.partners(id) on delete set null,
  name text not null,
  slug text unique not null,
  brand text,
  model text,
  year int,
  description text,
  daily_price numeric,
  weekend_price numeric,
  transmission text,
  fuel_type text,
  seats int,
  color text,
  mileage int,
  featured boolean default false,
  status text default 'available',
  created_at timestamp with time zone default now()
);

-- Car images
create table public.car_images (
  id uuid primary key default gen_random_uuid(),
  car_id uuid references public.cars(id) on delete cascade,
  image_url text not null,
  sort_order int default 0
);

-- Bookings
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  car_id uuid references public.cars(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  total_price numeric,
  status text check (status in ('pending','approved','rejected','active','completed','cancelled')) default 'pending',
  payment_status text default 'unpaid',
  payment_notes text,
  notes text,
  created_at timestamp with time zone default now()
);

-- Blocked dates
create table public.blocked_dates (
  id uuid primary key default gen_random_uuid(),
  car_id uuid references public.cars(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  reason text,
  created_at timestamp with time zone default now()
);

-- Driver documents
create table public.driver_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  document_url text not null,
  document_type text not null,
  approved boolean default false,
  uploaded_at timestamp with time zone default now()
);

-- Revenue logs
create table public.revenue_logs (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete cascade,
  amount numeric not null,
  partner_amount numeric not null,
  platform_amount numeric not null,
  created_at timestamp with time zone default now()
);
