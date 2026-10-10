import { MediaFolder } from '@/types/settings';
import { isAdminRole } from '@/utils/kpi-export';

export function normalizeRoleName(role: unknown): string {
  if (typeof role === 'string') return role.trim();
  if (role && typeof role === 'object' && 'name' in role) {
    const name = (role as { name?: unknown }).name;
    if (typeof name === 'string') return name.trim();
    if (name && typeof name === 'object' && 'en' in (name as object)) {
      const en = (name as { en?: unknown }).en;
      if (typeof en === 'string') return en.trim();
    }
  }
  return '';
}

export function folderRoleNames(folder: Pick<MediaFolder, 'roles'>): string[] {
  return (folder.roles ?? []).map(normalizeRoleName).filter(Boolean);
}

/**
 * Admin always sees every folder.
 * A folder with no roles is visible to everyone.
 * A folder with roles is visible only to users who have one of those roles.
 */
export function canViewMediaFolder(folder: MediaFolder, userRoles: string[]): boolean {
  if (isAdminRole(userRoles)) return true;
  const allowed = folderRoleNames(folder);
  if (allowed.length === 0) return true;
  const owned = new Set(userRoles.map((role) => role.toLowerCase()));
  return allowed.some((role) => owned.has(role.toLowerCase()));
}

export function filterVisibleMediaFolders(
  folders: MediaFolder[],
  userRoles: string[]
): MediaFolder[] {
  return (folders ?? [])
    .filter((folder) => canViewMediaFolder(folder, userRoles))
    .map((folder) => ({
      ...folder,
      subFolders: filterVisibleMediaFolders(folder.subFolders ?? [], userRoles),
    }));
}
