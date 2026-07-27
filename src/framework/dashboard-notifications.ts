import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import client from '@/framework/utils';
import type {
  DashboardNotificationsListResponse,
  DashboardUnreadCountResponse,
  PushTokenResponse,
  RegisterPushTokenInput,
  RevokePushTokenInput,
} from '@/types/dashboard-notifications';

export const dashboardNotificationKeys = {
  all: ['dashboard-notifications'] as const,
  list: (param: string) =>
    [...dashboardNotificationKeys.all, 'list', param] as const,
  unreadCount: () =>
    [...dashboardNotificationKeys.all, 'unread-count'] as const,
};

const UNREAD_POLL_MS = 45_000;

export function useDashboardNotifications(
  param = 'per_page=20',
  enabled = true
) {
  return useQuery<DashboardNotificationsListResponse, Error>({
    queryKey: dashboardNotificationKeys.list(param),
    queryFn: () =>
      client.dashboardNotifications.all(param) as Promise<DashboardNotificationsListResponse>,
    enabled,
  });
}

export function useDashboardUnreadCount(enabled = true) {
  const queryClient = useQueryClient();
  const previousCountRef = useRef<number | null>(null);

  const query = useQuery<DashboardUnreadCountResponse, Error>({
    queryKey: dashboardNotificationKeys.unreadCount(),
    queryFn: () =>
      client.dashboardNotifications.unreadCount() as Promise<DashboardUnreadCountResponse>,
    enabled,
    refetchInterval: UNREAD_POLL_MS,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    const count = query.data?.data?.unread_count;
    if (typeof count !== 'number') return;

    if (
      previousCountRef.current !== null &&
      count > previousCountRef.current
    ) {
      queryClient.invalidateQueries({
        queryKey: dashboardNotificationKeys.all,
      });
    }
    previousCountRef.current = count;
  }, [query.data?.data?.unread_count, queryClient]);

  useEffect(() => {
    if (!enabled) return;

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        queryClient.invalidateQueries({
          queryKey: dashboardNotificationKeys.unreadCount(),
        });
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [enabled, queryClient]);

  return query;
}

export function useMarkDashboardNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => client.dashboardNotifications.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: dashboardNotificationKeys.all,
      });
    },
  });
}

export function useMarkAllDashboardNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => client.dashboardNotifications.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: dashboardNotificationKeys.all,
      });
    },
  });
}

export function useRegisterPushToken() {
  return useMutation({
    mutationFn: (input: RegisterPushTokenInput) =>
      client.pushTokens.register(input) as Promise<{ data: PushTokenResponse }>,
  });
}

export function useRevokePushToken() {
  return useMutation({
    mutationFn: (input: RevokePushTokenInput) =>
      client.pushTokens.revoke(input),
  });
}

export function invalidateDashboardNotifications(
  queryClient: ReturnType<typeof useQueryClient>
) {
  return queryClient.invalidateQueries({
    queryKey: dashboardNotificationKeys.all,
  });
}
