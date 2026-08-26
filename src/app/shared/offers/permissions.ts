export interface OffersPagePermissions {
  view: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
  export: boolean;
  faqs: boolean;
  reviewsView: boolean;
  reviewsGate1: boolean;
  reviewsGate2: boolean;
}

const has = (userPermissions: string[], key: string) =>
  userPermissions.includes(key);

export function resolveOffersPermissions(
  userPermissions: string[] = []
): OffersPagePermissions {
  const packages = has(userPermissions, 'packages');
  const reservations = has(userPermissions, 'reservations');

  return {
    view: packages,
    create: packages,
    update: packages,
    delete: packages,
    export: packages,
    faqs: packages,
    reviewsView: packages,
    reviewsGate1: packages,
    reviewsGate2: reservations,
  };
}
