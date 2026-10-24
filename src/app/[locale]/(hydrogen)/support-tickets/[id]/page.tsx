'use client';

import { useTranslation } from 'react-i18next';
import PageHeader from '@/app/shared/page-header';
import Spinner from '@/components/ui/spinner';
import { useIsMounted } from '@/hooks/use-is-mounted';
import { usePermissions } from '@/context/PermissionsContext';
import { routes } from '@/config/routes';
import { resolveSupportTicketsPermissions } from '@/app/shared/support-tickets/permissions';
import SupportTicketThread from '@/app/shared/support-tickets/thread';

export default function SupportTicketDetailPage({ params }: { params: { id: string } }) {
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

  const pageHeader = {
    title: t('st_page_title'),
    breadcrumb: [
      { href: '/', name: t('st_breadcrumb_home') },
      { href: routes.supportTickets.index, name: t('st_page_title') },
      { name: `#${params.id}` },
    ],
  };

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      {access.view ? (
        <SupportTicketThread key={params.id} ticketId={params.id} access={access} />
      ) : (
        <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-600">
          {t('st_no_permission')}
        </div>
      )}
    </>
  );
}
