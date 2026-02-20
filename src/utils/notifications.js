import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app, db } from "./firebase"; // o teu init
import { doc, setDoc } from "firebase/firestore";

const messaging = getMessaging(app);

export async function enableNotificationsForUser(userId) {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const currentToken = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });

    if (currentToken) {
      await setDoc(
        doc(db, "userTokens", userId),
        { token: currentToken },
        { merge: true }
      );
      return currentToken;
    }
    return null;
  } catch (err) {
    console.error("Erro a ativar notificações", err);
    return null;
  }
}

// opcional: receber notificações quando a app está aberta
export function listenForegroundMessages() {
  onMessage(messaging, (payload) => {
    console.log("Mensagem em foreground:", payload);
  });
}
