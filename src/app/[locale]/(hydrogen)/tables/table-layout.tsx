'use client';

import Link from 'next/link';
import { PiPlusBold } from 'react-icons/pi';
import PageHeader, { PageHeaderTypes } from '@/app/shared/page-header';
import ExportButton from '@/app/shared/export-button';
import CreateButton from '@/app/shared/create-button';
import ImportButton from '@/app/shared/import-button';
import { Button } from '@/components/ui/button';

type TableLayoutProps = {
  data: {columns: unknown[], rows: unknown[]};
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
  customSize,
  role,
  type,
  canExport = true,
  canImport = true,
  canCreate = true,
  exportElement,
  headerActions,
  ...props
}: React.PropsWithChildren<TableLayoutProps>) {

  return (
    <>
      <PageHeader {...props}>
        <div className="flex flex-wrap items-center gap-2.5 @lg:justify-end">
          {canImport && importButton ? <ImportButton url={importButton} /> : ''}
          {canExport &&
            (exportElement ?? (
              <ExportButton data={data} fileName={fileName} header={'excel'} type={type} role={role} />
            ))}
          {headerActions}
          {canCreate && createName && createHref ? (
            <Link href={createHref} className="w-full @sm:w-auto">
              <Button
                className="mt-0 w-full text-xs capitalize @sm:w-auto dark:bg-gray-100 dark:text-white dark:active:bg-gray-100 sm:text-sm"
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
           className='mt-0 w-full text-xs capitalize @sm:w-auto dark:bg-gray-100 dark:text-white dark:active:bg-gray-100 sm:text-sm' 
           disabled={isLoading}
           customSize={customSize}
           />
           ) : null}
        </div>
      </PageHeader>

      {children}
    </>
  );
}
