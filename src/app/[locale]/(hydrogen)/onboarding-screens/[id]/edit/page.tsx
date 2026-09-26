'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import PageHeader from '@/app/shared/page-header';
import Spinner from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { usePermissions } from '@/context/PermissionsContext';
import { resolveOnboardingScreensPermissions } from '@/app/shared/onboarding-screens/permissions';
import ScreenForm from '@/app/shared/onboarding-screens/screen-form';
import { useOnboardingScreen } from '@/framework/onboarding-screens';
import { routes } from '@/config/routes';

const pageHeader = {
  title: 'Edit Onboarding Screen',
  breadcrumb: [
    { href: '/', name: 'Home' },
    { href: routes.onboardingScreens.index, name: 'Onboarding Screens' },
    { name: 'Edit' },
  ],
};

export default function EditOnboardingScreenPage() {
  const params = useParams();
  const id = params?.id as string;

  const { permissions } = usePermissions();
  const access = resolveOnboardingScreensPermissions(permissions);

  const { data: screen, isLoading, error } = useOnboardingScreen(id);

  if (!access.update) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-600">
        You don&apos;t have permission to edit onboarding screens.
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
        <Text className="text-gray-700">Onboarding screen not found.</Text>
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
