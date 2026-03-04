import { useState, useEffect, useCallback } from 'react';
import {
    collection, query, where, orderBy, getDocs,
    Timestamp
} from 'firebase/firestore';
import { db } from '../utils/firebase';

export const useTreinosPendentes = (equipaId) => {
    const [refreshKey, setRefreshKey] = useState(0);
    
    const [treinosPendentes, setTreinosPendentes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTreinos = useCallback(async () => {
        if (!equipaId) {
            setTreinosPendentes([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
           

            // Data início: 02/03/2026
            const dataInicio = new Date('2026-01-02')

            // QUERY 1: Todos os treinos desde 02/03
            const treinosQ = query(
                collection(db, 'treinos'),
                where('equipa', '==', equipaId),
                where('data','>','2026-03-01'),
                orderBy('data', 'desc'),
                orderBy('horaInicio', 'asc')
            );

            // QUERY 2: Todas as avaliações da equipa
            const avaliacoesQ = query(
                collection(db, 'avaliacoes_treino'),
                where('equipa', '==', equipaId)
            );

            const [treinosSnap, avaliacoesSnap] = await Promise.all([
                getDocs(treinosQ),
                getDocs(avaliacoesQ)
            ]);

          

            // Conjunto de IDs já avaliados
            const idsAvaliados = new Set(
                avaliacoesSnap.docs.map(doc => doc.data().treinoId)
            );

            // Converter treinos + filtrar passados SEM avaliação
            const agora = new Date();
            const pendentes = treinosSnap.docs
                .map(doc => {
                    const dataRaw = doc.data();
                    return {
                        id: doc.id,
                        ...dataRaw,
                        data: dataRaw.data.toDate ? dataRaw.data.toDate() : new Date(dataRaw.data)  // ✅ FUNCIONA!
                    };
                })
                .filter(treino => {
                    // Calcular fim do treino
                    const horaFim = treino.horaFim || treino.horaInicio;
                    if (!horaFim) return false;

                    const [hFim, mFim] = horaFim.split(':').map(Number);
                    const fimTreino = new Date(treino.data);
                    fimTreino.setHours(hFim, mFim, 0, 0);

                    // Passou? + Sem avaliação?
                    const passou = agora > fimTreino;
                    const semAvaliacao = !idsAvaliados.has(treino.id);

                

                    return passou && semAvaliacao;
                });

            setTreinosPendentes(pendentes);
            

        } catch (error) {
            console.error('❌ ERRO useTreinosPendentes:', error);
            setError(error.message);
            setTreinosPendentes([]);
        } finally {
            setLoading(false);
        }
    }, [equipaId]);

    useEffect(() => {
        fetchTreinos();
    }, [fetchTreinos]);

    return {
        treinosPendentes,
        loading,
        error,
        refetch: fetchTreinos
    };
};
