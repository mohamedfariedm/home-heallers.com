'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import PageHeader from '@/app/shared/page-header';
import Spinner from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { usePermissions } from '@/context/PermissionsContext';
import { resolveOnboardingScreensPermissions } from '@/app/shared/onboarding-screens/permissions';
import ScreenForm from '@/app/shared/onboarding-screens/screen-form';
import { useOnboardingScreen } from '@/framework/onboarding-screens';
import { routes } from '@/config/routes';

export default function EditOnboardingScreenPage() {
  const params = useParams();
  const { t } = useTranslation();
  const pageHeader = {
    title: t('tutorial_edit_title', 'Edit Tutorial'),
    breadcrumb: [
      { href: '/', name: t('tutorial_home', 'Home') },
      { href: routes.onboardingScreens.index, name: t('Tutorial') },
      { name: t('tutorial_edit', 'Edit') },
    ],
  };
  const id = params?.id as string;

  const { permissions } = usePermissions();
  const access = resolveOnboardingScreensPermissions(permissions);

  const { data: screen, isLoading, error } = useOnboardingScreen(id);

  if (!access.update) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-600">
        {t('tutorial_no_permission_edit', "You don't have permission to edit tutorials.")}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !screen) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6">
        <Text className="text-gray-700">
          {t('tutorial_not_found', 'Tutorial not found.')}
        </Text>
      </div>
    );
  }

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <div className="mt-6">
        {/* key forces a fresh form state if the screen is refetched after save */}
        <ScreenForm key={screen.updated_at} initialValues={screen} />
      </div>
    </>
  );
}
