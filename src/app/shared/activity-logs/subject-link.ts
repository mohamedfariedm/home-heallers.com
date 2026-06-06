import { routes } from '@/config/routes';

const SUBJECT_ROUTE_BUILDERS: Record<string, (id: number) => string> = {
  Reservation: () => routes.reservations.index,
  Client: (id) => `${routes.patients.index}/${id}`,
  Doctor: (id) => routes.doctors.detail(id),
  User: () => routes.users.index,
  Invoice: (id) => routes.invoices.detail(id),
  Coupon: () => routes.coupons.index,
  Center: () => routes.centers.index,
  Category: () => routes.mainCategories.index,
  Service: () => routes.services.index,
  Package: () => routes.packages.index,
  Address: () => routes.addresses.index,
  News: () => routes.blogs.index,
  CustomerSupport: () => routes.customerSupport.index,
};

export function getSubjectHref(
  type: string | null,
  id: number | null
): string | null {
  if (!type || id == null) return null;
  const builder = SUBJECT_ROUTE_BUILDERS[type];
  return builder ? builder(id) : null;
}

export function formatSubjectLabel(
  type: string | null,
  id: number | null
): string {
  if (!type && id == null) return '—';
  if (!type) return `#${id}`;
  if (id == null) return type;
  return `${type} #${id}`;
}
