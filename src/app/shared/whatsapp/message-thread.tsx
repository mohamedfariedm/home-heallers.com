'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Text } from '@/components/ui/text';
import Spinner from '@/components/ui/spinner';
import cn from '@/utils/class-names';
import client from '@/framework/utils';
import { useWhatsAppMessages } from '@/framework/whatsapp';
import type { WhatsAppChat, WhatsAppChatMessage } from '@/types/whatsapp';
import {
  formatChatTitle,
  formatMessageTime,
  statusTickLabel,
} from './utils';
import WhatsAppComposer from './composer';

interface MessageThreadProps {
  chat: WhatsAppChat;
  sessionConnected: boolean;
}

export default function WhatsAppMessageThread({
  chat,
  sessionConnected,
}: MessageThreadProps) {
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastScrolledIdRef = useRef<number | null>(null);
  const [messages, setMessages] = useState<WhatsAppChatMessage[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);

  const { data, isLoading, isFetching } = useWhatsAppMessages(chat.id, {
    poll: true,
  });

  useEffect(() => {
    setMessages([]);
    setHasMore(true);
    lastScrolledIdRef.current = null;
  }, [chat.id]);

  useEffect(() => {
    if (!data?.data) return;
    const chronological = [...data.data].reverse();
    setMessages((prev) => {
      if (prev.length === 0) return chronological;
      const pageIds = new Set(chronological.map((m) => m.id));
      const olderPrefix = prev.filter((m) => !pageIds.has(m.id));
      if (olderPrefix.length > 0) {
        const merged = [...olderPrefix, ...chronological];
        merged.sort(
          (a, b) =>
            new Date(a.message_at).getTime() - new Date(b.message_at).getTime()
        );
        const sameLength = merged.length === prev.length;
        const sameIds =
          sameLength && merged.every((m, i) => m.id === prev[i]?.id);
        return sameIds ? prev : merged;
      }
      const sameLength = chronological.length === prev.length;
      const sameIds =
        sameLength && chronological.every((m, i) => m.id === prev[i]?.id);
      return sameIds ? prev : chronological;
    });
    setHasMore(
      data.data.length >= 50 ||
        (data.current_page ?? 1) < (data.last_page ?? 1)
    );
  }, [data, chat.id]);

  // Refresh chat list once when thread opens (server clears unread_count)
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['whatsapp', 'chats'] });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when chat changes
  }, [chat.id]);

  useEffect(() => {
    if (loadingOlder || !messages.length || !scrollRef.current) return;
    const lastId = messages[messages.length - 1]?.id;
    if (lastId == null || lastScrolledIdRef.current === lastId) return;
    lastScrolledIdRef.current = lastId;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loadingOlder]);

  const loadOlder = useCallback(async () => {
    const oldest = messages[0];
    if (!oldest || loadingOlder || !hasMore) return;
    setLoadingOlder(true);
    try {
      const res = await client.whatsapp.messages(chat.id, {
        per_page: 50,
        before: oldest.message_at,
      });
      const batch = [...(res.data ?? [])].reverse();
      if (batch.length === 0) {
        setHasMore(false);
      } else {
        setMessages((prev) => {
          const ids = new Set(prev.map((m) => m.id));
          const unique = batch.filter((m) => !ids.has(m.id));
          return [...unique, ...prev];
        });
        if (batch.length < 50) setHasMore(false);
      }
    } finally {
      setLoadingOlder(false);
    }
  }, [chat.id, messages, loadingOlder, hasMore]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || el.scrollTop > 80) return;
    loadOlder();
  };

  const appendOptimistic = (msg: WhatsAppChatMessage) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
        <Text className="font-semibold text-gray-900">
          {formatChatTitle(chat)}
        </Text>
        {chat.phone && (
          <Text className="text-sm text-gray-600">+{chat.phone}</Text>
        )}
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-y-auto bg-[#e5ddd5] p-4"
      >
        {hasMore && (
          <div className="mb-3 flex justify-center">
            {loadingOlder ? (
              <Spinner className="h-5 w-5" />
            ) : (
              <button
                type="button"
                onClick={loadOlder}
                className="text-xs text-primary hover:underline"
              >
                Load older messages
              </button>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : messages.length === 0 ? (
          <Text className="text-center text-sm text-gray-600">
            No messages in this thread yet.
          </Text>
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex',
                  msg.from_me ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-lg px-3 py-2 shadow-sm',
                    msg.from_me
                      ? 'bg-[#dcf8c6] text-gray-900'
                      : 'bg-white text-gray-900'
                  )}
                >
                  {!msg.from_me && chat.is_group && msg.sender_name && (
                    <Text className="mb-0.5 text-xs font-medium text-primary">
                      {msg.sender_name}
                    </Text>
                  )}
                  {msg.has_media && !msg.media_url ? (
                    <Text className="text-sm italic text-gray-600">
                      Media attachment
                    </Text>
                  ) : null}
                  <Text className="whitespace-pre-wrap break-words text-sm">
                    {msg.body || ''}
                  </Text>
                  <div
                    className={cn(
                      'mt-1 flex items-center gap-1 text-[11px] text-gray-500',
                      msg.from_me && 'justify-end'
                    )}
                  >
                    <span>{formatMessageTime(msg.message_at)}</span>
                    {msg.from_me && (
                      <span
                        className={cn(
                          msg.status === 'read' && 'text-blue-600',
                          msg.status === 'failed' && 'text-red-600'
                        )}
                        title={msg.status}
                      >
                        {statusTickLabel(msg.status)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {isFetching && !isLoading && (
          <Text className="mt-2 text-center text-xs text-gray-500">
            Syncing…
          </Text>
        )}
      </div>

      <WhatsAppComposer
        chatId={chat.id}
        disabled={!sessionConnected}
        onSent={appendOptimistic}
      />
    </div>
  );
}
