// components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { Fragment } from 'react';
import { usePathname } from 'next/navigation';
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
import { getLocaleFromPathname, withLocalePrefix } from '@/lib/locale';

export default function Sidebar({ className }: { className?: string }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const { t } = useTranslation('menu');
  const locale = getLocaleFromPathname(pathname);
  const { permissions } = usePermissions();


  const pathName = (selectedPath: string) => withLocalePrefix(selectedPath, locale);

  const hasAuthToken = Boolean(Cookies.get('auth_token'));
  const effectivePermissions = session?.user?.permissions || permissions;
  const filteredMenuItems = filterMenuItemsByPermissions(menuItemsHaydrogen, effectivePermissions);

  // Middleware gates routes on auth_token; NextAuth session can lag or briefly
  // refetch as unauthenticated — keep sidebar visible when the token exists.
  const showSidebar = status === 'authenticated' || hasAuthToken;

  if (!showSidebar) {
    return null;
  }

  return (
    <aside
      className={cn(
        'fixed bottom-0 start-0 z-50 h-full w-[270px] border-e border-gray-100 bg-white dark:bg-gray-100/50 2xl:w-72',
        className
      )}
    >
      <div className="sticky top-0 z-40 border-b border-gray-100/80 bg-white/90 px-1 py-1 backdrop-blur-sm dark:bg-gray-100/5">
        <Link href={pathName('/')} aria-label="Site Logo">
          <Logo className="max-w-[155px]" />
        </Link>
      </div>

      <SimpleBar className="h-[calc(100vh_-_150px)]">
        <div className="mt-5 pb-4 3xl:mt-6">
          {filteredMenuItems.map((item, index) => {
            const isActive = pathname === pathName(item?.href || '');

            return (
              <Fragment key={item.name + '-' + index}>
                {item?.href ? (
                  <Link
                    href={pathName(item.href)}
                    className={cn(
                      'group relative mx-3 my-0.5 flex items-center rounded-lg px-3 py-2 font-medium capitalize transition-colors duration-200 lg:my-1 2xl:mx-5 2xl:my-1.5',
                      isActive
                        ? 'bg-primary-lighter/70 text-primary before:absolute before:-start-3 before:top-2/5 before:block before:h-4/5 before:w-1 before:rounded-ee-md before:rounded-se-md before:bg-primary dark:bg-primary-lighter/20 2xl:before:-start-5'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-700/90 dark:hover:bg-gray-100/60'
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
                      'mb-2.5 truncate px-6 text-[11px] font-medium uppercase tracking-widest text-gray-400 dark:text-gray-500 2xl:px-8',
                      index !== 0 && 'mt-7 3xl:mt-8'
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
