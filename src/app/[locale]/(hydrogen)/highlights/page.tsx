'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import PageHeader from '@/app/shared/page-header';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import Spinner from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { usePermissions } from '@/context/PermissionsContext';
import { resolveHighlightsPermissions } from '@/app/shared/highlights/permissions';
import { useHighlights } from '@/framework/highlights';
import HighlightsTable from '@/app/shared/highlights/table';
import HighlightsSettingsModal from '@/app/shared/highlights/settings/settings-modal';
import { routes } from '@/config/routes';
import { PiPlusBold, PiGearBold } from 'react-icons/pi';

const pageHeader = {
  title: 'Highlights (Stories)',
  breadcrumb: [
    { href: '/', name: 'Home' },
    { name: 'Highlights' },
  ],
};

export default function HighlightsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { permissions } = usePermissions();
  const access = resolveHighlightsPermissions(permissions);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);

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
      <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-600">
        You don&apos;t have permission to view Highlights.
      </div>
    );
  }

  if (error && status !== 403) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6">
        <Text className="text-gray-700">Could not load highlights.</Text>
        <Button className="mt-4" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const rows = Array.isArray(data?.data) ? data.data : [];
  const total = data?.meta?.total ?? rows.length;

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <div className="mt-4 flex items-center gap-3 @lg:mt-0">
          {access.settings && (
            <Button
              variant="outline"
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-2"
            >
              <PiGearBold className="h-4 w-4" />
              <span>Image Duration</span>
            </Button>
          )}
          {access.create && (
            <Link href={routes.highlights.create}>
              <Button className="flex items-center gap-2">
                <PiPlusBold className="h-4 w-4" />
                <span>New Highlight</span>
              </Button>
            </Link>
          )}
        </div>
      </PageHeader>

      <div className="mt-6">
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
      </div>

      <HighlightsSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}
