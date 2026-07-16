-- =============================================================================
-- MIGRATION: Admin Get All Users RPC
-- Creates an admin-only RPC that returns profiles joined with auth.users
-- so the admin panel can display each user's email address.
-- =============================================================================

create or replace function public.admin_get_all_users()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller_email text;
begin
  -- Only the admin may call this
  v_caller_email := coalesce(auth.jwt() ->> 'email', '');
  if v_caller_email != 'pals234.pvr@gmail.com' then
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

grant execute on function public.admin_get_all_users() to authenticated;
