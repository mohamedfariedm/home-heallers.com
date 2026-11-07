'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import AdminPageShell from '@/components/ui/admin-page-shell';
import Spinner from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { usePermissions } from '@/context/PermissionsContext';
import { resolveHighlightsPermissions } from '@/app/shared/highlights/permissions';
import { useHighlightDetail } from '@/framework/highlights';
import HighlightForm from '@/app/shared/highlights/create-edit/highlight-form';
import ElementsManager from '@/app/shared/highlights/elements/elements-manager';
import { routes } from '@/config/routes';
import { useTranslation } from 'react-i18next';
import { PiCirclesThreePlusFill } from 'react-icons/pi';

export default function EditHighlightPage() {
  const { t } = useTranslation('highlights');
  const params = useParams();
  const id = params?.id as string;

  const { permissions } = usePermissions();
  const access = resolveHighlightsPermissions(permissions);

  const { data: highlight, isLoading, error } = useHighlightDetail(id);

  const title = highlight?.title?.en
    ? t('highlights_edit_title_named', { name: highlight.title.en })
    : t('highlights_edit_title');

  const shellProps = {
    title,
    description: t(
      'highlights_edit_description',
      'Update highlight details and story elements'
    ),
    icon: <PiCirclesThreePlusFill />,
    breadcrumb: [
      { href: '/', name: t('highlights_breadcrumb_home') },
      { href: routes.highlights.index, name: t('highlights_breadcrumb') },
      { name: t('highlights_breadcrumb_edit') },
    ],
  };

  if (!access.update) {
    return (
      <AdminPageShell {...shellProps}>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
          {t('highlights_no_permission_edit')}
        </div>
      </AdminPageShell>
    );
  }

  if (isLoading) {
    return (
      <AdminPageShell {...shellProps}>
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      </AdminPageShell>
    );
  }

  if (error || !highlight) {
    return (
      <AdminPageShell {...shellProps}>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <Text className="text-gray-700">{t('highlights_not_found')}</Text>
        </div>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell {...shellProps}>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-5">
          <HighlightForm initialValues={highlight} />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-7">
          <ElementsManager
            highlightId={Number(highlight.id)}
            elements={highlight.elements || []}
          />
        </div>
      </div>
    </AdminPageShell>
  );
}
