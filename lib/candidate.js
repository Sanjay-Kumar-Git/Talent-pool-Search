const COMMON_TITLE_WORDS = new Set([
  'account',
  'accountant',
  'admin',
  'analyst',
  'associate',
  'assistant',
  'consultant',
  'developer',
  'director',
  'engineer',
  'executive',
  'lead',
  'manager',
  'specialist',
  'support',
  'technical',
  'technician',
  'trainee',
  'senior',
  'junior',
  'software',
  'application',
  'production',
  'service',
  'operations',
  'intern',
  'consulting',
  'recruiter',
  'hr',
]);

const NON_NAME_WORDS = new Set([
  'resume',
  'cv',
  'profile',
  'summary',
  'skills',
  'experience',
  'education',
  'certification',
  'certifications',
  'projects',
  'contact',
  'phone',
  'email',
  'address',
  'linkedin',
  'github',
  'portfolio',
  'objective',
  'career',
  'computer',
  'science',
  'engineering',
  'technology',
  'btech',
  'be',
  'bachelor',
  'degree',
  'graduate',
  'college',
  'academic',
  'internship',
  'professional',
  'software',
  'application',
  'support',
  'technical',
  'development',
  'full',
  'stack',
  'systems',
  'operations',
  'monitoring',
  'analysis',
  'management',
  'cloud',
  'programming',
  'language',
  'languages',
]);

function titleCase(value) {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.replace(/[^A-Za-z]/g, ''))
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function looksLikeHumanName(value) {
  const normalized = value.trim().replace(/\s+/g, ' ');

  if (!normalized || normalized.length > 40) {
    return false;
  }

  const words = normalized.split(/\s+/);
  if (words.length < 2 || words.length > 4) {
    return false;
  }

  const cleanWords = words.map((word) => word.replace(/[^A-Za-z]/g, ''));
  if (cleanWords.some((word) => !word || word.length < 2)) {
    return false;
  }

  const lowered = cleanWords.map((word) => word.toLowerCase());
  if (lowered.some((word) => NON_NAME_WORDS.has(word))) {
    return false;
  }

  if (lowered.some((word) => COMMON_TITLE_WORDS.has(word))) {
    return false;
  }

  return cleanWords.every((word) => /^[A-Za-z]+$/.test(word));
}

export function normalizeTotalYearsOfExperience(value) {
  if (value === '.' || value === '' || value === null || value === undefined) {
    return 0;
  }

  const cleaned = typeof value === 'string' ? value.replace(/[^0-9.]/g, '').trim() : value;

  const parsed = typeof cleaned === 'string' ? Number(cleaned) : typeof cleaned === 'number' ? cleaned : Number.NaN;

  if (!Number.isFinite(parsed) || isNaN(parsed)) {
    return 0;
  }

  return Math.max(0, Math.round(parsed));
}

export function extractCandidateName(value, context = {}) {
  const directValue = typeof value === 'string' ? value.trim() : '';

  if (directValue && looksLikeHumanName(directValue)) {
    return titleCase(directValue);
  }

  const sourceText = [context.rawText, context.sourceFileName].filter(Boolean).join('\n');
  if (!sourceText) {
    return directValue || null;
  }

  const candidates = [];
  const lines = sourceText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    const cleaned = line
      .replace(/^[•\-\*\d.\s]+/, '')
      .replace(/[|,:;()]/g, ' ')
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleaned || cleaned.length > 45) {
      continue;
    }

    const matches = cleaned.match(/\b[A-Za-z][A-Za-z'’.-]*(?:\s+[A-Za-z][A-Za-z'’.-]*){1,3}\b/g) ?? [];

    for (const match of matches) {
      const normalized = match.trim().replace(/\s+/g, ' ');
      if (looksLikeHumanName(normalized) && !candidates.includes(normalized)) {
        candidates.push(normalized);
      }
    }
  }

  const fallback = candidates[0];
  return fallback ? titleCase(fallback) : directValue || null;
}
