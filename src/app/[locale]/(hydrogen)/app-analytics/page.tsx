'use client';

import AdminPageShell from '@/components/ui/admin-page-shell';
import AppAnalyticsDashboard from '@/app/shared/app-analytics';
import { useTranslation } from 'react-i18next';
import { PiDeviceMobileBold } from 'react-icons/pi';

export default function AppAnalyticsPage() {
  const { t } = useTranslation('app-analytics');

  return (
    <AdminPageShell
      title={t('analytics_title', 'App Analytics')}
      description={t(
        'analytics_description',
        'Track mobile app usage, installs, and engagement'
      )}
      icon={<PiDeviceMobileBold />}
      breadcrumb={[
        { href: '/', name: t('analytics_home', 'Home') },
        { name: t('analytics_title', 'App Analytics') },
      ]}
      maxWidth="full"
    >
      <AppAnalyticsDashboard />
    </AdminPageShell>
  );
}
