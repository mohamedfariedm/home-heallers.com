import { CouponFormInput } from '@/utils/validators/coupon-form.schema';
import { formatDate } from '@/utils/format-date';
import type { CouponInsuranceFilter } from '@/types/coupon';

function toNumberOrNull(value?: string): number | null {
  if (!value || value.trim() === '') return null;
  return Number(value);
}

function formatDateTime(date?: Date | null): string | null {
  if (!date) return null;
  return formatDate(date, 'YYYY-MM-DD HH:mm:ss');
}

/** API requires description.en / description.ar to always be strings, never null. */
export function normalizeTranslatedField(
  value?: { en?: string | null; ar?: string | null } | null
): { en: string; ar: string } {
  return {
    en: value?.en == null ? '' : String(value.en),
    ar: value?.ar == null ? '' : String(value.ar),
  };
}

export function buildCouponPayload(
  data: CouponFormInput,
  insuranceTypes: CouponInsuranceFilter[]
) {
  const payload: Record<string, unknown> = {
    code: data.code.trim().toUpperCase(),
    name: {
      en: String(data.name.en),
      ar: String(data.name.ar),
    },
    description: normalizeTranslatedField(data.description),
    type: data.type,
    value:
      data.type === 'free_service' || data.type === 'free_delivery'
        ? 0
        : Number(data.value),
    max_discount: toNumberOrNull(data.max_discount),
    starts_at: formatDateTime(data.starts_at),
    ends_at: formatDateTime(data.ends_at),
    max_redemptions: toNumberOrNull(data.max_redemptions),
    daily_limit: toNumberOrNull(data.daily_limit),
    per_client_limit: toNumberOrNull(data.per_client_limit),
    min_order_subtotal: toNumberOrNull(data.min_order_subtotal) ?? 0,
    eligible_user_type: data.eligible_user_type,
    first_booking_scope: data.first_booking_scope,
    first_booking_category_id:
      data.first_booking_scope === 'category'
        ? Number(data.first_booking_category_id)
        : null,
    is_active: data.is_active,
    service_ids: data.service_ids,
    free_service_ids: data.free_service_ids,
    city_ids: data.city_ids,
    country_ids: data.country_ids,
    phone_numbers: data.phone_numbers.map((p) => p.replace(/\D/g, '')),
    insurance_types: insuranceTypes
      .filter((row) => row.insurance_id != null || row.insurance_company)
      .map((row) => ({
        insurance_id: row.insurance_id ? Number(row.insurance_id) : null,
        insurance_company: row.insurance_company || null,
      })),
    patient_segments: data.patient_segments,
  };

  return payload;
}

export function parseCouponDate(value?: string | null): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
