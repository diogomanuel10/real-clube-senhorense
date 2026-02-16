import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, limit, updateDoc, doc } from 'firebase/firestore';
import { db } from '../utils/firebase';

export const useNotificacoes = (userId) => {
  const [notificacoes, setNotificacoes] = useState([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const [loading, setLoading] = useState(true);

  const carregarNotificacoes = async () => {
    setLoading(true);
    try {
      // Buscar notificações do usuário ou globais
      const q = query(
        collection(db, 'notificacoes'),
        orderBy('dataHora', 'desc'),
        limit(20)
      );
      
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // Filtrar por usuário ou globais
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
      await updateDoc(doc(db, 'notificacoes', notificacaoId), {
        lida: true,
      });
      
      setNotificacoes(prev =>
        prev.map(n => n.id === notificacaoId ? { ...n, lida: true } : n)
      );
      setNaoLidas(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Erro ao marcar como lida:', err);
    }
  };

  const marcarTodasComoLidas = async () => {
    try {
      const promises = notificacoes
        .filter(n => !n.lida)
        .map(n => updateDoc(doc(db, 'notificacoes', n.id), { lida: true }));
      
      await Promise.all(promises);
      
      setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
      setNaoLidas(0);
    } catch (err) {
      console.error('Erro ao marcar todas como lidas:', err);
    }
  };

  useEffect(() => {
    if (userId) {
      carregarNotificacoes();
    }
  }, [userId]);

  return {
    notificacoes,
    naoLidas,
    loading,
    marcarComoLida,
    marcarTodasComoLidas,
    recarregar: carregarNotificacoes,
  };
};
