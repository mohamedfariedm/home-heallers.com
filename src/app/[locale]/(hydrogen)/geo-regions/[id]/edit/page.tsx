'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import PageHeader from '@/app/shared/page-header';
import Spinner from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { usePermissions } from '@/context/PermissionsContext';
import { resolveGeoRegionsPermissions } from '@/app/shared/geo-regions/permissions';
import RegionForm from '@/app/shared/geo-regions/region-form';
import { useGeoRegion } from '@/framework/geo-regions';
import { routes } from '@/config/routes';

export default function EditGeoRegionPage() {
  const params = useParams();
  const { t } = useTranslation();
  const id = params?.id as string;
  const pageHeader = {
    title: t('geo_edit_title', 'Edit Geo Region'),
    breadcrumb: [
      { href: '/', name: t('geo_home', 'Home') },
      { href: routes.geoRegions.index, name: t('Geo Regions', 'Geo Regions') },
      { name: t('geo_edit', 'Edit') },
    ],
  };

  const { permissions } = usePermissions();
  const access = resolveGeoRegionsPermissions(permissions);
  const { data: region, isLoading, error } = useGeoRegion(id);

  if (!access.update) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-600">
        {t(
          'geo_no_permission_edit',
          "You don't have permission to edit geo regions."
        )}
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

  if (error || !region) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6">
        <Text className="text-gray-700">
          {t('geo_not_found', 'Geo region not found.')}
        </Text>
      </div>
    );
  }

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <div className="mt-6">
        {/* key forces a fresh form state if the region is refetched after save */}
        <RegionForm key={region.updated_at} initialValues={region} />
      </div>
    </>
  );
}
