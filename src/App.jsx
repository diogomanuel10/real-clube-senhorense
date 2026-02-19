import { useState, useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./components/DashboardLayout";
import Atletas from "./pages/Atletas";
import Captacoes from "./pages/Captacoes";
import Login from "./pages/Login";
import Treinos from "./pages/Treinos";
import Escaloes from "./pages/Escaloes";
import Presencas from "./pages/Presencas";
import AtletaPerfil from "./pages/AtletaPerfil";
import Quotas from "./pages/Quotas";
import AdminUsers from "./pages/AdminUsers";
import Comunicados from "./pages/Comunicados";
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

          <Route path="/atletas/:id" element={<AtletaPerfil user={user} />} />

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
