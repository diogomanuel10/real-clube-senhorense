import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit, updateDoc, doc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useClub } from '../contexts/ClubContext';

export const useNotificacoes = (userId) => {
  const { clubId } = useClub();
  const [notificacoes, setNotificacoes] = useState([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const [loading, setLoading] = useState(true);

  const carregarNotificacoes = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, `clubs/${clubId}/notificacoes`), // ← NOVO
        orderBy('dataHora', 'desc'),
        limit(20)
      );

      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      const filtradas = data.filter(n => !n.userId || n.userId === userId);

      setNotificacoes(filtradas);
      setNaoLidas(filtradas.filter(n => !n.lida).length);
    } catch (err) {
      console.error('Erro ao carregar notificações:', err);
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLida = async (notificacaoId) => {
    try {
      await updateDoc(doc(db, `clubs/${clubId}/notificacoes`, notificacaoId), { // ← NOVO
        lida: true,
      });
      setNotificacoes(prev => prev.map(n => n.id === notificacaoId ? { ...n, lida: true } : n));
      setNaoLidas(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Erro ao marcar como lida:', err);
    }
  };

  const marcarTodasComoLidas = async () => {
    try {
      const promises = notificacoes
        .filter(n => !n.lida)
        .map(n => updateDoc(doc(db, `clubs/${clubId}/notificacoes`, n.id), { lida: true })); // ← NOVO

      await Promise.all(promises);
      setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
      setNaoLidas(0);
    } catch (err) {
      console.error('Erro ao marcar todas como lidas:', err);
    }
  };

  useEffect(() => {
    if (userId && clubId) carregarNotificacoes();
  }, [userId, clubId]); // ← clubId no dependency array

  return {
    notificacoes,
    naoLidas,
    loading,
    marcarComoLida,
    marcarTodasComoLidas,
    recarregar: carregarNotificacoes,
  };
};
