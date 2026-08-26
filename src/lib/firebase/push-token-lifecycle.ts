import client from '@/framework/utils';
import { getToken as getAuthToken } from '@/framework/utils/get-token';
import {
  deleteFcmWebToken,
  getFcmWebToken,
  getStoredFcmToken,
  getStoredFcmTokenUserId,
  isFirebaseConfigured,
  setStoredFcmToken,
} from '@/lib/firebase/messaging';

let syncInFlight: Promise<void> | null = null;

export async function registerPushTokenWithBackend(
  token: string,
  userId?: string | null
): Promise<void> {
  try {
    await client.pushTokens.register({
      platform: 'web',
      token,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    });
    setStoredFcmToken(token, userId);
  } catch (error) {
    console.error('Push token registration failed:', error);
  }
}

/**
 * Register the current web FCM token with the API only when it is missing
 * locally or has changed (including a different logged-in user).
 */
export async function syncFcmWebToken(userId?: string | null): Promise<void> {
  if (syncInFlight) return syncInFlight;

  syncInFlight = (async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    if (!isFirebaseConfigured()) return;
    if (!getAuthToken()) return;

    const currentToken = await getFcmWebToken();
    if (!currentToken) return;

    const savedToken = getStoredFcmToken();
    const savedUserId = getStoredFcmTokenUserId();
    const sameUser = !userId || savedUserId === String(userId);

    if (savedToken && savedToken === currentToken && sameUser) return;

    await registerPushTokenWithBackend(currentToken, userId);
  })().finally(() => {
    syncInFlight = null;
  });

  return syncInFlight;
}

/** Revoke current web FCM token with the API, then clear local FCM state. Call before logout. */
export async function revokePushTokenBeforeLogout(): Promise<void> {
  const token = getStoredFcmToken();
  if (!token) {
    await deleteFcmWebToken();
    return;
  }
  try {
    await client.pushTokens.revoke({ token });
  } catch (error) {
    console.error('Push token revoke failed:', error);
  } finally {
    await deleteFcmWebToken();
  }
}
