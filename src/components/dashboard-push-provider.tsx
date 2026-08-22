'use client';

import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { dashboardNotificationKeys } from '@/framework/dashboard-notifications';
import {
  isFirebaseConfigured,
  onForegroundMessage,
  requestNotificationPermission,
} from '@/lib/firebase/messaging';
import { syncFcmWebToken } from '@/lib/firebase/push-token-lifecycle';
import { Button } from '@/components/ui/button';
import { Text, Title } from '@/components/ui/text';
import cn from '@/utils/class-names';

const PROMPT_DISMISSED_KEY = 'fcm_permission_prompt_dismissed';

export default function DashboardPushProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status, data: session } = useSession();
  const queryClient = useQueryClient();
  const [showPrompt, setShowPrompt] = useState(false);
  const authenticated = status === 'authenticated';
  const userId = session?.user?.id ?? null;

  const refreshInbox = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: dashboardNotificationKeys.all,
    });
  }, [queryClient]);

  const enablePush = useCallback(async () => {
    if (!isFirebaseConfigured()) return;

    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      setShowPrompt(false);
      return;
    }

    await syncFcmWebToken(userId);
    setShowPrompt(false);
  }, [userId]);

  useEffect(() => {
    if (!authenticated || !isFirebaseConfigured()) return;

    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      if (!('Notification' in window)) return;

      if (Notification.permission === 'granted') {
        if (!cancelled) {
          await syncFcmWebToken(userId);
        }
      } else if (Notification.permission === 'default') {
        const dismissed = localStorage.getItem(PROMPT_DISMISSED_KEY) === '1';
        if (!dismissed && !cancelled) {
          setShowPrompt(true);
        }
      }

      unsubscribe = await onForegroundMessage(() => {
        refreshInbox();
      });
    })();

    const onVisibility = () => {
      if (document.visibilityState === 'visible' && Notification.permission === 'granted') {
        void syncFcmWebToken(userId);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      unsubscribe?.();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [authenticated, refreshInbox, userId]);

  const dismissPrompt = () => {
    localStorage.setItem(PROMPT_DISMISSED_KEY, '1');
    setShowPrompt(false);
  };

  return (
    <>
      {children}
      {showPrompt && authenticated ? (
        <div
          className={cn(
            'fixed bottom-4 end-4 z-[60] w-[min(100%-2rem,360px)] rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-300 dark:bg-gray-100'
          )}
          role="dialog"
          aria-labelledby="push-permission-title"
        >
          <Title as="h6" id="push-permission-title" className="mb-1 text-sm font-semibold">
            Enable browser notifications
          </Title>
          <Text className="mb-3 text-xs text-gray-600">
            Stay updated on new bookings and operation tickets even when this tab is in the background.
          </Text>
          <div className="flex items-center justify-end gap-2">
            <Button size="sm" variant="outline" onClick={dismissPrompt}>
              Not now
            </Button>
            <Button size="sm" onClick={() => void enablePush()}>
              Enable
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}
