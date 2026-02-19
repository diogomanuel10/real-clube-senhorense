import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../utils/firebase";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);

      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        // Puxar dados extras do Firestore
        const userRef = doc(db, "utilizadores", firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        const fullUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || "",
          // ← AQUI VEM DO FIRESTORE
          role: userSnap.data()?.role || "viewer",
          equipas: userSnap.data()?.equipas || [],
          nome: userSnap.data()?.nome || firebaseUser.displayName || "",
        };

        setUser(fullUser);
      } catch (error) {
        console.error("Erro ao carregar dados do utilizador:", error);
        // User básico mesmo assim
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || "",
          role: "viewer",
          equipas: [],
        });
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return { user, loading, logout };
}
