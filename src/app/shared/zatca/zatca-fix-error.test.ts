import { describe, expect, it } from 'vitest';
import {
  canEditClient,
  collectFixFields,
  detectNationalityHint,
  getZatcaErrorMessage,
  isZatcaValidationError,
  nationalityHintText,
  normalizeNationalId,
  parseZatcaValidationError,
  toEnglishDigits,
  validateNationalId,
} from './zatca-fix-error';

describe('toEnglishDigits / normalizeNationalId', () => {
  it('converts Arabic-Indic digits', () => {
    expect(toEnglishDigits('١٢٣٤٥٦٧٨٩٠')).toBe('1234567890');
  });

  it('converts Eastern Arabic digits and strips spaces', () => {
    expect(normalizeNationalId('۲ ٤٥ ٦ ٧٨٩٠١')).toBe('245678901');
  });
});

describe('validateNationalId', () => {
  it('accepts a Saudi national id starting with 1', () => {
    expect(validateNationalId('١٢٣٤٥٦٧٨٩٠', true)).toBeNull();
  });

  it('rejects a Saudi id that does not start with 1', () => {
    expect(validateNationalId('2234567890', true)).toMatch(/تبدأ بـ 1/);
  });

  it('accepts a non-Saudi iqama starting with 2', () => {
    expect(validateNationalId('2234567890', false)).toBeNull();
  });

  it('rejects a non-Saudi id that does not start with 2', () => {
    expect(validateNationalId('1234567890', false)).toMatch(/يبدأ بـ 2/);
  });

  it('rejects ids that are not 10 digits', () => {
    expect(validateNationalId('123', true)).toMatch(/10 أرقام/);
  });
});

describe('parseZatcaValidationError', () => {
  const payload = {
    success: false,
    message: 'يلزم تصحيح بيانات العميل',
    message_en: 'Client data must be corrected',
    errors: [
      {
        code: 'BR-KSA-09',
        message: 'الجنسية مطلوبة',
        message_en: 'Nationality is required',
        fix_field: 'client.nationality',
      },
    ],
    data: { invoice_id: 9, client_id: 4, fix_fields: ['client.nationality'] },
  };

  it('parses a 422 buyer/tax payload', () => {
    const parsed = parseZatcaValidationError({
      message: 'Request failed with status code 422',
      response: { status: 422, data: payload },
    });
    expect(parsed?.message).toBe('يلزم تصحيح بيانات العميل');
    expect(parsed?.errors).toHaveLength(1);
    expect(collectFixFields(parsed!)).toEqual(['client.nationality']);
    expect(isZatcaValidationError({ response: { status: 422, data: payload } })).toBe(
      true
    );
  });

  it('ignores Laravel field-map 422s and other statuses', () => {
    expect(
      parseZatcaValidationError({
        response: {
          status: 422,
          data: { message: 'invalid', errors: { amount: ['too small'] } },
        },
      })
    ).toBeNull();
    expect(
      parseZatcaValidationError({
        response: { status: 500, data: payload },
      })
    ).toBeNull();
  });
});

describe('canEditClient', () => {
  it('allows patients or clients, and denies neither', () => {
    expect(canEditClient(['patients'])).toBe(true);
    expect(canEditClient(['clients'])).toBe(true);
    expect(canEditClient(['patients', 'invoices'])).toBe(true);
    expect(canEditClient(['invoices', 'zatca.submit'])).toBe(false);
    expect(canEditClient([])).toBe(false);
  });
});

describe('detectNationalityHint', () => {
  it('suggests non-Saudi when a Saudi 15% invoice has an iqama', () => {
    const hint = detectNationalityHint({
      message: 'يلزم تصحيح البيانات',
      errors: [
        {
          code: 'ZATCA_TAX_NATIONALITY_MISMATCH',
          message:
            'العميل أحمد مسجل سعودي، لكن الفاتورة عليها ضريبة 15%. فواتير السعوديين ضريبتها 0% (تتحملها الدولة). عدّل نسبة الضريبة في الفاتورة أو جنسية العميل.',
          message_en:
            'Client Ahmed is registered as Saudi, but the invoice has 15% tax.',
          fix_field: 'invoice.tax_percentage',
        },
        {
          code: 'ZATCA_INVALID_BUYER_ID',
          message:
            'رقم هوية العميل أحمد غير صحيح: يبدو رقم إقامة (يبدأ بـ 2).',
          message_en:
            "Client Ahmed's ID number is invalid: it looks like an iqama (starts with 2).",
          fix_field: 'client.national_id',
        },
      ],
    });
    expect(hint).toBe('likely_non_saudi');
    expect(nationalityHintText(hint)).toMatch(/غير سعودي/);
  });

  it('suggests Saudi when a 0% invoice has a national ID and unset nationality', () => {
    const hint = detectNationalityHint({
      message: 'يلزم تصحيح البيانات',
      errors: [
        {
          code: 'ZATCA_TAX_NATIONALITY_MISMATCH',
          message:
            'العميل أحمد غير مسجل سعودي (أو جنسيته غير محددة)، لكن الفاتورة معفاة/0%. حدّد جنسية العميل إذا كان سعودياً، أو عدّل الضريبة إلى 15%.',
          message_en:
            'Client Ahmed is not registered as Saudi (or nationality is unset), but the invoice is exempt/0%.',
          fix_field: 'client.nationality',
        },
        {
          code: 'ZATCA_INVALID_BUYER_ID',
          message:
            'رقم هوية العميل أحمد غير صحيح: يبدو رقم هوية وطنية (يبدأ بـ 1).',
          message_en:
            "Client Ahmed's ID number is invalid: it looks like a national ID (starts with 1).",
          fix_field: 'client.national_id',
        },
      ],
    });
    expect(hint).toBe('likely_saudi');
    expect(nationalityHintText(hint)).toMatch(/سعودي/);
  });

  it('returns null when only one of the two errors is present', () => {
    expect(
      detectNationalityHint({
        message: 'x',
        errors: [
          {
            code: 'ZATCA_TAX_NATIONALITY_MISMATCH',
            message: 'العميل أحمد مسجل سعودي، لكن الفاتورة عليها ضريبة 15%.',
            fix_field: 'invoice.tax_percentage',
          },
        ],
      })
    ).toBeNull();
  });
});

describe('getZatcaErrorMessage', () => {
  it('prefers response message, then message_en, then axios message', () => {
    expect(
      getZatcaErrorMessage({
        message: 'Request failed with status code 422',
        response: {
          data: { message: 'فشل الإصدار', message_en: 'Issue failed' },
        },
      })
    ).toBe('فشل الإصدار');
    expect(
      getZatcaErrorMessage({
        message: 'Request failed with status code 500',
        response: { data: { message_en: 'Server error' } },
      })
    ).toBe('Server error');
    expect(
      getZatcaErrorMessage({ message: 'Request failed with status code 500' })
    ).toBe('Request failed with status code 500');
  });
});
