'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import Spinner from '@/components/ui/spinner';
import ExercisesTable from '@/app/shared/exercises/table';
import { useRehabilitationReviewCandidates } from '@/framework/exercises';
import { routes } from '@/config/routes';

const pageHeader = {
  title: 'Rehabilitation Review',
  breadcrumb: [
    { href: '/', name: 'Home' },
    { href: routes.exercises.index, name: 'Exercises' },
    { name: 'Rehabilitation Review' },
  ],
};

export default function RehabilitationReviewPage() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  if (!params.get('page')) params.set('page', '1');
  if (!params.get('limit')) params.set('limit', '20');

  const { data, isLoading } = useRehabilitationReviewCandidates(
    params.toString()
  );
  const [selectedColumns, setSelectedColumns] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);

  return (
    <TableLayout
      title={pageHeader.title}
      breadcrumb={pageHeader.breadcrumb}
      data={{
        columns: selectedColumns
          .filter((column) => column !== 'checked' && column !== 'action')
          .map((column: string) =>
            column.replace(/\./g, '_').replace(/\s/g, '_')
          ),
        rows: selectedRowKeys,
      }}
      fileName="exercises/rehabilitation-review"
      header="Exercise,Body Part,Equipment,Target,Review Status"
      canCreate={false}
      canExport={false}
    >
      {isLoading ? (
        <div className="m-auto">
          <Spinner size="lg" />
        </div>
      ) : (
        <ExercisesTable
          data={data?.data ?? []}
          getSelectedColumns={setSelectedColumns}
          getSelectedRowKeys={setSelectedRowKeys}
          totalItems={data?.meta?.total ?? 0}
          rehabilitationReviewMode
        />
      )}
    </TableLayout>
  );
}
