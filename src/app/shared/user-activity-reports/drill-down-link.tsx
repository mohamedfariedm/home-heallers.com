'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import cn from '@/utils/class-names';
import {
  buildUserActivityDetailPath,
  buildUserActivityListPath,
  parseUserApiLinkToSearchParams,
} from '@/utils/user-activity-query';

export default function UserActivityDrillDownLink({
  link,
  children,
  className,
  userId,
}: {
  link: string;
  children: React.ReactNode;
  className?: string;
  /** When set, list-style links stay on this user's detail page. */
  userId?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = Cookies.get('NEXT_LOCALE') || 'en';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const params = parseUserApiLinkToSearchParams(link);

    const pathUserMatch = link.match(/\/user-activity\/(\d+)/);
    const targetUserId = pathUserMatch
      ? Number(pathUserMatch[1])
      : userId ?? (params.get('actor_id') ? Number(params.get('actor_id')) : null);

    if (targetUserId) {
      params.delete('tab');
      params.delete('actor_id');
      params.set('page', '1');
      router.push(buildUserActivityDetailPath(locale, targetUserId, params));
      return;
    }

    params.set('tab', 'users');
    router.push(buildUserActivityListPath(locale, params));
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
