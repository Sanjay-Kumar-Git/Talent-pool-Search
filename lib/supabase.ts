import { createClient } from '@supabase/supabase-js';

function normalizeSupabaseUrl(url: string | undefined) {
  if (!url) return null;

  return url.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
}

export function getSupabaseClient() {
  const supabaseUrl = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL);
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

  return supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
}

export const supabase = getSupabaseClient();
