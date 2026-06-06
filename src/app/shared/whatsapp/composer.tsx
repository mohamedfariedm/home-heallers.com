'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Text } from '@/components/ui/text';
import { useSendWhatsAppMessage } from '@/framework/whatsapp';
import type { WhatsAppChatMessage } from '@/types/whatsapp';

const MAX_LENGTH = 4096;

interface ComposerProps {
  chatId: number;
  disabled?: boolean;
  onSent?: (message: WhatsAppChatMessage) => void;
}

export default function WhatsAppComposer({
  chatId,
  disabled,
  onSent,
}: ComposerProps) {
  const [text, setText] = useState('');
  const send = useSendWhatsAppMessage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const message = text.trim();
    if (!message || disabled || send.isPending) return;

    try {
      const result = await send.mutateAsync({ chatId, message });
      if (result.data) {
        onSent?.(result.data);
      }
      setText('');
    } catch {
      // toast handled in hook
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-gray-200 bg-white p-3"
    >
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, MAX_LENGTH))}
        placeholder={
          disabled
            ? 'Connect WhatsApp to send messages…'
            : 'Type a reply…'
        }
        disabled={disabled || send.isPending}
        rows={3}
        className="w-full resize-none"
      />
      <div className="mt-2 flex items-center justify-between">
        <Text className="text-xs text-gray-500">
          {text.length}/{MAX_LENGTH}
        </Text>
        <Button
          type="submit"
          disabled={disabled || !text.trim() || send.isPending}
          isLoading={send.isPending}
        >
          Send
        </Button>
      </div>
    </form>
  );
}
