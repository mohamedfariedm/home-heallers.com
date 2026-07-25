export interface DoctorTargetsPermissions {
  view: boolean;
  create: boolean;
  edit: boolean;
  adjust: boolean;
  approve: boolean;
  reports: boolean;
  dashboard: boolean;
}

const hasAny = (userPermissions: string[], keys: string[]) =>
  keys.some((key) => userPermissions.includes(key));

export function resolveDoctorTargetsPermissions(
  userPermissions: string[] = []
): DoctorTargetsPermissions {
  return {
    view: hasAny(userPermissions, [
      'doctor_targets.edit',
      'doctor_targets.create',
      'doctor_targets.approve',
      'doctor_targets.reports',
      'dashboard.doctor_targets',
    ]),
    create: hasAny(userPermissions, ['doctor_targets.create']),
    edit: hasAny(userPermissions, ['doctor_targets.edit']),
    adjust: hasAny(userPermissions, ['doctor_targets.adjust']),
    approve: hasAny(userPermissions, ['doctor_targets.approve']),
    reports: hasAny(userPermissions, ['doctor_targets.reports']),
    dashboard: hasAny(userPermissions, ['dashboard.doctor_targets']),
  };
}

export type DoctorTargetStatus = 'draft' | 'active' | 'approved' | 'paid';

export function getStatusActions(
  status: DoctorTargetStatus | string,
  perms: DoctorTargetsPermissions
) {
  switch (status) {
    case 'draft':
      return {
        edit: perms.edit,
        activate: perms.edit,
        retarget: perms.create,
        adjust: false,
        preview: false,
        approve: false,
      };
    case 'active':
      return {
        edit: perms.edit,
        activate: false,
        retarget: perms.create,
        adjust: perms.adjust,
        preview: perms.approve,
        approve: perms.approve,
      };
    case 'approved':
    case 'paid':
    default:
      return {
        edit: false,
        activate: false,
        retarget: false,
        adjust: false,
        preview: false,
        approve: false,
      };
  }
}

export function isFrozenStatus(status: string) {
  return status === 'approved' || status === 'paid';
}
