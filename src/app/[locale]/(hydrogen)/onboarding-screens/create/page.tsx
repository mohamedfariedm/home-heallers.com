'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import AdminPageShell from '@/components/ui/admin-page-shell';
import { usePermissions } from '@/context/PermissionsContext';
import { resolveOnboardingScreensPermissions } from '@/app/shared/onboarding-screens/permissions';
import ScreenForm from '@/app/shared/onboarding-screens/screen-form';
import { routes } from '@/config/routes';
import { PiDeviceMobileDuotone } from 'react-icons/pi';

export default function CreateOnboardingScreenPage() {
  const { t } = useTranslation('onboarding-screens');
  const { permissions } = usePermissions();
  const access = resolveOnboardingScreensPermissions(permissions);

  const shellProps = {
    title: t('tutorial_new_title', 'New Tutorial'),
    description: t(
      'tutorial_create_description',
      'Create an onboarding screen for first-time app users'
    ),
    icon: <PiDeviceMobileDuotone />,
    breadcrumb: [
      { href: '/', name: t('tutorial_home', 'Home') },
      { href: routes.onboardingScreens.index, name: t('Tutorial') },
      { name: t('tutorial_create', 'Create') },
    ],
  };

  if (!access.create) {
    return (
      <AdminPageShell {...shellProps}>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
          {t('tutorial_no_permission_create', "You don't have permission to create tutorials.")}
        </div>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell {...shellProps}>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <ScreenForm />
      </div>
    </AdminPageShell>
  );
}
