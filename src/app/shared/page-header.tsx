'use client';

import React from 'react';
import AdminPageShell from '@/components/ui/admin-page-shell';
import cn from '@/utils/class-names';

export type PageHeaderTypes = {
  title: string;
  breadcrumb: { name: string; href?: string }[];
  className?: string;
  description?: string;
  icon?: React.ReactNode;
};

export default function PageHeader({
  title,
  breadcrumb,
  children,
  className,
  description,
  icon,
}: React.PropsWithChildren<PageHeaderTypes>) {
  return (
    <AdminPageShell
      title={title}
      description={description}
      icon={icon}
      breadcrumb={breadcrumb}
      actions={children}
      headerOnly
      className={cn(className)}
    />
  );
}
