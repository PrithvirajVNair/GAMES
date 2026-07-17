-- =============================================================================
-- MIGRATION: Protect is_banned Column
--
-- Adds a BEFORE UPDATE trigger that prevents any non-admin user from
-- modifying their own is_banned flag via the profiles table.
-- The admin_ban_user RPC (security definer) bypasses this because it
-- runs as the function owner, not as the calling user's JWT.
-- =============================================================================

create or replace function public.protect_ban_column()
returns trigger as $$
begin
  -- If the caller is not the admin, silently restore the original is_banned value.
  -- This makes the update "succeed" (no error) but the flag doesn't change —
  -- exactly like the badge protection pattern.
  if coalesce(auth.jwt() ->> 'email', '') != 'pals234.pvr@gmail.com' then
    new.is_banned = old.is_banned;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists ensure_ban_protection on public.profiles;
create trigger ensure_ban_protection
  before update on public.profiles
  for each row execute function public.protect_ban_column();
