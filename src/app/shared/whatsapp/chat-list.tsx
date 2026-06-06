'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import Spinner from '@/components/ui/spinner';
import cn from '@/utils/class-names';
import { useWhatsAppChats } from '@/framework/whatsapp';
import type { WhatsAppChat } from '@/types/whatsapp';
import {
  formatChatTitle,
  formatMessageTime,
  truncatePreview,
} from './utils';
interface ChatListProps {
  selectedChatId: number | null;
  onSelectChat: (chat: WhatsAppChat) => void;
}

export default function WhatsAppChatList({
  selectedChatId,
  onSelectChat,
}: ChatListProps) {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useWhatsAppChats({
    search: debouncedSearch || undefined,
    page,
    per_page: 25,
  });

  const chats = data?.data ?? [];

  return (
    <div className="flex h-full w-full flex-col border-e border-gray-200 bg-white md:w-[320px] lg:w-[360px]">
      <div className="border-b border-gray-200 p-3">
        <Input
          placeholder="Search name, phone, or message…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full"
        />
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-2 text-xs text-primary hover:underline"
        >
          Refresh list
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isError ? (
          <div className="p-4 text-sm text-red-700">
            <p className="font-medium">Failed to load chats</p>
            <p className="mt-1 break-all">{error?.message}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-2 text-primary hover:underline"
            >
              Retry
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center p-8">
            <Spinner />
          </div>
        ) : chats.length === 0 ? (
          <Text className="p-6 text-center text-sm text-gray-500">
            No conversations yet.
          </Text>
        ) : (
          <ul>
            {chats.map((chat) => {
              const active = chat.id === selectedChatId;
              return (
                <li key={chat.id}>
                  <button
                    type="button"
                    onClick={() => onSelectChat(chat)}
                    className={cn(
                      'flex w-full gap-3 border-b border-gray-100 px-3 py-3 text-start transition-colors hover:bg-gray-50',
                      active && 'bg-primary/5'
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <Text className="truncate font-medium text-gray-900">
                          {formatChatTitle(chat)}
                          {chat.is_group && (
                            <span className="ms-1 text-xs text-gray-500">
                              (group)
                            </span>
                          )}
                        </Text>
                        {chat.last_message_at && (
                          <span className="shrink-0 text-xs text-gray-500">
                            {formatMessageTime(chat.last_message_at)}
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center justify-between gap-2">
                        <Text className="truncate text-sm text-gray-600">
                          {truncatePreview(chat.last_message)}
                        </Text>
                        {chat.unread_count > 0 && (
                          <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-white">
                            {chat.unread_count > 99 ? '99+' : chat.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {isFetching && !isLoading && (
          <Text className="py-2 text-center text-xs text-gray-400">
            Updating…
          </Text>
        )}
      </div>

      {data && data.last_page > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 p-2 text-sm">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-2 text-primary disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-gray-600">
            {page} / {data.last_page}
          </span>
          <button
            type="button"
            disabled={page >= data.last_page}
            onClick={() => setPage((p) => p + 1)}
            className="px-2 text-primary disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
