export function normalizeText(value: string | null | undefined) {
  if (!value) return '';
  return value.replace(/\s+/g, ' ').trim();
}

export function parseJsonSafely(text: string) {
  const match = text.match(/```json\s*([\s\S]*?)\s*```/i) ?? text.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error('Gemini response did not contain JSON.');
  }

  return JSON.parse(match[1] ?? match[0]);
}
