-- Fix role assignment in trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, joined_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    CASE WHEN NEW.email = 'info.teamhaim@gmail.com' THEN 'coach' ELSE 'athlete' END,
    CURRENT_DATE
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix existing Team Haim profile to coach
UPDATE public.profiles
SET role = 'coach'
WHERE id = (SELECT id FROM auth.users WHERE email = 'info.teamhaim@gmail.com');
