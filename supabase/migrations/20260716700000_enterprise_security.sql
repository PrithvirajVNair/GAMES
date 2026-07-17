-- =============================================================================
-- MIGRATION: Enterprise Security Hardening
--
-- 1.  UUID-based admin system (replaces fragile email string comparisons)
-- 2.  Unified profiles column protection (replaces 2 separate triggers)
-- 3.  Rate limiting infrastructure
-- 4.  Admin audit log
-- 5.  All admin RPCs updated to use is_admin() + audit logging
-- 6.  start_quiz_session updated: input validation + rate limiting
-- 7.  anon role write lockdown
-- =============================================================================


-- =============================================================================
-- 1. UUID-BASED ADMIN SYSTEM
-- =============================================================================

create table if not exists public.admins (
  user_id    uuid references auth.users(id) on delete cascade primary key,
  granted_at timestamptz not null default now()
);

-- No RLS policies = zero direct access. Only security definer functions can touch this.
alter table public.admins enable row level security;

-- Seed the initial admin from the existing email
insert into public.admins (user_id)
select id from auth.users where email = 'pals234.pvr@gmail.com'
on conflict do nothing;

-- Lightweight helper called by every admin-gated function and trigger
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

grant execute on function public.is_admin() to authenticated;


-- =============================================================================
-- 2. UNIFIED PROFILES COLUMN PROTECTION
--    Replaces:  ensure_badge_protection (from 20260716000000)
--               ensure_ban_protection   (from 20260716600000)
--    Non-admin users may ONLY change username and avatar_url.
--    All other columns (id, created_at, badge, is_banned) are locked.
-- =============================================================================

create or replace function public.protect_profile_columns()
returns trigger as $$
begin
  if not public.is_admin() then
    new.id         := old.id;
    new.created_at := old.created_at;
    new.badge      := old.badge;
    new.is_banned  := old.is_banned;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Drop old individual triggers
drop trigger if exists ensure_badge_protection on public.profiles;
drop trigger if exists ensure_ban_protection   on public.profiles;
drop trigger if exists protect_profile_columns on public.profiles;

create trigger protect_profile_columns
  before update on public.profiles
  for each row execute function public.protect_profile_columns();


-- =============================================================================
-- 3. RATE LIMITING
--    Tracks per-user call counts in a rolling time window.
-- =============================================================================

