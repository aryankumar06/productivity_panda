-- =====================================================
-- ROLE-BASED WORKSPACE MANAGEMENT SYSTEM
-- Supabase Schema with Row Level Security
-- FIXED: Using SECURITY DEFINER functions to avoid recursion
-- =====================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =====================================================
-- STEP 1: CREATE ALL TABLES FIRST
-- =====================================================

-- USER PROFILES TABLE
create table if not exists public.user_profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  display_name text,
  user_code text unique, -- 6-digit unique invite code
  user_type text check (user_type in ('student', 'creator', 'professional')) default 'professional',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- WORKSPACES TABLE
create table if not exists public.workspaces (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  owner_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- WORKSPACE MEMBERS TABLE
create table if not exists public.workspace_members (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references public.workspaces on delete cascade not null,
  user_id uuid references auth.users not null,
  role text check (role in ('manager', 'employee')) default 'employee',
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(workspace_id, user_id),
  -- Add FK to user_profiles to enable easy joins
  constraint fk_workspace_user_profile foreign key (user_id) references public.user_profiles(id)
);

-- WORKSPACE INVITES TABLE
create table if not exists public.workspace_invites (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references public.workspaces on delete cascade not null,
  inviter_id uuid references auth.users not null,
  invitee_email text,
  invitee_id uuid references auth.users,
  status text check (status in ('pending', 'accepted', 'rejected')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- WORKSPACE TASKS TABLE
create table if not exists public.workspace_tasks (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references public.workspaces on delete cascade not null,
  title text not null,
  description text,
  status text check (status in ('todo', 'in_progress', 'review', 'done')) default 'todo',
  priority text check (priority in ('low', 'medium', 'high', 'urgent')) default 'medium',
  assignee_id uuid references auth.users,
  created_by uuid references auth.users not null,
  due_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TASK COMMENTS TABLE
create table if not exists public.task_comments (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references public.workspace_tasks on delete cascade not null,
  user_id uuid references auth.users not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- NOTIFICATIONS TABLE
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  type text check (type in ('alert', 'invite', 'mention', 'update', 'info')) not null,
  title text not null,
  message text not null,
  link text,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =====================================================
-- STEP 2: HELPER FUNCTIONS (SECURITY DEFINER - bypass RLS)
-- These MUST be created BEFORE policies that use them
-- =====================================================

-- Check if user is a member of a workspace (bypasses RLS)
create or replace function is_workspace_member(ws_id uuid, uid uuid)
returns boolean as $$
  select exists (
    select 1 from public.workspace_members 
    where workspace_id = ws_id and user_id = uid
  );
$$ language sql security definer stable;

-- Check if user is a manager of a workspace (bypasses RLS)
create or replace function is_workspace_manager(ws_id uuid, uid uuid)
returns boolean as $$
  select exists (
    select 1 from public.workspace_members 
    where workspace_id = ws_id 
    and user_id = uid 
    and role = 'manager'
  );
$$ language sql security definer stable;

-- Check if user owns a workspace (bypasses RLS)
create or replace function is_workspace_owner(ws_id uuid, uid uuid)
returns boolean as $$
  select exists (
    select 1 from public.workspaces 
    where id = ws_id and owner_id = uid
  );
$$ language sql security definer stable;

-- Get user's role in a workspace
create or replace function get_workspace_role(ws_id uuid, uid uuid)
returns text as $$
  select role from public.workspace_members 
  where workspace_id = ws_id and user_id = uid
  limit 1;
$$ language sql security definer stable;

-- =====================================================
-- STEP 3: ENABLE RLS ON ALL TABLES
-- =====================================================

alter table public.user_profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.workspace_invites enable row level security;
alter table public.workspace_tasks enable row level security;
alter table public.task_comments enable row level security;
alter table public.notifications enable row level security;

-- =====================================================
-- STEP 4: CREATE ALL POLICIES (using helper functions)
-- =====================================================

-- USER PROFILES POLICIES
create policy "Users can view any profile" on public.user_profiles
  for select using (true);

create policy "Users can update own profile" on public.user_profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.user_profiles
  for insert with check (auth.uid() = id);

-- WORKSPACES POLICIES (using helper functions)
create policy "Users can view workspaces they belong to" on public.workspaces
  for select using (
    auth.uid() = owner_id 
    or is_workspace_member(id, auth.uid())
  );

create policy "Users can create workspaces" on public.workspaces
  for insert with check (auth.uid() = owner_id);

create policy "Only owners can update workspaces" on public.workspaces
  for update using (auth.uid() = owner_id);

create policy "Only owners can delete workspaces" on public.workspaces
  for delete using (auth.uid() = owner_id);

-- WORKSPACE MEMBERS POLICIES (using helper functions)
create policy "Members can view workspace members" on public.workspace_members
  for select using (
    is_workspace_member(workspace_id, auth.uid())
    or is_workspace_owner(workspace_id, auth.uid())
  );

create policy "Managers or owners can add members" on public.workspace_members
  for insert with check (
    is_workspace_manager(workspace_id, auth.uid())
    or is_workspace_owner(workspace_id, auth.uid())
  );

create policy "Invitees can join workspace" on public.workspace_members
  for insert with check (
    auth.uid() = user_id
    and role = 'employee'
    and exists (
      select 1 from public.workspace_invites
      where workspace_id = workspace_members.workspace_id
      and invitee_id = auth.uid()
      and status = 'pending'
    )
  );

create policy "Managers can remove members" on public.workspace_members
  for delete using (
    is_workspace_manager(workspace_id, auth.uid())
  );

-- WORKSPACE INVITES POLICIES
create policy "Users can view relevant invites" on public.workspace_invites
  for select using (
    auth.uid() = invitee_id 
    or auth.uid() = inviter_id
    or is_workspace_manager(workspace_id, auth.uid())
  );

create policy "Managers can create invites" on public.workspace_invites
  for insert with check (
    is_workspace_manager(workspace_id, auth.uid())
  );

create policy "Invitees can update invite status" on public.workspace_invites
  for update using (auth.uid() = invitee_id);

-- WORKSPACE TASKS POLICIES
create policy "Members can view tasks" on public.workspace_tasks
  for select using (
    is_workspace_member(workspace_id, auth.uid())
  );

create policy "Managers can create tasks" on public.workspace_tasks
  for insert with check (
    is_workspace_manager(workspace_id, auth.uid())
  );

create policy "Managers can update any task" on public.workspace_tasks
  for update using (
    is_workspace_manager(workspace_id, auth.uid())
    or auth.uid() = assignee_id
  );

create policy "Managers can delete tasks" on public.workspace_tasks
  for delete using (
    is_workspace_manager(workspace_id, auth.uid())
  );

-- TASK COMMENTS POLICIES
create policy "Members can view comments" on public.task_comments
  for select using (
    exists (
      select 1 from public.workspace_tasks t
      where t.id = task_comments.task_id 
      and is_workspace_member(t.workspace_id, auth.uid())
    )
  );

create policy "Members can add comments" on public.task_comments
  for insert with check (
    exists (
      select 1 from public.workspace_tasks t
      where t.id = task_comments.task_id 
      and is_workspace_member(t.workspace_id, auth.uid())
    )
  );

-- NOTIFICATIONS POLICIES
create policy "Users can view own notifications" on public.notifications
  for select using (auth.uid() = user_id);

create policy "Users can update own notifications" on public.notifications
  for update using (auth.uid() = user_id);

create policy "Anyone can create notifications" on public.notifications
  for insert with check (true);

create policy "Users can delete own notifications" on public.notifications
  for delete using (auth.uid() = user_id);

-- =====================================================
-- STEP 5: TRIGGERS
-- =====================================================

-- Trigger to auto-add owner as manager when workspace is created
create or replace function add_owner_as_manager()
returns trigger as $$
begin
  insert into public.workspace_members (workspace_id, user_id, role)
  values (new.id, new.owner_id, 'manager');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_workspace_created on public.workspaces;
create trigger on_workspace_created
  after insert on public.workspaces
  for each row execute function add_owner_as_manager();

-- Trigger to create notification when invite is created
create or replace function notify_on_invite()
returns trigger as $$
begin
  if new.invitee_id is not null then
    insert into public.notifications (user_id, type, title, message, link)
    values (
      new.invitee_id,
      'invite',
      'Workspace Invitation',
      'You have been invited to join a workspace',
      'workspace:' || new.workspace_id
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_invite_created on public.workspace_invites;
create trigger on_invite_created
  after insert on public.workspace_invites
  for each row execute function notify_on_invite();

-- Trigger to create notification when task is assigned
create or replace function notify_on_task_assignment()
returns trigger as $$
begin
  if new.assignee_id is not null and (old is null or old.assignee_id is null or old.assignee_id != new.assignee_id) then
    insert into public.notifications (user_id, type, title, message, link)
    values (
      new.assignee_id,
      'alert',
      'New Task Assigned',
      'You have been assigned a new task: ' || new.title,
      'task:' || new.id
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_task_assigned on public.workspace_tasks;
create trigger on_task_assigned
  after insert or update on public.workspace_tasks
  for each row execute function notify_on_task_assignment();

-- Trigger to create user profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.user_profiles (id, email, user_code)
  values (
    new.id, 
    new.email,
    floor(random() * 900000 + 100000)::text
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill existing users (Optional - run manually if needed)
-- insert into public.user_profiles (id, email, user_code)
-- select id, email, floor(random() * 900000 + 100000)::text
-- from auth.users
-- where id not in (select id from public.user_profiles)
-- on conflict do nothing;

-- =====================================================
-- DONE! All tables, policies, and triggers created.
-- =====================================================
