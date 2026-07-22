alter table public.author_applications
  add column if not exists full_name text,
  add column if not exists birth_date date,
  add column if not exists phone text,
  add column if not exists country text,
  add column if not exists rules_version text,
  add column if not exists rules_accepted_at timestamptz;

comment on column public.author_applications.full_name is 'Private identity data; visible only during author application review';
comment on column public.author_applications.phone is 'Private contact data; visible only during author application review';

notify pgrst, 'reload schema';
