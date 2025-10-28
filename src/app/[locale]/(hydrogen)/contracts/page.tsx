'use client';
import ContractsTable from '@/app/shared/contracts/table';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import { useContracts } from '@/framework/contracts';
import Spinner from '@/components/ui/spinner';
import ContractForm from '@/app/shared/contracts/contract-form';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

const pageHeader = {
  title: 'Contracts Management',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'contracts',
    },
  ],
};

export default function ContractsTablePage() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  if (!params.get('page')) params.set('page', '1');
  if (!params.get('limit')) params.set('limit', '10');
  
  const { data, isLoading } = useContracts(params.toString());
  const [selectedColumns, setSelectedColumns] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);

  return (
    <TableLayout
      title={pageHeader.title}
      breadcrumb={pageHeader.breadcrumb}
      data={{
        columns: selectedColumns
          .filter((column) => column !== 'checked' && column !== 'action')
          .map((column: String) =>
            column.replace(/\./g, '_').replace(/\s/g, '_')
          ),
        rows: selectedRowKeys,
      }}
      fileName="contracts/index"
      header="Company Name,Service Manager,Created At"
      createName="Create Contract"
      createElementButton={<ContractForm />}
    >
      {isLoading ? (
        <div className="m-auto">
          <Spinner size="lg" />
        </div>
      ) : (
        <ContractsTable
          data={data?.data || []}
          getSelectedColumns={setSelectedColumns}
          getSelectedRowKeys={setSelectedRowKeys}
          totalItems={data?.meta?.total || 0}
        />
      )}
    </TableLayout>
  );
}

