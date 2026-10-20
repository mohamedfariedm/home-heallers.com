import { describe, expect, it } from 'vitest';
import {
  collectFixFields,
  getZatcaErrorMessage,
  isZatcaValidationError,
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
