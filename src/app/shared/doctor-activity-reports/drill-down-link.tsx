'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import cn from '@/utils/class-names';
import {
  buildDoctorActivityDetailPath,
  buildDoctorActivityListPath,
  parseDoctorApiLinkToSearchParams,
} from '@/utils/doctor-activity-query';

export default function DoctorActivityDrillDownLink({
  link,
  children,
  className,
  doctorId,
}: {
  link: string;
  children: React.ReactNode;
  className?: string;
  doctorId?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = Cookies.get('NEXT_LOCALE') || 'en';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const params = parseDoctorApiLinkToSearchParams(link);

    const pathDoctorMatch = link.match(/\/doctor-activity\/(\d+)/);
    const targetDoctorId = pathDoctorMatch
      ? Number(pathDoctorMatch[1])
      : doctorId ?? (params.get('actor_id') ? Number(params.get('actor_id')) : null);

    if (targetDoctorId) {
      params.delete('tab');
      params.set('page', '1');
      router.push(buildDoctorActivityDetailPath(locale, targetDoctorId, params));
      return;
    }

    params.set('tab', 'doctors');
    router.push(buildDoctorActivityListPath(locale, params));
  };

  return (
    <Link
      href={pathname}
      onClick={handleClick}
      className={cn(
        'font-semibold text-blue-600 hover:underline dark:text-blue-400',
        className
      )}
    >
      {children}
    </Link>
  );
}
