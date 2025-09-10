'use client';
import StoresTable from '@/app/shared/stores/table';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import Spinner from '@/components/ui/spinner';
import { useFeturesCategories } from '@/framework/features-categories';
import UpdateCreateFeaturesCat from '@/app/shared/featurescategories/features-form';
import FeaturesTable from '@/app/shared/featurescategories/table';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
// export const metadata = {
//   ...metaObject('Enhanced Table'),
// };

const pageHeader = {
  title: 'Features Categories Management',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'features categories',
    },
  ],
};

export default function FeaturesCategoriesPage() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  if (!params.get('page')) params.set('page', '1');
  if (!params.get('limit')) params.set('limit', '10');
  const { data, isLoading } = useFeturesCategories(params.toString());
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
      fileName="features_categories/index"
      header="User,Created At"
      createName="Create Category"
      createElementButton={<UpdateCreateFeaturesCat />}
    >
      {isLoading ? (
        <div className="m-auto">
          <Spinner size="lg" />
        </div>
      ) : (
        <FeaturesTable
          data={data?.data?.categories}
          getSelectedColumns={setSelectedColumns}
          getSelectedRowKeys={setSelectedRowKeys}
          totalItems={data?.meta?.total}
        />
      )}
    </TableLayout>
  );
}
