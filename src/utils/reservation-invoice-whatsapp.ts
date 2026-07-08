export function getReservationClientMobile(row: {
  client?: { mobile?: string | null };
  patient?: { mobile?: string | null };
  guest_info?: { mobile?: string | null };
}): string | null {
  const mobile =
    row?.client?.mobile ??
    row?.patient?.mobile ??
    row?.guest_info?.mobile ??
    '';
  const trimmed = String(mobile ?? '').trim();
  return trimmed || null;
}

export function reservationHasInvoice(row: {
  invoice?: unknown;
  invoice_id?: number | string | null;
  has_invoice?: boolean;
  status?: number | string | null;
}): boolean {
  if (row?.invoice) return true;
  if (row?.invoice_id) return true;
  if (row?.has_invoice === true) return true;

  const status = Number(row?.status);
  return status === 3 || status === 5;
}

export function canSendInvoiceWhatsapp(row: Parameters<typeof getReservationClientMobile>[0] &
  Parameters<typeof reservationHasInvoice>[0]): boolean {
  return reservationHasInvoice(row) && Boolean(getReservationClientMobile(row));
}

export function getSendInvoiceWhatsappDisabledReason(
  row: Parameters<typeof getReservationClientMobile>[0] &
    Parameters<typeof reservationHasInvoice>[0]
): string | null {
  if (!reservationHasInvoice(row)) {
    return 'Invoice not available until reservation is confirmed';
  }
  if (!getReservationClientMobile(row)) {
    return 'Client has no mobile number';
  }
  return null;
}
