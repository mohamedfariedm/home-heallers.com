type UserActivityQueryOptions = {
  /** Detail endpoint — do not apply list-only sort defaults. */
  forDetail?: boolean;
};

/** Detail-only filters: scope `records[]`, not list or summary. */
const DETAIL_ONLY_FILTERS = ['source_campaign', 'status'] as const;

/** Map user-activity report page URL params to API query string */
export function toUserActivityQuery(
  searchParams: URLSearchParams,
  options?: UserActivityQueryOptions
): string {
  const p = new URLSearchParams();

  searchParams.forEach((value, key) => {
    if (key === 'limit') {
      p.set('per_page', value);
      return;
    }
    if (key === 'tab') return;
    p.append(key, value);
  });

  // Legacy param names from earlier frontend builds
  p.delete('source_campaign_equal');
  p.delete('status_equal');
  p.delete('lead_status');

  if (!options?.forDetail) {
    DETAIL_ONLY_FILTERS.forEach((key) => p.delete(key));
  }

  if (!p.get('page')) p.set('page', '1');
  if (!p.get('per_page')) p.set('per_page', '25');

  if (!options?.forDetail) {
    if (!p.get('sort_by')) p.set('sort_by', 'total_actions');
    if (!p.get('sort_direction')) p.set('sort_direction', 'desc');
  } else if (!p.get('sort_direction')) {
    p.set('sort_direction', 'desc');
  }

  return p.toString();
}

export function hasActiveUserActivityFilters(
  searchParams: URLSearchParams
): boolean {
  const ignored = new Set([
    'page',
    'per_page',
    'limit',
    'sort_by',
    'sort_direction',
    'tab',
  ]);
  return Array.from(searchParams.keys()).some((key) => !ignored.has(key));
}

/** Extract query params from an API drill-down link for frontend navigation */
export function parseUserApiLinkToSearchParams(link: string): URLSearchParams {
  try {
    const url = new URL(link);
    const params = new URLSearchParams(url.search);

    const userMatch = url.pathname.match(/\/user-activity\/(\d+)$/);
    if (userMatch) {
      params.set('actor_id', userMatch[1]);
    }

    return params;
  } catch {
    return new URLSearchParams();
  }
}

export function buildUserActivityListPath(
  locale: string,
  params: URLSearchParams
): string {
  const next = new URLSearchParams(params);
  next.set('tab', 'users');
  return `/${locale}/kpis?${next.toString()}`;
}

export function buildUserActivityDetailPath(
  locale: string,
  userId: number,
  params?: URLSearchParams
): string {
  const qs = params?.toString();
  return `/${locale}/kpis/users/${userId}${qs ? `?${qs}` : ''}`;
}

/** Synthetic by_log_name entries on list + detail (not real Spatie channels). */
export function formatUserActivityLogName(logName: string): string {
  if (logName === 'inbound') return 'Inbound';
  if (logName === 'outbound') return 'Outbound';
  return logName;
}

export function formatSourceCampaignLabel(value: string | null): string {
  if (value == null || value === '' || value === 'null') return 'No campaign';
  return value;
}

export function formatLeadStatusLabel(value: string | null): string {
  if (value == null || value === '' || value === 'null') return 'No status';
  return value;
}

/** Toggle detail records filter from API lead drill-down link (`source_campaign` / `status`). */
export function toggleLeadFilterFromLink(
  current: URLSearchParams,
  apiLink: string
): URLSearchParams {
  const parsed = parseUserApiLinkToSearchParams(apiLink);
  const params = new URLSearchParams(current.toString());

  params.delete('source_campaign_equal');
  params.delete('status_equal');
  params.delete('lead_status');
  params.delete('subject_type');

  const sourceCampaign = parsed.get('source_campaign');
  const status = parsed.get('status');

  if (sourceCampaign !== null) {
    const isActive = params.get('source_campaign') === sourceCampaign;
    params.delete('source_campaign');
    params.delete('status');
    if (!isActive) params.set('source_campaign', sourceCampaign);
  } else if (status !== null) {
    const isActive = params.get('status') === status;
    params.delete('source_campaign');
    params.delete('status');
    if (!isActive) params.set('status', status);
  }

  params.set('page', '1');
  params.delete('tab');
  params.delete('actor_id');
  return params;
}

export function isLeadFilterLinkActive(
  current: URLSearchParams,
  apiLink: string
): boolean {
  const parsed = parseUserApiLinkToSearchParams(apiLink);
  const sourceCampaign = parsed.get('source_campaign');
  const status = parsed.get('status');

  if (sourceCampaign !== null) {
    return current.get('source_campaign') === sourceCampaign;
  }
  if (status !== null) {
    return current.get('status') === status;
  }
  return false;
}

export function buildUserActivityLeadFilterPathFromLink(
  locale: string,
  userId: number,
  current: URLSearchParams,
  apiLink: string
): string {
  const params = toggleLeadFilterFromLink(current, apiLink);
  return buildUserActivityDetailPath(locale, userId, params);
}

/** @deprecated Use buildUserActivityLeadFilterPathFromLink with API `link` values. */
export function applyLeadCampaignFilter(
  current: URLSearchParams,
  sourceCampaign: string | null
): URLSearchParams {
  const value = sourceCampaign == null ? 'null' : String(sourceCampaign);
  return toggleLeadFilterFromLink(
    current,
    `http://local/user-activity/0?source_campaign=${encodeURIComponent(value)}`
  );
}

/** @deprecated Use buildUserActivityLeadFilterPathFromLink with API `link` values. */
export function applyLeadStatusFilter(
  current: URLSearchParams,
  status: string | null
): URLSearchParams {
  const value = status == null ? 'null' : String(status);
  return toggleLeadFilterFromLink(
    current,
    `http://local/user-activity/0?status=${encodeURIComponent(value)}`
  );
}

/** @deprecated Use isLeadFilterLinkActive with API `link` values. */
export function isLeadCampaignFilterActive(
  current: URLSearchParams,
  sourceCampaign: string | null
): boolean {
  const value = sourceCampaign == null ? 'null' : String(sourceCampaign);
  return current.get('source_campaign') === value;
}

/** @deprecated Use isLeadFilterLinkActive with API `link` values. */
export function isLeadStatusFilterActive(
  current: URLSearchParams,
  status: string | null
): boolean {
  const value = status == null ? 'null' : String(status);
  return current.get('status') === value;
}

/** @deprecated Use buildUserActivityLeadFilterPathFromLink. */
export function buildUserActivityLeadFilterPath(
  locale: string,
  userId: number,
  current: URLSearchParams,
  filter:
    | { type: 'campaign'; sourceCampaign: string | null }
    | { type: 'status'; status: string | null }
): string {
  const value =
    filter.type === 'campaign'
      ? filter.sourceCampaign == null
        ? 'null'
        : String(filter.sourceCampaign)
      : filter.status == null
        ? 'null'
        : String(filter.status);
  const param = filter.type === 'campaign' ? 'source_campaign' : 'status';
  return buildUserActivityLeadFilterPathFromLink(
    locale,
    userId,
    current,
    `http://local/user-activity/0?${param}=${encodeURIComponent(value)}`
  );
}
