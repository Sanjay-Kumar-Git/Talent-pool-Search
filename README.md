# Talent Pool Search

A Next.js app for uploading resumes, extracting candidate details with regex and Gemini, and searching candidates from a Supabase-backed directory.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a Supabase project and enable the PostgreSQL database.
3. Create a table named `candidates` using the SQL below.
4. Add environment variables to `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   GEMINI_API_KEY=your-gemini-api-key
   ```
5. Run the app:
   ```bash
   npm run dev
   ```

## Supabase schema

```sql
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
```

## Notes

- The upload route extracts PII locally before sending scrubbed text to Gemini.
- The app uses a simple modal-based profile view for each candidate.
