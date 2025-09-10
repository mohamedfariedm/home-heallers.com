'use client';
import ToDoTable from '@/app/shared/todo/todo-List/table';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import { useToDoList } from '@/framework/todolist';
import Spinner from '@/components/ui/spinner';
import StoreForm from '@/app/shared/brand/brand-List/brand-form';
import { useBrand, useBrands } from '@/framework/brand';
import BrandTable from '@/app/shared/brand/brand-List/table';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

const pageHeader = {
  title: 'Brand Management',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'brand',
    },
  ],
};

export default function BrandTablePage() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  if (!params.get('page')) params.set('page', '1');
  if (!params.get('limit')) params.set('limit', '10');
  const { data, isLoading } = useBrands(params.toString());
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
      fileName="brands/index"
      header="User,Created At"
      createName="Create Brand"
      createElementButton={<StoreForm />}
    >
      {isLoading ? (
        <div className="m-auto">
          <Spinner size="lg" />
        </div>
      ) : (
        <BrandTable
          data={data?.data?.brands}
          getSelectedColumns={setSelectedColumns}
          getSelectedRowKeys={setSelectedRowKeys}
          totalItems={data?.meta?.total}
        />
      )}
    </TableLayout>
  );
}
