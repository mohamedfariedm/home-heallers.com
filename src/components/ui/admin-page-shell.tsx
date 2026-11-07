'use client';

import React from 'react';
import cn from '@/utils/class-names';
import Breadcrumb from '@/components/ui/breadcrumb';

export type AdminPageShellProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  status?: React.ReactNode;
  breadcrumb?: { name: string; href?: string }[];
  children?: React.ReactNode;
  maxWidth?: '7xl' | 'full' | 'none';
  className?: string;
  contentClassName?: string;
  /** When true, only render the header bar (no gradient page / content padding). */
  headerOnly?: boolean;
};

const maxWidthClass = {
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
  none: '',
} as const;

export default function AdminPageShell({
  title,
  description,
  icon,
  actions,
  status,
  breadcrumb,
  children,
  maxWidth = '7xl',
  className,
  contentClassName,
  headerOnly = false,
}: AdminPageShellProps) {
  const subtitle =
    description ||
    (breadcrumb?.length
      ? breadcrumb.map((b) => b.name).join(' / ')
      : undefined);

  const header = (
    <div className="border-b border-gray-100 bg-white shadow-sm">
      <div
        className={cn(
          'mx-auto flex items-center gap-4 px-6 py-4',
          maxWidth !== 'none' && maxWidthClass[maxWidth]
        )}
      >
        {icon ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#143087] to-[#39519B] shadow">
            <span className="flex h-5 w-5 items-center justify-center text-white [&>svg]:h-5 [&>svg]:w-5">
              {icon}
            </span>
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold text-gray-900">{title}</h1>
          {description ? (
            <p className="text-xs text-gray-400">{description}</p>
          ) : breadcrumb?.length ? (
            <Breadcrumb
              separator=""
              separatorVariant="circle"
              className="mt-0.5 flex-wrap text-gray-400"
            >
              {breadcrumb.map((item) => (
                <Breadcrumb.Item
                  key={item.name}
                  {...(item?.href && { href: item.href })}
                >
                  {item.name}
                </Breadcrumb.Item>
              ))}
            </Breadcrumb>
          ) : subtitle ? (
            <p className="text-xs text-gray-400">{subtitle}</p>
          ) : null}
        </div>

        {status}
        {actions ? (
          <div className="flex shrink-0 items-center justify-end gap-2.5">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );

  if (headerOnly) {
    return <header className={cn('mb-6', className)}>{header}</header>;
  }

  return (
    <div
      className={cn(
        'min-h-screen bg-gradient-to-br from-slate-50 via-[#E8ECF5]/40 to-blue-50/20',
        className
      )}
    >
      {header}
      <div
        className={cn(
          'mx-auto px-6 py-8',
          maxWidth !== 'none' && maxWidthClass[maxWidth],
          contentClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}

export const adminPrimaryButtonClass =
  'gap-2 bg-[#143087] text-white hover:bg-[#0F2466] dark:bg-[#143087] dark:text-white dark:hover:bg-[#0F2466] dark:active:bg-[#0F2466]';

export const adminSecondaryButtonClass =
  'gap-2 border border-gray-200 bg-white text-gray-700 hover:border-[#143087]/40 hover:text-[#143087]';
