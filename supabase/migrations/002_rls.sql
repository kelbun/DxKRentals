-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.partners enable row level security;
alter table public.cars enable row level security;
alter table public.car_images enable row level security;
alter table public.bookings enable row level security;
alter table public.blocked_dates enable row level security;
alter table public.driver_documents enable row level security;
alter table public.revenue_logs enable row level security;

-- Helper function to get current user role
create or replace function public.get_user_role()
returns text as $$
  select role from public.users where id = auth.uid();
$$ language sql security definer;

-- USERS policies
create policy "Users can read own profile"
  on public.users for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update using (auth.uid() = id);

create policy "Admins can read all users"
  on public.users for select using (get_user_role() = 'admin');

-- CARS policies (public read for available cars)
create policy "Anyone can view available cars"
  on public.cars for select using (status = 'available');

create policy "Admins have full car access"
  on public.cars for all using (get_user_role() = 'admin');

create policy "Partners can view own cars"
  on public.cars for select using (
    get_user_role() = 'partner' and
    partner_id in (select id from public.partners where user_id = auth.uid())
  );

-- CAR IMAGES policies
create policy "Anyone can view car images"
  on public.car_images for select using (true);

create policy "Admins can manage car images"
  on public.car_images for all using (get_user_role() = 'admin');

-- BOOKINGS policies
create policy "Customers can view own bookings"
  on public.bookings for select using (user_id = auth.uid());

create policy "Customers can create bookings"
  on public.bookings for insert with check (user_id = auth.uid());

create policy "Admins have full booking access"
  on public.bookings for all using (get_user_role() = 'admin');

create policy "Partners can view bookings for own cars"
  on public.bookings for select using (
    get_user_role() = 'partner' and
    car_id in (
      select c.id from public.cars c
      join public.partners p on p.id = c.partner_id
      where p.user_id = auth.uid()
    )
  );

-- BLOCKED DATES policies
create policy "Anyone can view blocked dates"
  on public.blocked_dates for select using (true);

create policy "Admins can manage blocked dates"
  on public.blocked_dates for all using (get_user_role() = 'admin');

-- DRIVER DOCUMENTS policies
create policy "Users can view own documents"
  on public.driver_documents for select using (user_id = auth.uid());

create policy "Users can upload own documents"
  on public.driver_documents for insert with check (user_id = auth.uid());

create policy "Admins can view all documents"
  on public.driver_documents for all using (get_user_role() = 'admin');

-- REVENUE LOGS policies
create policy "Admins can view all revenue"
  on public.revenue_logs for all using (get_user_role() = 'admin');

create policy "Partners can view own revenue"
  on public.revenue_logs for select using (
    get_user_role() = 'partner' and
    booking_id in (
      select b.id from public.bookings b
      join public.cars c on c.id = b.car_id
      join public.partners p on p.id = c.partner_id
      where p.user_id = auth.uid()
    )
  );
