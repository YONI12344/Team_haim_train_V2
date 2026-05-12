-- Fix the coach profile role if it was incorrectly set to 'athlete'
-- Run this in the Supabase SQL editor

UPDATE public.profiles
SET role = 'coach'
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email = 'info.teamhaim@gmail.com'
);

-- Verify the result
SELECT id, full_name, role FROM public.profiles
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email = 'info.teamhaim@gmail.com'
);
