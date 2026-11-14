'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { PiPencilBold, PiTrashBold } from 'react-icons/pi';
import DeletePopover from '@/app/shared/delete-popover';
import { formatCampaignBudget, formatCampaignDate } from '@/app/shared/campaigns/format';
import { resolveCampaignsPermissions } from '@/app/shared/campaigns/permissions';
import { CampaignStatusBadge } from '@/app/shared/campaigns/status-badge';
import AdminPageShell from '@/components/ui/admin-page-shell';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { routes } from '@/config/routes';
import { usePermissions } from '@/context/PermissionsContext';
import { useCampaign, useDeleteCampaign } from '@/framework/campaigns';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-gray-100 py-3 sm:grid-cols-3">
      <Text className="text-sm font-medium text-gray-500">{label}</Text>
      <div className="text-sm text-gray-900 sm:col-span-2">{children}</div>
    </div>
  );
}

export default function CampaignDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { t, i18n } = useTranslation('campaigns');
  const id = params?.id as string;
  const { permissions } = usePermissions();
  const access = resolveCampaignsPermissions(permissions);
  const { data: campaign, isLoading, error } = useCampaign(access.view ? id : undefined);
  const deleteCampaign = useDeleteCampaign();
  const httpStatus = (error as any)?.response?.status;

  if (!access.view || httpStatus === 403) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-600">
        {t('campaigns_no_permission_view')}
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
    <AdminPageShell
      title={campaign.name}
      description={t('campaigns_details')}
      breadcrumb={[
        { href: '/', name: t('campaigns_home') },
        { href: routes.campaigns.index, name: t('campaigns_page_title') },
        { name: campaign.name },
      ]}
      status={<CampaignStatusBadge status={campaign.status} />}
      actions={
        <div className="flex items-center gap-2">
          {access.update && (
            <Link href={routes.campaigns.edit(campaign.id)}>
              <Button variant="outline" className="flex items-center gap-2">
                <PiPencilBold className="h-4 w-4" />
                {t('campaigns_edit')}
              </Button>
            </Link>
          )}
          {access.delete && (
            <DeletePopover
              title={t('campaigns_delete_title')}
              description={t('campaigns_delete_confirm')}
              onDelete={() =>
                deleteCampaign.mutate(campaign.id, {
                  onSuccess: () => router.push(routes.campaigns.index),
                })
              }
            >
              <Button variant="outline" className="flex items-center gap-2 text-red-600">
                <PiTrashBold className="h-4 w-4" />
                {t('campaigns_delete')}
              </Button>
            </DeletePopover>
          )}
        </div>
      }
    >
      <div className="rounded-lg border border-gray-200 bg-white px-5 shadow-sm">
        <Row label={t('campaigns_field_name')}>{campaign.name}</Row>
        <Row label={t('campaigns_field_source')}>
          <span className="font-mono">{campaign.source_campaign}</span>
        </Row>
        <Row label={t('campaigns_field_platform')}>
          {campaign.platform ? t(`campaigns_platform_${campaign.platform}`) : '—'}
        </Row>
        <Row label={t('campaigns_field_status')}>
          <CampaignStatusBadge status={campaign.status} />
          <Text className="mt-1 text-xs text-gray-500">{t('campaigns_status_hint')}</Text>
        </Row>
        <Row label={t('campaigns_field_start')}>
          {formatCampaignDate(campaign.start_date, i18n.language)}
        </Row>
        <Row label={t('campaigns_field_end')}>
          {formatCampaignDate(campaign.end_date, i18n.language)}
        </Row>
        <Row label={t('campaigns_field_budget')}>
          {formatCampaignBudget(campaign.budget, campaign.currency)}
          <Text className="mt-1 text-xs text-gray-500">{t('campaigns_budget_hint')}</Text>
        </Row>
        <Row label={t('campaigns_field_description')}>
          <span dir="auto" className="whitespace-pre-wrap">
            {campaign.description || '—'}
          </span>
        </Row>
        <Row label={t('campaigns_meta_created')}>
          {formatCampaignDate(campaign.created_at, i18n.language, true)}
        </Row>
        <Row label={t('campaigns_meta_updated')}>
          {formatCampaignDate(campaign.updated_at, i18n.language, true)}
        </Row>
      </div>
    </AdminPageShell>
  );
}
