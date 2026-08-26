import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getMessaging,
  getToken,
  onMessage,
  deleteToken,
  isSupported,
  type Messaging,
  type MessagePayload,
} from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const FCM_TOKEN_STORAGE_KEY = 'fcm_web_token';
const FCM_TOKEN_USER_STORAGE_KEY = 'fcm_web_token_user';
const LEGACY_FCM_TOKEN_STORAGE_KEY = 'fcm_web_push_token';

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      firebaseConfig.messagingSenderId &&
      firebaseConfig.appId &&
      process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
  );
}

function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === 'undefined' || !isFirebaseConfigured()) return null;
  return getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);
}

export async function getFirebaseMessaging(): Promise<Messaging | null> {
  if (typeof window === 'undefined' || !isFirebaseConfigured()) return null;
  const supported = await isSupported().catch(() => false);
  if (!supported) return null;
  const app = getFirebaseApp();
  if (!app) return null;
  return getMessaging(app);
}

export function getStoredFcmToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(FCM_TOKEN_STORAGE_KEY);
}

export function getStoredFcmTokenUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(FCM_TOKEN_USER_STORAGE_KEY);
}

export function setStoredFcmToken(token: string | null, userId?: string | null): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LEGACY_FCM_TOKEN_STORAGE_KEY);
  if (token) {
    localStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);
    if (userId) {
      localStorage.setItem(FCM_TOKEN_USER_STORAGE_KEY, userId);
    }
  } else {
    localStorage.removeItem(FCM_TOKEN_STORAGE_KEY);
    localStorage.removeItem(FCM_TOKEN_USER_STORAGE_KEY);
  }
}

export async function registerMessagingServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  try {
    return await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
    });
  } catch (error) {
    console.error('FCM service worker registration failed:', error);
    return null;
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return Notification.requestPermission();
}

export async function getFcmWebToken(): Promise<string | null> {
  const messaging = await getFirebaseMessaging();
  if (!messaging) return null;

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) return null;

  const registration = await registerMessagingServiceWorker();
  if (!registration) return null;

  try {
    await navigator.serviceWorker.ready;
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });
    return token || null;
  } catch (error) {
    console.error('FCM getToken failed:', error);
    return null;
  }
}

export async function deleteFcmWebToken(): Promise<void> {
  const messaging = await getFirebaseMessaging();
  if (!messaging) {
    setStoredFcmToken(null);
    return;
  }
  try {
    await deleteToken(messaging);
  } catch (error) {
    console.error('FCM deleteToken failed:', error);
  } finally {
    setStoredFcmToken(null);
  }
}

export async function onForegroundMessage(
  handler: (payload: MessagePayload) => void
): Promise<(() => void) | undefined> {
  const messaging = await getFirebaseMessaging();
  if (!messaging) return undefined;
  return onMessage(messaging, handler);
}
