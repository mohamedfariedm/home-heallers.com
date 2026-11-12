'use client';

import { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PiGearBold, PiLifebuoyDuotone } from 'react-icons/pi';
import AdminPageShell, {
  adminSecondaryButtonClass,
} from '@/components/ui/admin-page-shell';
import Spinner from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/context/PermissionsContext';
import { useIsMounted } from '@/hooks/use-is-mounted';
import { resolveSupportTicketsPermissions } from '@/app/shared/support-tickets/permissions';
import SupportTicketsInbox from '@/app/shared/support-tickets/inbox';
import SupportTicketsSettingsModal from '@/app/shared/support-tickets/settings-modal';
import cn from '@/utils/class-names';

function SupportTicketsPageContent() {
  const { t } = useTranslation();
  const isMounted = useIsMounted();
  const { permissions } = usePermissions();
  const access = resolveSupportTicketsPermissions(permissions);
  const [settingsOpen, setSettingsOpen] = useState(false);

  if (!isMounted) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const title = t('st_page_title');
  const breadcrumb = [
    { href: '/', name: t('st_breadcrumb_home') },
    { name: t('st_page_title') },
  ];

  if (!access.view) {
    return (
      <AdminPageShell
        title={title}
        description={t(
          'st_page_description',
          'Review and respond to customer support tickets'
        )}
        icon={<PiLifebuoyDuotone />}
        breadcrumb={breadcrumb}
      >
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
          {t('st_no_permission')}
        </div>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title={title}
      description={t(
        'st_page_description',
        'Review and respond to customer support tickets'
      )}
      icon={<PiLifebuoyDuotone />}
      breadcrumb={breadcrumb}
      maxWidth="full"
      actions={
        access.settings ? (
          <Button
            variant="outline"
            className={cn(adminSecondaryButtonClass, 'flex items-center gap-2')}
            onClick={() => setSettingsOpen(true)}
          >
            <PiGearBold className="h-4 w-4" />
            <span>{t('st_settings_title')}</span>
          </Button>
        ) : null
      }
    >
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <SupportTicketsInbox />
      </div>

      {access.settings && (
        <SupportTicketsSettingsModal
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </AdminPageShell>
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
