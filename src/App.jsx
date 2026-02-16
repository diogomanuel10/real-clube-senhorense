import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./utils/firebase";
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./components/DashboardLayout";
import Atletas from "./pages/Atletas";
import Captacoes from "./pages/Captacoes";
import Login from "./pages/Login";
import Treinos from "./pages/Treinos";
import Escaloes from "./pages/Escaloes";
import Presencas from "./pages/Presencas";
import AtletaPerfil from "./pages/AtletaPerfil";
import Quotas from './pages/Quotas';
import AdminUsers from "./pages/AdminUsers";
import Comunicados from './pages/Comunicados';
import Equipamentos from "./pages/Equipamentos"; // <-- ADICIONAR ISTO

import "./styles/globals.css";

function AppContent({ user }) {
  return (
    <Routes>
      {user ? (
        <>
          <Route path="/" element={<Dashboard user={user} />} />

          <Route
            path="/atletas"
            element={
              <DashboardLayout user={user}>
                <Atletas user={user} />
              </DashboardLayout>
            }
          />

          <Route path="/atletas/:id" element={<AtletaPerfil user={user} />} />

          <Route
            path="/admin/utilizadores"
            element={<AdminUsers user={user} />}
          />


<Route path="quotas" element={
  <DashboardLayout user={user}>
                <Quotas user={user} />
              </DashboardLayout>} />
          <Route
            path="/escaloes"
            element={
              <DashboardLayout user={user}>
                <Escaloes user={user} />
              </DashboardLayout>
            }
          />

          <Route
            path="/treinos"
            element={
              <DashboardLayout user={user}>
                <Treinos user={user} />
              </DashboardLayout>
            }
          />

 <Route
            path="/admin/utilizadores"
            element={
              <DashboardLayout user={user}>
                <AdminUsers user={user} />
              </DashboardLayout>
            }
          />
          <Route
            path="/presencas"
            element={
              <DashboardLayout user={user}>
                <Presencas user={user} />
              </DashboardLayout>
            }
          />

          <Route
            path="/captacoes"
            element={
              <DashboardLayout user={user}>
                <Captacoes user={user} />
              </DashboardLayout>
            }
          />

          {/* ADICIONAR ESTA ROTA */}
          <Route
            path="/equipamentos"
            element={
              <DashboardLayout user={user}>
                <Equipamentos user={user} />
              </DashboardLayout>
            }
          />

          <Route
            path="/comunicados"
            element={
              <DashboardLayout user={user}>
                <Comunicados user={user} />
              </DashboardLayout>
            }
          />
        </>
      ) : (
        <Route path="/" element={<Login />} />
      )}
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const ref = doc(db, "utilizadores", currentUser.uid);
          const snap = await getDoc(ref);

          if (snap.exists()) {
            const data = snap.data();
            const roleFromDb = data.role || data.perfil || "viewer";

            const userToSet = {
              ...currentUser,
              role: roleFromDb,
              displayName: data.nome || currentUser.displayName,
            };

            setUser(userToSet);
          } else {
            setUser({
              ...currentUser,
              ...data,
              role: roleFromDb,
              displayName: data.nome || currentUser.displayName,
            });
          }
        } catch (err) {
          console.error("Erro ao buscar dados:", err);
          setUser({
            ...currentUser,
            role: "viewer",
          });
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  console.log("STATE user em App:", user);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600">
        <div className="text-xl text-white animate-pulse">Carregando...</div>
      </div>
    );
  }

  return (
    <Router>
      <AppContent user={user} />
    </Router>
  );
}

export default App;
