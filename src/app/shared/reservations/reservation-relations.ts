import { resolveLocalizedName } from '@/utils/resolve-localized-name';

export type ReservationRelationKey = 'service' | 'category';

export function asRecordList(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
}

function firstRecord(value: unknown): Record<string, any> | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const record = firstRecord(item);
      if (record) return record;
    }
    return null;
  }
  if (value && typeof value === 'object') return value as Record<string, any>;
  return null;
}

function plainId(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'string' && /^\d+$/.test(value.trim())) return value.trim();
  return '';
}

/** Display text for a service or category record, including a plain name string. */
export function relationLabel(value: unknown): string {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed || plainId(trimmed)) return '';
    return resolveLocalizedName(trimmed);
  }
  const record = firstRecord(value);
  if (!record) return '';
  return (
    resolveLocalizedName(record.name) ||
    resolveLocalizedName(record.title) ||
    resolveLocalizedName(record.label) ||
    (typeof record.name_en === 'string' ? record.name_en : '') ||
    (typeof record.name_ar === 'string' ? record.name_ar : '')
  );
}

function namedFallback(row: any, key: ReservationRelationKey) {
  const name =
    row?.[`${key}_name`] ??
    row?.[`${key}_title`] ??
    (row?.[`${key}_name_en`] || row?.[`${key}_name_ar`]
      ? { en: row[`${key}_name_en`], ar: row[`${key}_name_ar`] }
      : null);
  const id = plainId(row?.[`${key}_id`]);
  if (!name && !id) return null;
  return { id: id || undefined, name };
}

/** Service or category payload from a reservation, in the shapes the API sends. */
export function reservationRelation(row: any, key: ReservationRelationKey): any {
  if (!row || typeof row !== 'object') return null;

  const direct = row[key] ?? row[`${key}s`];
  const directId = plainId(direct);
  if (directId) return { id: directId };
  if (firstRecord(direct) || (typeof direct === 'string' && direct.trim())) return direct;

  if (key === 'category') {
    const service = firstRecord(reservationRelation(row, 'service'));
    const nested = service?.category ?? service?.categories ?? service?.category_id;
    if (nested) return typeof nested === 'object' || Array.isArray(nested) ? nested : { id: nested };
  }

  const dates = Array.isArray(row.dates) ? row.dates : [];
  for (const session of dates) {
    const found = session?.[key] ?? session?.[`${key}s`] ?? session?.[`${key}_id`];
    const foundId = plainId(found);
    if (foundId) return { id: foundId };
    if (firstRecord(found) || (typeof found === 'string' && found.trim())) return found;
    if (key === 'category') {
      const sessionService = firstRecord(session?.service ?? session?.services);
      const category = sessionService?.category ?? sessionService?.categories ?? sessionService?.category_id;
      if (category) {
        return typeof category === 'object' || Array.isArray(category) ? category : { id: category };
      }
    }
    const sessionName =
      session?.[`${key}_name`] ??
      (session?.[`${key}_name_en`] || session?.[`${key}_name_ar`]
        ? { en: session[`${key}_name_en`], ar: session[`${key}_name_ar`] }
        : null);
    if (sessionName) return { id: session?.[`${key}_id`], name: sessionName };
  }

  return namedFallback(row, key);
}

export function reservationRelationId(row: any, key: ReservationRelationKey): string {
  const directId = plainId(row?.[`${key}_id`]);
  if (directId) return directId;

  const fromRelation = plainId(firstRecord(reservationRelation(row, key))?.id ?? reservationRelation(row, key));
  if (fromRelation) return fromRelation;

  if (key === 'category') {
    const service = firstRecord(reservationRelation(row, 'service'));
    const nestedId = plainId(service?.category_id ?? service?.category?.id);
    if (nestedId) return nestedId;
  }

  return '';
}

export function reservationRelationLabel(
  row: any,
  key: ReservationRelationKey,
  namesById?: ReadonlyMap<string, string>
): string {
  const label = relationLabel(reservationRelation(row, key));
  if (label) return label;
  const id = reservationRelationId(row, key);
  return (id && namesById?.get(id)) || '';
}

export function catalogNameMap(list: any[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const item of list) {
    const id = plainId(item?.id);
    const label = relationLabel(item);
    if (id && label) map.set(id, label);
  }
  return map;
}
