'use client';
import CategoriesTable from '@/app/shared/maincategories/table';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import { useMainCategories } from '@/framework/maincategories ';
import Spinner from '@/components/ui/spinner';
import CategoryForm from '@/app/shared/maincategories/category-form';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
// export const metadata = {
//   ...metaObject('Enhanced Table'),
// };

const pageHeader = {
  title: 'BG Categories Managment',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'BG Categories',
    },
  ],
};

export default function CategoriesTablePage() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  if (!params.get('page')) params.set('page', '1');
  if (!params.get('limit')) params.set('limit', '10');
  const { data, isLoading } = useMainCategories(params.toString());
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
      fileName="categories/new_index_categories"
      type="BG"
      header="User,Created At"
      createName="Create BG"
      createElementButton={<CategoryForm />}
    >
      {isLoading ? (
        <div className="m-auto">
          <Spinner size="lg" />
        </div>
      ) : (
        <CategoriesTable
          data={data?.data?.categories}
          getSelectedColumns={setSelectedColumns}
          getSelectedRowKeys={setSelectedRowKeys}
          totalItems={data?.meta?.total}
        />
      )}
    </TableLayout>
  );
}
