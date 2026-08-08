/** Spatie-style permission names for Work Management (Epic 18). */

export const WM_PERMISSIONS = {
  workItemsView: 'work_items.view',
  workItemsCreate: 'work_items.create',
  workItemsUpdate: 'work_items.update',
  workItemsDelete: 'work_items.delete',
  workItemsAssign: 'work_items.assign',
  workItemsChangeStatus: 'work_items.change_status',
  projectsManage: 'projects.manage',
  departmentsManage: 'departments.manage',
  commentsCreate: 'comments.create',
  attachmentsCreate: 'attachments.create',
  reportsView: 'reports.view',
} as const;

export type WmPermission =
  (typeof WM_PERMISSIONS)[keyof typeof WM_PERMISSIONS];

/** Mock: grant all WM permissions to any authenticated user. */
export function getMockWmPermissions(): string[] {
  return Object.values(WM_PERMISSIONS);
}

export function hasWmPermission(
  userPermissions: string[] | undefined | null,
  permission: WmPermission,
  /** When true (default mock), missing list = allow all */
  allowAllIfEmpty = true
): boolean {
  if (!userPermissions || userPermissions.length === 0) {
    return allowAllIfEmpty;
  }
  // Also allow if user has any of the real Spatie names OR mock grants
  if (userPermissions.some((p) => Object.values(WM_PERMISSIONS).includes(p as WmPermission))) {
    return userPermissions.includes(permission);
  }
  // Backend may not have seeded WM perms yet — treat as allowed in mock mode
  return allowAllIfEmpty;
}
