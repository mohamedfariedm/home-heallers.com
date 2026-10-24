'use client';

import PageHeader from '@/app/shared/page-header';
import StatisticsDashboard from '@/app/shared/statistics/dashboard';
import { useTranslation } from 'react-i18next';

export default function StatisticsPage() {
  const { t } = useTranslation('statistics');
  const pageHeader = {
    title: t('stats_title', 'Statistics Dashboard'),
    breadcrumb: [
      {
        href: '/',
        name: t('home', 'Home'),
      },
      {
        name: t('stats_breadcrumb', 'Statistics'),
      },
    ],
  };

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <StatisticsDashboard />
    </>
  );
}
