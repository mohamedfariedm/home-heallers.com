export type QrDecodedRow = {
  key: string;
  tag: number;
  name: string;
  value: string;
};

const KNOWN_TAGS: Array<{ tag: number; keys: string[]; name: string }> = [
  { tag: 1, keys: ['seller_name'], name: 'Seller name / اسم البائع' },
  { tag: 2, keys: ['vat_number'], name: 'VAT number / الرقم الضريبي' },
  { tag: 3, keys: ['timestamp'], name: 'Timestamp / الوقت' },
  { tag: 4, keys: ['total'], name: 'Invoice total / إجمالي الفاتورة' },
  { tag: 5, keys: ['vat_total'], name: 'VAT total / إجمالي الضريبة' },
  { tag: 6, keys: ['hash'], name: 'Invoice hash / هاش الفاتورة' },
  { tag: 7, keys: ['signature'], name: 'Signature / التوقيع' },
  { tag: 8, keys: ['public_key'], name: 'Public key / المفتاح العام' },
  {
    tag: 9,
    keys: ['certificate_signature', 'field_9'],
    name: 'Certificate signature / توقيع الشهادة',
  },
];

function stringifyValue(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function rowsFromArray(decoded: unknown[]): QrDecodedRow[] {
  const rows: QrDecodedRow[] = [];
  decoded.forEach((item, index) => {
    if (!item || typeof item !== 'object') return;
    const row = item as Record<string, unknown>;
    const tagNum = Number(row.tag);
    const tag = Number.isFinite(tagNum) ? tagNum : index + 1;
    rows.push({
      key: String(row.key ?? `tag-${tag}-${index}`),
      tag,
      name: typeof row.name === 'string' && row.name ? row.name : `Tag ${tag}`,
      value: stringifyValue(row.value),
    });
  });
  return rows;
}

function rowsFromObject(decoded: Record<string, unknown>): QrDecodedRow[] {
  const used = new Set<string>();
  const rows: QrDecodedRow[] = [];

  for (const def of KNOWN_TAGS) {
    const key = def.keys.find((k) => Object.prototype.hasOwnProperty.call(decoded, k));
    if (!key) continue;
    used.add(key);
    rows.push({
      key,
      tag: def.tag,
      name: def.name,
      value: stringifyValue(decoded[key]),
    });
  }

  for (const [key, value] of Object.entries(decoded)) {
    if (used.has(key)) continue;
    const match = /^field_(\d+)$/.exec(key);
    const tag = match ? Number(match[1]) : rows.length + 1;
    rows.push({
      key,
      tag,
      name: match
        ? `Unknown field ${match[1]} / حقل غير معروف ${match[1]}`
        : key,
      value: stringifyValue(value),
    });
  }

  rows.sort((a, b) => a.tag - b.tag);
  return rows;
}

/** Always returns an array so rc-table never receives an object. */
export function decodedQrToRows(decoded: unknown): QrDecodedRow[] {
  if (decoded == null) return [];
  if (Array.isArray(decoded)) return rowsFromArray(decoded);
  if (typeof decoded === 'object') {
    return rowsFromObject(decoded as Record<string, unknown>);
  }
  return [];
}

export const QR_VALUE_TRUNCATE_AT = 48;

export function isLongQrValue(value: string): boolean {
  return value.length > QR_VALUE_TRUNCATE_AT;
}

export function truncateQrValue(value: string): string {
  if (!isLongQrValue(value)) return value;
  return `${value.slice(0, 24)}…${value.slice(-8)}`;
}
