create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (char_length(username) between 3 and 50),
  email text not null unique,
  role text not null default 'READER' check (role in ('READER', 'AUTHOR', 'ADMIN')),
  display_name text,
  bio text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, email, role)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'username'), ''), split_part(new.email, '@', 1) || '_' || left(new.id::text, 8)),
    new.email,
    'READER'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_auth_user();

create table if not exists public.author_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  username text not null,
  email text not null,
  pen_name text not null,
  introduction text not null,
  genres text not null,
  sample_work text,
  status text not null default 'PENDING' check (status in ('PENDING', 'APPROVED', 'REJECTED')),
  rejection_reason text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null
);

alter table public.profiles enable row level security;
alter table public.author_applications enable row level security;

create policy "profiles can read own row" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "profiles can update own row" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
