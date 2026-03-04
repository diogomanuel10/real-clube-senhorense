import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebase';

export const useAtletasEquipa = (equipaId) => {
  const [atletas, setAtletas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!equipaId) return;
    
    const fetchAtletas = async () => {
      try {
        const q = query(
          collection(db, 'atletas'),
          where('equipa', '==', equipaId)
        );
        const snapshot = await getDocs(q);
        setAtletas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Erro ao carregar atletas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAtletas();
  }, [equipaId]);

  return { atletas, loading };
};
