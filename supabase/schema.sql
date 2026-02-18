-- ============================================
-- LinkNest: Database Setup
-- Run this in the Supabase SQL Editor
-- ============================================

-- 1. Create the bookmarks table
create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  url text not null,
  tags text[] not null default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Keep updated_at current on updates
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_bookmarks_set_updated_at on public.bookmarks;
create trigger trg_bookmarks_set_updated_at
before update on public.bookmarks
for each row
execute function public.set_updated_at();

-- 2. Enable Row Level Security
alter table public.bookmarks enable row level security;

-- 3. RLS Policies

-- Users can only view their own bookmarks
create policy "Users can view own bookmarks"
  on public.bookmarks
  for select
  using (auth.uid() = user_id);

-- Users can insert their own bookmarks
create policy "Users can insert own bookmarks"
  on public.bookmarks
  for insert
  with check (auth.uid() = user_id);

-- Users can delete their own bookmarks
create policy "Users can delete own bookmarks"
  on public.bookmarks
  for delete
  using (auth.uid() = user_id);

-- Users can update their own bookmarks
create policy "Users can update own bookmarks"
  on public.bookmarks
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4. Create index for faster queries
create index if not exists idx_bookmarks_user_id on public.bookmarks(user_id);

-- 5. Enable realtime for bookmarks table
alter publication supabase_realtime add table public.bookmarks;
