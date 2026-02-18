import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../utils/firebase';

export function useDashboardAdmin() {
  const [stats, setStats] = useState({
    totalAtletas: 0,
    totalTreinadores: 0,
    totalEscaloes: 0,
    taxaAssiduidadeGeral: 0,
    quotasPagas: 0,
    quotasPendentes: 0,
    receitaMensal: 0,
    treinosSemana: 0,
  });

  const [quotas, setQuotas] = useState({
    pagas: [],
    pendentes: [],
    emAtraso: [],
  });

  const [escaloes, setEscaloes] = useState([]);
  const [treinadores, setTreinadores] = useState([]);
  const [atividadeRecente, setAtividadeRecente] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);

      // 1. Carregar Atletas
      const atletasSnap = await getDocs(collection(db, 'atletas'));
      const todosAtletas = atletasSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // 2. Carregar Escalões
      const escaloesSnap = await getDocs(collection(db, 'escaloes'));
      const todosEscaloes = escaloesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // 3. Carregar Treinos (última semana)
      const hoje = new Date();
      const inicioSemana = new Date(hoje);
      inicioSemana.setDate(hoje.getDate() - 7);
      const inicioSemanaISO = inicioSemana.toISOString().slice(0, 10);
      const hojeISO = hoje.toISOString().slice(0, 10);

      const treinosSnap = await getDocs(collection(db, 'treinos'));
      const todosTreinos = treinosSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const treinosSemana = todosTreinos.filter(t => 
        t.data >= inicioSemanaISO && t.data <= hojeISO
      );

      // 4. Carregar Presenças (últimos 30 dias)
      const presencasSnap = await getDocs(collection(db, 'presencas'));
      const todasPresencas = presencasSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const data30DiasAtras = new Date();
      data30DiasAtras.setDate(hoje.getDate() - 30);
      const data30ISO = data30DiasAtras.toISOString().slice(0, 10);

      const treinos30Dias = todosTreinos.filter(t =>
        t.data >= data30ISO && t.data <= hojeISO
      );
      const treinosIds30Dias = treinos30Dias.map(t => t.id);
      
      const presencas30Dias = todasPresencas.filter(p =>
        treinosIds30Dias.includes(p.treinoId) && p.estado === 'presente'
      );

      const totalPossivel = treinos30Dias.length * todosAtletas.length;
      const taxaAssiduidadeGeral = totalPossivel > 0
        ? Math.round((presencas30Dias.length / totalPossivel) * 100)
        : 0;

      // 5. Carregar Quotas
      const quotasSnap = await getDocs(collection(db, 'quotas'));
      const todasQuotas = quotasSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const quotasPagas = todasQuotas.filter(q => q.pago);
      const quotasPendentes = todasQuotas.filter(q => !q.pago);
      
      // Quotas em atraso (mais de 30 dias)
      const quotasEmAtraso = quotasPendentes.filter(q => {
        if (!q.dataVencimento) return false;
        const vencimento = new Date(q.dataVencimento);
        return vencimento < hoje;
      });

      const receitaMensal = quotasPagas
        .filter(q => {
          if (!q.dataPagamento) return false;
          const pagamento = new Date(q.dataPagamento);
          return pagamento.getMonth() === hoje.getMonth() &&
                 pagamento.getFullYear() === hoje.getFullYear();
        })
        .reduce((acc, q) => acc + (q.valor || 0), 0);

      setQuotas({
        pagas: quotasPagas,
        pendentes: quotasPendentes,
        emAtraso: quotasEmAtraso,
      });

      // 6. Calcular estatísticas por escalão
      const escaloesComStats = todosEscaloes.map(esc => {
        const atletasEscalao = todosAtletas.filter(a => a.equipa === esc.nome);
        const treinosEscalao = treinos30Dias.filter(t => t.equipa === esc.nome);
        const treinosEscalaoIds = treinosEscalao.map(t => t.id);
        
        const presencasEscalao = presencas30Dias.filter(p =>
          treinosEscalaoIds.includes(p.treinoId)
        );

        const totalPossivelEscalao = treinosEscalao.length * atletasEscalao.length;
        const assiduidade = totalPossivelEscalao > 0
          ? Math.round((presencasEscalao.length / totalPossivelEscalao) * 100)
          : 0;

        const quotasEscalao = todasQuotas.filter(q =>
          atletasEscalao.some(a => a.id === q.atletaId)
        );
        const quotasPagasEscalao = quotasEscalao.filter(q => q.pago).length;
        const quotasPendentesEscalao = quotasEscalao.filter(q => !q.pago).length;

        return {
          ...esc,
          totalAtletas: atletasEscalao.length,
          assiduidade,
          quotasPagas: quotasPagasEscalao,
          quotasPendentes: quotasPendentesEscalao,
          totalTreinos: treinosEscalao.length,
        };
      });

      setEscaloes(escaloesComStats);

      // 7. Carregar Treinadores
      const utilizadoresSnap = await getDocs(collection(db, 'utilizadores'));
      const todosTreinadores = utilizadoresSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(u => u.role === 'treinador');

      const treinadoresComStats = todosTreinadores.map(treinador => {
        const equipas = treinador.equipas || [];
        const atletasTreinador = todosAtletas.filter(a => equipas.includes(a.equipa));
        
        return {
          ...treinador,
          totalAtletas: atletasTreinador.length,
          equipas: equipas.join(', ') || 'Sem equipas',
        };
      });

      setTreinadores(treinadoresComStats);

      // 8. Atividade Recente (simplificado)
      const atividadeMock = [
        { tipo: 'treino', texto: 'Treino Sub 21 F realizado', data: hojeISO },
        { tipo: 'quota', texto: '5 quotas pagas hoje', data: hojeISO },
        { tipo: 'atleta', texto: 'Novo atleta inscrito', data: hojeISO },
      ];
      setAtividadeRecente(atividadeMock);

      // 9. Set Stats
      setStats({
        totalAtletas: todosAtletas.length,
        totalTreinadores: todosTreinadores.length,
        totalEscaloes: todosEscaloes.length,
        taxaAssiduidadeGeral,
        quotasPagas: quotasPagas.length,
        quotasPendentes: quotasPendentes.length,
        receitaMensal,
        treinosSemana: treinosSemana.length,
      });

    } catch (error) {
      console.error('Erro ao carregar dashboard admin:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    quotas,
    escaloes,
    treinadores,
    atividadeRecente,
    loading,
    recarregar: carregarDados,
  };
}
