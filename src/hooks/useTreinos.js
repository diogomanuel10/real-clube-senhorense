import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useClub } from '../contexts/ClubContext'; // ← NOVO

export const useTreinos = () => {
  const { clubId } = useClub(); // ← NOVO
  const [treinos, setTreinos] = useState([]);
  const [escaloes, setEscaloes] = useState([]);
  const [planos, setPlanos] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [treinosSnap, escaloesSnap, planosSnap] = await Promise.all([
        getDocs(collection(db, `clubs/${clubId}/treinos`)),     // ← NOVO PATH
        getDocs(collection(db, `clubs/${clubId}/escaloes`)),    // ← NOVO PATH
        getDocs(collection(db, `clubs/${clubId}/planosTreino`)),// ← NOVO PATH
      ]);

      const treinosData = treinosSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const escaloesData = escaloesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const planosData = planosSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      escaloesData.sort((a, b) => a.nome.localeCompare(b.nome));

      setTreinos(treinosData);
      setEscaloes(escaloesData);
      setPlanos(planosData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clubId) carregarDados(); // ← só carrega quando clubId estiver pronto
  }, [clubId]); // ← NOVO: re-carrega se clube mudar

  return {
    treinos,
    setTreinos,
    escaloes,
    planos,
    setPlanos,
    loading,
    recarregar: carregarDados,
  };
};
