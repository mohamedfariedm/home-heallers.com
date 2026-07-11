'use client';

import PageHeader from '@/app/shared/page-header';
import AppAnalyticsDashboard from '@/app/shared/app-analytics';

const pageHeader = {
  title: 'App Analytics',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'App Analytics',
    },
  ],
};

export default function AppAnalyticsPage() {
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <AppAnalyticsDashboard />
    </>
  );
}
