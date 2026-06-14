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
    // Vérifier support Firebase Messaging
    const supported = await isSupported();
    if (!supported) throw new Error("Firebase Messaging non supporté sur ce navigateur/OS");
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;
    await navigator.serviceWorker.ready;
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    return token;
  } catch (error) {
    throw error;
  }
}

export function onForegroundMessage(callback) {
  return onMessage(messaging, callback);
}
