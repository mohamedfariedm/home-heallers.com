'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import PageHeader from '@/app/shared/page-header';
import { usePermissions } from '@/context/PermissionsContext';
import { resolveGeoRegionsPermissions } from '@/app/shared/geo-regions/permissions';
import RegionForm from '@/app/shared/geo-regions/region-form';
import { routes } from '@/config/routes';

export default function CreateGeoRegionPage() {
  const { t } = useTranslation();
  const pageHeader = {
    title: t('geo_new_title', 'New Geo Region'),
    breadcrumb: [
      { href: '/', name: t('geo_home', 'Home') },
      { href: routes.geoRegions.index, name: t('Geo Regions', 'Geo Regions') },
      { name: t('geo_create', 'Create') },
    ],
  };
  const { permissions } = usePermissions();
  const access = resolveGeoRegionsPermissions(permissions);

  if (!access.create) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-600">
        {t(
          'geo_no_permission_create',
          "You don't have permission to create geo regions."
        )}
      </div>
    );
  }

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <div className="mt-6">
        <RegionForm />
      </div>
    </>
  );
}
