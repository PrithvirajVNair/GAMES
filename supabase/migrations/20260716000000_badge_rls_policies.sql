-- 1. Create the trigger function to prevent normal users from modifying the badge column
create or replace function public.protect_badge_column()
returns trigger as $$
begin
  -- Check if the user is NOT the admin
  if coalesce(auth.jwt() ->> 'email', '') != 'pals234.pvr@gmail.com' then
    -- Force the new badge value to remain the same as the old value
    -- This ignores any attempts by the user to change their badge
    new.badge = old.badge;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- 2. Bind the trigger to the profiles table on UPDATE
drop trigger if exists ensure_badge_protection on public.profiles;
create trigger ensure_badge_protection
  before update on public.profiles
  for each row execute function public.protect_badge_column();

-- 3. Create a policy for the admin to update any user's profile
-- We drop it first in case this script is run multiple times
drop policy if exists "Allow admin to update any profile" on public.profiles;
create policy "Allow admin to update any profile" on public.profiles
  for update using (
    auth.jwt() ->> 'email' = 'pals234.pvr@gmail.com'
  );
