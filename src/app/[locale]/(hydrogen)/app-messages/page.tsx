'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  PiChatCenteredDotsDuotone,
  PiMagnifyingGlassBold,
  PiPencilBold,
  PiPlusBold,
  PiTrashBold,
} from 'react-icons/pi';
import PageHeader from '@/app/shared/page-header';
import DeletePopover from '@/app/shared/delete-popover';
import Spinner from '@/components/ui/spinner';
import Pagination from '@/components/ui/pagination';
import { ActionIcon } from '@/components/ui/action-icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { usePermissions } from '@/context/PermissionsContext';
import { resolveAppMessagesPermissions } from '@/app/shared/app-messages/permissions';
import {
  useAppMessages,
  useDeleteAppMessage,
  useToggleAppMessageActive,
} from '@/framework/app-messages';
import { AppMessageLang, AppMessageStatusFilter } from '@/types/app-messages';
import { routes } from '@/config/routes';

const pageHeader = {
  title: 'App Messages',
  breadcrumb: [{ href: '/', name: 'Home' }, { name: 'App Messages' }],
};

const FILTERS: { value: AppMessageStatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const PAGE_SIZE = 15;

export default function AppMessagesPage() {
  const params = useParams();
  const lang: AppMessageLang = params?.locale === 'ar' ? 'ar' : 'en';
  const otherLang: AppMessageLang = lang === 'ar' ? 'en' : 'ar';
  const { permissions } = usePermissions();
  const access = resolveAppMessagesPermissions(permissions);

  const [status, setStatus] = useState<AppMessageStatusFilter>('all');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading, isFetching, error, refetch } = useAppMessages({
    status,
    search,
    page,
    limit: PAGE_SIZE,
  });
  const toggleActive = useToggleAppMessageActive();
  const deleteMessage = useDeleteAppMessage();
  const httpStatus = (error as any)?.response?.status;

  const messages = data?.data ?? [];
  const total = data?.total ?? 0;
  const isFiltered = status !== 'all' || search.trim() !== '';

  if (!access.view || httpStatus === 403) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-600">
        You don&apos;t have permission to view app messages.
      </div>
    );
  }

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        {access.create && (
          <div className="mt-4 @lg:mt-0">
            <Link href={routes.appMessages.create}>
              <Button className="flex items-center gap-2">
                <PiPlusBold className="h-4 w-4" />
                <span>New Message</span>
              </Button>
            </Link>
          </div>
        )}
      </PageHeader>

      <div className="mt-6 max-w-5xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => {
                  setStatus(f.value);
                  setPage(1);
                }}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  status === f.value
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <Input
            className="w-full sm:w-72"
            placeholder="Search title or description…"
            prefix={<PiMagnifyingGlassBold className="h-4 w-4 text-gray-400" />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onClear={() => setSearchInput('')}
            clearable
          />
        </div>

        {error && httpStatus !== 403 ? (
          <div className="rounded-md border border-gray-200 bg-white p-6">
            <Text className="text-gray-700">Could not load app messages.</Text>
            <Button className="mt-4" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white py-14 text-center">
            <PiChatCenteredDotsDuotone className="mb-2 h-10 w-10 text-gray-400" />
            <Text className="font-medium text-gray-700">
              {isFiltered ? 'No messages match these filters' : 'No messages yet'}
            </Text>
            {!isFiltered && (
              <Text className="mt-1 text-xs text-gray-500">
                The doctor app hides the message card until there is an active message.
              </Text>
            )}
          </div>
        ) : (
          <div className={`space-y-3 ${isFetching ? 'opacity-70' : ''}`}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:gap-4 ${
                  message.is_active ? '' : 'opacity-60'
                }`}
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="truncate font-semibold text-gray-900" dir="auto">
                    {message.title?.[lang]}
                  </p>
                  <p className="truncate text-xs text-gray-400" dir="auto">
                    {message.title?.[otherLang]}
                  </p>
                  <p className="line-clamp-2 text-sm text-gray-600" dir="auto">
                    {message.description?.[lang]}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                  <Badge
                    variant="flat"
                    color={message.is_active ? 'success' : 'secondary'}
                    className="hidden sm:inline-flex"
                  >
                    {message.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  {access.update && (
                    <Switch
                      size="sm"
                      checked={message.is_active}
                      disabled={toggleActive.isPending}
                      onChange={() => toggleActive.mutate(message.id)}
                    />
                  )}
                  {access.update && (
                    <Link href={routes.appMessages.edit(message.id)}>
                      <ActionIcon size="sm" variant="outline" aria-label="Edit">
                        <PiPencilBold className="h-4 w-4" />
                      </ActionIcon>
                    </Link>
                  )}
                  {access.delete && (
                    <DeletePopover
                      title="Delete message"
                      description="Are you sure you want to delete this message?"
                      onDelete={() => deleteMessage.mutate(message.id)}
                    >
                      <ActionIcon
                        size="sm"
                        variant="outline"
                        aria-label="Delete"
                        className="hover:text-red-600"
                      >
                        <PiTrashBold className="h-4 w-4" />
                      </ActionIcon>
                    </DeletePopover>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {total > PAGE_SIZE && (
          <div className="flex justify-end">
            <Pagination
              current={page}
              total={total}
              pageSize={PAGE_SIZE}
              onChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>
    </>
  );
}
