-- Create the announcements table
create table if not exists public.announcements (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  message text not null,
  type text not null check (type in ('news', 'game')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id) on delete set null
);

-- Enable Row Level Security (RLS)
alter table public.announcements enable row level security;

-- Policies for public reading
create policy "Allow public read access to announcements" on public.announcements
  for select using (true);

-- Policies for admin writing/modifying
create policy "Allow admin full access to announcements" on public.announcements
  for all using (
    auth.jwt() ->> 'email' = 'pals234.pvr@gmail.com'
  );
