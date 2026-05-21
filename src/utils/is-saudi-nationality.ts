import { resolveLocalizedName } from '@/utils/resolve-localized-name';

function normalizeLabel(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value.trim().toLowerCase();
  return resolveLocalizedName(value).trim().toLowerCase();
}

/** True when nationality or country label resolves to Saudi Arabia (admin + API parity). */
export function isSaudiNationalityOrCountry(value: unknown): boolean {
  const label = normalizeLabel(value);
  if (!label) return false;
  return (
    label.includes('saudi') ||
    label.includes('السعود') ||
    label === 'ksa' ||
    label === 'sa'
  );
}

export function isSaudiNationalityRecord(
  nationality?: { id?: number; name?: unknown } | null
): boolean {
  if (!nationality) return false;
  return isSaudiNationalityOrCountry(nationality.name);
}
