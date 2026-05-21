export interface ZatcaPermissions {
  view: boolean;
  audit: boolean;
  submit: boolean;
  retry: boolean;
  revalidate: boolean;
  export: boolean;
  admin: boolean;
}

const has = (perms: string[], key: string) => perms.includes(key);

export function resolveZatcaPermissions(
  userPermissions: string[] = []
): ZatcaPermissions {
  return {
    view: has(userPermissions, 'zatca.view') || has(userPermissions, 'invoices'),
    audit: has(userPermissions, 'zatca.audit'),
    submit: has(userPermissions, 'zatca.submit'),
    retry: has(userPermissions, 'zatca.retry'),
    revalidate: has(userPermissions, 'zatca.revalidate'),
    export: has(userPermissions, 'zatca.export'),
    admin: has(userPermissions, 'zatca.admin'),
  };
}
