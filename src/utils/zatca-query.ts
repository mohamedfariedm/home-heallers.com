/** Map invoices page URL params to ZATCA list API query string */
export function toZatcaListQuery(searchParams: URLSearchParams): string {
  const p = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (key === 'limit') {
      p.set('per_page', value);
      return;
    }
    if (key === 'invoice_number' || key === 'customer_name') {
      if (!p.get('search')) p.set('search', value);
      return;
    }
    p.set(key, value);
  });
  if (!p.get('page')) p.set('page', '1');
  if (!p.get('per_page')) p.set('per_page', p.get('limit') ?? '25');
  return p.toString();
}
