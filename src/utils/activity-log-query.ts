/** Map activity-logs page URL params to API query string */
export function toActivityLogQuery(searchParams: URLSearchParams): string {
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
  if (!p.get('per_page')) p.set('per_page', '10');
  if (!p.get('sort_by')) p.set('sort_by', 'created_at');
  if (!p.get('sort_direction')) p.set('sort_direction', 'desc');

  return p.toString();
}

export function hasActiveActivityLogFilters(
  searchParams: URLSearchParams
): boolean {
  const ignored = new Set(['page', 'per_page', 'limit', 'sort_by', 'sort_direction', 'tab']);
  return Array.from(searchParams.keys()).some((key) => !ignored.has(key));
}
