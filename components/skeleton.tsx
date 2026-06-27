// Shimmer animation is defined in globals.css
// Each skeleton component matches the exact shape of the real content

/* ─── Utility ─────────────────────────────────────────── */

function Shimmer({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-slate-800 ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
    </div>
  );
}

/* ─── Single card skeleton ─────────────────────────────── */

export function CandidateCardSkeleton() {
  return (
    <div className="flex h-full flex-col rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
      {/* Avatar + name */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Shimmer className="h-11 w-11 shrink-0 !rounded-2xl" />
          <div className="space-y-2 pt-1">
            <Shimmer className="h-4 w-32" />
            <Shimmer className="h-3 w-24" />
          </div>
        </div>
        <Shimmer className="h-6 w-14 !rounded-full" />
      </div>

      {/* Location */}
      <div className="mt-4 flex items-center gap-2">
        <Shimmer className="h-3 w-3 !rounded-full" />
        <Shimmer className="h-3 w-28" />
      </div>

      {/* Skill tags */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Shimmer className="h-6 w-16 !rounded-full" />
        <Shimmer className="h-6 w-20 !rounded-full" />
        <Shimmer className="h-6 w-14 !rounded-full" />
        <Shimmer className="h-6 w-18 !rounded-full" />
      </div>
    </div>
  );
}

/* ─── Card grid skeleton (default 6 cards) ─────────────── */

export function CandidateCardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CandidateCardSkeleton key={i} />
      ))}
    </section>
  );
}

/* ─── Single table row skeleton ────────────────────────── */

export function CandidateTableRowSkeleton() {
  return (
    <tr className="border-b border-slate-800">
      {/* Name + avatar */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <Shimmer className="h-9 w-9 shrink-0 !rounded-xl" />
          <Shimmer className="h-4 w-28" />
        </div>
      </td>
      {/* Title */}
      <td className="px-5 py-4">
        <Shimmer className="h-4 w-36" />
      </td>
      {/* Experience */}
      <td className="px-5 py-4">
        <Shimmer className="h-6 w-14 !rounded-full" />
      </td>
      {/* Location */}
      <td className="px-5 py-4">
        <Shimmer className="h-4 w-24" />
      </td>
      {/* Skills */}
      <td className="px-5 py-4">
        <div className="flex gap-1.5">
          <Shimmer className="h-5 w-14 !rounded-full" />
          <Shimmer className="h-5 w-16 !rounded-full" />
          <Shimmer className="h-5 w-12 !rounded-full" />
        </div>
      </td>
      {/* Contact */}
      <td className="px-5 py-4">
        <div className="flex gap-3">
          <Shimmer className="h-4 w-4 !rounded-full" />
          <Shimmer className="h-4 w-4 !rounded-full" />
          <Shimmer className="h-4 w-4 !rounded-full" />
        </div>
      </td>
      {/* View */}
      <td className="px-5 py-4">
        <Shimmer className="h-4 w-10" />
      </td>
    </tr>
  );
}

/* ─── Table skeleton (default 6 rows) ──────────────────── */

export function CandidateTableSkeleton({ count = 6 }: { count?: number }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-5 py-4">Candidate</th>
              <th className="px-5 py-4">Title</th>
              <th className="px-5 py-4">Experience</th>
              <th className="px-5 py-4">Location</th>
              <th className="px-5 py-4">Top Skills</th>
              <th className="px-5 py-4">Contact</th>
              <th className="px-5 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {Array.from({ length: count }).map((_, i) => (
              <CandidateTableRowSkeleton key={i} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ─── Filter bar skeleton ───────────────────────────────── */

export function FilterBarSkeleton() {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col gap-2">
            <Shimmer className="h-3 w-20" />
            <Shimmer className="h-10 w-full !rounded-2xl" />
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between">
        <Shimmer className="h-4 w-28" />
        <Shimmer className="h-9 w-40 !rounded-xl" />
      </div>
    </section>
  );
}

/* ─── Full page skeleton (header + filters + grid) ─────── */

export function CandidatePageSkeleton({ viewMode = 'card' }: { viewMode?: 'card' | 'table' }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-6 py-12">
      {/* Header skeleton */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8">
        <Shimmer className="h-4 w-40" />
        <Shimmer className="mt-4 h-8 w-80" />
        <Shimmer className="mt-3 h-4 w-96" />
      </div>

      <FilterBarSkeleton />

      {viewMode === 'card' ? (
        <CandidateCardGridSkeleton />
      ) : (
        <CandidateTableSkeleton />
      )}
    </main>
  );
}