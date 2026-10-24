import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import client from '@/framework/utils';
import { routes } from '@/config/routes';
import {
  getSupportRealtimeConnection,
  normalizeRealtimeConfig,
} from '@/lib/support-tickets/realtime';
import type {
  SendSupportMediaInput,
  SendSupportTextInput,
  SupportMessage,
  SupportMessagesPage,
  SupportTicket,
  SupportTicketsAgentOption,
  SupportTicketsListResponse,
  SupportTicketsSettings,
  SupportTicketsStats,
  SupportTicketsUnreadCount,
} from '@/types/support-tickets';

const BASE_KEY = routes.supportTickets.index;

export const supportTicketsKeys = {
  all: [BASE_KEY] as const,
  list: (queryString: string) => [BASE_KEY, 'list', queryString] as const,
  lists: () => [BASE_KEY, 'list'] as const,
  stats: () => [BASE_KEY, 'stats'] as const,
  unread: () => [BASE_KEY, 'unread-count'] as const,
  detail: (id: string | number) => [BASE_KEY, 'detail', String(id)] as const,
  messages: (id: string | number) => [BASE_KEY, 'messages', String(id)] as const,
  agents: () => [BASE_KEY, 'agents'] as const,
  settings: () => [BASE_KEY, 'settings'] as const,
  config: () => [BASE_KEY, 'config'] as const,
};

/** POST helpers return the axios response; GET/PUT/PATCH/DELETE return the body. */
const unwrap = <T>(res: any): T => {
  const body = res && typeof res === 'object' && 'status' in res && 'headers' in res ? res.data : res;
  return (body?.data ?? body) as T;
};

const errorMessage = (err: any, fallback: string) =>
  err?.response?.data?.message || err?.message || fallback;

const isTicket = (value: any): value is SupportTicket =>
  value && typeof value === 'object' && 'number' in value && 'stage' in value;

/* ------------------------------ Queries ------------------------------ */

export function useSupportTicketsConfig(enabled = true) {
  return useQuery({
    queryKey: supportTicketsKeys.config(),
    queryFn: async () => normalizeRealtimeConfig(await client.supportTickets.config()),
    enabled,
    staleTime: Infinity,
    retry: 1,
  });
}

export function useSupportTickets(queryString: string, options: { poll?: boolean } = {}) {
  return useQuery<SupportTicketsListResponse, Error>({
    queryKey: supportTicketsKeys.list(queryString),
    queryFn: async () => unwrap<SupportTicketsListResponse>(await client.supportTickets.all(queryString)),
    placeholderData: (prev) => prev,
    refetchInterval: options.poll ? 30_000 : false,
  });
}

export function useSupportTicketsStats(options: { poll?: boolean } = {}) {
  return useQuery<SupportTicketsStats, Error>({
    queryKey: supportTicketsKeys.stats(),
    queryFn: async () => unwrap<SupportTicketsStats>(await client.supportTickets.stats()),
    refetchInterval: options.poll ? 30_000 : false,
  });
}

export function useSupportTicketsUnreadCount(
  enabled = true,
  options: { refetchInterval?: number | false } = {}
) {
  return useQuery<SupportTicketsUnreadCount, Error>({
    queryKey: supportTicketsKeys.unread(),
    queryFn: async () => unwrap<SupportTicketsUnreadCount>(await client.supportTickets.unreadCount()),
    enabled,
    refetchInterval: options.refetchInterval ?? 60_000,
  });
}

export function useSupportTicket(id: string | number, options: { poll?: boolean } = {}) {
  return useQuery<SupportTicket, any>({
    queryKey: supportTicketsKeys.detail(id),
    queryFn: async () => unwrap<SupportTicket>(await client.supportTickets.findOne(id)),
    enabled: id !== undefined && id !== null && id !== '',
    refetchInterval: options.poll ? 20_000 : false,
    retry: (count, err) => err?.response?.status !== 404 && err?.response?.status !== 403 && count < 2,
  });
}

/** Latest page of messages (newest first, as returned by the API). */
export function useSupportTicketMessages(id: string | number, options: { poll?: boolean } = {}) {
  return useQuery<SupportMessagesPage, Error>({
    queryKey: supportTicketsKeys.messages(id),
    queryFn: async () => unwrap<SupportMessagesPage>(await client.supportTickets.messages(id, { limit: 30 })),
    enabled: id !== undefined && id !== null && id !== '',
    refetchInterval: options.poll ? 10_000 : false,
  });
}

export function useSupportTicketsAgents(enabled = true) {
  return useQuery<SupportTicketsAgentOption[], Error>({
    queryKey: supportTicketsKeys.agents(),
    queryFn: async () => {
      const data = unwrap<any>(await client.supportTickets.agents());
      return Array.isArray(data) ? data : data?.agents ?? [];
    },
    enabled,
  });
}

export function useSupportTicketsSettings(enabled = true) {
  return useQuery<SupportTicketsSettings, Error>({
    queryKey: supportTicketsKeys.settings(),
    queryFn: async () => unwrap<SupportTicketsSettings>(await client.supportTickets.settings.get()),
    enabled,
  });
}

/* ----------------------------- Mutations ----------------------------- */

