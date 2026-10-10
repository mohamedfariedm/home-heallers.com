/**
 * Canonical enums & reason lists from Backend FE Integration Guide.
 * Keep in sync with docs/home_healers_dashboard_frontend_integration.md
 */

export const LEAD_STATUSES = [
  'new',
  'possible',
  'follow_up',
  'negotiation',
  'success',
  'failed',
  'closed',
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_REASONS = [
  { value: 'price_too_high', label: 'Price too high' },
  { value: 'wants_massage', label: 'Wants massage, not physiotherapy' },
  { value: 'wrong_number', label: 'Wrong number' },
  { value: 'no_answer', label: 'No answer' },
  { value: 'not_needed', label: "Doesn't need the service" },
  { value: 'outside_coverage', label: 'Outside the coverage area' },
  { value: 'outside_ksa', label: 'Outside Saudi Arabia' },
  { value: 'wants_insurance', label: 'Wants insurance' },
  { value: 'thinks_clinic_or_center', label: 'Thinks we are a clinic/center/hospital' },
  { value: 'registered_via_app', label: 'Registered through the app instead' },
  { value: 'inquiry_only', label: 'Inquiry only' },
  { value: 'duplicate', label: 'Duplicate lead' },
  { value: 'other', label: 'Other' },
] as const;

export type LeadStatusReason = (typeof LEAD_STATUS_REASONS)[number]['value'];

export const SOURCE_CAMPAIGN_OPTIONS = [
  { value: 'google', label: 'Google' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'snapchat', label: 'Snapchat' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'call', label: 'Call' },
  { value: 'website', label: 'Website' },
  { value: 'mobile_application', label: 'Mobile Application' },
  { value: 'referral', label: 'Referral' },
  { value: 'center', label: 'Center' },
  { value: 'other', label: 'Other' },
] as const;

export const COMMUNICATION_CHANNEL_OPTIONS = [
  { value: 'WhatsApp', label: 'WhatsApp' },
  { value: 'Call', label: 'Call' },
  { value: 'Lead Form', label: 'Lead Form' },
] as const;

/** Staff-selectable reservation cancel/fail reasons. Never send payment_timeout from FE. */
export const RESERVATION_STATUS_REASONS = [
  { value: 'client_request', label: 'Client request' },
  { value: 'price_too_high', label: 'Price too high' },
  { value: 'payment_failed', label: 'Payment failed' },
  { value: 'no_doctor_available', label: 'No doctor available' },
  { value: 'outside_coverage', label: 'Outside coverage' },
  { value: 'schedule_conflict', label: 'Schedule conflict' },
  { value: 'patient_unreachable', label: 'Patient unreachable' },
  { value: 'health_condition', label: 'Health condition' },
  { value: 'wants_insurance', label: 'Wants insurance' },
  { value: 'duplicate_booking', label: 'Duplicate booking' },
  { value: 'test_booking', label: 'Test booking' },
  { value: 'other', label: 'Other' },
] as const;

export type ReservationStatusReason =
  (typeof RESERVATION_STATUS_REASONS)[number]['value'];

export const RESERVATION_STATUS = {
  Reviewing: 1,
  WaitConfirm: 2,
  Confirmed: 3,
  Canceled: 4,
  Completed: 5,
  Failed: 6,
  PendingPayment: 8,
} as const;

export function isTerminalLeadStatus(status: string | null | undefined): boolean {
  const s = String(status || '').toLowerCase();
  return s === 'failed' || s === 'closed';
}

export function isCancelOrFailReservationStatus(
  status: number | string | null | undefined
): boolean {
  const n = Number(status);
  return n === RESERVATION_STATUS.Canceled || n === RESERVATION_STATUS.Failed;
}

export function formatStatusReasonLabel(value: string | null | undefined): string {
  if (!value) return 'Unclassified';
  if (value === 'unclassified') return 'Unclassified';
  const lead = LEAD_STATUS_REASONS.find((r) => r.value === value);
  if (lead) return lead.label;
  const res = RESERVATION_STATUS_REASONS.find((r) => r.value === value);
  if (res) return res.label;
  if (value === 'payment_timeout') return 'Payment timeout (system)';
  return value
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
