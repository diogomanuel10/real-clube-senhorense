import { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  orderBy, 
  query,
  increment,
} from 'firebase/firestore';
import { db } from '../utils/firebase';

export const useComunicados = () => {
  const [comunicados, setComunicados] = useState([]);
  const [escaloes, setEscaloes] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [comunicadosSnap, escaloesSnap] = await Promise.all([
        getDocs(query(collection(db, 'comunicados'), orderBy('dataCriacao', 'desc'))),
        getDocs(collection(db, 'escaloes')),
      ]);

      const comunicadosData = comunicadosSnap.docs.map(d => ({ 
        id: d.id, 
        ...d.data() 
      }));
      
      const escaloesData = escaloesSnap.docs.map(d => ({ 
        id: d.id, 
        ...d.data() 
      }));

      setComunicados(comunicadosData);
      setEscaloes(escaloesData);
    } catch (err) {
      console.error('Erro ao carregar comunicados:', err);
    } finally {
      setLoading(false);
    }
  };

  const criarComunicado = async (dados, userId, userName) => {
    try {
      const novoComunicado = {
        ...dados,
        autorId: userId,
        autor: userName,
        dataCriacao: new Date().toISOString(),
        visualizacoes: 0,
        pinned: false,
      };

      const docRef = await addDoc(collection(db, 'comunicados'), novoComunicado);
      
      setComunicados(prev => [
        { id: docRef.id, ...novoComunicado },
        ...prev
      ]);

      return { success: true, id: docRef.id };
    } catch (err) {
      console.error('Erro ao criar comunicado:', err);
      return { success: false, error: err.message };
    }
  };

  const atualizarComunicado = async (id, dados) => {
    try {
      await updateDoc(doc(db, 'comunicados', id), dados);
      
      setComunicados(prev =>
        prev.map(c => c.id === id ? { ...c, ...dados } : c)
      );

      return { success: true };
    } catch (err) {
      console.error('Erro ao atualizar comunicado:', err);
      return { success: false, error: err.message };
    }
  };

  const eliminarComunicado = async (id) => {
    try {
      await deleteDoc(doc(db, 'comunicados', id));
      setComunicados(prev => prev.filter(c => c.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Erro ao eliminar comunicado:', err);
      return { success: false, error: err.message };
    }
  };

  const togglePin = async (id, currentPinned) => {
    try {
      await updateDoc(doc(db, 'comunicados', id), {
        pinned: !currentPinned,
      });
      
      setComunicados(prev =>
        prev.map(c => c.id === id ? { ...c, pinned: !currentPinned } : c)
      );

      return { success: true };
    } catch (err) {
      console.error('Erro ao fixar comunicado:', err);
      return { success: false, error: err.message };
    }
  };

  const incrementarVisualizacoes = async (id) => {
    try {
      await updateDoc(doc(db, 'comunicados', id), {
        visualizacoes: increment(1),
      });
      
      setComunicados(prev =>
        prev.map(c => c.id === id ? { ...c, visualizacoes: (c.visualizacoes || 0) + 1 } : c)
      );
    } catch (err) {
      console.error('Erro ao incrementar visualizações:', err);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  return {
    comunicados,
    escaloes,
    loading,
    criarComunicado,
    atualizarComunicado,
    eliminarComunicado,
    togglePin,
    incrementarVisualizacoes,
    recarregar: carregarDados,
  };
};
