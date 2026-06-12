const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

initializeApp();

exports.sendPushNotification = onDocumentCreated(
  "notifications_queue/{docId}",
  async (event) => {
    const data = event.data.data();
    if (!data || data.sent) return;
    const db = getFirestore();
    const messaging = getMessaging();
    try {
      const tokensSnap = await db.collection("fcm_tokens").get();
      const tokens = tokensSnap.docs
        .filter(doc => doc.data().userId !== data.createdBy)
        .map(doc => doc.data().token)
        .filter(Boolean);
      if (tokens.length === 0) { await event.data.ref.update({ sent: true, skipped: true }); return; }
      const response = await messaging.sendEachForMulticast({
        tokens,
        notification: { title: data.title, body: data.body },
        webpush: { notification: { title: data.title, body: data.body, icon: "/logo192.png" }, fcmOptions: { link: "https://karate-pro.vercel.app" } },
        data: { type: data.type || "notification", createdBy: data.createdBy || "", timestamp: new Date().toISOString() },
      });
      const invalidTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const code = resp.error?.code;
          if (code === "messaging/invalid-registration-token" || code === "messaging/registration-token-not-registered") invalidTokens.push(tokens[idx]);
        }
      });
      if (invalidTokens.length > 0) {
        const batch = db.batch();
        const docs = await db.collection("fcm_tokens").where("token", "in", invalidTokens).get();
        docs.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
      }
      await event.data.ref.update({ sent: true, sentAt: new Date(), successCount: response.successCount, failureCount: response.failureCount });
    } catch (err) {
      console.error("Erreur sendPushNotification:", err);
      await event.data.ref.update({ sent: true, error: String(err) });
    }
  }
);
