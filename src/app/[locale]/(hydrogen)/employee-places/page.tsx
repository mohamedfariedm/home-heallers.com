'use client'
import { routes } from '@/config/routes';
import { useSearchParams } from 'next/navigation';
import PageHeader from '@/app/shared/page-header';
import ChartWidgets from '@/app/shared/sales-chart';
import { useEmployLocation } from '@/framework/settings';
import GoogleMap from '@/components/google-map/interactiveMap'
import Spinner from '@/components/ui/spinner';

const pageHeader = {
  title: 'Employee Location',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'Employee Location',
    },
  ],
};

export default function EmployeeLocation() {
    const searchParams = useSearchParams()
    const params = new URLSearchParams(searchParams)
    const { data, isLoading} = useEmployLocation(params.toString())
    
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
      </PageHeader>
      {isLoading ? 
      <div>
        <Spinner />
      </div> :
      <GoogleMap data={data?.data}/>
      }  
    </>
  );
}
