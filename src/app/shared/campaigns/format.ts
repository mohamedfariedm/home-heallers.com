export function parseApiDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const normalized =
    value.length === 10 ? `${value}T00:00:00` : value.replace(' ', 'T');
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatCampaignDate(
  value: string | null | undefined,
  locale: string,
  withTime = false
): string {
  const date = parseApiDate(value);
  if (!date) return '—';
  const loc = locale.startsWith('ar') ? 'ar-SA' : 'en-GB';
  return date.toLocaleString(loc, {
    dateStyle: 'medium',
    ...(withTime ? { timeStyle: 'short' as const } : {}),
  });
}

export function formatCampaignBudget(
  budget: string | null | undefined,
  currency = 'SAR'
): string {
  if (budget === null || budget === undefined || budget === '') return '—';
  return `${budget} ${currency || 'SAR'}`;
}
