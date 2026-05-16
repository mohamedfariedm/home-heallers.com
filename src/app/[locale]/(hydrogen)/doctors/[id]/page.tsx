'use client';

import Spinner from '@/components/ui/spinner';
import { useParams, useRouter } from 'next/navigation';
import { useDoctor, type DoctorHistoryFilters } from '@/framework/doctors';
import DoctorProfileView from '@/app/shared/doctors/profile';
import { ActionIcon } from '@/components/ui/action-icon';
import { PiArrowLeftBold } from 'react-icons/pi';
import { useMemo, useState } from 'react';

export default function DoctorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [historyFilters, setHistoryFilters] = useState<DoctorHistoryFilters>({});
  const { data, isLoading } = useDoctor(id, historyFilters);

  const doctor = useMemo(() => {
    if (!data) return null;
    return Array.isArray(data?.data) ? data.data[0] : (data?.data ?? data);
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ActionIcon
          size="sm"
          variant="outline"
          onClick={() => router.back()}
          aria-label="Back"
        >
          <PiArrowLeftBold className="h-4 w-4" />
        </ActionIcon>
        <h1 className="text-lg font-semibold">Doctor profile</h1>
      </div>

      {isLoading && !doctor ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : doctor ? (
        <DoctorProfileView
          doctor={doctor}
          historyFilters={historyFilters}
          onHistoryFiltersChange={setHistoryFilters}
          isHistoryLoading={isLoading}
        />
      ) : (
        <div className="rounded-lg border border-gray-200 p-6 text-center text-sm text-gray-600">
          No data found.
        </div>
      )}
    </div>
  );
}
