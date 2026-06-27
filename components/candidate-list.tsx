'use client';

import { useMemo, useState } from 'react';
import {
  Search,
  Sparkles,
  MapPin,
  Briefcase,
  Mail,
  Phone,
  Github,
  Linkedin,
  LayoutGrid,
  Table2,
  ExternalLink,
} from 'lucide-react';
import { extractCandidateName } from '@/lib/candidate';

interface Candidate {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  skills?: string[] | null;
  total_years_of_experience?: number | null;
  most_recent_job_title?: string | null;
  location?: string | null;
  source_file_name?: string | null;
  raw_text?: string | null;
}

interface CandidateListProps {
  initialCandidates: Candidate[];
}

type ViewMode = 'card' | 'table';

function getInitials(name: string | null | undefined) {
  return (name ?? 'C')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase() ?? '')
    .join('') || 'C';
}

export function CandidateList({ initialCandidates }: CandidateListProps) {
  const [search, setSearch] = useState('');
  const [minExperience, setMinExperience] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('card');

  const normalizedCandidates = useMemo(() => {
    return (initialCandidates ?? []).map((c) => ({
      ...c,
      skills: Array.isArray(c.skills) ? c.skills : [],
      total_years_of_experience:
        typeof c.total_years_of_experience === 'number' ? c.total_years_of_experience : 0,
      location: c.location ?? null,
      name:
        extractCandidateName(c.name, {
          rawText: c.raw_text,
          sourceFileName: c.source_file_name,
        }) ?? null,
    }));
  }, [initialCandidates]);

  const filteredCandidates = useMemo(() => {
    return normalizedCandidates.filter((c) => {
      const skillMatch =
        !search ||
        c.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));
      const expMatch =
        !minExperience ||
        (c.total_years_of_experience ?? 0) >= Number(minExperience);
      const locMatch =
        !locationFilter ||
        (c.location ?? '').toLowerCase().includes(locationFilter.toLowerCase());
      return skillMatch && expMatch && locMatch;
    });
  }, [locationFilter, minExperience, normalizedCandidates, search]);

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-6 py-12">

      {/* Header */}
      <header className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8">
        <div className="flex items-center gap-3 text-sky-400">
          <Sparkles size={20} />
          <p className="text-sm font-semibold uppercase tracking-[0.3em]">Candidate Directory</p>
        </div>
        <h1 className="mt-4 text-3xl font-semibold">Search the talent pool with precision.</h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          Filter by skill, experience, and location to find the right professionals quickly.
        </p>
      </header>

      {/* Filters + View Toggle */}
      <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm text-slate-300">
            Skill search
            <div className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2">
              <Search size={16} className="text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="React, SQL..."
                className="w-full bg-transparent outline-none"
              />
            </div>
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-300">
            Minimum years
            <input
              value={minExperience}
              onChange={(e) => setMinExperience(e.target.value)}
              type="number"
              placeholder="3"
              className="rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 outline-none"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-300">
            Location
            <input
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              placeholder="Remote / London"
              className="rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 outline-none"
            />
          </label>
        </div>

        {/* View toggle + result count */}
        <div className="mt-5 flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Showing{' '}
            <span className="font-semibold text-white">{filteredCandidates.length}</span>{' '}
            candidate{filteredCandidates.length !== 1 ? 's' : ''}
          </p>

          <div className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-950/70 p-1">
            <button
              onClick={() => setViewMode('card')}
              title="Card view"
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                viewMode === 'card'
                  ? 'bg-sky-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid size={15} />
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Table view"
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                viewMode === 'table'
                  ? 'bg-sky-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Table2 size={15} />
              Table
            </button>
          </div>
        </div>
      </section>

      {/* ── CARD VIEW ── */}
      {viewMode === 'card' && (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredCandidates.length ? (
            filteredCandidates.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCandidate(c)}
                className="flex h-full flex-col rounded-3xl border border-slate-800 bg-slate-900/70 p-6 text-left transition hover:border-sky-500 hover:bg-slate-800/80"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-500/15 text-sm font-semibold text-sky-300">
                      {getInitials(c.name)}
                    </div>
                    <div className="min-w-0">
                      <h2 className="break-words text-base font-semibold">
                        {c.name ?? 'Unnamed candidate'}
                      </h2>
                      <p className="mt-0.5 text-sm text-slate-400">
                        {c.most_recent_job_title ?? 'No title'}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-300">
                    {c.total_years_of_experience ?? 0} yrs
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
                  <MapPin size={14} />
                  <span className="truncate">{c.location ?? 'Location unknown'}</span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {c.skills.slice(0, 4).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300"
                    >
                      {skill}
                    </span>
                  ))}
                  {c.skills.length > 4 && (
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-500">
                      +{c.skills.length - 4} more
                    </span>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="col-span-full rounded-3xl border border-slate-800 bg-slate-900/70 p-10 text-center text-slate-400">
              No candidates match the current filters.
            </div>
          )}
        </section>
      )}

      {/* ── TABLE VIEW ── */}
      {viewMode === 'table' && (
        <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70">
          {filteredCandidates.length ? (
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
                  {filteredCandidates.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedCandidate(c)}
                      className="cursor-pointer transition hover:bg-slate-800/60"
                    >
                      {/* Name + avatar */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-xs font-semibold text-sky-300">
                            {getInitials(c.name)}
                          </div>
                          <span className="font-medium text-white">
                            {c.name ?? 'Unnamed'}
                          </span>
                        </div>
                      </td>

                      {/* Job title */}
                      <td className="px-5 py-4 text-slate-300">
                        {c.most_recent_job_title ?? '—'}
                      </td>

                      {/* Experience */}
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-sky-500/10 px-2.5 py-1 text-xs font-semibold text-sky-300">
                          {c.total_years_of_experience ?? 0} yrs
                        </span>
                      </td>

                      {/* Location */}
                      <td className="px-5 py-4 text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={13} className="shrink-0" />
                          <span className="truncate max-w-[120px]">
                            {c.location ?? '—'}
                          </span>
                        </div>
                      </td>

                      {/* Skills */}
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {c.skills.slice(0, 3).map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-300"
                            >
                              {skill}
                            </span>
                          ))}
                          {c.skills.length > 3 && (
                            <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-500">
                              +{c.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Contact icons */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3 text-slate-500">
                          {c.email && (
                            <Mail size={15} className="hover:text-sky-400" title={c.email} />
                          )}
                          {c.phone && (
                            <Phone size={15} className="hover:text-sky-400" title={c.phone} />
                          )}
                          {c.linkedin_url && (
                            <a
                              href={c.linkedin_url.startsWith('http') ? c.linkedin_url : `https://${c.linkedin_url}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="hover:text-sky-400"
                            >
                              <Linkedin size={15} />
                            </a>
                          )}
                          {c.github_url && (
                            <a
                              href={c.github_url.startsWith('http') ? c.github_url : `https://${c.github_url}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="hover:text-sky-400"
                            >
                              <Github size={15} />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* View button */}
                      <td className="px-5 py-4">
                        <span className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300">
                          View <ExternalLink size={12} />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-10 text-center text-slate-400">
              No candidates match the current filters.
            </div>
          )}
        </section>
      )}

      {/* ── DETAIL MODAL ── */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">
            {/* Modal header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sky-500/15 text-lg font-bold text-sky-300">
                  {getInitials(selectedCandidate.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-widest text-sky-400">
                    Candidate profile
                  </p>
                  <h2 className="mt-1 break-words text-xl font-semibold">
                    {selectedCandidate.name ?? 'Unnamed candidate'}
                  </h2>
                  <p className="mt-0.5 text-slate-400">
                    {selectedCandidate.most_recent_job_title ?? 'No title'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="shrink-0 rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-300 hover:border-slate-500 hover:text-white"
              >
                Close
              </button>
            </div>

            {/* Modal body */}
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {/* Professional details */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                  <Briefcase size={15} /> Professional details
                </div>
                <div className="mt-3 space-y-2 text-sm text-slate-400">
                  <p>Experience: <span className="text-white">{selectedCandidate.total_years_of_experience ?? 0} years</span></p>
                  <p>Location: <span className="text-white">{selectedCandidate.location ?? 'Not specified'}</span></p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(selectedCandidate.skills ?? []).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-sky-500/10 px-3 py-1 text-xs text-sky-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact details */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                  <Mail size={15} /> Contact details
                </div>
                <div className="mt-3 space-y-2 text-sm text-slate-400">
                  <p className="flex items-center gap-2">
                    <Mail size={13} className="shrink-0" />
                    <span className="break-all">{selectedCandidate.email ?? 'N/A'}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone size={13} className="shrink-0" />
                    <span>{selectedCandidate.phone ?? 'N/A'}</span>
                  </p>
                  {selectedCandidate.linkedin_url && (
                    <a
                      href={
                        selectedCandidate.linkedin_url.startsWith('http')
                          ? selectedCandidate.linkedin_url
                          : `https://${selectedCandidate.linkedin_url}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 break-all hover:text-sky-300"
                    >
                      <Linkedin size={13} className="shrink-0" />
                      {selectedCandidate.linkedin_url}
                    </a>
                  )}
                  {selectedCandidate.github_url && (
                    <a
                      href={
                        selectedCandidate.github_url.startsWith('http')
                          ? selectedCandidate.github_url
                          : `https://${selectedCandidate.github_url}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 break-all hover:text-sky-300"
                    >
                      <Github size={13} className="shrink-0" />
                      {selectedCandidate.github_url}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}