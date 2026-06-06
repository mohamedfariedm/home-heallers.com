/** Map user-activity report page URL params to API query string */
export function toUserActivityQuery(searchParams: URLSearchParams): string {
  const p = new URLSearchParams();

  searchParams.forEach((value, key) => {
    if (key === 'limit') {
      p.set('per_page', value);
      return;
    }
    if (key === 'tab') return;
    p.append(key, value);
  });

  if (!p.get('page')) p.set('page', '1');
  if (!p.get('per_page')) p.set('per_page', '25');
  if (!p.get('sort_by')) p.set('sort_by', 'total_actions');
  if (!p.get('sort_direction')) p.set('sort_direction', 'desc');

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
