import { routes } from '@/config/routes';
import type { DashboardNotificationAction } from '@/types/dashboard-notifications';

/** Resolve in-app path for a dashboard notification action (locale prefix applied by router/Link). */
export function getDashboardNotificationHref(
  action: DashboardNotificationAction | null | undefined
): string | null {
  if (!action || action.type !== 'route') return null;

  const { entity, id } = action;

  switch (entity) {
    case 'reservation':
      return routes.reservations.index;
    case 'customer_support':
      return '/customer-supports-operation-kanban';
    case 'client':
      return id != null ? routes.patients.detail(id) : routes.patients.index;
    default:
      return null;
  }
}

export function parseNotificationActionFromPushData(
  data: Record<string, string> | undefined
): DashboardNotificationAction | null {
  if (!data) return null;

  const entity = data.entity || data.action_entity;
  if (!entity) return null;

  const rawId = data.id ?? data.action_id ?? data.entity_id;
  const id =
    rawId != null && rawId !== '' && !Number.isNaN(Number(rawId))
      ? Number(rawId)
      : null;

  return {
    type: 'route',
    entity,
    id,
  };
}
