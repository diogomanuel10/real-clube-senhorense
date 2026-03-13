// src/hooks/useAuth.js
import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
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
        // 1. Doc índice — só tem clubeId e role de superadmin
        const indexSnap = await getDoc(doc(db, "utilizadores", firebaseUser.uid));
        const indexData = indexSnap.data();

        // 2. Se for superadmin, não precisa de clube
        if (indexData?.role === "superadmin") {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            nome: indexData.nome || firebaseUser.displayName || "",
            role: "superadmin",
            clubeId: null,
            equipas: [],
          });
          setLoading(false);
          return;
        }

// 3. Ir buscar perfil completo na subcoleção do clube
const clubeId = indexData?.clubeId;
const urlClubeId = new URLSearchParams(window.location.search).get('clube') || 
localStorage.getItem('ultimoClube');

if (!clubeId && urlClubeId) {
  localStorage.setItem('ultimoClube', urlClubeId);
  await updateDoc(doc(db, "utilizadores", firebaseUser.uid), { clubeId: urlClubeId });
  console.log('✅ Clube auto-detectado:', urlClubeId);
  return; // ← SAI ANTES do perfil (reload automático)
}

if (!clubeId) throw new Error("Utilizador sem clubeId");

const perfilSnap = await getDoc(doc(db, `clubs/${clubeId}/utilizadores`, firebaseUser.uid));

const perfil = perfilSnap.data(); // ← ESTA LINHA FALTAVA!

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          nome: perfil.nome || firebaseUser.displayName || "",
          role: perfil.role || "viewer",
          equipas: perfil.equipas || [],
          clubeId,
          ativo: perfil.ativo ?? true,
        });

      } catch (error) {
        console.error("Erro ao carregar utilizador:", error);
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          nome: firebaseUser.displayName || "",
          role: "viewer",
          equipas: [],
          clubeId: null,
        });
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const logout = async () => await signOut(auth);

  return { user, loading, logout };
}
