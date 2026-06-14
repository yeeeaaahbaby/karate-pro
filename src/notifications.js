import { db } from "./firebase";
import { collection, addDoc, getDocs, query, where, serverTimestamp, onSnapshot, orderBy, limit } from "firebase/firestore";

// ─── IDENTITÉ UTILISATEUR (pas d'auth, juste localStorage) ───────────────────
export const TEAM_USERS = [
  { id: "iliana",   name: "Iliana",   fullName: "Iliana Voratovic",   role: "athlete", emoji: "🥋" },
  { id: "isabelle", name: "Isabelle", fullName: "Isabelle Voratovic", role: "parent",  emoji: "👩" },
  { id: "alexandre",name: "Alexandre",fullName: "Alexandre Voratovic",role: "parent",  emoji: "👨" },
  { id: "helvetia", name: "Helvétia", fullName: "Helvétia Taily",     role: "coach",   emoji: "🎯" },
];

export function getUserId() {
  try {
    const u = JSON.parse(localStorage.getItem("kp_user") || "null");
    return u ? u.id : null;
  } catch { return null; }
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("kp_user") || "null");
  } catch { return null; }
}

export function setCurrentUser(user) {
  localStorage.setItem("kp_user", JSON.stringify(user));
}

// ─── SAUVEGARDER TOKEN FCM ────────────────────────────────────────────────────
export async function saveUserToken(userId, token) {
  try {
    if (!userId || !token) return;
    const q = query(collection(db, "fcm_tokens"), where("token", "==", token));
    const existing = await getDocs(q);
    if (!existing.empty) return;
    await addDoc(collection(db, "fcm_tokens"), {
      userId,
      token,
      createdAt: serverTimestamp(),
    });
    console.log("✅ Token FCM enregistré pour", userId);
  } catch (error) {
    console.error("Erreur sauvegarde token:", error);
  }
}

// ─── ENVOYER UNE NOTIFICATION (écrit dans notifications_queue) ────────────────
export async function notifyNewContent({ type, title, body, createdBy }) {
  try {
    await addDoc(collection(db, "notifications_queue"), {
      type,
      title,
      body,
      createdBy: createdBy || getUserId() || "unknown",
      createdAt: serverTimestamp(),
      sent: false,
    });
  } catch (error) {
    console.error("Erreur notification:", error);
  }
}

// ─── ÉCOUTER LES NOTIFICATIONS ENTRANTES (in-app) ────────────────────────────
export function subscribeToNotifications(onNewNotif, userId) {
  if (!userId) userId = getUserId();
  if (!userId) return () => {};

  const q = query(
    collection(db, "notifications_queue"),
    where("sent", "==", false),
    orderBy("createdAt", "desc"),
    limit(20)
  );

  let initialized = false;
  return onSnapshot(q, (snapshot) => {
    if (!initialized) { initialized = true; return; }
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const data = change.doc.data();
        if (data.createdBy !== userId) {
          onNewNotif({ title: data.title, body: data.body, type: data.type });
        }
      }
    });
  });
}

// ─── HELPERS PAR TYPE D'ÉVÉNEMENT ────────────────────────────────────────────

export async function notifyNewSeance(seance, createdBy) {
  const katas = seance.katas?.slice(0,2).join(", ") || "";
  await notifyNewContent({
    type: "nouvelle_seance",
    title: `🥋 Nouvelle séance ${seance.type}`,
    body: `${seance.date} · ${seance.duration} min · ${katas}`,
    createdBy,
  });
  if (seance.coachFeedback?.trim()) {
    await notifyNewContent({
      type: "notes_coach_seance",
      title: `💬 Retours du coach — séance ${seance.type}`,
      body: seance.coachFeedback,
      createdBy,
    });
  }
}

export async function notifyNewStage(stage, createdBy) {
  const katas = stage.katas?.slice(0,2).join(", ") || "";
  await notifyNewContent({
    type: "nouveau_stage",
    title: `🏅 Nouveau stage Équipe de France`,
    body: `${stage.date} · ${stage.duration} min · ${katas}`,
    createdBy,
  });
  if (stage.corrections?.trim()) {
    await notifyNewContent({
      type: "notes_coach_stage",
      title: `💬 Corrections du stage`,
      body: stage.corrections,
      createdBy,
    });
  }
}

export async function notifyNewPrepa(seance, createdBy) {
  await notifyNewContent({
    type: "nouvelle_prepa",
    title: `💪 Nouvelle prépa physique — ${seance.type}`,
    body: `${seance.date} · ${seance.duration} min · Coach: ${seance.coach || "N/A"}`,
    createdBy,
  });
  if (seance.notes?.trim()) {
    await notifyNewContent({
      type: "notes_coach_prepa",
      title: `💬 Notes prépa physique`,
      body: seance.notes,
      createdBy,
    });
  }
}

export async function notifyNewCompetition(comp, createdBy) {
  await notifyNewContent({
    type: "nouvelle_competition",
    title: `🏆 Nouvelle compétition ajoutée`,
    body: `${comp.name} · ${comp.date} · ${comp.lieu || ""}`,
    createdBy,
  });
  if (comp.notes?.trim()) {
    await notifyNewContent({
      type: "notes_coach_competition",
      title: `💬 Notes de compétition`,
      body: comp.notes,
      createdBy,
    });
  }
}

export async function notifyNewCorrection(correction, createdBy) {
  await notifyNewContent({
    type: "nouvelle_correction",
    title: `⚠️ Nouvelle correction — ${correction.kata || ""}`,
    body: correction.content,
    createdBy,
  });
}

export async function notifyNewChatMessage(message, senderName, createdBy) {
  await notifyNewContent({
    type: "nouveau_message",
    title: `💬 ${senderName}`,
    body: message,
    createdBy,
  });
}

// ─── LEGACY : enregistrerSeance (compatibilité) ───────────────────────────────
export async function enregistrerSeance(seance, createdBy) {
  try {
    const docRef = await addDoc(collection(db, "seances"), {
      ...seance,
      createdAt: serverTimestamp(),
    });
    await notifyNewSeance(seance, createdBy);
    return docRef.id;
  } catch (error) {
    console.error("Erreur enregistrement séance:", error);
    throw error;
  }
}

export async function getSeances() {
  try {
    const snapshot = await getDocs(collection(db, "seances"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Erreur récupération séances:", error);
    return [];
  }
}
