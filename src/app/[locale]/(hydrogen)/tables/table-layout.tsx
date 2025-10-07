'use client';

import PageHeader, { PageHeaderTypes } from '@/app/shared/page-header';
// import ImportButton from '@/app/shared/import-button';
import ExportButton from '@/app/shared/export-button';
import CreateButton from '@/app/shared/create-button';
import ImportButton from '@/app/shared/import-button';

type TableLayoutProps = {
  data: {columns: unknown[], rows: unknown[]};
  header: string;
  fileName: string;
  createName?: string;
  createElementButton?: React.ReactNode;
  importButton?: string;
  isLoading?: boolean;
  role?: string;
  type?: string;
  customSize?: string;
} & PageHeaderTypes;

export default function TableLayout({
  data,
  header,
  fileName,
  children,
  createElementButton,
  importButton,
  createName,
  isLoading,
  customSize,
  role,
  type,
  ...props
}: React.PropsWithChildren<TableLayoutProps>) {

  return (
    <>
      <PageHeader {...props}>
        <div className="mt-4 flex items-center gap-3 @lg:mt-0">
          {importButton?<ImportButton url={importButton}/>:""}
          <ExportButton data={data} fileName={fileName} header={'excel'} type={type} role={role} />
          {/* <ExportButton data={data} fileName={fileName} header={'pdf'} type={type} role={role} /> */}
          {createName && 
          <CreateButton
           label={createName} 
           view={createElementButton}
           className='mt-0 w-full text-xs capitalize @lg:w-auto dark:bg-gray-100 dark:text-white dark:active:bg-gray-100 sm:text-sm lg:mt-0' 
           disabled={isLoading}
           customSize={customSize}
           />
           }
        </div>
      </PageHeader>

      {children}
    </>
  );
}
