-- 1. Create the user_reports table
create table public.user_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references auth.users(id) on delete cascade not null,
  reported_user_id uuid references auth.users(id) on delete cascade not null,
  reason text not null,
  status text default 'pending', -- 'pending', 'resolved', 'dismissed'
  created_at timestamp with time zone default now()
);

-- 2. Enable RLS
alter table public.user_reports enable row level security;

-- 3. Policies
-- Users can submit their own reports
create policy "Users can submit reports" on public.user_reports 
  for insert to authenticated 
  with check (auth.uid() = reporter_id);

-- Allow users to read their own reports so the frontend can check for duplicates
create policy "Users can view their own reports" on public.user_reports
  for select to authenticated
  using (auth.uid() = reporter_id);

-- 4. Prevent a user from reporting the same person multiple times if a report is already pending
create unique index if not exists unique_pending_report 
on public.user_reports (reporter_id, reported_user_id) 
where status = 'pending';

-- 5. RPC for admins to get pending reports
create or replace function public.admin_get_pending_reports()
returns table (
  id uuid,
  reporter_id uuid,
  reported_user_id uuid,
  reason text,
  status text,
  created_at timestamp with time zone,
  reporter_username text,
  reported_username text
) 
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Hardcoded admin check for ultimate security
  if auth.jwt() ->> 'email' != 'pals234.pvr@gmail.com' then
    raise exception 'Unauthorized';
  end if;

  return query
  select 
    ur.id,
    ur.reporter_id,
    ur.reported_user_id,
    ur.reason,
    ur.status,
    ur.created_at,
    pr.username as reporter_username,
    pu.username as reported_username
  from user_reports ur
  left join profiles pr on pr.id = ur.reporter_id
  left join profiles pu on pu.id = ur.reported_user_id
  where ur.status = 'pending'
  order by ur.created_at desc;
end;
$$;

-- 6. RPC for admins to resolve reports
create or replace function public.admin_resolve_report(
  target_report_id uuid,
  new_status text,
  should_ban boolean default false
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reported_user_id uuid;
begin
  if auth.jwt() ->> 'email' != 'pals234.pvr@gmail.com' then
    raise exception 'Unauthorized';
  end if;

  -- Get the reported user ID
  select reported_user_id into v_reported_user_id from user_reports where id = target_report_id;

  -- Update report status
  update user_reports set status = new_status where id = target_report_id;

  -- If admin chose to ban the user
  if should_ban then
    update profiles set is_banned = true where id = v_reported_user_id;
  end if;
end;
$$;
