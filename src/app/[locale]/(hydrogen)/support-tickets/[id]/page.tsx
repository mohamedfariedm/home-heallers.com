'use client';

import { useTranslation } from 'react-i18next';
import AdminPageShell from '@/components/ui/admin-page-shell';
import Spinner from '@/components/ui/spinner';
import { useIsMounted } from '@/hooks/use-is-mounted';
import { usePermissions } from '@/context/PermissionsContext';
import { routes } from '@/config/routes';
import { resolveSupportTicketsPermissions } from '@/app/shared/support-tickets/permissions';
import SupportTicketThread from '@/app/shared/support-tickets/thread';
import { PiLifebuoyDuotone } from 'react-icons/pi';

export default function SupportTicketDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { t } = useTranslation();
  const isMounted = useIsMounted();
  const { permissions } = usePermissions();
  const access = resolveSupportTicketsPermissions(permissions);

  if (!isMounted) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <AdminPageShell
      title={`${t('st_page_title')} #${params.id}`}
      description={t('st_thread_description', 'Conversation thread for this ticket')}
      icon={<PiLifebuoyDuotone />}
      breadcrumb={[
        { href: '/', name: t('st_breadcrumb_home') },
        { href: routes.supportTickets.index, name: t('st_page_title') },
        { name: `#${params.id}` },
      ]}
      maxWidth="full"
    >
      {access.view ? (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <SupportTicketThread
            key={params.id}
            ticketId={params.id}
            access={access}
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
          {t('st_no_permission')}
        </div>
      )}
    </AdminPageShell>
  );
}
