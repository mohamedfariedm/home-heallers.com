export interface UserActivityReportsPermissions {
  view: boolean;
  export: boolean;
}

export function resolveUserActivityReportsPermissions(
  userPermissions: string[] = []
): UserActivityReportsPermissions {
  const view = userPermissions.includes('user_reports');
  return {
    view,
    export: view,
  };
}
