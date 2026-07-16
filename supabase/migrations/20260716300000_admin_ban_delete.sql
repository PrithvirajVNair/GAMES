-- =============================================================================
-- MIGRATION: Admin Ban & Delete User Features
--
-- 1. Adds `is_banned` boolean column to profiles
-- 2. Creates admin_ban_user(target_user_id, should_ban) RPC
-- 3. Creates admin_delete_user(target_user_id) RPC
--
-- Both RPCs verify the caller is the admin (pals234.pvr@gmail.com) and refuse
-- to act on the admin account itself.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. ADD is_banned COLUMN TO profiles
-- -----------------------------------------------------------------------------
alter table public.profiles
  add column if not exists is_banned boolean not null default false;


-- -----------------------------------------------------------------------------
-- 2. RPC: admin_ban_user
-- Sets or clears the is_banned flag on a target profile.
-- Only callable by the admin. Cannot ban the admin account itself.
-- -----------------------------------------------------------------------------
create or replace function public.admin_ban_user(
  target_user_id uuid,
  should_ban     boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller_email text;
  v_target_email text;
begin
  -- Resolve caller's email from the JWT
  v_caller_email := coalesce(auth.jwt() ->> 'email', '');

  -- Only the admin may call this
  if v_caller_email != 'pals234.pvr@gmail.com' then
    raise exception 'Permission denied: admin only';
  end if;

  -- Resolve the target's email to prevent banning the admin account
  select email into v_target_email
  from auth.users
  where id = target_user_id;

  if not found then
    raise exception 'User not found';
  end if;

  if v_target_email = 'pals234.pvr@gmail.com' then
    raise exception 'Cannot ban the admin account';
  end if;

  -- Apply the ban / unban
  update public.profiles
  set is_banned = should_ban
  where id = target_user_id;
end;
$$;


-- -----------------------------------------------------------------------------
-- 3. RPC: admin_delete_user
-- Permanently deletes a user from auth.users.
-- Because profiles/scores use ON DELETE CASCADE, all related data is wiped.
-- Only callable by the admin. Cannot delete the admin account itself.
-- -----------------------------------------------------------------------------
create or replace function public.admin_delete_user(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller_email text;
  v_target_email text;
begin
  -- Resolve caller's email from the JWT
  v_caller_email := coalesce(auth.jwt() ->> 'email', '');

  -- Only the admin may call this
  if v_caller_email != 'pals234.pvr@gmail.com' then
    raise exception 'Permission denied: admin only';
  end if;

  -- Resolve the target's email
  select email into v_target_email
  from auth.users
  where id = target_user_id;

  if not found then
    raise exception 'User not found';
  end if;

  if v_target_email = 'pals234.pvr@gmail.com' then
    raise exception 'Cannot delete the admin account';
  end if;

  -- Delete from auth.users — cascades to profiles, scores, quiz_sessions, etc.
  delete from auth.users where id = target_user_id;
end;
$$;


-- Grant execute rights to authenticated users (the RPC enforces admin-only internally)
grant execute on function public.admin_ban_user(uuid, boolean) to authenticated;
grant execute on function public.admin_delete_user(uuid)       to authenticated;
