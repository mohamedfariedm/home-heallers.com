export type DateRangeMode = 'last10Days' | 'monthToDate';

export type DateRangeKeys = {
  fromKey?: string;
  toKey?: string;
};

export type DateRange = {
  from: string;
  to: string;
};

/** Set on Clear/Reset so auto date defaults are not re-injected. */
export const ALL_DATES_PARAM = 'all_dates';

/** Reservation operational KPI filters that intentionally omit date_from/date_to. */
export const NO_DATE_DEFAULT_RESERVATION_FILTERS = new Set([
  'unassigned',
  'same_day_unassigned',
  'unscheduled_sessions',
]);

/** Query keys that mean “keep all-time / no date default”. */
export const NO_DATE_DEFAULT_PARAM_KEYS = [
  'follow_up_aging',
  'sla_breach',
  ALL_DATES_PARAM,
] as const;

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** Format a Date as YYYY-MM-DD in local time. */
export function formatLocalYmd(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** Last 10 days, today inclusive (today - 9 → today). */
export function getLast10DaysRange(now: Date = new Date()): DateRange {
  const to = new Date(now);
  const from = new Date(now);
  from.setDate(to.getDate() - 9);
  return { from: formatLocalYmd(from), to: formatLocalYmd(to) };
}

/** First day of the current month through today. */
export function getMonthToDateRange(now: Date = new Date()): DateRange {
  const to = new Date(now);
  const from = new Date(to.getFullYear(), to.getMonth(), 1);
  return { from: formatLocalYmd(from), to: formatLocalYmd(to) };
}

export function getDefaultDateRange(
  mode: DateRangeMode,
  now: Date = new Date()
): DateRange {
  return mode === 'monthToDate'
    ? getMonthToDateRange(now)
    : getLast10DaysRange(now);
}

export function resolveDateKeys(keys?: DateRangeKeys): {
  fromKey: string;
  toKey: string;
} {
  return {
    fromKey: keys?.fromKey ?? 'date_from',
    toKey: keys?.toKey ?? 'date_to',
  };
}

/**
 * True when the URL is a drill-down / explicit all-time clear that must stay without date defaults.
 */
export function shouldSkipDefaultDateRange(
  params: URLSearchParams | { get: (key: string) => string | null }
): boolean {
  const filter = params.get('filter');
  if (filter && NO_DATE_DEFAULT_RESERVATION_FILTERS.has(filter)) {
    return true;
  }

  for (const key of NO_DATE_DEFAULT_PARAM_KEYS) {
    if (params.get(key)) return true;
  }

  return false;
}

/**
 * If both from/to are missing (and not a skip context), set defaults on `params`.
 * Returns true when params were mutated.
 */
export function ensureDefaultDateParams(
  params: URLSearchParams,
  options: DateRangeKeys & {
    mode: DateRangeMode;
    skip?: boolean;
    now?: Date;
  }
): boolean {
  if (options.skip ?? shouldSkipDefaultDateRange(params)) {
    return false;
  }

  const { fromKey, toKey } = resolveDateKeys(options);
  const hasFrom = Boolean(params.get(fromKey));
  const hasTo = Boolean(params.get(toKey));

  // User already chose a range (partial or full) — do not override.
  if (hasFrom || hasTo) {
    return false;
  }

  const range = getDefaultDateRange(options.mode, options.now);
  params.set(fromKey, range.from);
  params.set(toKey, range.to);
  params.delete(ALL_DATES_PARAM);
  return true;
}

/**
 * Write a chosen date range onto `params`, or mark all-time when both ends are empty.
 * Always clears previous from/to keys first. Sets `all_dates=1` when empty so
 * `ensureDefaultDateParams` / `useEnsureDefaultDateRange` do not re-inject defaults.
 */
export function applyDateRangeToParams(
  params: URLSearchParams,
  dates: { date_from?: string | null; date_to?: string | null } | undefined,
  keys?: DateRangeKeys
): void {
  const { fromKey, toKey } = resolveDateKeys(keys);
  const from = dates?.date_from?.trim() || '';
  const to = dates?.date_to?.trim() || '';

  params.delete(fromKey);
  params.delete(toKey);

  if (from || to) {
    if (from) params.set(fromKey, from);
    if (to) params.set(toKey, to);
    params.delete(ALL_DATES_PARAM);
    return;
  }

  params.set(ALL_DATES_PARAM, '1');
}

/**
 * Build a clean query string for Clear/Reset: wipe filters including dates (all-time).
 * Sets `all_dates=1` so the page default range is not auto-reapplied.
 */
export function buildClearedFiltersParams(
  options: DateRangeKeys & {
    mode?: DateRangeMode;
    limit?: string | null;
    page?: string;
    extra?: Record<string, string>;
    now?: Date;
  } = {}
): URLSearchParams {
  const params = new URLSearchParams();

  params.set('page', options.page ?? '1');
  if (options.limit) {
    params.set('limit', options.limit);
  }

  if (options.extra) {
    Object.entries(options.extra).forEach(([key, value]) => {
      if (value != null && value !== '') params.set(key, value);
    });
  }

  params.set(ALL_DATES_PARAM, '1');
  return params;
}
