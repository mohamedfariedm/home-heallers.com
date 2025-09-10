'use client'
import { useSearchParams } from 'next/navigation';
import PageHeader from '@/app/shared/page-header';
import ChartWidgets from '@/app/shared/sales-target-chart';
import { useSalesTargetChartReport } from '@/framework/sales-target-chart';

const pageHeader = {
  title: 'Sales Target Chart',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'Sales Target Chart',
    },
  ],
};

export default function ChartsTargetPage() {
    const searchParams = useSearchParams()
    const params = new URLSearchParams(searchParams)
    const type = params.get('type') || 'weekly'
    const { data, isLoading} = useSalesTargetChartReport(type, params.toString())
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
      </PageHeader>
        

      <ChartWidgets details={data?.data} />
    </>
  );
}
