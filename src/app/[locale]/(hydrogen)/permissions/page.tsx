'use client'
import PermitionsTable from '@/app/shared/permition/table';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import CreatePermition from '@/app/shared/permition/create-permition';
// import { usePermissions } from '@/framework/roles';
import { usePermissions } from '@/framework/permitions';
import Spinner from '@/components/ui/spinner';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
// export const metadata = {
//   ...metaObject('Enhanced Table'),
// };

const pageHeader = {
  title: 'Permissions Management',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'permissions',
    },
  ],
};

export default function PermitionsTablePage() {
    const searchParams = useSearchParams()
    const params = new URLSearchParams(searchParams)
    if(!params.get('page')) params.set('page', '1')
    if(!params.get('limit')) params.set('limit', '10')
    const { data, isLoading } = usePermissions(params.toString());   
    const [selectedColumns, setSelectedColumns] = useState<any[]>([])
    const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([])   
    console.log('selectedRowKeys', data);
    
  return (
    <TableLayout
      title={pageHeader.title}
      breadcrumb={pageHeader.breadcrumb}
      data={{columns: selectedColumns.filter((column) => column !== 'checked' && column !== 'action').map((column: String) => column.replace(/\./g, '_').replace(/\s/g, '_')), rows: selectedRowKeys}}
      fileName="permition/index"
      header="Permition,Created At"
      createName='Create Permition'
      // isLoading={isPermissionsLoading}
      createElementButton={<CreatePermition  />}
    >
      {isLoading ? (
        <div className="m-auto">
            <Spinner size="lg" />
        </div>
      ) : (<PermitionsTable data={data?.data} getSelectedColumns={setSelectedColumns} getSelectedRowKeys={setSelectedRowKeys} totalItems={data?.meta?.total} />)}
    </TableLayout>
  );
}
