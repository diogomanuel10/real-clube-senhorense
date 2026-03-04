import { useState, useEffect, useCallback } from 'react';
import {
    collection, query, where, orderBy, getDocs,
    Timestamp
} from 'firebase/firestore';
import { db } from '../utils/firebase';

export const useTreinosPendentes = (equipas) => {
    const [treinosPendentes, setTreinosPendentes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTreinos = useCallback(async () => {
        if (!equipas || equipas.length === 0) {
            setTreinosPendentes([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // para já, faz 1 query por equipa em paralelo
            const dataInicio = new Date('2026-01-02');

            const treinosQueries = equipas.map(eq =>
                query(
                    collection(db, 'treinos'),
                    where('equipa', '==', eq),
                    where('data', '>', '2026-03-01'),
                    orderBy('data', 'desc'),
                    orderBy('horaInicio', 'asc')
                )
            );

            const avaliacoesQueries = equipas.map(eq =>
                query(
                    collection(db, 'avaliacoes_treino'),
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
                        data: dataRaw.data.toDate ? dataRaw.data.toDate() : new Date(dataRaw.data),
                    };
                })
                .filter(treino => {
                    const horaFim = treino.horaFim || treino.horaInicio;
                    if (!horaFim) return false;

                    const [hFim, mFim] = horaFim.split(':').map(Number);
                    const fimTreino = new Date(treino.data);
                    fimTreino.setHours(hFim, mFim, 0, 0);

                    const passou = agora > fimTreino;
                    const semAvaliacao = !idsAvaliados.has(treino.id);

                    return passou && semAvaliacao;
                })
                .sort((a, b) => {
                    // ordena por data desc + horaInicio asc como antes
                    if (a.data.getTime() !== b.data.getTime()) {
                        return b.data - a.data;
                    }
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
    }, [equipas]);

    useEffect(() => {
        fetchTreinos();
    }, [fetchTreinos]);

    return { treinosPendentes, loading, error, refetch: fetchTreinos };
};

