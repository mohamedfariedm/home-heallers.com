import { describe, expect, it } from 'vitest';
import {
  decodedQrToRows,
  isLongQrValue,
  truncateQrValue,
} from './qr-decoded-rows';

describe('decodedQrToRows', () => {
  it('returns [] for null, undefined, and non-objects', () => {
    expect(decodedQrToRows(null)).toEqual([]);
    expect(decodedQrToRows(undefined)).toEqual([]);
    expect(decodedQrToRows('seller_name')).toEqual([]);
    expect(decodedQrToRows(12)).toEqual([]);
  });

  it('maps the object-shaped Fatoora decoded payload in tag order 1–9', () => {
    const rows = decodedQrToRows({
      public_key: 'pk-bytes',
      seller_name: 'Home Healers',
      vat_number: '310796025900003',
      timestamp: '2026-10-20T18:34:34Z',
      total: '115.00',
      vat_total: '15.00',
      hash: 'abc',
      signature: 'sig',
      field_9: 'cert-sig',
    });

    expect(rows.map((row) => row.tag)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(rows[0]).toMatchObject({
      key: 'seller_name',
      name: 'Seller name / اسم البائع',
      value: 'Home Healers',
    });
    expect(rows[8]).toMatchObject({
      key: 'field_9',
      name: 'Certificate signature / توقيع الشهادة',
      value: 'cert-sig',
    });
    expect(Array.isArray(rows)).toBe(true);
  });

  it('labels leftover field_N keys as unknown fields', () => {
    const rows = decodedQrToRows({
      seller_name: 'X',
      field_12: 'mystery',
    });
    expect(rows).toEqual([
      {
        key: 'seller_name',
        tag: 1,
        name: 'Seller name / اسم البائع',
        value: 'X',
      },
      {
        key: 'field_12',
        tag: 12,
        name: 'Unknown field 12 / حقل غير معروف 12',
        value: 'mystery',
      },
    ]);
  });

  it('accepts an already-normalized array without crashing', () => {
    const rows = decodedQrToRows([
      { tag: 1, name: 'Seller', value: 'A' },
      { tag: 2, name: 'VAT', value: '1' },
    ]);
    expect(rows).toEqual([
      { key: 'tag-1-0', tag: 1, name: 'Seller', value: 'A' },
      { key: 'tag-2-1', tag: 2, name: 'VAT', value: '1' },
    ]);
  });

  it('skips junk entries inside an array', () => {
    expect(decodedQrToRows([null, 'x', { tag: 1, name: 'Seller', value: 'A' }])).toEqual([
      { key: 'tag-1-2', tag: 1, name: 'Seller', value: 'A' },
    ]);
  });
});

describe('truncateQrValue', () => {
  it('leaves short values intact and truncates long ones', () => {
    expect(isLongQrValue('115.00')).toBe(false);
    expect(truncateQrValue('115.00')).toBe('115.00');
    const long = 'a'.repeat(60);
    expect(isLongQrValue(long)).toBe(true);
    expect(truncateQrValue(long)).toBe(`${'a'.repeat(24)}…${'a'.repeat(8)}`);
  });
});
