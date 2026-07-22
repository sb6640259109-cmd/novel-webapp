create extension if not exists pgcrypto;

create table if not exists public.novels (
  id uuid primary key default gen_random_uuid(), title text not null, author text not null,
  genre text not null, description text not null, content text, rating double precision not null default 0,
  image text, owner_id text, owner_username text, moderation_status text not null default 'ACTIVE',
  moderation_reason text, copyright_status text not null default 'CLEAR', moderated_at timestamptz,
  moderated_by text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.chapters (
  id uuid primary key default gen_random_uuid(), novel_id uuid not null references public.novels(id) on delete cascade,
  title text not null, content text not null, "order" integer not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.novel_favorites (
  id uuid primary key default gen_random_uuid(), novel_id uuid not null references public.novels(id) on delete cascade,
  user_id text not null, created_at timestamptz not null default now(), unique(novel_id, user_id)
);
create table if not exists public.novel_followers (like public.novel_favorites including all);
alter table public.novel_followers add constraint novel_followers_novel_fk foreign key (novel_id) references public.novels(id) on delete cascade;
create table if not exists public.novel_ratings (
  id uuid primary key default gen_random_uuid(), novel_id uuid not null references public.novels(id) on delete cascade,
  user_id text not null, value double precision not null check (value between 0 and 5),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(novel_id, user_id)
);
create table if not exists public.novel_comments (
  id uuid primary key default gen_random_uuid(), novel_id uuid not null references public.novels(id) on delete cascade,
  user_id text not null, username text not null, text text not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.followed_authors (
  id uuid primary key default gen_random_uuid(), user_id text not null, author text not null,
  created_at timestamptz not null default now(), unique(user_id, author)
);
create table if not exists public.reading_history (
  id uuid primary key default gen_random_uuid(), user_id text not null, novel_id uuid not null references public.novels(id) on delete cascade,
  novel_title text not null, chapter_id uuid, chapter_title text, progress double precision not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(user_id, novel_id)
);

alter table public.novels enable row level security;
alter table public.chapters enable row level security;
alter table public.novel_favorites enable row level security;
alter table public.novel_followers enable row level security;
alter table public.novel_ratings enable row level security;
alter table public.novel_comments enable row level security;
alter table public.followed_authors enable row level security;
alter table public.reading_history enable row level security;
