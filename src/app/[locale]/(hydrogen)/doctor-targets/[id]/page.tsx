'use client';

import Spinner from '@/components/ui/spinner';
import { useParams, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { ActionIcon } from '@/components/ui/action-icon';
import { PiArrowLeftBold } from 'react-icons/pi';
import { useDoctorTarget } from '@/framework/doctor-targets';
import DoctorTargetDetailView from '@/app/shared/doctor-targets/detail-view';
import { usePermissions } from '@/context/PermissionsContext';
import { resolveDoctorTargetsPermissions } from '@/app/shared/doctor-targets/permissions';

export default function DoctorTargetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { permissions } = usePermissions();
  const targetPermissions = resolveDoctorTargetsPermissions(permissions);
  const { data, isLoading } = useDoctorTarget(id);

  const target = useMemo(() => {
    if (!data) return null;
    return Array.isArray(data?.data) ? data.data[0] : (data?.data ?? data);
  }, [data]);

  if (!targetPermissions.view) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-600">
        You do not have permission to view this target.
      </div>
    );
  }

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
        <h1 className="text-lg font-semibold">Doctor target details</h1>
      </div>

      {isLoading && !target ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : target ? (
        <DoctorTargetDetailView
          target={target}
          permissions={targetPermissions}
        />
      ) : (
        <div className="rounded-lg border border-gray-200 p-6 text-center text-sm text-gray-600">
          No data found.
        </div>
      )}
    </div>
  );
}