function useTicketMutation<TVars>(
  mutationFn: (vars: TVars) => Promise<any>,
  getId: (vars: TVars) => string | number,
  messages: { success?: string; error: string }
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (res, vars) => {
      const data = unwrap<any>(res);
      const ticket = isTicket(data) ? data : isTicket(data?.ticket) ? data.ticket : null;
      if (ticket) queryClient.setQueryData(supportTicketsKeys.detail(getId(vars)), ticket);
      queryClient.invalidateQueries({ queryKey: supportTicketsKeys.detail(getId(vars)) });
      queryClient.invalidateQueries({ queryKey: supportTicketsKeys.messages(getId(vars)) });
      queryClient.invalidateQueries({ queryKey: supportTicketsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: supportTicketsKeys.stats() });
      queryClient.invalidateQueries({ queryKey: supportTicketsKeys.agents() });
      if (messages.success) toast.success(messages.success);
    },
    onError: (err: any) => {
      toast.error(errorMessage(err, messages.error));
    },
  });
}

export const useChangeSupportTicketStage = (msgs: { success?: string; error: string }) =>
  useTicketMutation(
    ({ id, stage }: { id: string | number; stage: 'in_progress' | 'resolved' }) =>
      client.supportTickets.changeStage(id, stage),
    (v) => v.id,
    msgs
  );

export const useClaimSupportTicket = (msgs: { success?: string; error: string }) =>
  useTicketMutation((id: string | number) => client.supportTickets.claim(id), (id) => id, msgs);

export const useAssignSupportTicket = (msgs: { success?: string; error: string }) =>
  useTicketMutation(
    ({ id, userId }: { id: string | number; userId: number | null }) =>
      client.supportTickets.assign(id, userId),
    (v) => v.id,
    msgs
  );

export const useCloseSupportTicket = (msgs: { success?: string; error: string }) =>
  useTicketMutation(
    ({ id, note }: { id: string | number; note?: string }) => client.supportTickets.close(id, note),
    (v) => v.id,
    msgs
  );

export const useDismissSupportCloseRequest = (msgs: { success?: string; error: string }) =>
  useTicketMutation(
    (id: string | number) => client.supportTickets.dismissCloseRequest(id),
    (id) => id,
    msgs
  );

export function useSendSupportMessage(ticketId: string | number, errorText: string) {
  return useMutation({
    mutationFn: async (input: SendSupportTextInput) =>
      unwrap<SupportMessage>(await client.supportTickets.sendMessage(ticketId, input)),
    onError: (err: any) => toast.error(errorMessage(err, errorText)),
  });
}

export function useSendSupportMedia(ticketId: string | number, errorText: string) {
  return useMutation({
    mutationFn: async (input: SendSupportMediaInput) =>
      unwrap<SupportMessage>(await client.supportTickets.sendMedia(ticketId, input)),
    onError: (err: any) => toast.error(errorMessage(err, errorText)),
  });
}

export function useDeleteSupportMessage(ticketId: string | number, errorText: string) {
  return useMutation({
    mutationFn: async (messageId: number) =>
      unwrap<SupportMessage>(await client.supportTickets.deleteMessage(ticketId, messageId)),
    onError: (err: any) => toast.error(errorMessage(err, errorText)),
  });
}

export function useMarkSupportTicketRead(ticketId: string | number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (lastReadMessageId?: number) =>
      client.supportTickets.markRead(ticketId, lastReadMessageId),
    onSuccess: () => {
      queryClient.setQueryData<SupportTicket | undefined>(
        supportTicketsKeys.detail(ticketId),
        (prev) => (prev ? { ...prev, unread_count: 0 } : prev)
      );
      queryClient.invalidateQueries({ queryKey: supportTicketsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: supportTicketsKeys.stats() });
      queryClient.invalidateQueries({ queryKey: supportTicketsKeys.unread() });
    },
  });
}

export function useUpdateSupportTicketsSettings(msgs: { success: string; error: string }) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SupportTicketsSettings) => client.supportTickets.settings.update(data),
    onSuccess: (res) => {
      const data = unwrap<SupportTicketsSettings>(res);
      if (data?.welcome_message) queryClient.setQueryData(supportTicketsKeys.settings(), data);
      else queryClient.invalidateQueries({ queryKey: supportTicketsKeys.settings() });
      toast.success(msgs.success);
    },
    onError: (err: any) => toast.error(errorMessage(err, msgs.error)),
  });
}

/* ------------------------------ Realtime ----------------------------- */

/**
 * Subscribes to a private support channel. Returns whether the socket is
 * live so callers can fall back to polling when it is not.
 */
export function useSupportChannel(
  channel: string | null,
  onEvent: (event: string, payload: any) => void,
  enabled = true
) {
  const { data: config, isFetched } = useSupportTicketsConfig(enabled);
  const handlerRef = useRef(onEvent);
  handlerRef.current = onEvent;
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!enabled || !channel || !config) {
      setConnected(false);
      return;
    }
    const connection = getSupportRealtimeConnection(config);
    setConnected(connection.isConnected());
    const offState = connection.onStateChange(setConnected);
    const unsubscribe = connection.subscribe(channel, (event, payload) =>
      handlerRef.current(event, payload)
    );
    return () => {
      offState();
      unsubscribe();
    };
  }, [channel, config, enabled]);

  return { connected, ready: isFetched };
}

export function unwrapRealtimePayload<T>(payload: any, key: 'ticket' | 'message'): T | null {
  if (!payload || typeof payload !== 'object') return null;
  if (payload[key] && typeof payload[key] === 'object') return payload[key] as T;
  if (payload.data && typeof payload.data === 'object' && 'id' in payload.data) return payload.data as T;
  return 'id' in payload ? (payload as T) : null;
}
