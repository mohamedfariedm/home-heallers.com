'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import CampaignForm from '@/app/shared/campaigns/campaign-form';
import { resolveCampaignsPermissions } from '@/app/shared/campaigns/permissions';
import PageHeader from '@/app/shared/page-header';
import { routes } from '@/config/routes';
import { usePermissions } from '@/context/PermissionsContext';

export default function CreateCampaignPage() {
  const { t } = useTranslation('campaigns');
  const { permissions } = usePermissions();
  const access = resolveCampaignsPermissions(permissions);

  if (!access.create) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-600">
        {t('campaigns_no_permission_create')}
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={t('campaigns_create_title')}
        breadcrumb={[
          { href: '/', name: t('campaigns_home') },
          { href: routes.campaigns.index, name: t('campaigns_page_title') },
          { name: t('campaigns_create') },
        ]}
      />
      <div className="mt-6">
        <CampaignForm />
      </div>
    </>
  );
}
