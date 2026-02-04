import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './utils/firebase';
import Dashboard from './pages/Dashboard';
import Atletas from './pages/Atletas';
import Login from './pages/Login';
import './styles/globals.css';

function AppContent() {
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
    <Routes>
  {user ? (
    <>
      <Route path="/" element={<Dashboard user={user} />} />
      <Route path="/atletas" element={<Atletas user={user} />} />
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
  return (
    <Router>
      <div className="min-h-screen">
        <AppContent />
      </div>
    </Router>
  );
}

export default App;
