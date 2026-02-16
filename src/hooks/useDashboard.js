import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../utils/firebase';

export const useDashboard = () => {
  const [stats, setStats] = useState({
    totalAtletas: 0,
    equipasAtivas: 0,
    atletasAcompanhamento: 0,
  });
  const [treinos, setTreinos] = useState([]);
  const [escaloes, setEscaloes] = useState([]);
  const [comunicados, setComunicados] = useState([]); // <-- ADICIONAR
  const [loading, setLoading] = useState(true);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [atletasSnap, escaloesSnap, treinosSnap, comunicadosSnap] = await Promise.all([
        getDocs(collection(db, 'atletas')),
        getDocs(collection(db, 'escaloes')),
        getDocs(collection(db, 'treinos')),
        getDocs(query(collection(db, 'comunicados'), orderBy('dataCriacao', 'desc'), limit(5))), // <-- ADICIONAR
      ]);

      const atletasData = atletasSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const escaloesData = escaloesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const treinosData = treinosSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const comunicadosData = comunicadosSnap.docs.map(d => ({ id: d.id, ...d.data() })); // <-- ADICIONAR

      // Calcular stats
      const totalAtletas = atletasData.length;
      const equipasAtivas = new Set(atletasData.map(a => a.equipa)).size;
      const atletasAcompanhamento = atletasData.filter(a => a.necessitaAcompanhamento).length;

      setStats({
        totalAtletas,
        equipasAtivas,
        atletasAcompanhamento,
      });

      setTreinos(treinosData);
      setEscaloes(escaloesData);
      setComunicados(comunicadosData); // <-- ADICIONAR
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  return {
    stats,
    treinos,
    escaloes,
    comunicados, // <-- ADICIONAR
    loading,
    recarregar: carregarDados,
  };
};
