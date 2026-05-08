-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- profiles
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  phone text,
  role text not null default 'athlete' check (role in ('coach','athlete')),
  group_name text,
  joined_at date default current_date,
  notes text,
  created_at timestamptz default now()
);

-- training plans (one per athlete per week)
create table training_plans (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references profiles(id) on delete cascade,
  week_start date not null,
  title text,
  coach_notes text,
  created_at timestamptz default now(),
  unique (athlete_id, week_start)
);

-- workouts
create table workouts (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references training_plans(id) on delete cascade,
  athlete_id uuid not null references profiles(id) on delete cascade,
  workout_date date not null,
  workout_type text not null check (workout_type in ('Easy','Tempo','Intervals','Long Run','Recovery','Strength','Race','Rest')),
  planned_distance_km numeric,
  planned_pace numeric,
  planned_duration_min int,
  planned_intensity int check (planned_intensity between 1 and 10),
  planned_notes text,
  actual_distance_km numeric,
  actual_pace numeric,
  actual_duration_min int,
  actual_avg_hr int,
  actual_rpe int check (actual_rpe between 1 and 10),
  athlete_notes text,
  status text not null default 'planned' check (status in ('planned','in_progress','completed','missed')),
  created_at timestamptz default now()
);

-- interval sets
create table interval_sets (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references workouts(id) on delete cascade,
  set_number int not null,
  distance_m int,
  target_seconds int,
  actual_seconds int,
  hr int,
  rest_seconds int
);

-- Enable RLS
alter table profiles enable row level security;
alter table training_plans enable row level security;
alter table workouts enable row level security;
alter table interval_sets enable row level security;

-- Helper function to get current user role
create or replace function get_user_role()
returns text as $$
  select role from profiles where id = auth.uid();
$$ language sql security definer stable;

-- profiles policies
create policy "Users can view own profile" on profiles
  for select using (id = auth.uid() or get_user_role() = 'coach');

create policy "Users can update own profile" on profiles
  for update using (id = auth.uid());

create policy "Users can insert own profile" on profiles
  for insert with check (id = auth.uid());

-- training_plans policies
create policy "Athletes view own plans" on training_plans
  for select using (athlete_id = auth.uid() or get_user_role() = 'coach');

create policy "Coaches manage all plans" on training_plans
  for all using (get_user_role() = 'coach');

-- workouts policies
create policy "Athletes view own workouts" on workouts
  for select using (athlete_id = auth.uid() or get_user_role() = 'coach');

create policy "Athletes update own workouts" on workouts
  for update using (athlete_id = auth.uid() or get_user_role() = 'coach');

create policy "Coaches manage all workouts" on workouts
  for all using (get_user_role() = 'coach');

-- interval_sets policies
create policy "Athletes view own interval sets" on interval_sets
  for select using (
    exists (
      select 1 from workouts w
      where w.id = interval_sets.workout_id
      and (w.athlete_id = auth.uid() or get_user_role() = 'coach')
    )
  );

create policy "Coaches manage interval sets" on interval_sets
  for all using (get_user_role() = 'coach');

-- Trigger: auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
declare
  coach_emails text;
  is_coach boolean;
begin
  coach_emails := coalesce(current_setting('app.coach_emails', true), '');
  is_coach := (
    coach_emails != '' and
    new.email = any(string_to_array(coach_emails, ','))
  );
  
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    case when is_coach then 'coach' else 'athlete' end
  )
  on conflict (id) do nothing;
  
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
