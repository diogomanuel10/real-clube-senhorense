import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useClub } from '../contexts/ClubContext';

export const useDashboard = () => {
  const { clubId } = useClub();
  const [stats, setStats] = useState({
    totalAtletas: 0,
    equipasAtivas: 0,
    atletasAcompanhamento: 0,
  });
  const [treinos, setTreinos] = useState([]);
  const [escaloes, setEscaloes] = useState([]);
  const [comunicados, setComunicados] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [atletasSnap, escaloesSnap, treinosSnap, comunicadosSnap] = await Promise.all([
        getDocs(collection(db, `clubs/${clubId}/atletas`)),                                                          // ← NOVO
        getDocs(collection(db, `clubs/${clubId}/escaloes`)),                                                         // ← NOVO
        getDocs(collection(db, `clubs/${clubId}/treinos`)),                                                          // ← NOVO
        getDocs(query(collection(db, `clubs/${clubId}/comunicados`), orderBy('dataCriacao', 'desc'), limit(5))),     // ← NOVO
      ]);

      const atletasData = atletasSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const escaloesData = escaloesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const treinosData = treinosSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const comunicadosData = comunicadosSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const totalAtletas = atletasData.length;
      const equipasAtivas = new Set(atletasData.map(a => a.equipa)).size;
      const atletasAcompanhamento = atletasData.filter(a => a.necessitaAcompanhamento).length;

      setStats({ totalAtletas, equipasAtivas, atletasAcompanhamento });
      setTreinos(treinosData);
      setEscaloes(escaloesData);
      setComunicados(comunicadosData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clubId) carregarDados();
  }, [clubId]); // ← re-carrega se clube mudar

  return {
    stats,
    treinos,
    escaloes,
    comunicados,
    loading,
    recarregar: carregarDados,
  };
};
