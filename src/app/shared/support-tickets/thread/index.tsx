'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { PiArrowLeftBold, PiLockBold, PiWarningCircleBold } from 'react-icons/pi';
import cn from '@/utils/class-names';
import client from '@/framework/utils';
import Spinner from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { routes } from '@/config/routes';
import {
  supportTicketsKeys,
  unwrapRealtimePayload,
  useDeleteSupportMessage,
  useMarkSupportTicketRead,
  useSupportChannel,
  useSupportTicket,
  useSupportTicketMessages,
} from '@/framework/support-tickets';
import { supportTicketChannel } from '@/lib/support-tickets/realtime';
import type {
  SupportMessage,
  SupportMessagesPage,
  SupportMessagesReadEvent,
  SupportTicket,
} from '@/types/support-tickets';
import type { SupportTicketsPermissions } from '../permissions';
import { STAGE_COLORS, mergeMessages, stageLabel, ticketTitle } from '../utils';
import MessageBubble from './message-bubble';
import SupportComposer from './composer';
import TicketHeaderActions from './header-actions';
import TicketSidePanel from './side-panel';

interface Props {
  ticketId: string;
  access: SupportTicketsPermissions;
}

export default function SupportTicketThread({ ticketId, access }: Props) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const currentUser = session?.user as { id?: string | number; email?: string } | undefined;

  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const restoreScroll = useRef<number | null>(null);
  const lastMarkedRead = useRef<number>(0);
  const initialReadSent = useRef(false);

  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [olderCursor, setOlderCursor] = useState<string | null | undefined>(undefined);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const markRead = useMarkSupportTicketRead(ticketId);
  const deleteMessage = useDeleteSupportMessage(ticketId, t('st_delete_error'));

  const addMessages = useCallback((incoming: SupportMessage[]) => {
    if (incoming.length === 0) return;
    setMessages((prev) => mergeMessages(prev, incoming));
  }, []);

  const updateTicket = useCallback(
    (patch: Partial<SupportTicket> | ((prev: SupportTicket) => Partial<SupportTicket>)) => {
      queryClient.setQueryData<SupportTicket | undefined>(supportTicketsKeys.detail(ticketId), (prev) =>
        prev ? { ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) } : prev
      );
    },
    [queryClient, ticketId]
  );

  const { connected } = useSupportChannel(supportTicketChannel(ticketId), (event, payload) => {
    if (event === 'support.message.created') {
      const message = unwrapRealtimePayload<SupportMessage>(payload, 'message');
      if (message && String(message.ticket_id ?? ticketId) === String(ticketId)) addMessages([message]);
    } else if (event === 'support.ticket.updated') {
      const ticket = unwrapRealtimePayload<SupportTicket>(payload, 'ticket');
      if (ticket) updateTicket(ticket);
    } else if (event === 'support.messages.read') {
      const read = payload as SupportMessagesReadEvent;
      if (read?.reader_role === 'client') {
        updateTicket((prev) => ({
          client_last_read_message_id: Math.max(
            prev.client_last_read_message_id ?? 0,
            Number(read.last_read_message_id) || 0
          ),
        }));
      } else if (read?.reader_role === 'support') {
        lastMarkedRead.current = Math.max(lastMarkedRead.current, Number(read.last_read_message_id) || 0);
        updateTicket({ unread_count: 0 });
        queryClient.invalidateQueries({ queryKey: supportTicketsKeys.unread() });
      }
    }
  });

  const ticketQuery = useSupportTicket(ticketId, { poll: !connected });
  const ticket = ticketQuery.data;
  const messagesQuery = useSupportTicketMessages(ticketId, { poll: !connected });

  useEffect(() => {
    const page = messagesQuery.data as SupportMessagesPage | undefined;
    if (!page) return;
    addMessages(page.messages ?? []);
    setOlderCursor((prev) => (prev === undefined ? page.next_cursor ?? null : prev));
  }, [messagesQuery.data, addMessages]);

  // Mark client messages read on open and whenever a new one arrives.
  const latestClientId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].sender_type === 'client') return messages[i].id;
    }
    return 0;
  }, [messages]);

  useEffect(() => {
    if (!messagesQuery.isSuccess) return;
    if (!initialReadSent.current) {
      initialReadSent.current = true;
      lastMarkedRead.current = latestClientId;
      markRead.mutate(undefined);
      return;
    }
    if (latestClientId > lastMarkedRead.current) {
      lastMarkedRead.current = latestClientId;
      markRead.mutate(latestClientId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mutation object identity changes every render
  }, [latestClientId, messagesQuery.isSuccess]);

  // Keep the view pinned to the newest message unless the agent scrolled up.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (restoreScroll.current !== null) {
      el.scrollTop = el.scrollHeight - restoreScroll.current;
      restoreScroll.current = null;
    } else if (stickToBottom.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const loadOlder = useCallback(async () => {
    if (!olderCursor || loadingOlder) return;
    setLoadingOlder(true);
    try {
      const res: any = await client.supportTickets.messages(ticketId, { cursor: olderCursor, limit: 30 });
      const page: SupportMessagesPage = res?.data ?? res;
      const el = scrollRef.current;
      if (el) restoreScroll.current = el.scrollHeight - el.scrollTop;
      addMessages(page.messages ?? []);
      setOlderCursor(page.next_cursor ?? null);
    } catch {
      // the "load older" button stays available for retry
    } finally {
      setLoadingOlder(false);
    }
  }, [addMessages, loadingOlder, olderCursor, ticketId]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (el.scrollTop < 60) void loadOlder();
  };

  const handleSent = (message: SupportMessage) => {
    stickToBottom.current = true;
    addMessages([message]);
    queryClient.invalidateQueries({ queryKey: supportTicketsKeys.detail(ticketId) });
    queryClient.invalidateQueries({ queryKey: supportTicketsKeys.lists() });
    queryClient.invalidateQueries({ queryKey: supportTicketsKeys.stats() });
  };

  const isOwnMessage = (message: SupportMessage) => {
    if (message.sender_type !== 'support' || message.is_system || !message.sender || !currentUser) return false;
    if (currentUser.id != null && String(message.sender.id) === String(currentUser.id)) return true;
    return !!currentUser.email && message.sender.email === currentUser.email;
  };

  const handleDelete = async (message: SupportMessage) => {
    if (!window.confirm(t('st_delete_confirm'))) return;
    setDeletingId(message.id);
    try {
      const tombstone = await deleteMessage.mutateAsync(message.id);
      addMessages([
        tombstone?.id
          ? tombstone
          : { ...message, is_deleted: true, body: null, media_url: null, deleted_at: new Date().toISOString() },
      ]);
    } catch {
      // toast handled in hook
    } finally {
      setDeletingId(null);
    }
  };

  const errorStatus = ticketQuery.error?.response?.status;
  if (ticketQuery.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }
  if (!ticket) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <Text className="flex items-center gap-2 text-gray-700">
          <PiWarningCircleBold className="h-5 w-5" />
          {errorStatus === 404
            ? t('st_ticket_not_found')
            : errorStatus === 403
              ? t('st_no_permission')
              : t('st_load_error')}
        </Text>
        <div className="mt-4 flex gap-2">
          <Link href={routes.supportTickets.index}>
            <Button variant="outline">{t('st_back_to_inbox')}</Button>
          </Link>
          {errorStatus !== 404 && errorStatus !== 403 && (
            <Button onClick={() => ticketQuery.refetch()}>{t('st_retry')}</Button>
          )}
        </div>
      </div>
    );
  }

  const isOpen = ticket.status === 'open';
  const seenUpTo = ticket.client_last_read_message_id ?? 0;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex h-[calc(100vh-200px)] min-h-[520px] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href={routes.supportTickets.index}
              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
              title={t('st_back_to_inbox')}
            >
              <PiArrowLeftBold className="h-4 w-4 rtl:rotate-180" />
            </Link>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-gray-900">{ticketTitle(t, ticket)}</span>
                <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', STAGE_COLORS[ticket.stage])}>
                  {stageLabel(t, ticket.stage)}
                </span>
                {ticket.close_requested && isOpen && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                    {t('st_close_requested')}
                  </span>
                )}
              </div>
              <div className="truncate text-xs text-gray-500">
                {ticket.client?.name}
                {ticket.client?.mobile && (
                  <span className="ms-2" dir="ltr">
                    {ticket.client.mobile}
                  </span>
                )}
              </div>
            </div>
          </div>
          <TicketHeaderActions ticket={ticket} access={access} currentUserId={currentUser?.id} />
        </div>

        <div ref={scrollRef} onScroll={handleScroll} className="min-h-0 flex-1 overflow-y-auto bg-gray-50 p-4">
          {olderCursor && (
            <div className="mb-3 flex justify-center">
              {loadingOlder ? (
                <Spinner className="h-5 w-5" />
              ) : (
                <button type="button" onClick={loadOlder} className="text-xs text-primary hover:underline">
                  {t('st_load_older')}
                </button>
              )}
            </div>
          )}
          {messagesQuery.isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : messages.length === 0 ? (
            <Text className="py-12 text-center text-sm text-gray-500">{t('st_no_messages')}</Text>
          ) : (
            <div className="flex flex-col gap-2">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  seen={message.sender_type === 'support' && message.id <= seenUpTo}
                  canDelete={isOpen && isOwnMessage(message)}
                  deleting={deletingId === message.id}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        {isOpen ? (
          <SupportComposer ticketId={ticketId} onSent={handleSent} />
        ) : (
          <div className="flex items-center justify-center gap-2 border-t border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            <PiLockBold className="h-4 w-4" />
            {t('st_ticket_closed_readonly')}
          </div>
        )}
      </div>

      <TicketSidePanel ticket={ticket} />
    </div>
  );
}
