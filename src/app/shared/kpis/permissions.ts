export interface KpisPermissions {
  viewUsers: boolean;
  viewDoctors: boolean;
  exportUsers: boolean;
  exportDoctors: boolean;
}

export function resolveKpisPermissions(
  userPermissions: string[] = []
): KpisPermissions {
  const viewUsers = userPermissions.includes('user_reports');
  const viewDoctors = userPermissions.includes('doctor_reports');

  // Export uses the same report permissions on the frontend.
  // The API still enforces admin role on ?export=true (403 for non-admins).
  return {
    viewUsers,
    viewDoctors,
    exportUsers: viewUsers,
    exportDoctors: viewDoctors,
  };
}

export function canAccessKpis(userPermissions: string[] = []): boolean {
  return (
    userPermissions.includes('user_reports') ||
    userPermissions.includes('doctor_reports')
  );
}
