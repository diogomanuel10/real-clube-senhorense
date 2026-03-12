import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useClub } from '../contexts/ClubContext';

// aceita string OU array
export const useAtletasEquipa = (equipasInput) => {
  const { clubId } = useClub();
  const [atletas, setAtletas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // normalizar: sempre array
    const equipas = Array.isArray(equipasInput)
      ? equipasInput
      : equipasInput
      ? [equipasInput]
      : [];

    if (equipas.length === 0 || !clubId) {
      setAtletas([]);
      setLoading(false);
      return;
    }

    const fetchAtletas = async () => {
      setLoading(true);
      try {
        // 1 query por equipa em paralelo
        const queries = equipas.map(eq =>
          query(
            collection(db, `clubs/${clubId}/atletas`), // ← NOVO PATH
            where('equipa', '==', eq)
          )
        );

        const snapshots = await Promise.all(queries.map(getDocs));

        const todosAtletas = snapshots.flatMap(snap =>
          snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        );

        setAtletas(todosAtletas);
      } catch (error) {
        console.error('Erro ao carregar atletas:', error);
        setAtletas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAtletas();
  }, [equipasInput, clubId]); // ← clubId no dependency array

  return { atletas, loading };
};
