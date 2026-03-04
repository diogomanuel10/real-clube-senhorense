import { useState, useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import { Toaster } from 'react-hot-toast';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import JogoLive from './pages/JogoLive';
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./utils/firebase";
import Dashboard from "./pages/Dashboard";
import JogoEstatisticas from './pages/JogoEstatisticas';
import Jogos from './pages/Jogos';
import DashboardLayout from "./components/DashboardLayout";
import Atletas from "./pages/Atletas";
import Captacoes from "./pages/Captacoes";
import Login from "./pages/Login";
import Treinos from "./pages/Treinos";
import Escaloes from "./pages/Escaloes";
import Presencas from "./pages/Presencas";
import AtletaPerfil from "./pages/AtletaPerfil";
import Quotas from "./pages/Quotas";
import Exercicios from "./pages/ExerciciosSebenta"
import AdminUsers from "./pages/AdminUsers";
import Avaliacoes from "./pages/AvaliacoesEquipa"
import Comunicados from "./pages/Comunicados";
import FirebaseMonitoring from './pages/FirebaseMonitoring';
import Equipamentos from "./pages/Equipamentos";

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

          <Route
            path="/avaliacoes"
            element={
              <DashboardLayout user={user}>
                <Avaliacoes user={user} />
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

          <Route path="/jogos" element={<DashboardLayout user={user}><Jogos user={user} /></DashboardLayout>} />

          <Route
            path="/treinos"
            element={
              <DashboardLayout user={user}>
                <Treinos user={user} />
              </DashboardLayout>
            }
          />

<Route path="/jogos/:jogoId/estatisticas" element={<DashboardLayout user={user}><JogoEstatisticas user={user} /></DashboardLayout>} />
<Route path="/jogos/:jogoId/live" element={<DashboardLayout user={user}><JogoLive user={user} /></DashboardLayout>} />
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

          <Route
            path="/quotas"
            element={
              <DashboardLayout user={user}>
                <Quotas user={user} />
              </DashboardLayout>
            }
          />

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

          <Route
            path="/admin/utilizadores"
            element={
              <DashboardLayout user={user}>
                <AdminUsers user={user} />
              </DashboardLayout>
            }
          />

          <Route
            path="/exercicios"
            element={
              <DashboardLayout user={user}>
                <Exercicios user={user} />
              </DashboardLayout>
            }
          />

          <Route
            path="/firebase-monitoring"
            element={ <DashboardLayout user={user}><FirebaseMonitoring user={user} /></DashboardLayout>}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <img
          src="/logo.png"
          alt="Real Clube Senhorense"
          className="h-20 w-20 animate-bounce"
        />
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
