'use client';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import Spinner from '@/components/ui/spinner';
import cn from '@/utils/class-names';
import {
  useWhatsAppLogout,
  useWhatsAppQr,
  useWhatsAppReconnect,
  useWhatsAppSessionStatus,
} from '@/framework/whatsapp';
import type { WhatsAppSessionState } from '@/types/whatsapp';
import { isSessionReady, needsQrPanel } from './utils';

const SESSION_LABELS: Record<WhatsAppSessionState, string> = {
  CONNECTED: 'Connected',
  QR_REQUIRED: 'Scan QR code to link',
  CONNECTING: 'Connecting…',
  DISCONNECTED: 'Not linked',
  AUTH_FAILED: 'Authentication failed',
};

const SESSION_STYLES: Record<WhatsAppSessionState, string> = {
  CONNECTED: 'border-green-200 bg-green-50 text-green-900',
  QR_REQUIRED: 'border-amber-200 bg-amber-50 text-amber-900',
  CONNECTING: 'border-blue-200 bg-blue-50 text-blue-900',
  DISCONNECTED: 'border-gray-200 bg-gray-50 text-gray-800',
  AUTH_FAILED: 'border-red-200 bg-red-50 text-red-900',
};

export default function WhatsAppSessionBanner() {
  const { data: status, isLoading, isFetching, isError, error } =
    useWhatsAppSessionStatus();
  const session = status?.session ?? status?.status ?? 'DISCONNECTED';
  const showQr = needsQrPanel(session);

  const { data: qrData, isLoading: qrLoading } = useWhatsAppQr(showQr, 12000);

  const reconnect = useWhatsAppReconnect();
  const logout = useWhatsAppLogout();

  const bannerClass = SESSION_STYLES[session] ?? SESSION_STYLES.DISCONNECTED;

  return (
    <div className={cn('mb-4 rounded-lg border p-4', bannerClass)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Text className="font-semibold">{SESSION_LABELS[session]}</Text>
            {(isLoading || isFetching) && <Spinner className="h-4 w-4" />}
          </div>
          {isSessionReady(session) && (
            <Text className="mt-1 text-sm opacity-90">
              {status?.pushname && <span>{status.pushname} · </span>}
              {status?.phone && <span>+{status.phone}</span>}
            </Text>
          )}
          {session === 'AUTH_FAILED' && (
            <Text className="mt-1 text-sm">
              WhatsApp rejected this session. Reconnect and scan a new QR code.
            </Text>
          )}
          {session === 'DISCONNECTED' && (
            <Text className="mt-1 text-sm">
              Link your business WhatsApp to send and receive team inbox messages.
            </Text>
          )}
          {isError && (
            <Text className="mt-2 text-sm text-red-700">
              API error: {error?.message}
            </Text>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {!isSessionReady(session) && (
            <Button
              size="sm"
              variant="outline"
              isLoading={reconnect.isPending}
              onClick={() => reconnect.mutate()}
            >
              Reconnect
            </Button>
          )}
          {isSessionReady(session) && (
            <Button
              size="sm"
              variant="outline"
              color="danger"
              isLoading={logout.isPending}
              onClick={() => logout.mutate()}
            >
              Logout device
            </Button>
          )}
        </div>
      </div>

      {showQr && (
        <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          {qrLoading && !qrData?.qr_png ? (
            <Spinner />
          ) : qrData?.qr_png ? (
            <img
              src={qrData.qr_png}
              alt="WhatsApp QR code"
              className="h-48 w-48 rounded-md border border-gray-200 bg-white p-2"
            />
          ) : (
            <Text className="text-sm">Waiting for QR code…</Text>
          )}
          <Text className="max-w-md text-sm opacity-90">
            Open WhatsApp on your phone → Linked devices → Link a device, then
            scan this code. It refreshes about every {qrData?.expires_in ?? 25}{' '}
            seconds; this page updates automatically.
          </Text>
        </div>
      )}
    </div>
  );
}
