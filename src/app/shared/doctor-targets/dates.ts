/** Parse API/ISO date string (`yyyy-MM-dd`) to a local Date for pickers. */
export function parseIsoDate(value?: string | null): Date | null {
  if (!value) return null;
  const raw = value.slice(0, 10);
  const d = new Date(`${raw}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Format a Date as `yyyy-MM-dd` for API payloads. */
export function formatIsoDate(date: Date | null | undefined): string {
  if (!date || Number.isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** `yyyy-MM-dd` → `dd/mm/yyyy` */
export function isoToDisplayDate(value?: string | null): string {
  if (!value) return '';
  // Already display format
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;
  const iso = value.slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return '';
  return `${match[3]}/${match[2]}/${match[1]}`;
}

/** `dd/mm/yyyy` → `yyyy-MM-dd` (empty if invalid) */
export function parseDisplayDate(value?: string | null): string {
  if (!value) return '';
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
  if (!match) return '';
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return '';
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return '';
  }
  return formatIsoDate(date);
}

export const DATE_DISPLAY_FORMAT = 'dd/MM/yyyy';
