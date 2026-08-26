import type { WorkManagementRepository } from './repository';
import { MockWorkManagementRepository } from './mock-repository';
import { LaravelWorkManagementRepository } from './laravel-repository';

export type WorkManagementBackend = 'mock' | 'laravel';

/**
 * Live Laravel API when NEXT_PUBLIC_WM_BACKEND=laravel; otherwise mock/localStorage.
 * Contract: docs/work-management-api.md
 */
const BACKEND: WorkManagementBackend =
  (typeof process !== 'undefined' &&
    (process.env.NEXT_PUBLIC_WM_BACKEND as WorkManagementBackend)) ||
  'mock';

let instance: WorkManagementRepository | null = null;

export function getWorkManagementRepository(): WorkManagementRepository {
  if (!instance) {
    if (BACKEND === 'laravel') {
      instance = new LaravelWorkManagementRepository();
    } else {
      instance = new MockWorkManagementRepository();
    }
  }
  return instance;
}

export function resetWorkManagementRepositoryInstance() {
  instance = null;
}

export type { WorkManagementRepository } from './repository';
export { WM_PERMISSIONS, hasWmPermission, getMockWmPermissions } from './permissions';
export {
  DEFAULT_WORKFLOW,
  canTransition,
  getBoardColumns,
  BUILTIN_WORKFLOWS,
} from './workflow';
