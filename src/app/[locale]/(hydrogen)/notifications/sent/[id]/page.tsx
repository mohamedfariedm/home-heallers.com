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
        title="Sent notification"
        breadcrumb={[
          { href: '/', name: 'Home' },
          { href: '/notifications?tab=sent', name: 'Push Notifications' },
          { name: `#${params?.id ?? ''}` },
        ]}
      />
      <SentNotificationDetailView notificationId={id} />
    </>
  );
}
