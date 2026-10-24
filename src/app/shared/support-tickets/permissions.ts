export interface SupportTicketsPermissions {
  view: boolean;
  assign: boolean;
  close: boolean;
  settings: boolean;
}

export function resolveSupportTicketsPermissions(
  userPermissions: string[] = []
): SupportTicketsPermissions {
  const has = (key: string) => userPermissions.includes(key);

  return {
    view: has('support_tickets'),
    assign: has('support_tickets_assign'),
    close: has('support_tickets_close'),
    settings: has('support_tickets_settings'),
  };
}
