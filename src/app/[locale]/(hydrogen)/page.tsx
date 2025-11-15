"use client";
import StatisticsDashboard from '@/app/shared/statistics/dashboard';
import { useTranslation } from 'react-i18next';

export default function HomePage() {
  const { t } = useTranslation("common");

  return <StatisticsDashboard />;
}
