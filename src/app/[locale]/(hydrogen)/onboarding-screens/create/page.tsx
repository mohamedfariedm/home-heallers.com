'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import PageHeader from '@/app/shared/page-header';
import { usePermissions } from '@/context/PermissionsContext';
import { resolveOnboardingScreensPermissions } from '@/app/shared/onboarding-screens/permissions';
import ScreenForm from '@/app/shared/onboarding-screens/screen-form';
import { routes } from '@/config/routes';

export default function CreateOnboardingScreenPage() {
  const { t } = useTranslation();
  const pageHeader = {
    title: t('tutorial_new_title', 'New Tutorial'),
    breadcrumb: [
      { href: '/', name: t('tutorial_home', 'Home') },
      { href: routes.onboardingScreens.index, name: t('Tutorial') },
      { name: t('tutorial_create', 'Create') },
    ],
  };
  const { permissions } = usePermissions();
  const access = resolveOnboardingScreensPermissions(permissions);

  if (!access.create) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-600">
        {t('tutorial_no_permission_create', "You don't have permission to create tutorials.")}
      </div>
    );
  }

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <div className="mt-6">
        <ScreenForm />
      </div>
    </>
  );
}
