'use client';

import React from 'react';
import AdminPageShell from '@/components/ui/admin-page-shell';
import { usePermissions } from '@/context/PermissionsContext';
import { resolveHighlightsPermissions } from '@/app/shared/highlights/permissions';
import HighlightForm from '@/app/shared/highlights/create-edit/highlight-form';
import { routes } from '@/config/routes';
import { useTranslation } from 'react-i18next';
import { PiCirclesThreePlusFill } from 'react-icons/pi';

export default function CreateHighlightPage() {
  const { t } = useTranslation('highlights');
  const { permissions } = usePermissions();
  const access = resolveHighlightsPermissions(permissions);

  if (!access.create) {
    return (
      <AdminPageShell
        title={t('highlights_create_title')}
        icon={<PiCirclesThreePlusFill />}
      >
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
          {t('highlights_no_permission_create')}
        </div>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title={t('highlights_create_title')}
      description={t(
        'highlights_create_description',
        'Add a new story highlight for the mobile app'
      )}
      icon={<PiCirclesThreePlusFill />}
      breadcrumb={[
        { href: '/', name: t('highlights_breadcrumb_home') },
        { href: routes.highlights.index, name: t('highlights_breadcrumb') },
        { name: t('highlights_breadcrumb_create') },
      ]}
    >
      <div className="max-w-4xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <HighlightForm />
      </div>
    </AdminPageShell>
  );
}
