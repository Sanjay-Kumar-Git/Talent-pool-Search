# Talent Pool Search

A web app for recruiters to upload resumes (PDF or Word), automatically extract
candidate details, and search/filter the resulting talent pool — without ever
sending personally identifiable information (PII) to a third-party AI model.

**Live app:** https://talent-pool-search.onrender.com/candidates
**Repo:** https://github.com/Sanjay-Kumar-Git/Talent-pool-Search

> ⚠️ Free-tier hosting note: the app is deployed on Render's free plan, which
> spins down after periods of inactivity. The first request after idling can
> take 30–50 seconds to wake up — this is expected, not a bug.

---

## What it does

1. **Upload** — accepts multiple resumes at once, in PDF or Word (`.docx`) format.
2. **Extract & scrub locally, before any AI call:**
   - Raw text is extracted from each file on the server.
   - Contact details (name, email, phone, LinkedIn URL, GitHub URL) are pulled
     out using regex, **before** scrubbing.
   - The resume text is then scrubbed — emails, phone numbers, LinkedIn and
     GitHub URLs are replaced with placeholders (`[EMAIL]`, `[PHONE]`,
     `[LINKEDIN]`, `[GITHUB]`).
   - Only this **scrubbed** text is sent to the AI model. The AI never sees
     raw contact details.
3. **AI extraction** — the scrubbed text is sent to Gemini to extract skills,
   total years of experience, most recent job title, and location.
4. **Storage** — structured candidate data (contact details + AI-extracted
   fields) is stored in Supabase (PostgreSQL). The original uploaded files are
   **not** retained — only the extracted text and structured fields are saved,
   to keep the system's PII footprint as small as possible.
5. **Search & filter** — browse all candidates in a card/table view, filter by
   skill, minimum years of experience, and location, and click into any
   candidate to see their full profile.

No login or payment flow — this build focuses on the core upload → extract →
search loop.

---

## Tech stack & key decisions

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) | API routes + frontend in one deployable app |
| Database | Supabase (Postgres) | Generous free tier, instant REST/JS client, fast to set up |
| AI model | **Gemini** (Google AI Studio) | Free tier, good extraction accuracy for structured JSON-style output, and the assignment's recommended option |
| File parsing | Local extraction (PDF/Word parsed server-side) | Keeps raw resume content off any third party until after PII scrubbing |
| File storage | None — only extracted text/fields are persisted | Reduces what PII is stored at rest; nothing to leak from a file store that doesn't exist |
| Hosting | Render (free tier) | Simple GitHub-connected deploys for a Next.js Node service |

**On PII handling specifically:** contact details are extracted via regex
*before* the scrubbing step, so the structured contact fields (name, email,
phone, LinkedIn) are captured accurately from the original text — then the
text itself is scrubbed before it ever leaves the server to reach Gemini. The
AI model only ever sees skills/experience/career history, never raw contact
information.

---

## Project structure

```
talent-pool/
├── app/
│   ├── api/process/route.ts     # Upload handling: parse → extract PII → scrub → call Gemini → save
│   ├── candidates/page.tsx      # Search/filter candidate list view
│   ├── upload/page.tsx          # Upload UI with progress indicator
│   └── page.tsx                 # Landing page
├── components/
│   ├── candidate-list.tsx       # Card/table view + filters
│   ├── upload-experience.tsx    # Upload UI + progress state
│   └── ...
├── lib/
│   ├── gemini.ts                # Gemini API client + prompt for structured extraction
│   ├── supabase.ts              # Supabase client
│   └── candidate.js             # Candidate data helpers (regex PII extraction, scrubbing)
├── supabase/
│   └── schema.sql               # Database schema (see below)
├── test-data/                   # 25–30 sample fake resumes used for testing
└── README.md
```

> If your folder name for sample resumes differs from `test-data/`, update
> this path to match before submitting.

---

## Running locally

### Prerequisites

- Node.js 18.18+ (Next.js 14 requirement) — check with `node -v`
- npm (comes with Node)
- A free [Supabase](https://supabase.com) account/project
- A free Gemini API key from [Google AI Studio](https://aistudio.google.com)

### 1. Clone and install

```bash
git clone https://github.com/Sanjay-Kumar-Git/Talent-pool-Search.git
cd Talent-pool-Search
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** and run the schema below (also in `supabase/schema.sql`):

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

3. From your Supabase project's **Settings → API** page, copy the **Project URL**
   and **anon/public key**.

### 3. Get a Gemini API key

Go to [aistudio.google.com](https://aistudio.google.com), sign in, and generate
a free API key.

### 4. Configure environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

`.env.local` is git-ignored and should never be committed — see `.gitignore`.

### 5. Run in development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Run a production build locally (optional, recommended before deploying)

```bash
npm run build
npm start
```

> **Windows / PowerShell note:** if you see an error like *"running scripts is
> disabled on this system"* when running `npm run build`, either run
> `npm.cmd run build` instead, or (one-time fix, run PowerShell as
> Administrator) execute:
> `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`

---

## Test data

The `test-data/` folder contains 25–30 synthetically generated resumes covering
a mix of roles (software engineers, designers, project managers, sales,
operations) and seniority levels (junior, mid, senior), with varied skills,
locations, and some intentional career gaps and overlapping skill sets — used
to exercise the upload, extraction, and filtering flows realistically.

---

## Deployment

The app is deployed on [Render](https://render.com) as a Web Service:

- **Build command:** `npm install && npm run build`
- **Start command:** `npm start`
- Environment variables are configured in the Render dashboard, matching
  `.env.local` above.

Any push to `main` can be redeployed from the Render dashboard (or connect
auto-deploy on push if enabled).

---

## Known limitations / what I'd improve next

- Uploaded files are parsed and then discarded — there's no way to re-download
  the original resume later, only the extracted data. A real product would
  likely store the original file (e.g. in encrypted object storage) for
  audit/reference purposes while keeping the same PII-scrubbing pipeline for
  the AI call.
- No authentication — anyone with the URL can view the full candidate list.
  Fine for a take-home demo, not fine for production.
- Free-tier hosting means cold starts after inactivity.

---

## License

MIT
