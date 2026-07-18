-- Drop the old constraint
ALTER TABLE public.announcements DROP CONSTRAINT IF EXISTS announcements_type_check;

-- Add the new constraint with 'patch' included
ALTER TABLE public.announcements ADD CONSTRAINT announcements_type_check CHECK (type in ('news', 'game', 'patch'));
