'use client';

import { Button } from '@/components/ui/button';
import { Title, Text } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { PiPlusBold } from 'react-icons/pi';
import cn from '@/utils/class-names';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { routes } from '@/config/routes';

export function wmItemPath(key: string) {
  const locale = Cookies.get('NEXT_LOCALE') || 'en';
  return `/${locale}${routes.work.item(key)}`;
}

export function WmPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 rounded-xl border border-gray-200/80 bg-white px-5 py-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Title as="h2" className="text-xl font-semibold tracking-tight text-gray-900">
            {title}
          </Title>
          {description ? (
            <Text className="mt-1 max-w-2xl text-sm text-gray-500">
              {description}
            </Text>
          ) : null}
        </div>
        {action ? <div className="flex flex-wrap items-center gap-2">{action}</div> : null}
      </div>
    </div>
  );
}

export function WmOpenModalButton({
  label,
  view,
}: {
  label: string;
  view: React.ReactNode;
}) {
  const { openModal } = useModal();
  return (
    <Button
      onClick={() =>
        openModal({
          view,
          customSize: '720px',
        })
      }
    >
      <PiPlusBold className="me-1.5 h-4 w-4" />
      {label}
    </Button>
  );
}

export function WmBadge({
  children,
  tone = 'default',
}: {
  children: React.ReactNode;
  tone?: 'default' | 'danger' | 'warning' | 'success' | 'info';
}) {
  const tones: Record<string, string> = {
    default: 'bg-gray-100 text-gray-700',
    danger: 'bg-red-50 text-red-700',
    warning: 'bg-amber-50 text-amber-800',
    success: 'bg-green-50 text-green-700',
    info: 'bg-sky-50 text-sky-800',
  };
  return (
    <span
      className={cn(
        'inline-flex rounded-md px-2 py-0.5 text-xs font-medium capitalize',
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}

export function priorityTone(
  priority: string
): 'default' | 'danger' | 'warning' | 'success' | 'info' {
  if (priority === 'critical') return 'danger';
  if (priority === 'high') return 'warning';
  if (priority === 'low') return 'info';
  return 'default';
}

export function statusTone(
  status: string
): 'default' | 'danger' | 'warning' | 'success' | 'info' {
  if (status === 'done' || status === 'completed' || status === 'closed')
    return 'success';
  if (status === 'blocked' || status === 'cancelled') return 'danger';
  if (status === 'reopened' || status === 'ready_to_test') return 'warning';
  if (status === 'in_progress' || status === 'testing') return 'info';
  return 'default';
}

export function WmWorkItemLink({
  itemKey,
  className,
}: {
  itemKey: string;
  className?: string;
}) {
  return (
    <Link
      href={wmItemPath(itemKey)}
      className={cn('font-semibold text-primary hover:underline', className)}
    >
      {itemKey}
    </Link>
  );
}
