-- Sprout: full Supabase schema and Row Level Security policies.
-- Run in Supabase -> SQL Editor. It is safe to run again (create ... if not exists, drop policy if exists).
-- The same SQL is shown in the setup modal in index.html; keep the two in sync.
-- PostgreSQL has no "create policy if not exists", so each policy is dropped and created again.
-- Every table with user data has RLS on and a policy: a user can only read and write rows where user_id = auth.uid().

create table if not exists notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
  title text, content text,
  created_at timestamptz default now()
);
create table if not exists stats (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
  month text, year int,
  ig int default 0, tt int default 0, tg int default 0, yt int default 0,
  posts int default 0, stories int default 0, reels int default 0, reach int default 0,
  tt_videos int default 0, tt_views int default 0,
  tg_posts int default 0, tg_views int default 0,
  yt_videos int default 0, yt_shorts int default 0, yt_views int default 0,
  note text, created_at timestamptz default now()
);
-- For existing installs: add columns if upgrading
alter table stats add column if not exists tg int default 0;
alter table stats add column if not exists yt int default 0;
alter table stats add column if not exists tt_videos int default 0;
alter table stats add column if not exists tt_views int default 0;
alter table stats add column if not exists tg_posts int default 0;
alter table stats add column if not exists tg_views int default 0;
alter table stats add column if not exists yt_videos int default 0;
alter table stats add column if not exists yt_shorts int default 0;
alter table stats add column if not exists yt_views int default 0;
create table if not exists reflections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
  question_idx int not null,
  question_text text, category text,
  answer text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, question_idx)
);
create table if not exists streak_days (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
  day_date date not null,
  created_at timestamptz default now(),
  unique (user_id, day_date)
);
create table if not exists goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
  network text not null,
  target int not null,
  deadline date,
  created_at timestamptz default now()
);
create table if not exists audience_portrait (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
  input_data text, ai_result text,
  updated_at timestamptz default now(),
  unique (user_id)
);
create table if not exists mentor_plan (
  user_id uuid primary key references auth.users,
  plan jsonb,
  generated_at timestamptz default now()
);
create table if not exists user_questionnaire (
  user_id uuid primary key references auth.users,
  gender text,
  profession text,
  field_experience text,
  has_blog text,
  blog_type text,
  blog_topic text,
  blog_experience text,
  niche text,
  hours_per_week text,
  blockers text[],
  needs text[],
  monetization text,
  goals text,
  updated_at timestamptz default now()
);
-- For existing installs:
alter table user_questionnaire add column if not exists profession text;
alter table user_questionnaire add column if not exists blog_type text;
alter table user_questionnaire add column if not exists blog_topic text;
alter table user_questionnaire add column if not exists display_name text;
alter table user_questionnaire add column if not exists accent_color text;
alter table user_questionnaire add column if not exists display_emoji text;
alter table user_questionnaire add column if not exists blockers_other text;
alter table user_questionnaire add column if not exists needs_other text;
create table if not exists chats (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
  title text,
  messages jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create table if not exists baseline (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
  ig_followers int default 0, tt_followers int default 0,
  tg_followers int default 0, yt_followers int default 0,
  total_posts int default 0, total_stories int default 0, total_reels int default 0,
  total_tt_videos int default 0,
  total_tg_posts int default 0,
  total_yt_videos int default 0, total_yt_shorts int default 0,
  set_at date,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id)
);
-- For existing installs:
alter table baseline add column if not exists tg_followers int default 0;
alter table baseline add column if not exists yt_followers int default 0;
alter table baseline add column if not exists total_tt_videos int default 0;
alter table baseline add column if not exists total_tg_posts int default 0;
alter table baseline add column if not exists total_yt_videos int default 0;
alter table baseline add column if not exists total_yt_shorts int default 0;
alter table notes enable row level security;
alter table stats enable row level security;
alter table reflections enable row level security;
alter table streak_days enable row level security;
alter table goals enable row level security;
alter table audience_portrait enable row level security;
alter table baseline enable row level security;
alter table chats enable row level security;
alter table user_questionnaire enable row level security;
alter table mentor_plan enable row level security;
drop policy if exists "own_chats" on chats;
create policy "own_chats" on chats
  using (auth.uid()=user_id) with check (auth.uid()=user_id);
drop policy if exists "own_questionnaire" on user_questionnaire;
create policy "own_questionnaire" on user_questionnaire
  using (auth.uid()=user_id) with check (auth.uid()=user_id);
drop policy if exists "own_mentor_plan" on mentor_plan;
create policy "own_mentor_plan" on mentor_plan
  using (auth.uid()=user_id) with check (auth.uid()=user_id);
drop policy if exists "own_notes" on notes;
create policy "own_notes" on notes
  using (auth.uid()=user_id) with check (auth.uid()=user_id);
drop policy if exists "own_stats" on stats;
create policy "own_stats" on stats
  using (auth.uid()=user_id) with check (auth.uid()=user_id);
drop policy if exists "own_reflections" on reflections;
create policy "own_reflections" on reflections
  using (auth.uid()=user_id) with check (auth.uid()=user_id);
drop policy if exists "own_streak" on streak_days;
create policy "own_streak" on streak_days
  using (auth.uid()=user_id) with check (auth.uid()=user_id);
drop policy if exists "own_goals" on goals;
create policy "own_goals" on goals
  using (auth.uid()=user_id) with check (auth.uid()=user_id);
drop policy if exists "own_audience" on audience_portrait;
create policy "own_audience" on audience_portrait
  using (auth.uid()=user_id) with check (auth.uid()=user_id);
drop policy if exists "own_baseline" on baseline;
create policy "own_baseline" on baseline
  using (auth.uid()=user_id) with check (auth.uid()=user_id);
