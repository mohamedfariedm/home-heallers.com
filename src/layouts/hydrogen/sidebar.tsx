// components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { Fragment, useMemo } from 'react';
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
import { getLocaleFromPathname, withLocalePrefix } from '@/lib/locale';

function isMenuItemActive(
  pathname: string,
  search: string,
  localePath: (path: string) => string,
  href?: string
) {
  if (!href) return false;

  const [pathPart, queryPart] = href.split('?');
  const localized = localePath(pathPart);

  if (queryPart) {
    const wanted = new URLSearchParams(queryPart);
    const current = new URLSearchParams(search);
    const pathMatches =
      pathname === localized || pathname.endsWith(pathPart);
    if (!pathMatches) return false;
    for (const [key, value] of wanted.entries()) {
      if (current.get(key) !== value) return false;
    }
    return true;
  }

  if (pathname === localized) return true;
  if (localized !== localePath('/') && pathname.startsWith(`${localized}/`)) {
    return true;
  }
  return false;
}

export default function Sidebar({ className }: { className?: string }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslation('menu');
  const locale = getLocaleFromPathname(pathname);
  const { permissions } = usePermissions();

  const pathName = (selectedPath: string) =>
    withLocalePrefix(selectedPath, locale);

  const search = useMemo(() => searchParams.toString(), [searchParams]);

  const hasAuthToken = Boolean(Cookies.get('auth_token'));
  const effectivePermissions = session?.user?.permissions || permissions;
  const filteredMenuItems = filterMenuItemsByPermissions(
    menuItemsHaydrogen,
    effectivePermissions
  );

  const showSidebar = status === 'authenticated' || hasAuthToken;

  if (!showSidebar) {
    return null;
  }

  return (
    <aside
      className={cn(
        'fixed bottom-0 start-0 z-50 flex h-full w-[270px] flex-col border-e border-gray-100 bg-gradient-to-b from-white via-white to-[#E8ECF5]/50 dark:bg-gray-100/50 2xl:w-72',
        className
      )}
    >
      <div className="sticky top-0 z-40 flex items-center justify-center border-b border-gray-100 bg-transparent px-5 py-5">
        <Link
          href={pathName('/')}
          aria-label="Site Logo"
          className="inline-flex w-full items-center justify-center"
        >
          <Logo className="mx-auto" />
        </Link>
      </div>

      <SimpleBar className="h-[calc(100vh_-_80px)]">
        <nav className="mt-4 space-y-0.5 pb-8">
          {filteredMenuItems.map((item, index) => {
            const active = isMenuItemActive(
              pathname,
              search,
              pathName,
              item?.href
            );

            return (
              <Fragment key={item.name + '-' + index}>
                {item?.href ? (
                  <Link
                    href={pathName(item.href)}
                    className={cn(
                      'group relative mx-3 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium capitalize transition-all duration-200 2xl:mx-4',
                      active
                        ? 'bg-gradient-to-r from-[#143087] to-[#39519B] text-white shadow-sm shadow-[#143087]/15'
                        : 'text-gray-600 hover:bg-blue-50/80 hover:text-[#143087]'
                    )}
                  >
                    {item?.icon && (
                      <span
                        className={cn(
                          'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors [&>svg]:h-[18px] [&>svg]:w-[18px]',
                          active
                            ? 'bg-white/15 text-white'
                            : 'bg-[#E8ECF5] text-[#143087] group-hover:bg-blue-100/80'
                        )}
                      >
                        {item?.icon}
                      </span>
                    )}
                    <span className="truncate">{t(item.name)}</span>
                  </Link>
                ) : (
                  <Title
                    as="h6"
                    className={cn(
                      'mb-2 truncate px-6 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400 2xl:px-7',
                      index !== 0 && 'mt-6'
                    )}
                  >
                    {t(item.name)}
                  </Title>
                )}
              </Fragment>
            );
          })}
        </nav>
      </SimpleBar>
    </aside>
  );
}
