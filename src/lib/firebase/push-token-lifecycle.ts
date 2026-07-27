import client from '@/framework/utils';
import {
  deleteFcmWebToken,
  getStoredFcmToken,
  setStoredFcmToken,
} from '@/lib/firebase/messaging';

export async function registerPushTokenWithBackend(token: string): Promise<void> {
  try {
    await client.pushTokens.register({
      platform: 'web',
      token,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    });
    setStoredFcmToken(token);
  } catch (error) {
    console.error('Push token registration failed:', error);
  }
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