create table if not exists public.rate_limit_log (
  id         bigserial primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  action     text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_rate_limit_lookup
  on public.rate_limit_log (user_id, action, created_at desc);

alter table public.rate_limit_log enable row level security;
-- No policies — zero direct access.

-- Returns true if the current user is rate-limited, false if the call is allowed.
-- Logging the call and pruning old records happens atomically inside this function.
create or replace function public.is_rate_limited(
  p_action         text,
  p_max_calls      int,
  p_window_seconds int
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  if auth.uid() is null then
    return true;
  end if;

  select count(*) into v_count
  from public.rate_limit_log
  where user_id    = auth.uid()
    and action     = p_action
    and created_at > now() - (p_window_seconds || ' seconds')::interval;

  if v_count >= p_max_calls then
    return true; -- rate limited
  end if;

  -- Record this call
  insert into public.rate_limit_log (user_id, action)
  values (auth.uid(), p_action);

  -- Prune records older than 24 h to keep the table lean
  delete from public.rate_limit_log
  where user_id    = auth.uid()
    and action     = p_action
    and created_at < now() - interval '24 hours';

  return false; -- allowed
end;
$$;


-- =============================================================================
-- 4. ADMIN AUDIT LOG
--    Records every admin action with timestamp, who did it, and on whom.
-- =============================================================================

create table if not exists public.admin_audit_log (
  id             bigserial primary key,
  admin_user_id  uuid not null references auth.users(id),
  action         text not null,
  target_user_id uuid,                      -- no FK — record must survive after user deletion
  details        jsonb,
  created_at     timestamptz not null default now()
);

alter table public.admin_audit_log enable row level security;

drop policy if exists "Admin can view audit log" on public.admin_audit_log;
create policy "Admin can view audit log"
  on public.admin_audit_log for select
  using (public.is_admin());


-- =============================================================================
-- 5. ADMIN RPCs — updated to use is_admin() + audit logging
-- =============================================================================

-- 5a. admin_ban_user
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
  v_target_email text;
begin
  if not public.is_admin() then
    raise exception 'Permission denied: admin only';
  end if;

  select email into v_target_email
  from auth.users where id = target_user_id;

  if not found then
    raise exception 'User not found';
  end if;

  -- Protect admin from self-ban
  if exists (select 1 from public.admins where user_id = target_user_id) then
    raise exception 'Cannot ban an admin account';
  end if;

  update public.profiles
  set is_banned = should_ban
  where id = target_user_id;

  insert into public.admin_audit_log (admin_user_id, action, target_user_id, details)
  values (
    auth.uid(),
    case when should_ban then 'ban_user' else 'unban_user' end,
    target_user_id,
    jsonb_build_object('email', v_target_email)
  );
end;
$$;


-- 5b. admin_delete_user
create or replace function public.admin_delete_user(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_target_email text;
  v_username     text;
begin
  if not public.is_admin() then
    raise exception 'Permission denied: admin only';
  end if;

  select u.email, p.username
  into v_target_email, v_username
  from auth.users u
  left join public.profiles p on p.id = u.id
  where u.id = target_user_id;

  if not found then
    raise exception 'User not found';
  end if;

  if exists (select 1 from public.admins where user_id = target_user_id) then
    raise exception 'Cannot delete an admin account';
  end if;

  -- Audit BEFORE deletion so the foreign key on admin_user_id still resolves
  insert into public.admin_audit_log (admin_user_id, action, target_user_id, details)
  values (
    auth.uid(),
    'delete_user',
    target_user_id,
    jsonb_build_object('email', v_target_email, 'username', v_username)
  );

  delete from auth.users where id = target_user_id;
end;
$$;


-- 5c. admin_get_all_users
create or replace function public.admin_get_all_users()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Permission denied: admin only';
  end if;

  return (
    select jsonb_agg(row_to_json(t) order by t.created_at desc)
    from (
      select
        p.id,
        p.username,
        p.avatar_url,
        p.badge,
        p.is_banned,
        p.created_at,
        u.email
      from public.profiles p
      join auth.users u on u.id = p.id
    ) t
  );
end;
$$;


-- =============================================================================
-- 6. start_quiz_session — input validation + rate limiting
-- =============================================================================

create or replace function public.start_quiz_session(p_quiz_type text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session_id  uuid;
  v_valid_types text[] := array['flag_quiz', 'shape_quiz', 'logo_quiz'];
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  -- Validate quiz type against whitelist
  if not (p_quiz_type = any(v_valid_types)) then
    raise exception 'Invalid quiz type: %', p_quiz_type;
  end if;

  -- Rate limit: max 30 session starts per hour (generous for legit players)
  if public.is_rate_limited('start_session', 30, 3600) then
    raise exception 'Too many requests. Please wait before starting a new quiz.';
  end if;

  -- Clean up this user's abandoned sessions (older than 4 hours)
  delete from public.quiz_sessions
  where user_id    = auth.uid()
    and completed  = false
    and started_at < now() - interval '4 hours';

  insert into public.quiz_sessions (user_id, quiz_type, started_at)
  values (auth.uid(), p_quiz_type, now())
  returning id into v_session_id;

  return v_session_id;
end;
$$;


-- =============================================================================
-- 7. ANON ROLE LOCKDOWN
--    Revoke all write access from unauthenticated users on every public table.
--    RLS policies are the primary gate, but revoke is the hard floor.
-- =============================================================================

revoke insert, update, delete on public.profiles         from anon;
revoke insert, update, delete on public.scores           from anon;
revoke insert, update, delete on public.quiz_sessions    from anon;
revoke insert, update, delete on public.rate_limit_log   from anon;
revoke insert, update, delete on public.admin_audit_log  from anon;
revoke insert, update, delete on public.admins           from anon;
