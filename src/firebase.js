import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyALTS-8rZh8muVN6eucdyyXq0ZM48ZumuU",
  authDomain: "skb-elite.firebaseapp.com",
  projectId: "skb-elite",
  storageBucket: "skb-elite.firebasestorage.app",
  messagingSenderId: "341561757223",
  appId: "1:341561757223:web:8420fa801846c623a68802",
  measurementId: "G-WZ7XRL2RWY"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const messaging = getMessaging(app);

// VAPID Key pour les notifications Web Push
const VAPID_KEY = "BNFtRNp0YAuLAgJb4h73D4W8jjzV15ol9Rl1cZazcveUZioryx_LWj7nfcy";

// Demander la permission et obtenir le token FCM
export async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      return token;
    }
    return null;
  } catch (error) {
    console.error("Erreur notification:", error);
    return null;
  }
}

// Écouter les messages en foreground
export function onForegroundMessage(callback) {
  return onMessage(messaging, callback);
}
