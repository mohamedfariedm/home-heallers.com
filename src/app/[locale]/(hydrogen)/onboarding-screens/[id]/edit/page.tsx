'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import AdminPageShell from '@/components/ui/admin-page-shell';
import Spinner from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { usePermissions } from '@/context/PermissionsContext';
import { resolveOnboardingScreensPermissions } from '@/app/shared/onboarding-screens/permissions';
import ScreenForm from '@/app/shared/onboarding-screens/screen-form';
import { useOnboardingScreen } from '@/framework/onboarding-screens';
import { routes } from '@/config/routes';
import { PiDeviceMobileDuotone } from 'react-icons/pi';

export default function EditOnboardingScreenPage() {
  const params = useParams();
  const { t } = useTranslation('onboarding-screens');
  const id = params?.id as string;

  const { permissions } = usePermissions();
  const access = resolveOnboardingScreensPermissions(permissions);

  const { data: screen, isLoading, error } = useOnboardingScreen(id);

  const shellProps = {
    title: t('tutorial_edit_title', 'Edit Tutorial'),
    description: t(
      'tutorial_edit_description',
      'Update onboarding screen content and media'
    ),
    icon: <PiDeviceMobileDuotone />,
    breadcrumb: [
      { href: '/', name: t('tutorial_home', 'Home') },
      { href: routes.onboardingScreens.index, name: t('Tutorial') },
      { name: t('tutorial_edit', 'Edit') },
    ],
  };

  if (!access.update) {
    return (
      <AdminPageShell {...shellProps}>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
          {t('tutorial_no_permission_edit', "You don't have permission to edit tutorials.")}
        </div>
      </AdminPageShell>
    );
  }

  if (isLoading) {
    return (
      <AdminPageShell {...shellProps}>
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      </AdminPageShell>
    );
  }

  if (error || !screen) {
    return (
      <AdminPageShell {...shellProps}>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <Text className="text-gray-700">
            {t('tutorial_not_found', 'Tutorial not found.')}
          </Text>
        </div>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell {...shellProps}>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <ScreenForm key={screen.updated_at} initialValues={screen} />
      </div>
    </AdminPageShell>
  );
}
