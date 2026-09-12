'use client';

import React from 'react';
import PageHeader from '@/app/shared/page-header';
import { usePermissions } from '@/context/PermissionsContext';
import { resolveHighlightsPermissions } from '@/app/shared/highlights/permissions';
import HighlightForm from '@/app/shared/highlights/create-edit/highlight-form';
import { routes } from '@/config/routes';

const pageHeader = {
  title: 'Create Highlight',
  breadcrumb: [
    { href: '/', name: 'Home' },
    { href: routes.highlights.index, name: 'Highlights' },
    { name: 'Create' },
  ],
};

export default function CreateHighlightPage() {
  const { permissions } = usePermissions();
  const access = resolveHighlightsPermissions(permissions);

  if (!access.create) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-600">
        You don&apos;t have permission to create highlights.
      </div>
    );
  }

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <div className="mt-6 max-w-4xl">
        <HighlightForm />
      </div>
    </>
  );
}
