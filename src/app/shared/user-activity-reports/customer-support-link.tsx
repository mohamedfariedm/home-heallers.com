'use client';

import Link from 'next/link';
import Cookies from 'js-cookie';
import cn from '@/utils/class-names';
import { buildCustomerSupportListPath } from '@/utils/user-activity-query';

export default function CustomerSupportDrillDownLink({
  link,
  children,
  className,
  supportType = 'operation',
}: {
  link: string;
  children: React.ReactNode;
  className?: string;
  supportType?: 'operation' | 'marketing';
}) {
  const locale = Cookies.get('NEXT_LOCALE') || 'en';
  const href = buildCustomerSupportListPath(locale, link, supportType);

  return (
    <Link
      href={href}
      className={cn(
        'font-semibold text-blue-600 hover:underline dark:text-blue-400',
        className
      )}
    >
      {children}
    </Link>
  );
}
