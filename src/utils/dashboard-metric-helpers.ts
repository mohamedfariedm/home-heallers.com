/** Shared dashboard metric helpers — computed on the client from existing list `statistics`. */

export type MetricTone = 'excellent' | 'average' | 'danger' | 'info';

export function toPercent(part: number, whole: number, decimals = 1): number {
  if (!whole || whole <= 0) return 0;
  return Number(((part / whole) * 100).toFixed(decimals));
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/** Treat empty / null / literal "unknown" (any case) as unknown source. */
export function isUnknownSourceLabel(value: string | null | undefined): boolean {
  if (value == null) return true;
  const normalized = String(value).trim().toLowerCase();
  return normalized === '' || normalized === 'unknown' || normalized === 'null';
}

export function sumUnknownSourceCount(
  items: Array<{ source_campaign?: string | null; count?: number; reservations_count?: number }>
): { unknownCount: number; totalCount: number } {
  let unknownCount = 0;
  let totalCount = 0;
  for (const item of items) {
    const count = Number(item.count ?? item.reservations_count ?? 0);
    totalCount += count;
    if (isUnknownSourceLabel(item.source_campaign)) {
      unknownCount += count;
    }
  }
  return { unknownCount, totalCount };
}

export function getStatusCountFromStats(
  byStatus:
    | Array<{ status: string | null; count: number }>
    | Record<string, number | { count?: number } | undefined>
    | null
    | undefined,
  statusKey: string
): number {
  if (!byStatus) return 0;
  if (Array.isArray(byStatus)) {
    const found = byStatus.find(
      (item) => String(item.status || '').toLowerCase() === statusKey.toLowerCase()
    );
    return found?.count ?? 0;
  }
  const raw = byStatus[statusKey];
  if (typeof raw === 'number') return raw;
  if (raw && typeof raw === 'object') return Number(raw.count ?? 0);
  return 0;
}

/** Threshold helpers aligned with modules spec §12 */
export function toneForLeadQuality(rate: number): MetricTone {
  if (rate < 10) return 'danger';
  if (rate < 20) return 'average';
  return 'excellent';
}

export function toneForUnknownSource(rate: number): MetricTone {
  if (rate > 20) return 'danger';
  if (rate > 10) return 'average';
  return 'excellent';
}

export function toneForSupportToReservation(rate: number): MetricTone {
  if (rate < 5) return 'danger';
  if (rate < 10) return 'average';
  return 'excellent';
}

export function toneForSuccessRate(rate: number): MetricTone {
  if (rate < 8) return 'danger';
  if (rate < 15) return 'average';
  return 'excellent';
}

export function toneForFailedRate(rate: number): MetricTone {
  if (rate > 40) return 'danger';
  if (rate > 25) return 'average';
  return 'excellent';
}

export function toneForConfirmationRate(rate: number): MetricTone {
  if (rate < 85) return 'danger';
  if (rate < 95) return 'average';
  return 'excellent';
}

export function toneForCancellationRate(rate: number): MetricTone {
  if (rate > 8) return 'danger';
  if (rate > 4) return 'average';
  return 'excellent';
}

export function toneForCollectionRate(rate: number): MetricTone {
  if (rate < 85) return 'danger';
  if (rate < 95) return 'average';
  return 'excellent';
}

export function toneColors(tone: MetricTone) {
  switch (tone) {
    case 'excellent':
      return {
        bgColor: 'bg-green-50',
        textColor: 'text-green-600',
        darkBgColor: 'dark:bg-green-900/20',
        darkTextColor: 'dark:text-green-400',
        blurColor: 'bg-green-50/50',
        darkBlurColor: 'dark:bg-green-900/10',
      };
    case 'average':
      return {
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-600',
        darkBgColor: 'dark:bg-amber-900/20',
        darkTextColor: 'dark:text-amber-400',
        blurColor: 'bg-amber-50/50',
        darkBlurColor: 'dark:bg-amber-900/10',
      };
    case 'danger':
      return {
        bgColor: 'bg-red-50',
        textColor: 'text-red-600',
        darkBgColor: 'dark:bg-red-900/20',
        darkTextColor: 'dark:text-red-400',
        blurColor: 'bg-red-50/50',
        darkBlurColor: 'dark:bg-red-900/10',
      };
    default:
      return {
        bgColor: 'bg-slate-50',
        textColor: 'text-slate-600',
        darkBgColor: 'dark:bg-slate-900/20',
        darkTextColor: 'dark:text-slate-400',
        blurColor: 'bg-slate-50/50',
        darkBlurColor: 'dark:bg-slate-900/10',
      };
  }
}
