// components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { Fragment } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Title } from '@/components/ui/text';
import cn from '@/utils/class-names';
import SimpleBar from '@/components/ui/simplebar';
import { menuItemsHaydrogen } from './menu-items';
import Logo from '@/components/logo';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '@/context/PermissionsContext';
import { filterMenuItemsByPermissions } from '@/utils/menuUtils';
import { useSession } from 'next-auth/react';
import Cookies from 'js-cookie';

export default function Sidebar({ className }: { className?: string }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const locale = Cookies.get('NEXT_LOCALE') || 'en';
  const { permissions } = usePermissions();

  console.log('Sidebar - Session:', session);
  console.log('Sidebar - Permissions:', permissions);

  const pathName = (selectedPath: string) => {
    const segments = pathname.split('/');
    segments[1] = locale;
    return segments[0].concat('/', segments[1], selectedPath);
  };

  const effectivePermissions = session?.user?.permissions || permissions;
  console.log('Sidebar - Effective permissions:', effectivePermissions);
  const filteredMenuItems = filterMenuItemsByPermissions(menuItemsHaydrogen, effectivePermissions);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status !== 'authenticated') {
    return null;
  }

  return (
    <aside
      className={cn(
        'fixed bottom-0 start-0 z-50 h-full w-[270px] border-e-2 border-gray-100 bg-white dark:bg-gray-100/50 2xl:w-72',
        className
      )}
    >
      <div className="sticky top-0 z-40 bg-gray-0/10 dark:bg-gray-100/5">
        <Link href={pathName('/')} aria-label="Site Logo">
          <Logo className="max-w-[155px]" />
        </Link>
      </div>

      <SimpleBar className="h-[calc(100vh_-_150px)]">
        <div className="mt-4 pb-3 3xl:mt-6">
          {filteredMenuItems.map((item, index) => {
            const isActive = pathname === pathName(item?.href || '');

            return (
              <Fragment key={item.name + '-' + index}>
                {item?.href ? (
                  <Link
                    href={pathName(item.href)}
                    className={cn(
                      'group relative mx-3 my-0.5 flex items-center rounded-md px-3 py-2 font-medium capitalize lg:my-1 2xl:mx-5 2xl:my-2',
                      isActive
                        ? 'before:top-2/5 text-primary before:absolute before:-start-3 before:block before:h-4/5 before:w-1 before:rounded-ee-md before:rounded-se-md before:bg-primary 2xl:before:-start-5'
                        : 'text-gray-700 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-700/90'
                    )}
                  >
                    {item?.icon && (
                      <span
                        className={cn(
                          'me-2 inline-flex h-5 w-5 items-center justify-center rounded-md [&>svg]:h-[19px] [&>svg]:w-[19px]',
                          isActive
                            ? 'text-primary'
                            : 'text-gray-800 dark:text-gray-500 dark:group-hover:text-gray-700'
                        )}
                      >
                        {item?.icon}
                      </span>
                    )}
                    {t(item.name)}
                  </Link>
                ) : (
                  <Title
                    as="h6"
                    className={cn(
                      'mb-2 truncate px-6 text-[11px] font-medium uppercase tracking-widest text-gray-500 dark:text-gray-500 2xl:px-8',
                      index !== 0 && 'mt-6 3xl:mt-7'
                    )}
                  >
                    {t(item.name)}
                  </Title>
                )}
              </Fragment>
            );
          })}
        </div>
      </SimpleBar>
    </aside>
  );
}