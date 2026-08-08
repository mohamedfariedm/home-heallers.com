'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Title, Text } from '@/components/ui/text';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useWmNotifications,
} from '@/framework/work-management/work-items';
import { useWmActorId } from '@/framework/work-management/keys';
import { wmItemPath } from './ui';
import { useWmWorkItem } from '@/framework/work-management/work-items';

function NotifRow({
  id,
  title,
  body,
  read,
  workItemId,
  createdAt,
  userId,
}: {
  id: string;
  title: string;
  body: string;
  read: boolean;
  workItemId?: string;
  createdAt: string;
  userId: string;
}) {
  const mark = useMarkNotificationRead();
  const { data: item } = useWmWorkItem(workItemId ?? '');
  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-md border px-3 py-2 text-sm ${
        read ? 'border-gray-100 bg-white' : 'border-primary/20 bg-primary/5'
      }`}
    >
      <div>
        <div className="font-medium text-gray-900">{title}</div>
        <div className="text-gray-600">{body}</div>
        <div className="mt-1 text-xs text-gray-400">
          {new Date(createdAt).toLocaleString()}
          {item ? (
            <>
              {' · '}
              <Link
                href={wmItemPath(item.key)}
                className="text-primary hover:underline"
                onClick={() => mark.mutate({ id, userId })}
              >
                {item.key}
              </Link>
            </>
          ) : null}
        </div>
      </div>
      {!read ? (
        <Button
          size="sm"
          variant="text"
          onClick={() => mark.mutate({ id, userId })}
        >
          Mark read
        </Button>
      ) : null}
    </div>
  );
}

export default function WmNotificationsPanel() {
  const userId = useWmActorId();
  const { data: notifications = [] } = useWmNotifications(userId);
  const markAll = useMarkAllNotificationsRead();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <Title as="h4" className="text-sm font-semibold">
            Work notifications
          </Title>
          <Text className="text-xs text-gray-500">
            {unread} unread · assignments, mentions, status, comments, reopens
          </Text>
        </div>
        {unread ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => markAll.mutate(userId)}
          >
            Mark all read
          </Button>
        ) : null}
      </div>
      <div className="max-h-56 space-y-2 overflow-y-auto">
        {notifications.length === 0 ? (
          <Text className="text-sm text-gray-500">No notifications yet.</Text>
        ) : (
          notifications.slice(0, 20).map((n) => (
            <NotifRow key={n.id} {...n} userId={userId} />
          ))
        )}
      </div>
    </div>
  );
}
