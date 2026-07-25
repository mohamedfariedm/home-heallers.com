'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Spinner from '@/components/ui/spinner';
import { routes } from '@/config/routes';

/** @deprecated Overview lives on `/doctor-targets?tab=overview` */
export default function DoctorTargetsDashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`${routes.doctorTargets.index}?tab=overview`);
  }, [router]);

  return (
    <div className="flex h-40 items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
