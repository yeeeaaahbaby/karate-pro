importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyALTS-8rZh8muVN6eucdyyXq0ZM48ZumuU",
  authDomain: "skb-elite.firebaseapp.com",
  projectId: "skb-elite",
  storageBucket: "skb-elite.firebasestorage.app",
  messagingSenderId: "341561757223",
  appId: "1:341561757223:web:8420fa801846c623a68802"
});

const messaging = firebase.messaging();

// Gérer les notifications en arrière-plan
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Message reçu en background:', payload);

  const { title, body, icon } = payload.notification;

  self.registration.showNotification(title, {
    body,
    icon: icon || '/karate-icon.png',
    badge: '/karate-icon.png',
    vibrate: [200, 100, 200],
    data: payload.data,
    actions: [
      { action: 'open', title: 'Voir la séance' }
    ]
  });
});

// Clic sur la notification → ouvre l'app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('https://app.skb-elite.fr')
  );
});
