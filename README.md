# DxK Rentals — Premium Luxury Car Rental Platform

A full-stack luxury car rental platform built with Next.js, Tailwind CSS, and Supabase.

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
```bash
cp .env.example .env.local
```

### 3. Set up Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Run migrations in order in the Supabase SQL editor:
   - `supabase/migrations/001_schema.sql`
   - `supabase/migrations/002_rls.sql`
   - `supabase/migrations/003_triggers.sql`
3. (Optional) Run `supabase/seed.sql` for sample data
4. Create storage buckets: `car-images` (public) and `driver-documents` (private)
5. Enable Email auth in Authentication → Providers

### 4. Run locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### 5. Deploy to Vercel
1. Push to GitHub
2. Import repo in Vercel
3. Add your environment variables
4. Deploy

## Project Structure

```
src/
├── app/
│   ├── (public)/        # Homepage, cars listing, car detail
│   ├── (auth)/          # Login, signup pages
│   ├── (dashboard)/     # Admin & customer dashboards
│   └── api/             # REST API routes
├── components/
│   ├── ui/              # Button, Input, Badge, StatCard
│   ├── layout/          # Navbar, Footer, WhatsAppButton
│   ├── cards/           # CarCard
│   ├── forms/           # BookingForm
│   └── dashboard/       # RevenueChart
├── lib/
│   ├── supabase/        # Client, server, middleware helpers
│   ├── auth/            # getUser, requireRole
│   ├── validations/     # Zod schemas
│   └── utils/           # cn, format helpers
├── services/            # cars, bookings, availability, analytics
├── hooks/               # useUser, useBookings, useCars
└── types/               # TypeScript interfaces
```

## User Roles

| Role | Access |
|------|--------|
| `customer` | Browse fleet, submit bookings, view own history |
| `admin` | Full access — manage vehicles, approve bookings, analytics |
| `partner` | View assigned vehicles, earnings, booking calendar |

To make a user admin, update their role in Supabase:
```sql
update public.users set role = 'admin' where email = 'your@email.com';
```

## Key Features
- Luxury dark UI with gold accents
- Vehicle browsing with filters
- Booking request flow with availability checks
- Admin dashboard with revenue analytics
- Partner portal (scoped to their vehicles)
- RLS security on all tables
- Supabase Auth with auto profile creation
- WhatsApp contact integration

## Tech Stack
- **Frontend**: Next.js 14 App Router, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, RLS)
- **UI**: Framer Motion, Recharts, React Hook Form, Zod
- **Deployment**: Vercel + Supabase Cloud
