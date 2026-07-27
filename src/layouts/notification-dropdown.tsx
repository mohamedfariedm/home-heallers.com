'use client';

import { RefObject, useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Popover } from '@/components/ui/popover';
import { Title, Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionIcon } from '@/components/ui/action-icon';
import RingBellSolidIcon from '@/components/icons/ring-bell-solid';
import Link from 'next/link';
import { useMedia } from '@/hooks/use-media';
import SimpleBar from '@/components/ui/simplebar';
import { PiCheck } from 'react-icons/pi';
import {
  useDashboardNotifications,
  useDashboardUnreadCount,
  useMarkAllDashboardNotificationsRead,
  useMarkDashboardNotificationRead,
} from '@/framework/dashboard-notifications';
import { getDashboardNotificationHref } from '@/lib/firebase/notification-routing';
import type { DashboardNotification } from '@/types/dashboard-notifications';
import cn from '@/utils/class-names';

dayjs.extend(relativeTime);

function NotificationsList({
  setIsOpen,
}: {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { data, isLoading, isError } = useDashboardNotifications('per_page=20');
  const markOne = useMarkDashboardNotificationRead();
  const markAll = useMarkAllDashboardNotificationsRead();

  const notifications = data?.data?.notifications ?? [];

  const handleClick = (item: DashboardNotification) => {
    if (!item.read_at) {
      markOne.mutate(item.id);
    }
    setIsOpen(false);
  };

  return (
    <div className="w-[320px] text-left rtl:text-right sm:w-[360px] 2xl:w-[420px]">
      <div className="mb-3 flex items-center justify-between ps-6 pe-2">
        <Title as="h5">Notifications</Title>
        <Checkbox
          label="Mark All As Read"
          checked={false}
          onChange={() => markAll.mutate()}
          disabled={markAll.isPending || !notifications.some((n) => !n.read_at)}
        />
      </div>
      <SimpleBar className="max-h-[420px]">
        {isLoading ? (
          <Text className="px-6 py-8 text-center text-sm text-gray-500">
            Loading…
          </Text>
        ) : isError ? (
          <Text className="px-6 py-8 text-center text-sm text-gray-500">
            Could not load notifications.
          </Text>
        ) : notifications.length === 0 ? (
          <Text className="px-6 py-8 text-center text-sm text-gray-500">
            No notifications yet.
          </Text>
        ) : (
          <div className="grid cursor-pointer grid-cols-1 gap-1 ps-4">
            {notifications.map((item) => {
              const href = getDashboardNotificationHref(item.action);
              const unread = !item.read_at;
              const content = (
                <div
                  className={cn(
                    'group grid grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-md px-2 py-2 pe-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-50',
                    unread && 'bg-gray-50/80 dark:bg-gray-50/30'
                  )}
                >
                  <div className="w-full min-w-0">
                    <Title
                      as="h6"
                      className="mb-0.5 truncate text-sm font-semibold"
                    >
                      {item.title}
                    </Title>
                    {item.body ? (
                      <Text className="mb-1 line-clamp-2 text-xs text-gray-600">
                        {item.body}
                      </Text>
                    ) : null}
                    <span className="whitespace-nowrap text-xs text-gray-500">
                      {dayjs(item.created_at).fromNow()}
                    </span>
                  </div>
                  <div className="ms-auto flex-shrink-0 self-center">
                    {unread ? (
                      <Badge
                        renderAsDot
                        size="lg"
                        color="primary"
                        className="scale-90"
                      />
                    ) : (
                      <span className="inline-block rounded-full bg-gray-100 p-0.5 dark:bg-gray-50">
                        <PiCheck className="h-auto w-[9px]" />
                      </span>
                    )}
                  </div>
                </div>
              );

              if (href) {
                return (
                  <Link
                    key={item.id}
                    href={href}
                    onClick={() => handleClick(item)}
                    className="block"
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  className="block w-full text-start"
                  onClick={() => handleClick(item)}
                >
                  {content}
                </button>
              );
            })}
          </div>
        )}
      </SimpleBar>
    </div>
  );
}

export default function NotificationDropdown({
  children,
}: {
  children: JSX.Element & { ref?: RefObject<any> };
}) {
  const isMobile = useMedia('(max-width: 480px)', false);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      content={() => <NotificationsList setIsOpen={setIsOpen} />}
      shadow="sm"
      placement={isMobile ? 'bottom' : 'bottom-end'}
      className="z-50 px-0 pb-4 pe-6 pt-5 dark:bg-gray-100 [&>svg]:hidden [&>svg]:dark:fill-gray-100 sm:[&>svg]:inline-flex"
    >
      {children}
    </Popover>
  );
}

/** Bell + live unread badge for dashboard headers. */
export function NotificationBellButton({
  className,
  icon,
  badgeClassName,
}: {
  className?: string;
  icon?: React.ReactNode;
  badgeClassName?: string;
}) {
  const { data } = useDashboardUnreadCount(true);
  const unreadCount = data?.data?.unread_count ?? 0;

  return (
    <NotificationDropdown>
      <ActionIcon
        aria-label="Notification"
        variant="text"
        className={cn(
          'relative h-[34px] w-[34px] shadow backdrop-blur-md dark:bg-gray-100 md:h-9 md:w-9',
          className
        )}
      >
        {icon ?? <RingBellSolidIcon className="h-[18px] w-auto" />}
        {unreadCount > 0 ? (
          <Badge
            renderAsDot
            color="warning"
            enableOutlineRing
            className={cn(
              'absolute right-2.5 top-2.5 -translate-y-1/3 translate-x-1/2',
              badgeClassName
            )}
          />
        ) : null}
      </ActionIcon>
    </NotificationDropdown>
  );
}
