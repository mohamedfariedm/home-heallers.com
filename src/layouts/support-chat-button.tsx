'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Cookies from 'js-cookie';
import { PiChatsCircleFill } from 'react-icons/pi';
import { ActionIcon } from '@/components/ui/action-icon';
import { usePermissions } from '@/context/PermissionsContext';
import { useIsMounted } from '@/hooks/use-is-mounted';
import { resolveSupportTicketsPermissions } from '@/app/shared/support-tickets/permissions';
import {
  supportTicketsKeys,
  useSupportChannel,
  useSupportTicketsUnreadCount,
} from '@/framework/support-tickets';
import { SUPPORT_INBOX_CHANNEL } from '@/lib/support-tickets/realtime';
import {
  ClientMessageAlertTracker,
  ticketFromInboxEvent,
} from '@/lib/support-tickets/client-message-alert';
import { installSupportAlertUnlock, playSupportAlert } from '@/lib/support-tickets/alert-sound';
import cn from '@/utils/class-names';

const tracker = new ClientMessageAlertTracker();

/**
 * Header shortcut to support chats, with the number of chats that still
 * have an unread customer message. A chime plays on each new customer
 * message, including while the agent is on another dashboard page.
 */
export default function SupportChatButton({
  className,
  iconClassName,
}: {
  className?: string;
  iconClassName?: string;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const mounted = useIsMounted();
  const { permissions } = usePermissions();
  const canView = resolveSupportTicketsPermissions(permissions).view;
  const enabled = mounted && canView;

  const [ringing, setRinging] = useState(false);
  const ringUntil = useRef(0);
  const lastSoundAt = useRef(0);
  const unreadBaseline = useRef<number | null>(null);

  const { connected } = useSupportChannel(
    enabled ? SUPPORT_INBOX_CHANNEL : null,
    (event, payload) => {
      if (event !== 'support.inbox.updated') return;
      queryClient.invalidateQueries({ queryKey: supportTicketsKeys.unread() });
      queryClient.invalidateQueries({ queryKey: supportTicketsKeys.stats() });
      queryClient.invalidateQueries({ queryKey: supportTicketsKeys.lists() });

      const ticket = ticketFromInboxEvent(payload);
      if (!ticket || !tracker.consume(ticket)) return;
      lastSoundAt.current = Date.now();
      ringUntil.current = Date.now() + 2400;
      setRinging(true);
      window.setTimeout(() => {
        if (Date.now() >= ringUntil.current) setRinging(false);
      }, 2400);
      playSupportAlert(1);
    },
    enabled
  );

  const { data } = useSupportTicketsUnreadCount(enabled, {
    refetchInterval: connected ? 60_000 : 12_000,
  });

  const unreadChats = data?.unread_tickets ?? 0;
  const unreadMessages = data?.unread_messages;

  useEffect(() => {
    if (!enabled) return;
    installSupportAlertUnlock();
  }, [enabled]);

  // While the socket is down, a rise in unread messages is a customer message.
  useEffect(() => {
    if (!enabled || unreadMessages == null) return;
    const previous = unreadBaseline.current;
    unreadBaseline.current = unreadMessages;
    if (previous == null || connected) return;
    const delta = unreadMessages - previous;
    if (delta <= 0) return;
    if (Date.now() - lastSoundAt.current < 3000) return;
    lastSoundAt.current = Date.now();
    ringUntil.current = Date.now() + 2400;
    setRinging(true);
    window.setTimeout(() => {
      if (Date.now() >= ringUntil.current) setRinging(false);
    }, 2400);
    playSupportAlert(delta);
  }, [connected, enabled, unreadMessages]);

  if (!enabled) return null;

  const pathLocale = pathname.split('/')[1];
  const locale = pathLocale === 'ar' || pathLocale === 'en' ? pathLocale : Cookies.get('NEXT_LOCALE') || 'en';
  const href =
    unreadChats > 0
      ? `/${locale}/support-tickets?unread=1`
      : `/${locale}/support-tickets`;
  const label =
    unreadChats > 0
      ? t('st_header_chats_unread', { count: unreadChats })
      : t('st_header_chats');
  const badge = unreadChats > 99 ? '99+' : String(unreadChats);

  return (
    <span className="relative inline-flex shrink-0">
      <ActionIcon
        aria-label={label}
        title={label}
        variant="text"
        className={cn(
          'relative h-[34px] w-[34px] shadow backdrop-blur-md dark:bg-gray-100 md:h-9 md:w-9',
          ringing && 'ring-2 ring-red-500',
          className
        )}
        onClick={() => router.push(href)}
      >
        <PiChatsCircleFill className={cn('h-[18px] w-auto', iconClassName)} />
      </ActionIcon>
      {unreadChats > 0 ? (
        <span
          className={cn(
            'pointer-events-none absolute -top-1 end-0 z-10 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white shadow-sm',
            ringing && 'animate-pulse'
          )}
        >
          {badge}
        </span>
      ) : null}
    </span>
  );
}
