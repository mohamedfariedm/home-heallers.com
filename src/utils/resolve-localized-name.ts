/**
 * Resolves display text from API name fields that may be:
 * - plain string
 * - JSON string: "{\"ar\":\"...\",\"en\":\"...\"}"
 * - { ar: string | object, en: string | object }
 * - double-nested: { ar: { ar, en }, en: { ar, en } }
 */
export function resolveLocalizedName(
  nameField: unknown,
  prefer: 'en' | 'ar' = 'en'
): string {
  if (nameField == null || nameField === '') return '';

  if (typeof nameField === 'string') {
    const trimmed = nameField.trim();
    if (!trimmed) return '';

    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        const fromParsed = resolveLocalizedName(parsed, prefer);
        if (fromParsed) return fromParsed;
      } catch {
        // use as plain string
      }
    }

    return trimmed;
  }

  if (typeof nameField !== 'object') {
    return String(nameField);
  }

  const obj = nameField as Record<string, unknown>;
  const localeOrder = prefer === 'en' ? (['en', 'ar'] as const) : (['ar', 'en'] as const);

  for (const key of localeOrder) {
    const value = obj[key];
    if (value == null || value === '') continue;
    const resolved = resolveLocalizedName(value, prefer);
    if (resolved) return resolved;
  }

  return '';
}

export function resolveLocalizedNameOrFallback(
  nameField: unknown,
  fallback = '—'
): string {
  const value = resolveLocalizedName(nameField);
  return value || fallback;
}

export function getReservationPatientName(row: {
  patient?: { name?: unknown };
  guest_info?: { name?: unknown };
}): string {
  return (
    resolveLocalizedName(row?.patient?.name) ||
    resolveLocalizedName(row?.guest_info?.name) ||
    '—'
  );
}
