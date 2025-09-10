'use client';
import ProductsTable from '@/app/shared/products/table';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import { useProducts } from '@/framework/products';
import Spinner from '@/components/ui/spinner';
import ProductForm from '@/app/shared/products/product-form';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
// export const metadata = {
//   ...metaObject('Enhanced Table'),
// };

const pageHeader = {
  title: 'Products Management',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'products',
    },
  ],
};

export default function ProductsTablePage() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  if (!params.get('page')) params.set('page', '1');
  if (!params.get('limit')) params.set('limit', '10');
  const { data, isLoading } = useProducts(params.toString());
  const [selectedColumns, setSelectedColumns] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);

  return (
    <TableLayout
      title={pageHeader.title}
      breadcrumb={pageHeader.breadcrumb}
      data={{
        columns: selectedColumns
          .filter((column) => column !== 'checked' && column !== 'action')
          .map((column: String) =>
            column.replace(/\./g, '_').replace(/\s/g, '_')
          ),
        rows: selectedRowKeys,
      }}
      fileName="products/index"
      header="User,Created At"
      createName="Create Products"
      createElementButton={<ProductForm />}
    >
      {isLoading ? (
        <div className="m-auto">
          <Spinner size="lg" />
        </div>
      ) : (
        <ProductsTable
          data={data?.data?.products}
          getSelectedColumns={setSelectedColumns}
          getSelectedRowKeys={setSelectedRowKeys}
          totalItems={data?.meta?.total}
        />
      )}
    </TableLayout>
  );
}
