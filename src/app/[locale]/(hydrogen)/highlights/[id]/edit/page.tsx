'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import PageHeader from '@/app/shared/page-header';
import Spinner from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { usePermissions } from '@/context/PermissionsContext';
import { resolveHighlightsPermissions } from '@/app/shared/highlights/permissions';
import { useHighlightDetail } from '@/framework/highlights';
import HighlightForm from '@/app/shared/highlights/create-edit/highlight-form';
import ElementsManager from '@/app/shared/highlights/elements/elements-manager';
import { routes } from '@/config/routes';

export default function EditHighlightPage() {
  const params = useParams();
  const id = params?.id as string;

  const { permissions } = usePermissions();
  const access = resolveHighlightsPermissions(permissions);

  const { data: highlight, isLoading, error } = useHighlightDetail(id);

  const pageHeader = {
    title: highlight?.title?.en ? `Edit: ${highlight.title.en}` : 'Edit Highlight',
    breadcrumb: [
      { href: '/', name: 'Home' },
      { href: routes.highlights.index, name: 'Highlights' },
      { name: 'Edit' },
    ],
  };

  if (!access.update) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-600">
        You don&apos;t have permission to edit highlights.
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

  if (error || !highlight) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6">
        <Text className="text-gray-700">Highlight not found or failed to load.</Text>
      </div>
    );
  }

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <HighlightForm initialValues={highlight} />
        </div>

        <div className="lg:col-span-7">
          <ElementsManager
            highlightId={Number(highlight.id)}
            elements={highlight.elements || []}
          />
        </div>
      </div>
    </>
  );
}
