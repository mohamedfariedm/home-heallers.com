import { MediaFolder, MediaFolderUser } from '@/types/settings';
import { isAdminRole } from '@/utils/kpi-export';

export const MEDIA_FOLDERS_PERMISSION = 'media_folders';

export type MediaFolderViewer = {
  userId?: string | number | null;
  roles?: string[];
};

export function normalizeUserId(id: unknown): string {
  if (id == null) return '';
  return String(id).trim();
}

export function folderAllowedUsers(
  folder: Pick<MediaFolder, 'allowedUsers'>
): MediaFolderUser[] {
  return (folder.allowedUsers ?? [])
    .map((user) => ({
      id: normalizeUserId(user?.id),
      name: typeof user?.name === 'string' ? user.name.trim() : '',
    }))
    .filter((user) => user.id.length > 0);
}

export function isFolderOwner(
  folder: Pick<MediaFolder, 'ownerId'>,
  userId?: string | number | null
): boolean {
  const current = normalizeUserId(userId);
  const owner = normalizeUserId(folder.ownerId);
  return Boolean(current && owner && current === owner);
}

/** Only Admin can grant a folder to other users. */
export function canManageFolderAccess(roles: string[] = []): boolean {
  return isAdminRole(roles);
}

/**
 * A folder is visible to:
 * - Admin (always)
 * - the user who created it
 * - users the admin explicitly shared it with
 * Nobody else can see it — not by role or permission.
 */
export function canViewMediaFolder(
  folder: MediaFolder,
  viewer: MediaFolderViewer
): boolean {
  if (isAdminRole(viewer.roles ?? [])) return true;
  const userId = normalizeUserId(viewer.userId);
  if (!userId) return false;
  if (isFolderOwner(folder, userId)) return true;
  return folderAllowedUsers(folder).some((user) => user.id === userId);
}

/** Owner or Admin can add/delete files and sub-folders. */
export function canMutateMediaFolder(
  folder: MediaFolder | null,
  viewer: MediaFolderViewer
): boolean {
  if (isAdminRole(viewer.roles ?? [])) return true;
  if (!folder) return true;
  return isFolderOwner(folder, viewer.userId);
}

export function filterVisibleMediaFolders(
  folders: MediaFolder[],
  viewer: MediaFolderViewer
): MediaFolder[] {
  return (folders ?? [])
    .filter((folder) => canViewMediaFolder(folder, viewer))
    .map((folder) => ({
      ...folder,
      subFolders: filterVisibleMediaFolders(folder.subFolders ?? [], viewer),
    }));
}
