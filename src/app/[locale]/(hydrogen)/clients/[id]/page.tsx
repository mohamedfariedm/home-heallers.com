'use client';

import Spinner from '@/components/ui/spinner';
import { useParams, useRouter } from 'next/navigation';
import { usePatient } from '@/framework/patients';
import PatientProfileView from '@/app/shared/patients/profile';
import { ActionIcon } from '@/components/ui/action-icon';
import { PiArrowLeftBold } from 'react-icons/pi';

export default function PatientProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { data, isLoading } = usePatient(id);

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
        <h1 className="text-lg font-semibold">Patient profile</h1>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : data ? (
        <PatientProfileView
          patient={
            Array.isArray(data?.data)
              ? data.data[0]
              : (data?.data ?? data)
          }
        />
      ) : (
        <div className="rounded-lg border border-gray-200 p-6 text-center text-sm text-gray-600">
          No data found.
        </div>
      )}
    </div>
  );
}

