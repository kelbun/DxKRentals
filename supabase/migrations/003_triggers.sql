-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, phone)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Prevent overlapping bookings
create or replace function public.check_booking_overlap()
returns trigger as $$
begin
  if exists (
    select 1 from public.bookings
    where car_id = new.car_id
      and id != coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
      and status in ('approved', 'active')
      and daterange(start_date, end_date, '[]') && daterange(new.start_date, new.end_date, '[]')
  ) then
    raise exception 'Vehicle is not available for the selected dates';
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists prevent_booking_overlap on public.bookings;
create trigger prevent_booking_overlap
  before insert or update on public.bookings
  for each row execute procedure public.check_booking_overlap();
