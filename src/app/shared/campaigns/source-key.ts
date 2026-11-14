/** Matches the API: trim, collapse internal whitespace, lowercase. */
export function normalizeSourceKey(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}
