'use client'
import { routes } from '@/config/routes';
import { useSearchParams } from 'next/navigation';
import PageHeader from '@/app/shared/page-header';
import ChartWidgets from '@/app/shared/sales-chart';
import { useSalesChartReport } from '@/framework/sales-chart';

const pageHeader = {
  title: 'Sales Chart',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'Sales Chart',
    },
  ],
};

export default function ChartsPage() {
    const searchParams = useSearchParams()
    const params = new URLSearchParams(searchParams)
    const type = params.get('type') || 'daily'
    const { data, isLoading} = useSalesChartReport(type, params.toString())
    
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
      </PageHeader>
        

      <ChartWidgets details={data?.data} />
    </>
  );
}
