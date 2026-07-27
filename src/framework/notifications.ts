import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import client from '@/framework/utils';
import { HttpClient } from '@/framework/utils/request';
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';
import type {
  ApiResponse,
  ImmediateSendResult,
  NotificationContentPayload,
  ScheduledNotification,
  ScheduledNotificationsResponse,
  SentFilterOptionsResponse,
  SentNotification,
  SentNotificationRecipientsResponse,
  SentNotificationsResponse,
} from '@/types/admin-notifications';

export const notificationKeys = {
  scheduled: (param: string) =>
    [routes.notifications.index, 'scheduled', param] as const,
  scheduledDetail: (id: number) =>
    [routes.notifications.index, 'scheduled', id] as const,
  sent: (param: string) => [routes.notifications.index, 'sent', param] as const,
  sentDetail: (id: number) => [routes.notifications.index, 'sent', id] as const,
  sentRecipients: (id: number, param: string) =>
    [routes.notifications.index, 'sent', id, 'recipients', param] as const,
  sentFilterOptions: () =>
    [routes.notifications.index, 'sent', 'filter-options'] as const,
};

type Audience = 'all' | 'clients' | 'doctors' | 'specific';

function getSendFn(audience: Audience) {
  switch (audience) {
    case 'all':
      return client.notifications.sendGlobal;
    case 'clients':
      return client.notifications.sendToClients;
    case 'doctors':
      return client.notifications.sendToDoctors;
    case 'specific':
      return client.notifications.sendToSpecific;
  }
}

export function useScheduledNotifications(param: string, enabled = true) {
  return useQuery<ScheduledNotificationsResponse, Error>({
    queryKey: notificationKeys.scheduled(param),
    queryFn: () =>
      client.notifications.scheduled.all(param) as Promise<ScheduledNotificationsResponse>,
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useScheduledNotification(id: number, enabled = true) {
  return useQuery<ApiResponse<ScheduledNotification>, Error>({
    queryKey: notificationKeys.scheduledDetail(id),
    queryFn: () =>
      client.notifications.scheduled.findOne(id) as Promise<
        ApiResponse<ScheduledNotification>
      >,
    enabled: Boolean(id) && enabled,
  });
}

export function useSentNotifications(param: string, enabled = true) {
  return useQuery<SentNotificationsResponse, Error>({
    queryKey: notificationKeys.sent(param),
    queryFn: () =>
      client.notifications.sent.all(param) as Promise<SentNotificationsResponse>,
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useSentNotification(id: number, enabled = true) {
  return useQuery<ApiResponse<SentNotification>, Error>({
    queryKey: notificationKeys.sentDetail(id),
    queryFn: () =>
      client.notifications.sent.findOne(id) as Promise<ApiResponse<SentNotification>>,
    enabled: Boolean(id) && enabled,
  });
}

export function useSentNotificationRecipients(
  id: number,
  param = '',
  enabled = true
) {
  return useQuery<SentNotificationRecipientsResponse, Error>({
    queryKey: notificationKeys.sentRecipients(id, param),
    queryFn: () =>
      client.notifications.sent.recipients(id, param) as Promise<SentNotificationRecipientsResponse>,
    enabled: Boolean(id) && enabled,
    placeholderData: keepPreviousData,
  });
}

export function useSentNotificationFilterOptions(enabled = true) {
  return useQuery<SentFilterOptionsResponse, Error>({
    queryKey: notificationKeys.sentFilterOptions(),
    queryFn: () =>
      client.notifications.sent.filterOptions() as Promise<SentFilterOptionsResponse>,
    enabled,
    staleTime: 5 * 60_000,
  });
}

export function useSendNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      audience,
      payload,
    }: {
      audience: Audience;
      payload: NotificationContentPayload;
    }) => {
      const sendFn = getSendFn(audience);
      return (await sendFn(payload as never)) as ImmediateSendResult;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: [routes.notifications.index, 'sent'] });
      const queued = result?.data?.queued_count ?? 0;
      const recipients = result?.data?.recipient_count;
      const logId = result?.data?.log_id;
      const jobsLabel = `${queued} job${queued === 1 ? '' : 's'}`;
      const recipientsLabel =
        recipients != null ? `, ${recipients} recipient${recipients === 1 ? '' : 's'}` : '';
      toast.success(
        logId
          ? `Notification queued (${jobsLabel}${recipientsLabel}). Log #${logId}`
          : `Notification queued (${jobsLabel}${recipientsLabel})`
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to queue notification');
    },
  });
}

export function useCreateScheduledNotification() {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  return useMutation({
    mutationFn: client.notifications.scheduled.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [routes.notifications.index, 'scheduled'],
      });
      toast.success('Scheduled notification created');
      closeModal();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create scheduled notification');
    },
  });
}

export function useUpdateScheduledNotification() {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: Record<string, unknown>;
    }) => {
      try {
        return await client.notifications.scheduled.update(id, payload);
      } catch (error: unknown) {
        const status = (error as { response?: { status?: number } })?.response
          ?.status;
        // Fallback when API only accepts PATCH
        if (status === 405 || status === 404) {
          return HttpClient.patch(
            `${routes.notifications.index}/scheduled/${id}`,
            payload
          );
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [routes.notifications.index, 'scheduled'],
      });
      toast.success('Scheduled notification updated');
      closeModal();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update scheduled notification');
    },
  });
}

export function useCancelScheduledNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => client.notifications.scheduled.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [routes.notifications.index, 'scheduled'],
      });
      toast.success('Scheduled notification canceled');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel scheduled notification');
    },
  });
}

// Legacy exports — kept for backward compatibility during migration
export function useNotifications(param: string) {
  return useSentNotifications(param);
}

export const useAllNotifications = () => useSentNotificationFilterOptions();

export const useCreateNotifcation = useSendNotification;
