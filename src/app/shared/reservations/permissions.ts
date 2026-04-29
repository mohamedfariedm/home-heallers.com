export interface ReservationsPagePermissions {
  view: boolean;
  create: boolean;
  export: boolean;
  import: boolean;
  edit: boolean;
  delete: boolean;
  inviteDoctors: boolean;
  sendPaymentWhatsapp: boolean;
}

const hasAny = (userPermissions: string[], keys: string[]) =>
  keys.some((key) => userPermissions.includes(key));

export function resolveReservationsPermissions(
  userPermissions: string[] = []
): ReservationsPagePermissions {
  return {
    // Strict mode: base permission allows only page access.
    view: hasAny(userPermissions, ['reservations']),
    create: hasAny(userPermissions, ['reservations_create']),
    export: hasAny(userPermissions, ['reservations_export']),
    import: hasAny(userPermissions, ['reservations_import']),
    edit: hasAny(userPermissions, ['reservations_edit']),
    delete: hasAny(userPermissions, ['reservations_delete']),
    inviteDoctors: hasAny(userPermissions, ['reservations_invite_doctors']),
    sendPaymentWhatsapp: hasAny(userPermissions, ['reservations_send_payment_whatsapp']),
  };
}
