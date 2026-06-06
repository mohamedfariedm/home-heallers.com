export interface KpiExportResponse {
  message: string;
  download_url: string;
  file_name: string;
  expires_in: string;
  error?: string;
}

const EXPORT_QUERY_SKIP = new Set([
  'tab',
  'page',
  'per_page',
  'limit',
  'sort_by',
  'sort_direction',
  'export',
]);

/** Build export query string — keeps filters, drops pagination/sort/tab */
export function toKpiExportQuery(searchParams: URLSearchParams): string {
  const p = new URLSearchParams();

  searchParams.forEach((value, key) => {
    if (EXPORT_QUERY_SKIP.has(key)) return;
    p.append(key, value);
  });

  return p.toString();
}

export function triggerKpiExportDownload(response: {
  download_url: string;
  file_name?: string;
}) {
  if (!response.download_url) return;

  const link = document.createElement('a');
  link.href = response.download_url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  if (response.file_name) {
    link.download = response.file_name;
  }
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function formatKpiExportSuccessMessage(response: KpiExportResponse): string {
  const base = response.message || 'Export ready';
  return response.expires_in ? `${base} (expires in ${response.expires_in})` : base;
}

export function extractRolesFromLoginPayload(data: unknown): string[] {
  if (!data || typeof data !== 'object') return [];

  const payload = data as {
    data?: {
      role?: string | { name?: string };
      roles?: Array<string | { name?: string }>;
      Roles?: Array<string | { name?: string }>;
      user?: {
        role?: string | { name?: string };
        roles?: Array<string | { name?: string }>;
        Roles?: Array<string | { name?: string }>;
      };
    };
  };

  const root = payload.data;
  if (!root) return [];

  const normalize = (value: unknown): string | null => {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (value && typeof value === 'object' && 'name' in value) {
      const name = (value as { name?: string }).name;
      return name?.trim() || null;
    }
    return null;
  };

  const fromList = (list?: Array<string | { name?: string }>) =>
    (list ?? [])
      .map(normalize)
      .filter((role): role is string => Boolean(role));

  const userRoles = fromList(root.user?.roles ?? root.user?.Roles);
  if (userRoles.length) return userRoles;

  const rootRoles = fromList(root.roles ?? root.Roles);
  if (rootRoles.length) return rootRoles;

  const userRole = normalize(root.user?.role);
  if (userRole) return [userRole];

  const singleRole = normalize(root.role);
  return singleRole ? [singleRole] : [];
}

export function getStoredRoles(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('roles');
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed)
      ? parsed.filter((role): role is string => typeof role === 'string')
      : [];
  } catch {
    return [];
  }
}

export function setStoredRoles(roles: string[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('roles', JSON.stringify(roles));
}

export function clearStoredRoles() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('roles');
}

export function resolveEffectiveRoles(sessionRoles: string[] = []): string[] {
  if (sessionRoles.length) return sessionRoles;
  return getStoredRoles();
}

export function isAdminRole(roles: string[] = []): boolean {
  return roles.some((role) => role.toLowerCase() === 'admin');
}
