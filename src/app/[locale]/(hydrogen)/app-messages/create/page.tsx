'use client';

import React from 'react';
import PageHeader from '@/app/shared/page-header';
import { usePermissions } from '@/context/PermissionsContext';
import { resolveAppMessagesPermissions } from '@/app/shared/app-messages/permissions';
import MessageForm from '@/app/shared/app-messages/message-form';
import { routes } from '@/config/routes';

const pageHeader = {
  title: 'New App Message',
  breadcrumb: [
    { href: '/', name: 'Home' },
    { href: routes.appMessages.index, name: 'App Messages' },
    { name: 'Create' },
  ],
};

export default function CreateAppMessagePage() {
  const { permissions } = usePermissions();
  const access = resolveAppMessagesPermissions(permissions);

  if (!access.create) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-600">
        You don&apos;t have permission to create app messages.
      </div>
    );
  }

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <div className="mt-6">
        <MessageForm />
      </div>
    </>
  );
}
