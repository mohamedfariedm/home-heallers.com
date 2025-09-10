'use client';
import UsersTable from '@/app/shared/users/table';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import { useUsers } from '@/framework/users';
import Spinner from '@/components/ui/spinner';
import UserForm from '@/app/shared/users/user-form';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import * as tr from '@/app/[locale]/dictionaries/index';
import { useState } from 'react';
import { useRoles } from '@/framework/roles';
// export const metadata = {
//   ...metaObject('Enhanced Table'),
// };

export default function UsersTablePage({
  params: { locale },
}: {
  params: { locale: any };
}) {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  const pageHeader = {
    title: `Users Management`,
    breadcrumb: [
      {
        href: '/',
        name: 'Home',
      },
      {
        name: 'users',
      },
    ],
  };
  if (!params.get('page')) params.set('page', '1');
  if (!params.get('limit')) params.set('limit', '10');
  const { data, isLoading } = useUsers(params.toString());
  const text = String(locale) == 'ar' ? tr['ar'] : tr['en'];
  const { push } = useRouter();
  const pathName = usePathname();
  const [selectedColumns, setSelectedColumns] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  console.log('selectedRowKeys', data);

  return (
    <TableLayout
      title={text.userTitle}
      breadcrumb={pageHeader.breadcrumb}
      data={{
        columns: selectedColumns
          .filter((column) => column !== 'checked' && column !== 'action')
          .map((column: String) =>
            column.replace(/\./g, '_').replace(/\s/g, '_')
          ),
        rows: selectedRowKeys,
      }}
      fileName="users/index"
      header="User,Created At"
      createName="Create User"
      createElementButton={<UserForm />}
    >
      {isLoading ? (
        <div className="m-auto">
          <Spinner size="lg" />
        </div>
      ) : (
        <UsersTable
          data={data?.data}
          getSelectedColumns={setSelectedColumns}
          getSelectedRowKeys={setSelectedRowKeys}
          totalItems={data?.meta?.total}
        />
      )}
    </TableLayout>
  );
}
