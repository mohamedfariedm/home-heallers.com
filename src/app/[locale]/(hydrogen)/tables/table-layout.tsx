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
  ...props
}: React.PropsWithChildren<TableLayoutProps>) {

  return (
    <>
      <PageHeader {...props}>
        <div className="mt-4 flex items-center gap-3 @lg:mt-0">
          {canImport && importButton ? <ImportButton url={importButton} /> : ''}
          {canExport &&
            (exportElement ?? (
              <ExportButton data={data} fileName={fileName} header={'excel'} type={type} role={role} />
            ))}
          {canCreate && createName && createHref ? (
            <Link href={createHref} className="w-full @lg:w-auto">
              <Button
                className="mt-0 w-full text-xs capitalize @lg:w-auto dark:bg-gray-100 dark:text-white dark:active:bg-gray-100 sm:text-sm lg:mt-0"
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
           className='mt-0 w-full text-xs capitalize @lg:w-auto dark:bg-gray-100 dark:text-white dark:active:bg-gray-100 sm:text-sm lg:mt-0' 
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
