-- DailyLog Database Schema (Supabase PostgreSQL)

-- 1. PROFILES TABLE
-- Stores extra metadata linked to auth.users
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) on profiles
alter table public.profiles enable row level security;

-- Profiles Policies
create policy "Users can view own profile" 
  on public.profiles for select 
  using (auth.uid() = id);

create policy "Users can update own profile" 
  on public.profiles for update 
  using (auth.uid() = id);


-- 2. ENTRIES TABLE
-- Stores journal entries for users
create table public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  entry_date date not null,
  title text default '',
  content text default '',
  mood text constraint allowed_moods check (
    mood in ('amazing', 'happy', 'okay', 'tired', 'sad', 'angry', 'anxious', 'grateful', '')
  ),
  tags text[] default '{}',
  is_private boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Prevent multiple entries per user for a single day
  constraint unique_user_entry_date unique (user_id, entry_date)
);

-- Enable Row Level Security (RLS) on entries
alter table public.entries enable row level security;

-- Entries Policies (Strict ownership check)
create policy "Users can view own entries" 
  on public.entries for select 
  using (auth.uid() = user_id);

create policy "Users can insert own entries" 
  on public.entries for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own entries" 
  on public.entries for update 
  using (auth.uid() = user_id);

create policy "Users can delete own entries" 
  on public.entries for delete 
  using (auth.uid() = user_id);


-- 3. TRIGGERS & FUNCTIONS
-- Automatically create a profile when a new user registers via Supabase auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

-- Bind trigger to auth.users table inserts
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
