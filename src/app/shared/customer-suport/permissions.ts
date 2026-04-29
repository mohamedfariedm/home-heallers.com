export type CustomerSupportKanbanScope = 'marketing' | 'operation';

export interface CustomerSupportKanbanPermissions {
  view: boolean;
  create: boolean;
  update: boolean;
  moveStatus: boolean;
  export: boolean;
  filter: boolean;
  sendWhatsapp: boolean;
  viewDetails: boolean;
  viewActivityLogs: boolean;
}

const actionKeysByScope = {
  marketing: {
    base: 'customer_supports_outbound',
    create: 'customer_supports_outbound_create',
    update: 'customer_supports_outbound_update',
    moveStatus: 'customer_supports_outbound_move_status',
    export: 'customer_supports_outbound_export',
    filter: 'customer_supports_outbound_filter',
    sendWhatsapp: 'customer_supports_outbound_whatsapp',
    viewDetails: 'customer_supports_outbound_view_details',
    viewActivityLogs: 'customer_supports_outbound_view_activity_logs',
  },
  operation: {
    base: 'customer_supports_inbound',
    create: 'customer_supports_inbound_create',
    update: 'customer_supports_inbound_update',
    moveStatus: 'customer_supports_inbound_move_status',
    export: 'customer_supports_inbound_export',
    filter: 'customer_supports_inbound_filter',
    sendWhatsapp: 'customer_supports_inbound_whatsapp',
    viewDetails: 'customer_supports_inbound_view_details',
    viewActivityLogs: 'customer_supports_inbound_view_activity_logs',
  },
} as const;

const hasAny = (userPermissions: string[], keys: string[]) =>
  keys.some((key) => userPermissions.includes(key));

export function resolveCustomerSupportKanbanPermissions(
  userPermissions: string[] = [],
  scope: CustomerSupportKanbanScope
): CustomerSupportKanbanPermissions {
  const keys = actionKeysByScope[scope];

  return {
    // Strict mode: base permission allows only page access.
    view: hasAny(userPermissions, [keys.base]),
    create: hasAny(userPermissions, [keys.create]),
    update: hasAny(userPermissions, [keys.update]),
    moveStatus: hasAny(userPermissions, [keys.moveStatus]),
    export: hasAny(userPermissions, [keys.export]),
    filter: hasAny(userPermissions, [keys.filter]),
    sendWhatsapp: hasAny(userPermissions, [keys.sendWhatsapp]),
    viewDetails: hasAny(userPermissions, [keys.viewDetails]),
    viewActivityLogs: hasAny(userPermissions, [keys.viewActivityLogs]),
  };
}
