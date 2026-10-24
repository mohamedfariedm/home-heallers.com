'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { PiDeviceMobileDuotone, PiPlusBold } from 'react-icons/pi';
import PageHeader from '@/app/shared/page-header';
import Spinner from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Title, Text } from '@/components/ui/text';
import { usePermissions } from '@/context/PermissionsContext';
import { resolveOnboardingScreensPermissions } from '@/app/shared/onboarding-screens/permissions';
import SortableList from '@/app/shared/onboarding-screens/sortable-list';
import {
  useDeleteOnboardingScreen,
  useOnboardingScreens,
  useReorderOnboardingScreens,
  useToggleOnboardingScreenActive,
} from '@/framework/onboarding-screens';
import { OnboardingScreen } from '@/types/onboarding-screens';
import { routes } from '@/config/routes';

type StatusFilter = 'all' | 'active' | 'inactive';

const FILTERS: { value: StatusFilter; labelKey: string; label: string }[] = [
  { value: 'all', labelKey: 'tutorial_filter_all', label: 'All' },
  { value: 'active', labelKey: 'tutorial_active', label: 'Active' },
  { value: 'inactive', labelKey: 'tutorial_inactive', label: 'Inactive' },
];

export default function OnboardingScreensPage() {
  const params = useParams();
  const { t } = useTranslation('onboarding-screens');
  const lang = params?.locale === 'ar' ? 'ar' : 'en';
  const pageHeader = {
    title: t('Tutorial'),
    breadcrumb: [
      { href: '/', name: t('tutorial_home', 'Home') },
      { name: t('Tutorial') },
    ],
  };
  const { permissions } = usePermissions();
  const access = resolveOnboardingScreensPermissions(permissions);

  const [filter, setFilter] = useState<StatusFilter>('all');
  const [confirmDeactivate, setConfirmDeactivate] = useState<OnboardingScreen | null>(
    null
  );

  const { data: screens = [], isLoading, error, refetch } = useOnboardingScreens();
  const reorder = useReorderOnboardingScreens();
  const toggleActive = useToggleOnboardingScreenActive();
  const deleteScreen = useDeleteOnboardingScreen();
  const status = (error as any)?.response?.status;

  const activeCount = screens.filter((s) => s.is_active).length;
  const visibleScreens = useMemo(() => {
    if (filter === 'active') return screens.filter((s) => s.is_active);
    if (filter === 'inactive') return screens.filter((s) => !s.is_active);
    return screens;
  }, [screens, filter]);

  if (!access.view || status === 403) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-600">
        {t('tutorial_no_permission_view', "You don't have permission to view tutorials.")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6">
        <Text className="text-gray-700">
          {t('tutorial_load_error', 'Could not load tutorials.')}
        </Text>
        <Button className="mt-4" onClick={() => refetch()}>
          {t('tutorial_retry', 'Retry')}
        </Button>
      </div>
    );
  }

  const handleToggle = (screen: OnboardingScreen) => {
    if (screen.is_active && activeCount === 1) {
      setConfirmDeactivate(screen);
      return;
    }
    toggleActive.mutate(screen.id);
  };

  // Reorder needs every id, so drag & drop is only available on the full list.
  const canSort = access.update && filter === 'all' && screens.length > 1;

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        {access.create && (
          <div className="mt-4 @lg:mt-0">
            <Link href={routes.onboardingScreens.create}>
              <Button className="flex items-center gap-2">
                <PiPlusBold className="h-4 w-4" />
                <span>{t('tutorial_new', 'New Tutorial')}</span>
              </Button>
            </Link>
          </div>
        )}
      </PageHeader>

      <div className="mt-6 max-w-4xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  filter === f.value
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t(f.labelKey, f.label)}
              </button>
            ))}
          </div>
          <Text className="text-xs text-gray-500">
            {canSort
              ? t('tutorial_drag_hint', 'Drag the handle to change the order shown in the app.')
              : filter !== 'all' && screens.length > 1
                ? t('tutorial_switch_all_hint', 'Switch to "All" to reorder tutorials.')
                : null}
          </Text>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : visibleScreens.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white py-14 text-center">
            <PiDeviceMobileDuotone className="mb-2 h-10 w-10 text-gray-400" />
            <Text className="font-medium text-gray-700">
              {screens.length === 0
                ? t('tutorial_empty', 'No tutorials yet')
                : t('tutorial_no_match', 'No tutorials match this filter')}
            </Text>
            {screens.length === 0 && (
              <Text className="mt-1 text-xs text-gray-500">
                {t(
                  'tutorial_empty_hint',
                  'The app shows its built-in default tutorials until you add one.'
                )}
              </Text>
            )}
          </div>
        ) : (
          <SortableList
            screens={visibleScreens}
            lang={lang}
            sortable={canSort && !reorder.isPending}
            canEdit={access.update}
            canDelete={access.delete}
            onReorder={(ids) => reorder.mutate(ids)}
            onToggleActive={handleToggle}
            onDelete={(screen) => deleteScreen.mutate(screen.id)}
          />
        )}
      </div>

      <Modal isOpen={Boolean(confirmDeactivate)} onClose={() => setConfirmDeactivate(null)}>
        <div className="p-6">
          <Title as="h3" className="text-lg font-semibold text-gray-900">
            {t('tutorial_deactivate_title', 'Deactivate last tutorial?')}
          </Title>
          <Text className="mt-2 text-sm text-gray-600">
            {t(
              'tutorial_deactivate_body',
              'This is the last active tutorial. The app will fall back to its default tutorials. Continue?'
            )}
          </Text>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setConfirmDeactivate(null)}>
              {t('tutorial_cancel', 'Cancel')}
            </Button>
            <Button
              isLoading={toggleActive.isPending}
              onClick={() => {
                if (!confirmDeactivate) return;
                toggleActive.mutate(confirmDeactivate.id, {
                  onSettled: () => setConfirmDeactivate(null),
                });
              }}
            >
              {t('tutorial_deactivate', 'Deactivate')}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
