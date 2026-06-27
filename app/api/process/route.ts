import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { Groq } from 'groq-sdk';
import { supabase } from '@/lib/supabase';
import { extractCandidateName, normalizeTotalYearsOfExperience } from '@/lib/candidate';

(process as NodeJS.Process & { noDeprecation?: boolean }).noDeprecation = true;

const EMAIL_REGEX = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE_REGEX = /(?:\+?\d[\d().\-\s]{7,}\d)/g;
const LINKEDIN_REGEX = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s|)>"\]]+/gi;
const GITHUB_REGEX = /(?:https?:\/\/)?(?:www\.)?github\.com\/[^\s|)>"\]]+/gi;
const NAME_REGEX = /\b[A-Z][a-z]{1,20}(?:[ \t]+[A-Z][a-z]{1,20}){1,3}\b/g;

type StructuredResumeFields = {
  skills: string[];
  total_years_of_experience: number;
  most_recent_job_title: string;
  location: string;
};

type ExtractedPii = {
  name: string | null;
  email: string | null;
  phone: string | null;
  linkedin: string | null;
  github: string | null;
};

function extractPii(text: string): ExtractedPii {
  return {
    name: text.match(NAME_REGEX)?.[0] ?? null,
    email: text.match(EMAIL_REGEX)?.[0] ?? null,
    phone: text.match(PHONE_REGEX)?.[0] ?? null,
    linkedin: text.match(LINKEDIN_REGEX)?.[0] ?? null,
    github: text.match(GITHUB_REGEX)?.[0] ?? null,
  };
}

function scrubPii(text: string) {
  const pii = extractPii(text);
  const replacements: Array<[string | null, string]> = [
    [pii.name, '[NAME]'],
    [pii.email, '[EMAIL]'],
    [pii.phone, '[PHONE]'],
    [pii.linkedin, '[LINKEDIN]'],
    [pii.github, '[GITHUB]'],
  ];

  let scrubbed = text;

  for (const [value, marker] of replacements) {
    if (!value) continue;
    const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    scrubbed = scrubbed.replace(new RegExp(escaped, 'g'), marker);
  }

  return { scrubbed, pii };
}

async function extractTextFromPdf(buffer: Buffer) {
  const data = await pdfParse(buffer);
  return data.text;
}

async function extractTextFromDocx(buffer: Buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

function normalizeStructuredPayload(payload: unknown): StructuredResumeFields {
  const source = typeof payload === 'object' && payload !== null ? (payload as Record<string, unknown>) : {};

  const skills = Array.isArray(source.skills)
    ? source.skills.filter((item): item is string => typeof item === 'string')
    : [];

  return {
    skills,
    total_years_of_experience: normalizeTotalYearsOfExperience(source.total_years_of_experience),
    most_recent_job_title: typeof source.most_recent_job_title === 'string' ? source.most_recent_job_title : '',
    location: typeof source.location === 'string' ? source.location : '',
  };
}

async function extractStructuredFields(groq: Groq, scrubbedText: string): Promise<StructuredResumeFields> {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'You are an extraction assistant. Return one JSON object with exactly these keys and no extras: skills (array of strings), total_years_of_experience (number), most_recent_job_title (string), and location (string). Use empty arrays, empty strings, or 0 where information is missing. Return only JSON.',
      },
      {
        role: 'user',
        content: `Resume text:\n${scrubbedText}`,
      },
    ],
  });

  const rawPayload = completion.choices[0]?.message?.content ?? '{}';

  try {
    return normalizeStructuredPayload(JSON.parse(rawPayload));
  } catch {
    return {
      skills: [],
      total_years_of_experience: 0,
      most_recent_job_title: '',
      location: '',
    };
  }
}

export async function POST(request: Request) {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: 'GROQ_API_KEY is not configured.' }, { status: 500 });
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const formData = await request.formData();
  const files = formData.getAll('files') as File[];

  if (!files.length) {
    return NextResponse.json({ error: 'No files uploaded.' }, { status: 400 });
  }

  if (!supabase) {
    return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 500 });
  }

  const processedCandidates: Array<Record<string, unknown>> = [];
  const errors: string[] = [];

  for (const file of files) {
    try {
      const bytes = Buffer.from(await file.arrayBuffer());
      const extension = file.name.toLowerCase();
      let rawText = '';

      if (extension.endsWith('.pdf')) {
        rawText = await extractTextFromPdf(bytes);
      } else if (extension.endsWith('.docx')) {
        rawText = await extractTextFromDocx(bytes);
      } else {
        errors.push(`${file.name}: Unsupported file type. Use PDF or DOCX.`);
        continue;
      }

      if (!rawText.trim()) {
        errors.push(`${file.name}: Could not extract text. File may be image-based.`);
        continue;
      }

      const { scrubbed, pii } = scrubPii(rawText);
      const structured = await extractStructuredFields(groq, scrubbed);

      const candidate = {
        name: extractCandidateName(pii.name, { rawText, sourceFileName: file.name }) ?? null,
        email: pii.email ?? null,
        phone: pii.phone ?? null,
        linkedin_url: pii.linkedin ?? null,
        github_url: pii.github ?? null,
        skills: structured.skills,
        total_years_of_experience: structured.total_years_of_experience,
        most_recent_job_title: structured.most_recent_job_title || null,
        location: structured.location || null,
        raw_text: rawText,
        scrubbed_text: scrubbed,
        source_file_name: file.name,
      };

      const { error: dbError } = await supabase.from('candidates').insert(candidate);

      if (dbError) {
        console.error('Supabase insert error:', dbError);
        errors.push(`${file.name}: Failed to save to database — ${dbError.message}`);
      } else {
        processedCandidates.push(candidate);
      }
    } catch (err: any) {
      console.error(`Error processing ${file.name}:`, err?.message);
      errors.push(`${file.name}: Processing failed — ${err?.message ?? 'Unknown error'}`);
    }
  }

  const success = errors.length === 0;

  return NextResponse.json(
    {
      success,
      processed: processedCandidates.length,
      candidates: processedCandidates,
      errors,
    },
    { status: success ? 200 : 500 }
  );
}