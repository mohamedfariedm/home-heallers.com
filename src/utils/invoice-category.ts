import { resolveLocalizedName } from '@/utils/resolve-localized-name';

export type InvoiceCategoryRef = {
  id?: number;
  name?: unknown;
  code?: string;
};

export type InvoiceCategorySource = {
  category_id?: number | string | null;
  category_name?: unknown;
  category_code?: string | null;
  category?: InvoiceCategoryRef | null;
};

export function resolveCategoryLabel(
  source?: InvoiceCategorySource | null,
  prefer: 'en' | 'ar' = 'en'
): string {
  if (!source) return '';
  return (
    resolveLocalizedName(source.category_name, prefer) ||
    resolveLocalizedName(source.category?.name, prefer) ||
    source.category_code ||
    source.category?.code ||
    ''
  );
}

export function resolveInvoiceCategories(
  invoice?:
    | (InvoiceCategorySource & { details?: InvoiceCategorySource[] | null })
    | null,
  prefer: 'en' | 'ar' = 'en'
): string {
  const labels = new Set<string>();
  const header = resolveCategoryLabel(invoice, prefer);
  if (header) labels.add(header);
  for (const detail of invoice?.details ?? []) {
    const label = resolveCategoryLabel(detail, prefer);
    if (label) labels.add(label);
  }
  return Array.from(labels).join(', ');
}
