export interface AppMessagesPagePermissions {
  view: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

export function resolveAppMessagesPermissions(
  userPermissions: string[] = []
): AppMessagesPagePermissions {
  const allowed = userPermissions.includes('app_messages');

  return {
    view: allowed,
    create: allowed,
    update: allowed,
    delete: allowed,
  };
}
