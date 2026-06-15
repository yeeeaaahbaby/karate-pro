const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();

const ONESIGNAL_APP_ID = "0e17a9d1-8c6e-4131-9644-7ab407e46c75";
const ONESIGNAL_API_KEY = "os_v2_app_byl2tummnzatdfsepk2apzdmoxbbrrgjv4uegeeflhnolc4hf2obuxxclbbepz36tvoqdyjsgjqpc3atl255wqwvxmjchvjuw2v4h3q";

exports.sendPushNotification = onDocumentCreated(
  { document: "notifications_queue/{docId}", region: "europe-west1" },
  async (event) => {
    const data = event.data.data();
    if (!data || data.sent) return;
    const db = getFirestore();
    try {
      const playersSnap = await db.collection("onesignal_players").get();
      const subscriptionIds = [...new Set(
        playersSnap.docs
          .map(d => d.data().playerId)
          .filter(id => id)
      )];

      if (subscriptionIds.length === 0) {
        await event.data.ref.update({ sent: true, skipped: true, reason: "no_players" });
        return;
      }

      const response = await fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Key ${ONESIGNAL_API_KEY}`,
        },
        body: JSON.stringify({
          app_id: ONESIGNAL_APP_ID,
          include_subscription_ids: subscriptionIds,
          headings: { fr: data.title, en: data.title },
          contents: { fr: data.body, en: data.body },
          url: "https://karate-pro.vercel.app",
        }),
      });

      const result = await response.json();
      console.log("OneSignal response:", JSON.stringify(result));

      await event.data.ref.update({
        sent: true,
        sentAt: new Date(),
        oneSignalId: result.id || null,
        recipientCount: result.recipients || 0,
        onesignalError: result.errors ? JSON.stringify(result.errors) : null,
      });
    } catch (err) {
      console.error("Erreur sendPushNotification:", err);
      await event.data.ref.update({ sent: true, error: String(err) });
    }
  }
);
