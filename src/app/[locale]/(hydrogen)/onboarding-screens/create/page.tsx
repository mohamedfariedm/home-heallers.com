'use client';

import React from 'react';
import PageHeader from '@/app/shared/page-header';
import { usePermissions } from '@/context/PermissionsContext';
import { resolveOnboardingScreensPermissions } from '@/app/shared/onboarding-screens/permissions';
import ScreenForm from '@/app/shared/onboarding-screens/screen-form';
import { routes } from '@/config/routes';

const pageHeader = {
  title: 'New Onboarding Screen',
  breadcrumb: [
    { href: '/', name: 'Home' },
    { href: routes.onboardingScreens.index, name: 'Onboarding Screens' },
    { name: 'Create' },
  ],
};

export default function CreateOnboardingScreenPage() {
  const { permissions } = usePermissions();
  const access = resolveOnboardingScreensPermissions(permissions);

  if (!access.create) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-600">
        You don&apos;t have permission to create onboarding screens.
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
