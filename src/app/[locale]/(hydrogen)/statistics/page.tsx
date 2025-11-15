'use client';

import PageHeader from '@/app/shared/page-header';
import StatisticsDashboard from '@/app/shared/statistics/dashboard';

const pageHeader = {
  title: 'Statistics Dashboard',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'Statistics',
    },
  ],
};

export default function StatisticsPage() {
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <StatisticsDashboard />
    </>
  );
}

