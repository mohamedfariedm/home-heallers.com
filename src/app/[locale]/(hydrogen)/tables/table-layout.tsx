'use client';

import Link from 'next/link';
import { PiPlusBold } from 'react-icons/pi';
import { PageHeaderTypes } from '@/app/shared/page-header';
import ExportButton from '@/app/shared/export-button';
import CreateButton from '@/app/shared/create-button';
import ImportButton from '@/app/shared/import-button';
import { Button } from '@/components/ui/button';
import AdminPageShell, {
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from '@/components/ui/admin-page-shell';
import cn from '@/utils/class-names';

type TableLayoutProps = {
  data: { columns: unknown[]; rows: unknown[] };
  header: string;
  fileName: string;
  createName?: string;
  createElementButton?: React.ReactNode;
  createHref?: string;
  importButton?: string;
  isLoading?: boolean;
  role?: string;
  type?: string;
  customSize?: string;
  canExport?: boolean;
  canImport?: boolean;
  canCreate?: boolean;
  exportElement?: React.ReactNode;
  headerActions?: React.ReactNode;
  description?: string;
  icon?: React.ReactNode;
} & PageHeaderTypes;

export default function TableLayout({
  data,
  header,
  fileName,
  children,
  createElementButton,
  createHref,
  importButton,
  createName,
  isLoading,
  customSize = '960px',
  role,
  type,
  canExport = true,
  canImport = true,
  canCreate = true,
  exportElement,
  headerActions,
  description,
  icon,
  title,
  breadcrumb,
  className,
}: React.PropsWithChildren<TableLayoutProps>) {
  const actions = (
    <>
      {canImport && importButton ? (
        <ImportButton
          url={importButton}
          className={cn(adminSecondaryButtonClass, 'text-xs sm:text-sm')}
        />
      ) : null}
      {canExport &&
        (exportElement ?? (
          <ExportButton
            data={data}
            fileName={fileName}
            header={'excel'}
            type={type}
            role={role}
            className={cn(adminSecondaryButtonClass, 'text-xs sm:text-sm')}
          />
        ))}
      {headerActions}
      {canCreate && createName && createHref ? (
        <Link href={createHref} className="w-full @sm:w-auto">
          <Button
            className={cn(
              adminPrimaryButtonClass,
              'mt-0 w-full text-xs capitalize @sm:w-auto sm:text-sm'
            )}
            disabled={isLoading}
          >
            <PiPlusBold className="me-1.5 h-[17px] w-[17px]" />
            {createName}
          </Button>
        </Link>
      ) : canCreate && createName ? (
        <CreateButton
          label={createName}
          view={createElementButton}
          className={cn(
            adminPrimaryButtonClass,
            'mt-0 w-full text-xs capitalize @sm:w-auto sm:text-sm'
          )}
          disabled={isLoading}
          customSize={customSize}
        />
      ) : null}
    </>
  );

  return (
    <AdminPageShell
      title={title}
      description={description}
      icon={icon}
      breadcrumb={breadcrumb}
      actions={actions}
      className={className}
    >
      {children}
    </AdminPageShell>
  );
}
