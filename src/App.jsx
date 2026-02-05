import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './utils/firebase';
import Dashboard from './pages/Dashboard';
import Atletas from './pages/Atletas';
import Login from './pages/Login';
import Treinos from './pages/Treinos';
import Escaloes from './pages/Escaloes';
import Treinadores from "./pages/Treinadores";
import './styles/globals.css';
import DashboardLayout from './components/DashboardLayout';

function AppContent({ user }) {
  return (
    <Routes>
      {user ? (
        <>
         <Route path="/" element={<Dashboard user={user} />} />
 <Route
            path="/atletas"
            element={
              <DashboardLayout>
                <Atletas user={user} />
              </DashboardLayout>
            }
          />
          <Route
  path="/treinadores"
  element={
    <DashboardLayout>
      <Treinadores />
    </DashboardLayout>
  }
/>
<Route
            path="/escaloes"
            element={
              <DashboardLayout>
                <Escaloes user={user} />
              </DashboardLayout>
            }
          />
       <Route
  path="/treinos"
  element={
    <DashboardLayout>
      <Treinos user={user} />
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
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600">
        <div className="text-xl text-white animate-pulse">Carregando...</div>
      </div>
    );
  }

  return (
    <Router>
      {user ? (
       
          <AppContent user={user} />
       
      ) : (
        <AppContent user={null} />
      )}
    </Router>
  );
}

export default App;
