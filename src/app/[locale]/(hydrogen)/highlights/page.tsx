'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Spinner from '@/components/ui/spinner';
import AdminPageShell, {
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from '@/components/ui/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { usePermissions } from '@/context/PermissionsContext';
import { resolveHighlightsPermissions } from '@/app/shared/highlights/permissions';
import { useHighlights } from '@/framework/highlights';
import HighlightsTable from '@/app/shared/highlights/table';
import HighlightsSettingsModal from '@/app/shared/highlights/settings/settings-modal';
import { routes } from '@/config/routes';
import { useTranslation } from 'react-i18next';
import { PiPlusBold, PiGearBold, PiCirclesThreePlusFill } from 'react-icons/pi';
import cn from '@/utils/class-names';

export default function HighlightsPage() {
  const { t } = useTranslation('highlights');
  const searchParams = useSearchParams();
  const { permissions } = usePermissions();
  const access = resolveHighlightsPermissions(permissions);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [, setSelectedColumns] = useState<any[]>([]);
  const [, setSelectedRowKeys] = useState<any[]>([]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (!params.get('page')) params.set('page', '1');
    if (!params.get('limit')) params.set('limit', '20');
    return params.toString();
  }, [searchParams]);

  const { data, isLoading, isFetching, error, refetch } = useHighlights(queryString);
  const status = (error as any)?.response?.status;

  if (!access.view || status === 403) {
    return (
      <AdminPageShell
        title={t('highlights_page_title')}
        description={t(
          'highlights_page_description',
          'Manage story highlights shown in the mobile app'
        )}
        icon={<PiCirclesThreePlusFill />}
      >
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
          {t('highlights_no_permission_view')}
        </div>
      </AdminPageShell>
    );
  }

  if (error && status !== 403) {
    return (
      <AdminPageShell
        title={t('highlights_page_title')}
        icon={<PiCirclesThreePlusFill />}
      >
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <Text className="text-gray-700">{t('highlights_load_error')}</Text>
          <Button
            className={cn(adminPrimaryButtonClass, 'mt-4')}
            onClick={() => refetch()}
          >
            {t('highlights_retry')}
          </Button>
        </div>
      </AdminPageShell>
    );
  }

  const rows = Array.isArray(data?.data) ? data.data : [];
  const total = data?.meta?.total ?? rows.length;

  return (
    <AdminPageShell
      title={t('highlights_page_title')}
      description={t(
        'highlights_page_description',
        'Manage story highlights shown in the mobile app'
      )}
      icon={<PiCirclesThreePlusFill />}
      breadcrumb={[
        { href: '/', name: t('highlights_breadcrumb_home') },
        { name: t('highlights_breadcrumb') },
      ]}
      actions={
        <>
          {access.settings && (
            <Button
              variant="outline"
              onClick={() => setIsSettingsOpen(true)}
              className={cn(adminSecondaryButtonClass, 'flex items-center gap-2')}
            >
              <PiGearBold className="h-4 w-4" />
              <span>{t('highlights_image_duration')}</span>
            </Button>
          )}
          {access.create && (
            <Link href={routes.highlights.create}>
              <Button className={cn(adminPrimaryButtonClass, 'flex items-center gap-2')}>
                <PiPlusBold className="h-4 w-4" />
                <span>{t('highlights_new')}</span>
              </Button>
            </Link>
          )}
        </>
      }
    >
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <HighlightsTable
          data={rows}
          totalItems={total}
          isFetching={isFetching && !isLoading}
          canEdit={access.update}
          canDelete={access.delete}
          getSelectedColumns={setSelectedColumns}
          getSelectedRowKeys={setSelectedRowKeys}
        />
      )}

      <HighlightsSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </AdminPageShell>
  );
}
