'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import PageHeader from '@/app/shared/page-header';
import Spinner from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { usePermissions } from '@/context/PermissionsContext';
import { resolveAppMessagesPermissions } from '@/app/shared/app-messages/permissions';
import MessageForm from '@/app/shared/app-messages/message-form';
import { useAppMessage } from '@/framework/app-messages';
import { routes } from '@/config/routes';

const pageHeader = {
  title: 'Edit App Message',
  breadcrumb: [
    { href: '/', name: 'Home' },
    { href: routes.appMessages.index, name: 'App Messages' },
    { name: 'Edit' },
  ],
};

export default function EditAppMessagePage() {
  const params = useParams();
  const id = params?.id as string;

  const { permissions } = usePermissions();
  const access = resolveAppMessagesPermissions(permissions);

  const { data: message, isLoading, error } = useAppMessage(id);

  if (!access.update) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-600">
        You don&apos;t have permission to edit app messages.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !message) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6">
        <Text className="text-gray-700">Message not found.</Text>
      </div>
    );
  }

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <div className="mt-6">
        {/* key forces a fresh form state if the message is refetched after save */}
        <MessageForm key={message.updated_at} initialValues={message} />
      </div>
    </>
  );
}
