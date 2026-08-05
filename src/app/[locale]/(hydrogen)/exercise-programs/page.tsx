'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import Spinner from '@/components/ui/spinner';
import CreateOrUpdateExerciseProgram from '@/app/shared/exercise-programs/program-form';
import ExerciseProgramsTable from '@/app/shared/exercise-programs/table';
import { useExercisePrograms } from '@/framework/exercise-programs';

const pageHeader = {
  title: 'Exercise Programs',
  breadcrumb: [
    { href: '/', name: 'Home' },
    { name: 'Exercise Programs' },
  ],
};

export default function ExerciseProgramsPage() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  if (!params.get('page')) params.set('page', '1');
  if (!params.get('limit')) params.set('limit', '20');

  const { data, isLoading } = useExercisePrograms(params.toString());
  const [selectedColumns, setSelectedColumns] = useState<any[]>([]);

  return (
    <TableLayout
      title={pageHeader.title}
      breadcrumb={pageHeader.breadcrumb}
      data={{
        columns: selectedColumns
          .filter((column) => column !== 'action')
          .map((column: string) =>
            column.replace(/\./g, '_').replace(/\s/g, '_')
          ),
        rows: [],
      }}
      fileName="exercise-programs/index"
      header="Program,Doctor,Patient,Status"
      createName="Create Program"
      createElementButton={<CreateOrUpdateExerciseProgram />}
      customSize="900px"
      canExport={false}
    >
      {isLoading ? (
        <div className="m-auto">
          <Spinner size="lg" />
        </div>
      ) : (
        <ExerciseProgramsTable
          data={data?.data ?? []}
          getSelectedColumns={setSelectedColumns}
          totalItems={data?.meta?.total ?? 0}
        />
      )}
    </TableLayout>
  );
}
