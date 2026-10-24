'use client';

import { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PiGearBold } from 'react-icons/pi';
import PageHeader from '@/app/shared/page-header';
import Spinner from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/context/PermissionsContext';
import { useIsMounted } from '@/hooks/use-is-mounted';
import { resolveSupportTicketsPermissions } from '@/app/shared/support-tickets/permissions';
import SupportTicketsInbox from '@/app/shared/support-tickets/inbox';
import SupportTicketsSettingsModal from '@/app/shared/support-tickets/settings-modal';

function SupportTicketsPageContent() {
  const { t } = useTranslation();
  const isMounted = useIsMounted();
  const { permissions } = usePermissions();
  const access = resolveSupportTicketsPermissions(permissions);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Translations load after the server render, so wait for the client before
  // painting any translated text. Otherwise React hydrates the raw keys.
  if (!isMounted) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const pageHeader = {
    title: t('st_page_title'),
    breadcrumb: [{ href: '/', name: t('st_breadcrumb_home') }, { name: t('st_page_title') }],
  };

  if (!access.view) {
    return (
      <>
        <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
        <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-600">
          {t('st_no_permission')}
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        {access.settings && (
          <Button
            variant="outline"
            className="mt-4 flex items-center gap-2 @lg:mt-0"
            onClick={() => setSettingsOpen(true)}
          >
            <PiGearBold className="h-4 w-4" />
            <span>{t('st_settings_title')}</span>
          </Button>
        )}
      </PageHeader>

      <SupportTicketsInbox />

      {access.settings && (
        <SupportTicketsSettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      )}
    </>
  );
}

export default function SupportTicketsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <SupportTicketsPageContent />
    </Suspense>
  );
}
