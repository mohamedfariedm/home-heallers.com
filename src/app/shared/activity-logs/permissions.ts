export interface ActivityLogsPermissions {
  view: boolean;
}

export function resolveActivityLogsPermissions(
  userPermissions: string[] = []
): ActivityLogsPermissions {
  return {
    view: userPermissions.includes('activity-logs'),
  };
}
