'use client';
import ToDoTable from '@/app/shared/todo/todo-List/table';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import { useToDoList } from '@/framework/todolist';
import Spinner from '@/components/ui/spinner';
import StoreForm from '@/app/shared/todo/todo-List/todo-form';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

const pageHeader = {
  title: 'ToDo Management',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'todo',
    },
  ],
};

export default function StoreTablePage() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  if (!params.get('page')) params.set('page', '1');
  if (!params.get('limit')) params.set('limit', '10');
  const { data, isLoading } = useToDoList(params.toString());
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
      fileName="review_points/index"
      header="User,Created At"
      createName="Create point"
      createElementButton={<StoreForm />}
    >
      {isLoading ? (
        <div className="m-auto">
          <Spinner size="lg" />
        </div>
      ) : (
        <ToDoTable
          data={data?.data?.points}
          getSelectedColumns={setSelectedColumns}
          getSelectedRowKeys={setSelectedRowKeys}
          totalItems={data?.meta?.total}
        />
      )}
    </TableLayout>
  );
}
