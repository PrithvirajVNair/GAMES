-- Create the public.profiles table if it does not exist
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  username text unique not null constraint username_length check (char_length(username) >= 3 and char_length(username) <= 20),
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) on public.profiles
alter table public.profiles enable row level security;

-- Drop existing policies if they exist to avoid duplication errors
drop policy if exists "Allow public read access" on public.profiles;
drop policy if exists "Allow users to update their own profile" on public.profiles;

-- Create policies for client interaction
-- 1. Allow anyone to view profiles (e.g. personal stats, leaderboards)
create policy "Allow public read access" on public.profiles
  for select using (true);

-- 2. Allow users to update only their own profile
create policy "Allow users to update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Create a database function that executes with security definer privileges (bypassing RLS)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, created_at)
  values (
    new.id,
    -- Extract the username passed from auth metadata, fallback to a default if not present
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    coalesce(new.created_at, now())
  );
  return new;
end;
$$ language plpgsql security definer;

-- Bind the function to the auth.users AFTER INSERT event as a trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
