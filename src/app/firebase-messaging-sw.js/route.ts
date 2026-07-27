/**
 * Firebase Cloud Messaging service worker.
 * Served from web root. Config is injected at request time from NEXT_PUBLIC_FIREBASE_* env.
 */
export function GET() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
  };

  const body = `
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp(${JSON.stringify(config)});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'Home Healers';
  const options = {
    body: payload.notification?.body || '',
    data: payload.data || {},
    icon: '/logo-short.svg',
  };
  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const entity = data.entity || data.action_entity || '';
  const id = data.id || data.action_id || data.entity_id || '';

  let path = '/';
  if (entity === 'reservation') {
    path = '/reservations';
  } else if (entity === 'customer_support') {
    path = '/customer-supports-operation-kanban';
  } else if (entity === 'client' && id) {
    path = '/clients/' + id;
  } else if (entity === 'client') {
    path = '/clients';
  }

  const origin = self.location.origin;
  const targetUrl = origin + path;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.startsWith(origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
`.trim();

  return new Response(body, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Service-Worker-Allowed': '/',
    },
  });
}
