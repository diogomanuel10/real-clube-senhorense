import { useState, useEffect, useCallback } from 'react';
import {
  collection, query, where, orderBy, getDocs,
} from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useClub } from '../contexts/ClubContext';

export const useTreinosPendentes = (equipas) => {
  const { clubId } = useClub();
  
  const [treinosPendentes, setTreinosPendentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTreinos = useCallback(async () => {
    if (!equipas || equipas.length === 0 || !clubId) {
      setTreinosPendentes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

console.log(clubId)

    try {
      const treinosQueries = equipas.map(eq =>
        query(
          collection(db, `clubs/${clubId}/treinos`), // ← NOVO
          where('equipa', '==', eq),
          where('data', '>', '2026-03-01'),
          orderBy('data', 'desc'),
          orderBy('horaInicio', 'asc')
        )
      );

      const avaliacoesQueries = equipas.map(eq =>
        query(
          collection(db, `clubs/${clubId}/avaliacoes_treino`), // ← NOVO
          where('equipa', '==', eq)
        )
      );

      const [treinosSnaps, avaliacoesSnaps] = await Promise.all([
        Promise.all(treinosQueries.map(getDocs)),
        Promise.all(avaliacoesQueries.map(getDocs)),
      ]);

      const idsAvaliados = new Set(
        avaliacoesSnaps.flatMap(snap =>
          snap.docs.map(doc => doc.data().treinoId)
        )
      );

      const agora = new Date();

      const pendentes = treinosSnaps
        .flatMap(snap => snap.docs)
        .map(doc => {
          const dataRaw = doc.data();
          return {
            id: doc.id,
            ...dataRaw,
            data: dataRaw.data?.toDate ? dataRaw.data.toDate() : new Date(dataRaw.data),
          };
        })
        .filter(treino => {
          const horaFim = treino.horaFim || treino.horaInicio;
          if (!horaFim) return false;

          const [hFim, mFim] = horaFim.split(':').map(Number);
          const fimTreino = new Date(treino.data);
          fimTreino.setHours(hFim, mFim, 0, 0);

          return agora > fimTreino && !idsAvaliados.has(treino.id);
        })
        .sort((a, b) => {
          if (a.data.getTime() !== b.data.getTime()) return b.data - a.data;
          return (a.horaInicio || '').localeCompare(b.horaInicio || '');
        });

      setTreinosPendentes(pendentes);
    } catch (error) {
      console.error('❌ ERRO useTreinosPendentes:', error);
      setError(error.message);
      setTreinosPendentes([]);
    } finally {
      setLoading(false);
    }
  }, [equipas, clubId]); // ← clubId no dependency array

  useEffect(() => {
    fetchTreinos();
  }, [fetchTreinos]);

  return { treinosPendentes, loading, error, refetch: fetchTreinos };
};
