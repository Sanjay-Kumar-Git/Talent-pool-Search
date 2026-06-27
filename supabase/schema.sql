create extension if not exists pgcrypto;

create table if not exists candidates (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  phone text,
  linkedin_url text,
  github_url text,
  skills text[] default '{}',
  total_years_of_experience integer default 0,
  most_recent_job_title text,
  location text,
  raw_text text,
  scrubbed_text text,
  source_file_name text,
  created_at timestamptz default now()
);

alter table candidates enable row level security;

drop policy if exists "allow_all_candidates" on candidates;
create policy "allow_all_candidates" on candidates
  for all
  using (true)
  with check (true);
