import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";

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
export const auth = getAuth(app);

export {
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
};

const VAPID_KEY = "BNFtRNp0YAuLAgJb4h73D4W8jjzV15ol9Rl1cZazcveUZioryxl_Wj7npfcyTxKz5BkOm6DsP2w8oQBBHB9sGQo";

export async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;
    const swReg = await navigator.serviceWorker.ready;
    if (!swReg.pushManager) throw new Error("pushManager non disponible");
    // Supprimer l'ancienne souscription (mauvaise VAPID key)
    const existing = await swReg.pushManager.getSubscription();
    if (existing) await existing.unsubscribe();
    // getToken recrée la souscription avec la bonne VAPID key
    const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: swReg });
    return token;
  } catch (error) {
    throw error;
  }
}

export function onForegroundMessage(callback) {
  return onMessage(messaging, callback);
}
