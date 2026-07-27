'use client';

import PageHeader from '@/app/shared/page-header';
import SentNotificationDetailView from '@/app/shared/notifications/sent-detail';
import { useParams } from 'next/navigation';

export default function SentNotificationDetailPage() {
  const params = useParams();
  const id = Number(params?.id);

  return (
    <>
      <PageHeader
        title="Notification details"
        breadcrumb={[
          { href: '/', name: 'Home' },
          { href: '/notifications?tab=sent', name: 'Push Notifications' },
          { href: '/notifications?tab=sent', name: 'Sent history' },
          { name: `#${params?.id ?? ''}` },
        ]}
      />
      <SentNotificationDetailView notificationId={id} />
    </>
  );
}
