import { Suspense } from 'react';
import { CandidateList } from '@/components/candidate-list';
import { CandidatePageSkeleton } from '@/components/skeleton';

export const dynamic = 'force-dynamic';

function normalizeSupabaseUrl(url: string | undefined) {
  if (!url) return null;
  return url.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
}

async function getCandidates() {
  const supabaseUrl = normalizeSupabaseUrl(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  );
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) return [];

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/candidates?select=*&order=created_at.desc`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      console.error('Supabase fetch failed', await response.text());
      return [];
    }

    const data = await response.json();
    const candidates = Array.isArray(data) ? data : [];
    console.log('Candidate fetch count', candidates.length);
    return candidates;
  } catch (error) {
    console.error('Candidates fetch error', error);
    return [];
  }
}

// Inner async component — Suspense will show skeleton while this loads
async function CandidatesContent() {
  const candidates = await getCandidates();
  return <CandidateList initialCandidates={candidates} />;
}

export default function CandidatesPage() {
  return (
    <Suspense fallback={<CandidatePageSkeleton />}>
      <CandidatesContent />
    </Suspense>
  );
}