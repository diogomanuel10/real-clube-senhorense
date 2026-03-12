// hooks/useAvaliacoesEquipa.js
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useClub } from '../contexts/ClubContext';

export const useAvaliacoesEquipa = (equipaId) => {
  const { clubId } = useClub();
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [atletasStats, setAtletasStats] = useState({});

  useEffect(() => {
    if (!equipaId || !clubId) return;

    const fetchAvaliacoes = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, `clubs/${clubId}/avaliacoes_treino`), // ← NOVO PATH
          where('equipa', '==', equipaId),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);

        const avaliacoesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        }));

        setAvaliacoes(avaliacoesList);

        // Stats dos top5
        const stats = {};
        avaliacoesList.forEach(av => {
          av.top5.forEach((atletaId, index) => {
            stats[atletaId] = (stats[atletaId] || 0) + (6 - index); // 1º=5pts, 2º=4pts...
          });
        });
        setAtletasStats(stats);
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvaliacoes();
  }, [equipaId, clubId]); // ← clubId no dependency array

  return { avaliacoes, loading, atletasStats };
};
