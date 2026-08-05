'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PiDownloadSimpleBold, PiStethoscopeBold } from 'react-icons/pi';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import Spinner from '@/components/ui/spinner';
import CreateButton from '@/app/shared/create-button';
import CreateOrUpdateExercise from '@/app/shared/exercises/exercise-form';
import ImportExerciseForm from '@/app/shared/exercises/import-form';
import ExercisesTable from '@/app/shared/exercises/table';
import { useExercises } from '@/framework/exercises';
import { Button } from '@/components/ui/button';
import { routes } from '@/config/routes';

const pageHeader = {
  title: 'Exercises',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'Exercises',
    },
  ],
};

export default function ExercisesPage() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  if (!params.get('page')) params.set('page', '1');
  if (!params.get('limit')) params.set('limit', '20');

  const { data, isLoading } = useExercises(params.toString());
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
      fileName="exercises/index"
      header="Exercise,Body Part,Equipment,Target"
      createName="Create Exercise"
      createElementButton={<CreateOrUpdateExercise />}
      customSize="720px"
      exportElement={
        <div className="flex items-center gap-3">
          <Link href={routes.exercises.rehabilitationReview}>
            <Button variant="outline" className="gap-2">
              <PiStethoscopeBold className="h-[17px] w-[17px]" />
              Review Candidates
            </Button>
          </Link>
          <CreateButton
            label="Import Dataset"
            view={<ImportExerciseForm />}
            customSize="520px"
            icon={<PiDownloadSimpleBold className="me-1.5 h-[17px] w-[17px]" />}
            className="mt-0 w-full text-xs capitalize @lg:w-auto dark:bg-gray-100 dark:text-white dark:active:bg-gray-100 sm:text-sm lg:mt-0"
          />
        </div>
      }
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
        />
      )}
    </TableLayout>
  );
}
