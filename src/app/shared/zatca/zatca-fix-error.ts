import type { ZatcaFixErrorItem, ZatcaFixErrorPayload } from '@/types/zatca';

const ARABIC_DIGIT_MAP: Record<string, string> = {
  '٠': '0',
  '١': '1',
  '٢': '2',
  '٣': '3',
  '٤': '4',
  '٥': '5',
  '٦': '6',
  '٧': '7',
  '٨': '8',
  '٩': '9',
  '۰': '0',
  '۱': '1',
  '۲': '2',
  '۳': '3',
  '۴': '4',
  '۵': '5',
  '۶': '6',
  '۷': '7',
  '۸': '8',
  '۹': '9',
};

type AxiosLikeError = {
  message?: string;
  response?: {
    status?: number;
    data?: {
      success?: boolean;
      message?: string;
      message_en?: string;
      errors?: unknown;
      data?: ZatcaFixErrorPayload['data'];
    };
  };
};

export function toEnglishDigits(value: string): string {
  return value.replace(/[٠-٩۰-۹]/g, (digit) => ARABIC_DIGIT_MAP[digit] ?? digit);
}

export function normalizeNationalId(value: string): string {
  return toEnglishDigits(value).replace(/\s+/g, '');
}

export function validateNationalId(
  raw: string,
  isSaudi: boolean | null
): string | null {
  const id = normalizeNationalId(raw);
  if (!/^\d{10}$/.test(id)) {
    return 'رقم الهوية / الإقامة يجب أن يتكون من 10 أرقام';
  }
  if (isSaudi === true && !id.startsWith('1')) {
    return 'الهوية السعودية يجب أن تكون 10 أرقام وتبدأ بـ 1';
  }
  if (isSaudi === false && !id.startsWith('2')) {
    return 'رقم الإقامة يجب أن يكون 10 أرقام ويبدأ بـ 2';
  }
  if (isSaudi == null && !/^[12]\d{9}$/.test(id)) {
    return 'رقم الهوية يجب أن يبدأ بـ 1 للسعوديين أو 2 لغير السعوديين';
  }
  return null;
}

export function getZatcaErrorMessage(err: unknown): string {
  const axiosErr = err as AxiosLikeError;
  const data = axiosErr.response?.data;
  if (typeof data?.message === 'string' && data.message.trim()) {
    return data.message;
  }
  if (typeof data?.message_en === 'string' && data.message_en.trim()) {
    return data.message_en;
  }
  if (typeof axiosErr.message === 'string' && axiosErr.message.trim()) {
    return axiosErr.message;
  }
  return 'حدث خطأ غير متوقع';
}

function isFixErrorItem(value: unknown): value is ZatcaFixErrorItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as ZatcaFixErrorItem;
  return typeof item.message === 'string' && item.message.length > 0;
}

export function parseZatcaValidationError(
  err: unknown
): ZatcaFixErrorPayload | null {
  const axiosErr = err as AxiosLikeError;
  if (axiosErr.response?.status !== 422) return null;
  const body = axiosErr.response.data;
  if (!body || !Array.isArray(body.errors) || body.errors.length === 0) {
    return null;
  }
  const errors = body.errors.filter(isFixErrorItem);
  if (errors.length === 0) return null;

  return {
    success: body.success ?? false,
    message:
      (typeof body.message === 'string' && body.message) ||
      errors[0].message,
    message_en: body.message_en,
    errors,
    data: body.data ?? null,
  };
}

export function isZatcaValidationError(err: unknown): boolean {
  return parseZatcaValidationError(err) != null;
}

export function collectFixFields(
  payload: ZatcaFixErrorPayload
): string[] {
  const fromData = payload.data?.fix_fields ?? [];
  const fromErrors = payload.errors.map((item) => item.fix_field);
  const merged = [...fromData, ...fromErrors];
  const unique: string[] = [];
  for (const field of merged) {
    if (typeof field !== 'string' || field.length === 0) continue;
    if (unique.includes(field)) continue;
    unique.push(field);
  }
  return unique;
}

export function canEditClient(permissions: string[]): boolean {
  return permissions.includes('clients');
}
