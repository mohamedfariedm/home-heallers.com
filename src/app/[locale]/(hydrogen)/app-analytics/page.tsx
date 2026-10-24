'use client';

import PageHeader from '@/app/shared/page-header';
import AppAnalyticsDashboard from '@/app/shared/app-analytics';
import { useTranslation } from 'react-i18next';

export default function AppAnalyticsPage() {
  const { t } = useTranslation('app-analytics');
  const pageHeader = {
    title: t('analytics_title', 'App Analytics'),
    breadcrumb: [
      {
        href: '/',
        name: t('analytics_home', 'Home'),
      },
      {
        name: t('analytics_title', 'App Analytics'),
      },
    ],
  };

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <AppAnalyticsDashboard />
    </>
  );
}
