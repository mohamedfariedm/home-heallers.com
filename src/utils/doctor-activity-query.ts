type DoctorActivityQueryOptions = {
  /** Detail endpoint — do not apply list-only sort defaults. */
  forDetail?: boolean;
};

/** Map doctor-activity report page URL params to API query string */
export function toDoctorActivityQuery(
  searchParams: URLSearchParams,
  options?: DoctorActivityQueryOptions
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

export function hasActiveDoctorActivityFilters(
  searchParams: URLSearchParams
): boolean {
  const ignored = new Set([
    'page',
    'per_page',
    'limit',
    'sort_by',
    'sort_direction',
    'tab',
    'with_reservation',
  ]);
  return Array.from(searchParams.keys()).some((key) => !ignored.has(key));
}

export function parseDoctorApiLinkToSearchParams(link: string): URLSearchParams {
  try {
    const url = new URL(link);
    const params = new URLSearchParams(url.search);

    const doctorMatch = url.pathname.match(/\/doctor-activity\/(\d+)$/);
    if (doctorMatch) {
      params.set('actor_id', doctorMatch[1]);
    }

    return params;
  } catch {
    return new URLSearchParams();
  }
}

export function buildDoctorActivityListPath(
  locale: string,
  params: URLSearchParams
): string {
  const next = new URLSearchParams(params);
  next.set('tab', 'doctors');
  return `/${locale}/kpis?${next.toString()}`;
}

export function buildDoctorActivityDetailPath(
  locale: string,
  doctorId: number,
  params?: URLSearchParams
): string {
  const qs = params?.toString();
  return `/${locale}/kpis/doctors/${doctorId}${qs ? `?${qs}` : ''}`;
}

export function formatReservationStatusLabel(
  status: number | string | null
): string {
  if (status == null || status === '') return '—';
  const labels: Record<string, string> = {
    '1': 'Reviewing',
    '2': 'Awaiting Confirmation',
    '3': 'Confirmed',
    '4': 'Canceled',
    '5': 'Completed',
    '6': 'Failed',
  };
  return labels[String(status)] ?? String(status);
}
