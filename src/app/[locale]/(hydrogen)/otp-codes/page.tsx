'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import Spinner from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import OtpCodesTable from '@/app/shared/otp-codes/table';
import { toOtpCodeTableRows, useOtpCodes } from '@/framework/otp-codes';
import type { OtpCodesListResponse } from '@/types/otp-codes';

const pageHeader = {
  title: 'OTP Codes',
  breadcrumb: [
    { href: '/', name: 'Home' },
    { name: 'OTP Codes' },
  ],
};

export default function OtpCodesPage() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  if (!params.get('page')) params.set('page', '1');
  if (!params.get('limit')) params.set('limit', '20');

  const { data, isLoading, isError, error } = useOtpCodes(params.toString());
  const [selectedColumns, setSelectedColumns] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);

  const listData = data as OtpCodesListResponse | undefined;
  const rows = toOtpCodeTableRows(listData?.data);
  const totalItems = listData?.meta?.total ?? rows.length;

  return (
    <TableLayout
      title={pageHeader.title}
      breadcrumb={pageHeader.breadcrumb}
      data={{
        columns: selectedColumns
          .filter((column) => column !== 'checked' && column !== 'action')
          .map((column: String) =>
            String(column).replace(/\./g, '_').replace(/\s/g, '_')
          ),
        rows: selectedRowKeys,
      }}
      fileName="otp-codes"
      header="excel"
      canExport={false}
      canCreate={false}
      canImport={false}
    >
      {isLoading ? (
        <div className="m-auto py-16">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error?.message || 'Failed to load OTP codes'}
        </div>
      ) : (
        <>
          {rows.length === 0 ? (
            <Text className="mb-4 block text-sm text-gray-500">
              No OTP codes match your filters.
            </Text>
          ) : null}
          <OtpCodesTable
            data={rows}
            getSelectedColumns={setSelectedColumns}
            getSelectedRowKeys={setSelectedRowKeys}
            totalItems={totalItems}
          />
        </>
      )}
    </TableLayout>
  );
}
