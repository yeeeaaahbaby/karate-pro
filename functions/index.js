const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onRequest } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();

const ONESIGNAL_APP_ID = "0e17a9d1-8c6e-4131-9644-7ab407e46c75";
const ONESIGNAL_API_KEY = "os_v2_app_byl2tummnzatdfsepk2apzdmoxbbrrgjv4uegeeflhnolc4hf2obuxxclbbepz36tvoqdyjsgjqpc3atl255wqwvxmjchvjuw2v4h3q";

async function sendOneSignalPush(title, body) {
  const db = getFirestore();
  const playersSnap = await db.collection("onesignal_players").get();
  const subscriptionIds = [...new Set(
    playersSnap.docs.map(d => d.data().playerId).filter(id => id)
  )];

  console.log("Players trouvés:", subscriptionIds.length, JSON.stringify(subscriptionIds));

  if (subscriptionIds.length === 0) {
    return { skipped: true, reason: "no_players" };
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
      headings: { fr: title, en: title },
      contents: { fr: body, en: body },
      url: "https://karate-pro.vercel.app",
    }),
  });

  const result = await response.json();
  console.log("OneSignal response:", JSON.stringify(result));
  return result;
}

// ─── Trigger Firestore (notification automatique) ─────────────────────────────
exports.sendPushNotification = onDocumentCreated(
  { document: "notifications_queue/{docId}", region: "europe-west1" },
  async (event) => {
    const data = event.data.data();
    if (!data || data.sent) return;
    try {
      const result = await sendOneSignalPush(data.title, data.body);
      await event.data.ref.update({
        sent: true,
        sentAt: new Date(),
        oneSignalId: result.id || null,
        recipientCount: result.recipients || 0,
        skipped: result.skipped || false,
        onesignalError: result.errors ? JSON.stringify(result.errors) : null,
      });
    } catch (err) {
      console.error("Erreur sendPushNotification:", err);
      await event.data.ref.update({ sent: true, error: String(err) });
    }
  }
);

// ─── Trigger HTTP (test manuel) ───────────────────────────────────────────────
exports.testPush = onRequest(
  { region: "europe-west1", cors: true },
  async (req, res) => {
    try {
      const title = req.query.title || "🧪 Test notification";
      const body = req.query.body || "Test depuis HTTP trigger";
      const result = await sendOneSignalPush(title, body);
      res.json({ ok: true, result });
    } catch (err) {
      console.error("testPush error:", err);
      res.status(500).json({ ok: false, error: String(err) });
    }
  }
);
