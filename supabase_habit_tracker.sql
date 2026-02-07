-- Create habits table (if it doesn't exist)
create table if not exists public.habits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  frequency text check (frequency in ('daily', 'weekly')) default 'daily',
  target_days integer default 7,
  color text default '#3b82f6',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create habit_completions table (if it doesn't exist)
create table if not exists public.habit_completions (
  id uuid default uuid_generate_v4() primary key,
  habit_id uuid references public.habits on delete cascade not null,
  user_id uuid references auth.users not null,
  completed_date text not null, -- Storing as YYYY-MM-DD
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(habit_id, completed_date)
);

-- Enable RLS (safe to run multiple times)
alter table public.habits enable row level security;
alter table public.habit_completions enable row level security;

-- Drop existing policies to avoid conflicts
drop policy if exists "Users can view own habits" on public.habits;
drop policy if exists "Users can insert own habits" on public.habits;
drop policy if exists "Users can update own habits" on public.habits;
drop policy if exists "Users can delete own habits" on public.habits;

drop policy if exists "Users can view own completions" on public.habit_completions;
drop policy if exists "Users can insert own completions" on public.habit_completions;
drop policy if exists "Users can delete own completions" on public.habit_completions;

-- Re-create Policies for habits
create policy "Users can view own habits" on public.habits
  for select using (auth.uid() = user_id);

create policy "Users can insert own habits" on public.habits
  for insert with check (auth.uid() = user_id);

create policy "Users can update own habits" on public.habits
  for update using (auth.uid() = user_id);

create policy "Users can delete own habits" on public.habits
  for delete using (auth.uid() = user_id);

-- Re-create Policies for completions
create policy "Users can view own completions" on public.habit_completions
  for select using (auth.uid() = user_id);

create policy "Users can insert own completions" on public.habit_completions
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own completions" on public.habit_completions
  for delete using (auth.uid() = user_id);
