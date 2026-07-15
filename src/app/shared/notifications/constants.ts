export const AUDIENCE_OPTIONS = [
  { value: 'all', label: 'Everyone (clients + doctors)' },
  { value: 'clients', label: 'All clients' },
  { value: 'doctors', label: 'All doctors' },
  { value: 'specific', label: 'Specific users' },
] as const;

export const LANG_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'Arabic' },
] as const;

export const NOTIFICATION_TYPE_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'offers', label: 'Offers' },
  { value: 'categories', label: 'Categories' },
  { value: 'coupon', label: 'Coupon' },
] as const;

export const RECIPIENT_KIND_OPTIONS = [
  { value: 'client', label: 'Client' },
  { value: 'doctor', label: 'Doctor' },
] as const;

export const SCHEDULED_STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'sent', label: 'Sent' },
  { value: 'canceled', label: 'Canceled' },
  { value: 'failed', label: 'Failed' },
] as const;

export const SENT_SOURCE_OPTIONS = [
  { value: '', name: 'all', label: 'All sources' },
  { value: 'immediate', name: 'immediate', label: 'Immediate' },
  { value: 'scheduled', name: 'scheduled', label: 'Scheduled' },
  { value: 'system', name: 'system', label: 'System' },
] as const;

export const SENT_STATUS_OPTIONS = [
  { value: '', name: 'all', label: 'All statuses' },
  { value: 'sent', name: 'sent', label: 'Sent' },
  { value: 'failed', name: 'failed', label: 'Failed' },
] as const;

export const READ_FILTER_OPTIONS = [
  { value: '', name: 'all', label: 'All' },
  { value: '1', name: 'read', label: 'Read' },
  { value: '0', name: 'unread', label: 'Unread' },
] as const;

export const PUSH_STATUS_LABELS: Record<string, string> = {
  sent: 'Sent',
  failed: 'Failed',
  skipped: 'Skipped (no FCM token)',
};

export function formatRecipientType(value?: string | null) {
  switch (value) {
    case 'all':
      return 'Everyone';
    case 'clients':
      return 'All clients';
    case 'doctors':
      return 'All doctors';
    case 'specific':
      return 'Specific users';
    default:
      return value ?? '—';
  }
}

export function formatSentSource(value?: string | null) {
  switch (value) {
    case 'immediate':
      return 'Immediate';
    case 'scheduled':
      return 'Scheduled';
    case 'system':
      return 'System';
    default:
      return value ?? '—';
  }
}

export function statusBadgeClass(status?: string | null) {
  switch (status) {
    case 'pending':
      return 'bg-amber-50 text-amber-700 ring-amber-600/20';
    case 'processing':
      return 'bg-blue-50 text-blue-700 ring-blue-600/20';
    case 'sent':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
    case 'canceled':
      return 'bg-gray-50 text-gray-600 ring-gray-500/20';
    case 'failed':
      return 'bg-red-50 text-red-700 ring-red-600/20';
    case 'skipped':
      return 'bg-amber-50 text-amber-700 ring-amber-600/20';
    default:
      return 'bg-gray-50 text-gray-600 ring-gray-500/20';
  }
}
