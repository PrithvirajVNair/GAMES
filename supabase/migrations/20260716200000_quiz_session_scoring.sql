-- =============================================================================
-- MIGRATION: Server-Side Quiz Session Scoring
-- Fixes score manipulation vulnerability on the Flag Quiz leaderboard.
-- 
-- HOW IT WORKS:
-- 1. When a quiz starts, the frontend calls start_quiz_session() → server records
--    started_at = now() and returns a session UUID.
-- 2. When the quiz ends, the frontend calls submit_flag_quiz_score(session_id).
--    The RPC computes time_ms = (now() - started_at) itself — the client never
--    sends a time value.
-- 3. Direct INSERT on the scores table is blocked by RLS.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. QUIZ SESSIONS TABLE
-- -----------------------------------------------------------------------------
create table if not exists public.quiz_sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  quiz_type    text not null,                      -- e.g. 'flag_quiz'
  started_at   timestamptz not null default now(),
  completed    boolean not null default false,
  completed_at timestamptz
);

-- Index to quickly look up sessions for a user
create index if not exists idx_quiz_sessions_user_id
  on public.quiz_sessions (user_id);

-- RLS on quiz_sessions: users can only see and create their own sessions
alter table public.quiz_sessions enable row level security;

drop policy if exists "Users can insert their own quiz sessions" on public.quiz_sessions;
create policy "Users can insert their own quiz sessions"
  on public.quiz_sessions for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can read their own quiz sessions" on public.quiz_sessions;
create policy "Users can read their own quiz sessions"
  on public.quiz_sessions for select
  using (auth.uid() = user_id);


-- -----------------------------------------------------------------------------
-- 2. HARD MINIMUM TIME CONSTRAINT ON SCORES TABLE
-- Physically impossible to answer 250+ flags in under 60 seconds.
-- This is a DB-level safety net on top of the RPC validation.
-- -----------------------------------------------------------------------------
alter table public.scores
  drop constraint if exists scores_time_ms_minimum;

alter table public.scores
  add constraint scores_time_ms_minimum
    check (time_ms >= 60000);  -- 60 seconds minimum


-- -----------------------------------------------------------------------------
-- 3. LOCK DOWN DIRECT INSERTS ON SCORES TABLE
-- Remove any policy that allows users to insert directly.
-- Only the submit_flag_quiz_score RPC (security definer) can insert.
-- -----------------------------------------------------------------------------

-- Drop any existing permissive insert policies
drop policy if exists "Users can insert their own scores"     on public.scores;
drop policy if exists "Allow authenticated users to insert"   on public.scores;
drop policy if exists "Enable insert for authenticated users" on public.scores;
drop policy if exists "Allow insert for own user_id"         on public.scores;

-- Ensure RLS is enabled
alter table public.scores enable row level security;

-- Keep the SELECT policy so the leaderboard can still read scores
-- (existing select policies are untouched)

-- Create a policy that DENIES all direct inserts from the client.
-- The RPC runs as security definer so it bypasses RLS entirely.
drop policy if exists "Block direct score inserts" on public.scores;
create policy "Block direct score inserts"
  on public.scores for insert
  with check (false);  -- nobody can insert directly


-- -----------------------------------------------------------------------------
-- 4. RPC: start_quiz_session
-- Called by the frontend when the user starts a new quiz.
-- Returns the session UUID which the frontend stores in state.
-- -----------------------------------------------------------------------------
create or replace function public.start_quiz_session(quiz_type text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session_id uuid;
begin
  -- Only authenticated users can start a session
  if auth.uid() is null then
    raise exception 'Authentication required to start a quiz session';
  end if;

  -- Clean up old incomplete sessions for this user + quiz type
  -- (prevents session accumulation if user refreshes mid-game)
  delete from public.quiz_sessions
  where user_id   = auth.uid()
    and quiz_type = start_quiz_session.quiz_type
    and completed = false
    and started_at < now() - interval '4 hours';

  insert into public.quiz_sessions (user_id, quiz_type)
  values (auth.uid(), start_quiz_session.quiz_type)
  returning id into v_session_id;

  return v_session_id;
end;
$$;


-- -----------------------------------------------------------------------------
-- 5. RPC: submit_flag_quiz_score
-- Called by the frontend when the flag quiz is complete.
-- Computes time_ms on the server from the session's started_at timestamp.
-- Inserts into scores and returns the computed time_ms.
-- -----------------------------------------------------------------------------
create or replace function public.submit_flag_quiz_score(p_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session      public.quiz_sessions%rowtype;
  v_time_ms      bigint;
  v_score_id     uuid;
begin
  -- Must be authenticated
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  -- Load the session and lock the row to prevent race conditions
  select * into v_session
  from public.quiz_sessions
  where id      = p_session_id
    and user_id = auth.uid()
  for update;

  -- Session must exist and belong to the caller
  if not found then
    raise exception 'Session not found or does not belong to you';
  end if;

  -- Session must not already be used (prevent double-submit)
  if v_session.completed then
    raise exception 'This session has already been submitted';
  end if;

  -- Session must not be expired (max 4 hours — generous for a flag quiz)
  if v_session.started_at < now() - interval '4 hours' then
    raise exception 'Session has expired. Please start a new game.';
  end if;

  -- Compute elapsed time entirely on the server
  v_time_ms := extract(epoch from (now() - v_session.started_at)) * 1000;

  -- Enforce minimum time (sanity check — 60 s for 250+ flags is impossible)
  if v_time_ms < 60000 then
    raise exception 'Submitted time is physically impossible. Score rejected.';
  end if;

  -- Mark session as completed (prevents replay)
  update public.quiz_sessions
  set completed    = true,
      completed_at = now()
  where id = p_session_id;

  -- Insert the verified score (runs as security definer, bypasses RLS)
  insert into public.scores (user_id, time_ms, created_at)
  values (auth.uid(), v_time_ms, now())
  returning id into v_score_id;

  return jsonb_build_object(
    'score_id', v_score_id,
    'time_ms',  v_time_ms
  );
end;
$$;


-- Grant execute rights to authenticated users
grant execute on function public.start_quiz_session(text)  to authenticated;
grant execute on function public.submit_flag_quiz_score(uuid) to authenticated;
