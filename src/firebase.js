import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
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
    if (permission !== "granted") { console.warn("Permission refusée:", permission); return null; }
    // Attendre que le SW soit prêt
    const swReg = await navigator.serviceWorker.ready;
    console.log("SW prêt:", swReg.scope);
    const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: swReg });
    console.log("Token FCM obtenu:", token ? token.substring(0,20)+"..." : "NULL");
    return token;
  } catch (error) {
    console.error("Erreur FCM getToken:", error.code, error.message);
    throw error; // Remonter l'erreur pour la voir dans l'app
  }
}

export function onForegroundMessage(callback) {
  return onMessage(messaging, callback);
}
