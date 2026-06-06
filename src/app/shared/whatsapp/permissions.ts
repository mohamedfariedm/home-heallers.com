export interface WhatsAppInboxPermissions {
  manage: boolean;
}

export function resolveWhatsAppInboxPermissions(
  userPermissions: string[] = []
): WhatsAppInboxPermissions {
  return {
    manage: userPermissions.includes('whatsapp.manage'),
  };
}
