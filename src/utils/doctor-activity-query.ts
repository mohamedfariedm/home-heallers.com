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
    if (!p.get('sort_by')) p.set('sort_by', 'reservations_count');
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

export function formatSourceCampaignLabel(value: string | null): string {
  if (value == null || value === '' || value === 'null') return 'No campaign';
  if (value === 'unknown') return 'Unknown';
  return value;
}

/** Toggle detail reservations filter from API drill-down link (`source_campaign` / `status`). */
export function toggleReservationFilterFromLink(
  current: URLSearchParams,
  apiLink: string
): URLSearchParams {
  const parsed = parseDoctorApiLinkToSearchParams(apiLink);
  const params = new URLSearchParams(current.toString());

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

export function isReservationFilterLinkActive(
  current: URLSearchParams,
  apiLink: string
): boolean {
  const parsed = parseDoctorApiLinkToSearchParams(apiLink);
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

export function buildDoctorReservationFilterPathFromLink(
  locale: string,
  doctorId: number,
  current: URLSearchParams,
  apiLink: string
): string {
  const params = toggleReservationFilterFromLink(current, apiLink);
  return buildDoctorActivityDetailPath(locale, doctorId, params);
}

export function buildDoctorActivityPathFromApiLink(
  locale: string,
  link: string,
  doctorId?: number
): string {
  const params = parseDoctorApiLinkToSearchParams(link);
  params.delete('tab');

  const pathDoctorMatch = link.match(/\/doctor-activity\/(\d+)/);
  const targetDoctorId = pathDoctorMatch
    ? Number(pathDoctorMatch[1])
    : doctorId ?? (params.get('actor_id') ? Number(params.get('actor_id')) : null);

  if (targetDoctorId) {
    return buildDoctorActivityDetailPath(locale, targetDoctorId, params);
  }

  return buildDoctorActivityListPath(locale, params);
}
