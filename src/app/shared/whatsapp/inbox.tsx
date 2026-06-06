'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Text } from '@/components/ui/text';
import { PiChatCircleDotsDuotone } from 'react-icons/pi';
import WhatsAppSessionBanner from './session-banner';
import WhatsAppChatList from './chat-list';
import WhatsAppMessageThread from './message-thread';
import { useWhatsAppSessionStatus } from '@/framework/whatsapp';
import type { WhatsAppChat } from '@/types/whatsapp';
import { isSessionReady } from './utils';
function stubChat(id: number): WhatsAppChat {
  return {
    id,
    provider_chat_id: '',
    name: null,
    phone: null,
    is_group: false,
    unread_count: 0,
    last_message: null,
    last_message_at: null,
  };
}

export default function WhatsAppInbox() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedChat, setSelectedChat] = useState<WhatsAppChat | null>(null);
  const { data: sessionStatus } = useWhatsAppSessionStatus();
  const chatIdParam = searchParams.get('chat');

  const session =
    sessionStatus?.session ?? sessionStatus?.status ?? 'DISCONNECTED';
  const connected = isSessionReady(session);

  const selectChat = useCallback(
    (chat: WhatsAppChat) => {
      setSelectedChat(chat);
      const params = new URLSearchParams(searchParams.toString());
      params.set('chat', String(chat.id));
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  useEffect(() => {
    if (!chatIdParam) {
      setSelectedChat((prev) => (prev === null ? prev : null));
      return;
    }
    const id = Number(chatIdParam);
    if (!Number.isFinite(id)) return;
    setSelectedChat((prev) => (prev?.id === id ? prev : stubChat(id)));
  }, [chatIdParam]);

  const activeChat = selectedChat;

  return (
    <div>
      <WhatsAppSessionBanner />
      <div className="flex h-[calc(100vh-220px)] min-h-[480px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <WhatsAppChatList
          selectedChatId={activeChat?.id ?? null}
          onSelectChat={selectChat}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          {activeChat ? (
            <WhatsAppMessageThread
              chat={activeChat}
              sessionConnected={connected}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-gray-50 p-8 text-center">
              <PiChatCircleDotsDuotone className="h-16 w-16 text-gray-300" />
              <Text className="text-lg font-medium text-gray-700">
                Select a conversation
              </Text>
              <Text className="max-w-sm text-sm text-gray-500">
                Choose a chat from the list to view messages and reply. System
                messages (OTP) are hidden by default.
              </Text>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
