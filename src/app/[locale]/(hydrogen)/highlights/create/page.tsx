'use client';

import React from 'react';
import PageHeader from '@/app/shared/page-header';
import { usePermissions } from '@/context/PermissionsContext';
import { resolveHighlightsPermissions } from '@/app/shared/highlights/permissions';
import HighlightForm from '@/app/shared/highlights/create-edit/highlight-form';
import { routes } from '@/config/routes';
import { useTranslation } from 'react-i18next';

export default function CreateHighlightPage() {
  const { t } = useTranslation('highlights');
  const { permissions } = usePermissions();
  const access = resolveHighlightsPermissions(permissions);

  const pageHeader = {
    title: t('highlights_create_title'),
    breadcrumb: [
      { href: '/', name: t('highlights_breadcrumb_home') },
      { href: routes.highlights.index, name: t('highlights_breadcrumb') },
      { name: t('highlights_breadcrumb_create') },
    ],
  };

  if (!access.create) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-600">
        {t('highlights_no_permission_create')}
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
