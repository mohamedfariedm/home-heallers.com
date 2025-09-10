'use client'
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import Spinner from '@/components/ui/spinner';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useCategories } from '@/framework/categories';
import CreateCategories from '@/app/shared/categories/create-categories';
import CategoryTable from '@/app/shared/categories/table';
// export const metadata = {
//   ...metaObject('Enhanced Table'),
// };

const pageHeader = {
  title: 'Categories Management',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'Categories',
    },
  ],
};

export default function PermitionsTablePage() {
    const searchParams = useSearchParams()
    const params = new URLSearchParams(searchParams)
    if(!params.get('page')) params.set('page', '1')
    if(!params.get('limit')) params.set('limit', '10')
    const { data, isLoading } = useCategories(params.toString());   
    const [selectedColumns, setSelectedColumns] = useState<any[]>([])
    const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([])   
    console.log('selectedRowKeys', data);
    
  return (
    <TableLayout
      title={pageHeader.title}
      breadcrumb={pageHeader.breadcrumb}
      data={{columns: selectedColumns.filter((column) => column !== 'checked' && column !== 'action').map((column: String) => column.replace(/\./g, '_').replace(/\s/g, '_')), rows: selectedRowKeys}}
      fileName="Categories/index"
      header="Categories,Created At"
      createName='Create Categories'
      // isLoading={isPermissionsLoading}
      createElementButton={<CreateCategories  />}
    >

      
      {isLoading ? (
        <div className="m-auto">
            <Spinner size="lg" />
        </div>
      ) : (<CategoryTable data={data?.data} getSelectedColumns={setSelectedColumns} getSelectedRowKeys={setSelectedRowKeys} totalItems={data?.meta?.total} />)}
    </TableLayout>
  );
}
