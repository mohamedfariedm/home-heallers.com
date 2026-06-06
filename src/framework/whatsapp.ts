import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import client from '@/framework/utils';
import toast from 'react-hot-toast';
import { useWhatsAppInboxContext } from '@/lib/whatsapp/inbox-context';
import type {
  LaravelPaginator,
  SendWhatsAppMessageResult,
  WhatsAppChat,
  WhatsAppChatMessage,
  WhatsAppQrResponse,
  WhatsAppSessionStatus,
} from '@/types/whatsapp';

export const whatsappQueryKeys = {
  session: ['whatsapp', 'session'] as const,
  qr: ['whatsapp', 'qr'] as const,
  chats: (params: string) => ['whatsapp', 'chats', params] as const,
  messages: (chatId: number, cursor: string) =>
    ['whatsapp', 'messages', chatId, cursor] as const,
};

export function useWhatsAppSessionStatus() {
  const { apiEnabled } = useWhatsAppInboxContext();
  return useQuery<WhatsAppSessionStatus, Error>({
    queryKey: whatsappQueryKeys.session,
    queryFn: () => client.whatsapp.sessionStatus(),
    enabled: apiEnabled,
    refetchInterval: (query) => {
      if (!apiEnabled) return false;
      const session = query.state.data?.session ?? query.state.data?.status;
      return session === 'CONNECTED' ? false : 30000;
    },
  });
}

export function useWhatsAppQr(enabled: boolean, pollMs = 12000) {
  const { apiEnabled } = useWhatsAppInboxContext();
  const qrEnabled = apiEnabled && enabled;
  return useQuery<WhatsAppQrResponse, Error>({
    queryKey: whatsappQueryKeys.qr,
    queryFn: () => client.whatsapp.sessionQr(),
    enabled: qrEnabled,
    refetchInterval: qrEnabled ? pollMs : false,
  });
}

export function useWhatsAppReconnect() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => client.whatsapp.sessionReconnect(),
    onSuccess: () => {
      toast.success('Reconnecting WhatsApp session…');
      queryClient.invalidateQueries({ queryKey: whatsappQueryKeys.session });
      queryClient.invalidateQueries({ queryKey: whatsappQueryKeys.qr });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useWhatsAppLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => client.whatsapp.sessionLogout(),
    onSuccess: () => {
      toast.success('WhatsApp session logged out');
      queryClient.invalidateQueries({ queryKey: whatsappQueryKeys.session });
      queryClient.invalidateQueries({ queryKey: whatsappQueryKeys.qr });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useWhatsAppChats(params: {
  search?: string;
  page?: number;
  per_page?: number;
}) {
  const { apiEnabled } = useWhatsAppInboxContext();
  const key = JSON.stringify(params);
  return useQuery<LaravelPaginator<WhatsAppChat>, Error>({
    queryKey: whatsappQueryKeys.chats(key),
    queryFn: () => client.whatsapp.chats(params),
    enabled: apiEnabled,
    placeholderData: keepPreviousData,
    refetchInterval: apiEnabled ? 45000 : false,
  });
}

export function useWhatsAppMessages(
  chatId: number | null,
  options?: { before?: string; includeSystem?: boolean; poll?: boolean }
) {
  const { apiEnabled } = useWhatsAppInboxContext();
  const cursor = options?.before ?? 'latest';
  const messagesEnabled = apiEnabled && !!chatId;
  return useQuery<LaravelPaginator<WhatsAppChatMessage>, Error>({
    queryKey: whatsappQueryKeys.messages(chatId ?? 0, cursor),
    queryFn: () =>
      client.whatsapp.messages(chatId!, {
        per_page: 50,
        before: options?.before,
        include_system: options?.includeSystem ? 1 : undefined,
      }),
    enabled: messagesEnabled,
    refetchInterval:
      messagesEnabled && options?.poll && !options?.before ? 20000 : false,
  });
}

export function useSendWhatsAppMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      chatId,
      message,
    }: {
      chatId: number;
      message: string;
    }) => client.whatsapp.sendMessage(chatId, message),
    onSuccess: (result, { chatId }) => {
      if (result.httpStatus === 207) {
        toast.error(
          result.warning ||
            'Message sent via WhatsApp but failed to save locally.'
        );
      }
      queryClient.invalidateQueries({
        queryKey: ['whatsapp', 'messages', chatId],
      });
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'chats'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
