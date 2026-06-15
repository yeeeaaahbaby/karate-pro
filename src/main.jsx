import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { db } from './firebase.js'
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Initialiser OneSignal et sauvegarder les subscriptions dans Firestore
window.OneSignalDeferred = window.OneSignalDeferred || [];
window.OneSignalDeferred.push(async function(OneSignal) {
  await OneSignal.init({
    appId: "0e17a9d1-8c6e-4131-9644-7ab407e46c75",
    serviceWorkerPath: "/OneSignalSDKWorker.js",
    notifyButton: { enable: false },
  });

  async function saveSubscriptionId() {
    try {
      const subscriptionId = OneSignal.User.PushSubscription.id;
      if (!subscriptionId) return;
      const snap = await getDocs(query(collection(db, 'onesignal_players'), where('playerId', '==', subscriptionId)));
      if (snap.empty) {
        await addDoc(collection(db, 'onesignal_players'), {
          playerId: subscriptionId,
          createdAt: serverTimestamp(),
        });
        console.log('OneSignal subscription saved:', subscriptionId);
      }
    } catch (err) {
      console.error('Error saving OneSignal subscription:', err);
    }
  }

  OneSignal.User.PushSubscription.addEventListener('change', () => saveSubscriptionId());

  if (OneSignal.User.PushSubscription.optedIn) {
    saveSubscriptionId();
  }
});
