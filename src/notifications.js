import { db } from "./firebase";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";

// Sauvegarder le token FCM d'un utilisateur dans Firestore
export async function saveUserToken(userId, token, role, name) {
  try {
    await addDoc(collection(db, "fcm_tokens"), {
      userId,
      token,
      role, // "athlete", "coach", "parent"
      name,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Erreur sauvegarde token:", error);
  }
}

// Enregistrer une séance et déclencher une notification
export async function enregistrerSeance(seance) {
  try {
    // 1. Sauvegarder la séance dans Firestore
    const docRef = await addDoc(collection(db, "seances"), {
      ...seance,
      createdAt: serverTimestamp()
    });

    // 2. Créer une notification dans la collection "notifications"
    // (un Cloud Function Firebase écoutera cette collection et enverra le push)
    await addDoc(collection(db, "notifications_queue"), {
      type: "nouvelle_seance",
      seanceId: docRef.id,
      athlete: seance.athlete || "Iliana",
      type_seance: seance.type,
      duree: seance.duration,
      satisfaction: seance.satisfaction,
      katas: seance.katas || [],
      date: seance.date,
      createdAt: serverTimestamp(),
      sent: false
    });

    return docRef.id;
  } catch (error) {
    console.error("Erreur enregistrement séance:", error);
    throw error;
  }
}

// Récupérer les séances depuis Firestore
export async function getSeances() {
  try {
    const snapshot = await getDocs(collection(db, "seances"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Erreur récupération séances:", error);
    return [];
  }
}
