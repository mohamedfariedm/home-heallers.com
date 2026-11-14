'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import CampaignForm from '@/app/shared/campaigns/campaign-form';
import { resolveCampaignsPermissions } from '@/app/shared/campaigns/permissions';
import PageHeader from '@/app/shared/page-header';
import Spinner from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { routes } from '@/config/routes';
import { usePermissions } from '@/context/PermissionsContext';
import { useCampaign } from '@/framework/campaigns';

export default function EditCampaignPage() {
  const params = useParams();
  const { t } = useTranslation('campaigns');
  const id = params?.id as string;
  const { permissions } = usePermissions();
  const access = resolveCampaignsPermissions(permissions);
  const { data: campaign, isLoading, error } = useCampaign(id);
  const httpStatus = (error as any)?.response?.status;

  if (!access.update || httpStatus === 403) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-600">
        {t('campaigns_no_permission_edit')}
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

  if (error || !campaign) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6">
        <Text className="text-gray-700">{t('campaigns_not_found')}</Text>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={t('campaigns_edit_title')}
        breadcrumb={[
          { href: '/', name: t('campaigns_home') },
          { href: routes.campaigns.index, name: t('campaigns_page_title') },
          { name: t('campaigns_edit') },
        ]}
      />
      <div className="mt-6">
        <CampaignForm key={campaign.updated_at ?? campaign.id} initialValues={campaign} />
      </div>
    </>
  );
}
