'use client';

import { Suspense } from 'react';
import PageHeader from '@/app/shared/page-header';
import WhatsAppInbox from '@/app/shared/whatsapp/inbox';
import { WhatsAppInboxProvider } from '@/lib/whatsapp/inbox-context';
import { resolveWhatsAppInboxPermissions } from '@/app/shared/whatsapp/permissions';
import { usePermissions } from '@/context/PermissionsContext';
import { useSession } from 'next-auth/react';
import { Text } from '@/components/ui/text';
import { getToken } from '@/framework/utils/get-token';
import Spinner from '@/components/ui/spinner';

const pageHeader = {
  title: 'WhatsApp Team Inbox',
  breadcrumb: [
    { href: '/', name: 'Home' },
    { name: 'WhatsApp Inbox' },
  ],
};

function WhatsAppInboxPageContent() {
  const { permissions } = usePermissions();
  const { data: session, status } = useSession();
  const effectivePermissions =
    (session?.user as { permissions?: string[] })?.permissions ?? permissions;
  const inboxPermissions = resolveWhatsAppInboxPermissions(effectivePermissions);
  const token =
    typeof window !== 'undefined' ? getToken() : null;
  const apiEnabled = status === 'authenticated' && !!token;

  return (
    <WhatsAppInboxProvider
      apiEnabled={apiEnabled}
      hasManagePermission={inboxPermissions.manage}
    >
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />

      {!inboxPermissions.manage && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <Text className="font-medium text-amber-900">
            Missing permission: whatsapp.manage
          </Text>
          <Text className="mt-1 text-sm text-amber-800">
            Ask an administrator to assign{' '}
            <code className="text-xs">whatsapp.manage</code> to your role. API
            calls may return 403 until then.
          </Text>
        </div>
      )}

      {!apiEnabled && status !== 'loading' && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <Text className="font-medium text-red-900">Not signed in</Text>
          <Text className="mt-1 text-sm text-red-800">
            Log in so the <code className="text-xs">auth_token</code> cookie is
            set before using the inbox.
          </Text>
        </div>
      )}

      <WhatsAppInbox />
    </WhatsAppInboxProvider>
  );
}

export default function WhatsAppInboxPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center gap-2 p-8">
          <Spinner />
          <Text>Loading WhatsApp inbox…</Text>
        </div>
      }
    >
      <WhatsAppInboxPageContent />
    </Suspense>
  );
}
