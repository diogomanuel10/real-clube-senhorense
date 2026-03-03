import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
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

  // NOVO: Estados para alertas
  const [alertas, setAlertas] = useState({
    criticos: [],
    atencao: [],
    avisos: [],
    informativos: [],
  });

  // NOVO: Métricas de captação
  const [metricasCaptacao, setMetricasCaptacao] = useState({
    totalPendentes: 0,
    pendentesMais10Dias: 0,
    totalAprovadas: 0,
    taxaAprovacao: 0,
    tempoMedioAprovacao: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);

      const hoje = new Date();
      const hojeISO = hoje.toISOString().slice(0, 10);

      const estaDispensado = (item) => {
        if (!item.alertaDispensadoAte) return false;
        return item.alertaDispensadoAte >= hojeISO;
      };

      // 1. Carregar Atletas
      const atletasSnap = await getDocs(collection(db, 'atletas'));
      const todosAtletas = atletasSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // 2. Carregar Escalões
      const escaloesSnap = await getDocs(collection(db, 'escaloes'));
      const todosEscaloes = escaloesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // 3. Carregar Treinos
      const inicioSemana = new Date(hoje);
      inicioSemana.setDate(hoje.getDate() - 7);
      const inicioSemanaISO = inicioSemana.toISOString().slice(0, 10);

      const data30DiasAtras = new Date(hoje);
      data30DiasAtras.setDate(hoje.getDate() - 30);
      const data30ISO = data30DiasAtras.toISOString().slice(0, 10);

      const treinosSnap = await getDocs(collection(db, 'treinos'));
      const todosTreinos = treinosSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const treinosSemana = todosTreinos.filter(t =>
        t.data >= inicioSemanaISO && t.data <= hojeISO
      );

      const treinos30Dias = todosTreinos.filter(t =>
        t.data >= data30ISO && t.data <= hojeISO
      );
      const treinosIds30Dias = treinos30Dias.map(t => t.id);

      // 4. Carregar Presenças
      const presencasSnap = await getDocs(collection(db, 'presencas'));
      const todasPresencas = presencasSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Presenças válidas (só "presente")
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

      // NOVO: Quotas em atraso por gravidade
      const quotasEmAtraso = quotasPendentes.filter(q => {
        if (!q.dataVencimento) return false;
        return q.dataVencimento < hojeISO;
      });

      const quotasCriticas = quotasEmAtraso.filter(q => {
        const vencimento = new Date(q.dataVencimento);
        const diasAtraso = Math.floor((hoje - vencimento) / (1000 * 60 * 60 * 24));
        return diasAtraso >= 30 && !estaDispensado(q);
      });

      const quotasModeradas = quotasEmAtraso.filter(q => {
        const vencimento = new Date(q.dataVencimento);
        const diasAtraso = Math.floor((hoje - vencimento) / (1000 * 60 * 60 * 24));
        return diasAtraso >= 8 && diasAtraso < 30 && !estaDispensado(q);
      });

      const quotasLeves = quotasEmAtraso.filter(q => {
        const vencimento = new Date(q.dataVencimento);
        const diasAtraso = Math.floor((hoje - vencimento) / (1000 * 60 * 60 * 24));
        return diasAtraso > 0 && diasAtraso < 8 && !estaDispensado(q);
      });

      // NOVO: Pré-alerta de vencimento (próximos 5 dias)
      const daqui5Dias = new Date(hoje);
      daqui5Dias.setDate(hoje.getDate() + 5);
      const daqui5DiasISO = daqui5Dias.toISOString().slice(0, 10);

      const quotasVencendoEmBreve = quotasPendentes.filter(q =>
        q.dataVencimento &&
        q.dataVencimento >= hojeISO &&
        q.dataVencimento <= daqui5DiasISO
      );

      // Receita mensal (usando updatedAt como data de pagamento)
      const receitaMensal = quotasPagas
        .filter(q => {
          if (!q.updatedAt) return false;
          const pagamento = q.updatedAt.toDate();
          return pagamento.getMonth() === hoje.getMonth() &&
            pagamento.getFullYear() === hoje.getFullYear();
        })
        .reduce((acc, q) => acc + (q.valor || 0), 0);

      setQuotas({
        pagas: quotasPagas,
        pendentes: quotasPendentes,
        emAtraso: quotasEmAtraso,
      });

      // 6. NOVO: Calcular atletas inativos (14+ dias sem treino)
      const atletasInativos = todosAtletas.filter(atleta => {
        const presencasAtleta = todasPresencas
          .filter(p => p.atletaId === atleta.id && p.estado === 'presente')
          .sort((a, b) => {
            const dataA = todosTreinos.find(t => t.id === a.treinoId)?.data || '';
            const dataB = todosTreinos.find(t => t.id === b.treinoId)?.data || '';
            return dataB.localeCompare(dataA);
          });

        if (presencasAtleta.length === 0) return true;

        const ultimoTreinoId = presencasAtleta[0]?.treinoId;
        const ultimoTreino = todosTreinos.find(t => t.id === ultimoTreinoId);
        if (!ultimoTreino?.data) return true;

        const ultimaPresenca = new Date(ultimoTreino.data);
        const diasSemAparecer = Math.floor((hoje - ultimaPresenca) / (1000 * 60 * 60 * 24));

        return diasSemAparecer >= 14;
      });

      // 7. NOVO: Atletas com assiduidade baixa (só faltas injustificadas)
    const atletasAssiduidadeBaixa = todosAtletas.map(atleta => {
  const treinosAtleta = treinos30Dias.filter(t => t.equipa === atleta.equipa);
  const presencasAtleta = todasPresencas.filter(p => 
    p.atletaId === atleta.id && 
    treinosIds30Dias.includes(p.treinoId)
  );

  const presentes = presencasAtleta.filter(p => p.estado === 'presente').length;
  const totalTreinos = treinosAtleta.length;

  const taxaPresenca = totalTreinos > 0 
    ? (presentes / totalTreinos) * 100 
    : 100;

  const faltasInjustificadas = presencasAtleta.filter(p => p.estado === 'falta').length;

  // 👇 NOVO: Verifica se foi contactado recentemente
  const ultimoContacto = atleta.ultimoContacto ? new Date(atleta.ultimoContacto) : null;
  const diasDesdeContacto = ultimoContacto 
    ? Math.floor((hoje - ultimoContacto) / (1000 * 60 * 60 * 24))
    : 999;

  return {
    ...atleta,
    taxaPresenca: Math.round(taxaPresenca),
    faltasInjustificadas,
    totalTreinos,
    diasDesdeContacto,
  };
}).filter(a => 
  a.taxaPresenca < 60 && 
  a.totalTreinos > 0 && 
  a.diasDesdeContacto > 7 && // 👈 Exclui se foi contactado há menos de 7 dias
  !estaDispensado(a) // 👈 Exclui se foi dispensado
);

      // 8. NOVO: Carregar Captações
      const captacoesSnap = await getDocs(collection(db, 'captacoes'));
      const todasCaptacoes = captacoesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const captacoesPendentes = todasCaptacoes.filter(c =>
        c.aprovadoDirecao === "pendente"
      );

      const captacoesAntigas = captacoesPendentes.filter(c => {
        if (!c.dataRegisto) return false;
        const dataRegisto = new Date(c.dataRegisto);
        const diasEspera = Math.floor((hoje - dataRegisto) / (1000 * 60 * 60 * 24));
        return diasEspera >= 10;
      });

      const captacoesAprovadas = todasCaptacoes.filter(c =>
        c.aprovadoDirecao === "aprovado"
      );

      const taxaAprovacao = todasCaptacoes.length > 0
        ? Math.round((captacoesAprovadas.length / todasCaptacoes.length) * 100)
        : 0;

      // Tempo médio de aprovação (se tiver campo dataAprovacao, senão estimamos)
      const temposEspera = captacoesAprovadas
        .filter(c => c.dataRegisto)
        .map(c => {
          const inicio = new Date(c.dataRegisto);
          // Se não tiver dataAprovacao, usa hoje como referência
          const fim = c.dataAprovacao ? new Date(c.dataAprovacao) : hoje;
          return Math.floor((fim - inicio) / (1000 * 60 * 60 * 24));
        });

      const tempoMedioAprovacao = temposEspera.length > 0
        ? Math.round(temposEspera.reduce((a, b) => a + b, 0) / temposEspera.length)
        : 0;

      setMetricasCaptacao({
        totalPendentes: captacoesPendentes.length,
        pendentesMais10Dias: captacoesAntigas.length,
        totalAprovadas: captacoesAprovadas.length,
        taxaAprovacao,
        tempoMedioAprovacao,
      });

      // 9. NOVO: Construir alertas por prioridade
      const alertasCriticos = [];
      const alertasAtencao = [];
      const alertasAvisos = [];
      const alertasInformativos = [];

      // 🔴 CRÍTICOS
      if (quotasCriticas.length > 0) {
        alertasCriticos.push({
          id: 'quotas-criticas',
          tipo: 'quota',
          titulo: `${quotasCriticas.length} ${quotasCriticas.length === 1 ? 'quota crítica' : 'quotas críticas'}`,
          descricao: '30+ dias de atraso',
          contador: quotasCriticas.length,
          dados: quotasCriticas.map(q => ({
            ...q,
            diasAtraso: Math.floor((hoje - new Date(q.dataVencimento)) / (1000 * 60 * 60 * 24))
          })),
          acao: 'Contactar urgente',
          cor: 'red',
        });
      }

      if (captacoesAntigas.length > 0) {
        alertasCriticos.push({
          id: 'captacoes-antigas',
          tipo: 'captacao',
          titulo: `${captacoesAntigas.length} ${captacoesAntigas.length === 1 ? 'captação pendente há mais de 10 dias' : 'captações pendentes há mais de 10 dias'}`,
          descricao: 'Aguardam aprovação da direção',
          contador: captacoesAntigas.length,
          dados: captacoesAntigas.map(c => ({
            ...c,
            diasEspera: Math.floor((hoje - new Date(c.dataRegisto)) / (1000 * 60 * 60 * 24))
          })),
          acao: 'Aprovar/Rejeitar',
          cor: 'red',
        });
      }

      // 🟠 ATENÇÃO
      if (quotasModeradas.length > 0) {
        alertasAtencao.push({
          id: 'quotas-moderadas',
          tipo: 'quota',
          titulo: `${quotasModeradas.length} ${quotasModeradas.length === 1 ? 'quota em atraso' : 'quotas em atraso'}`,
          descricao: '8-29 dias de atraso',
          contador: quotasModeradas.length,
          dados: quotasModeradas.map(q => ({
            ...q,
            diasAtraso: Math.floor((hoje - new Date(q.dataVencimento)) / (1000 * 60 * 60 * 24))
          })),
          acao: 'Contactar',
          cor: 'orange',
        });
      }


      if (atletasAssiduidadeBaixa.length > 0) {
        alertasAtencao.push({
          id: 'assiduidade-baixa',
          tipo: 'atleta',
          titulo: `${atletasAssiduidadeBaixa.length} ${atletasAssiduidadeBaixa.length === 1 ? 'atleta com assiduidade baixa' : 'atletas com assiduidade baixa'}`,
          descricao: 'Menos de 60% de presenças',
          contador: atletasAssiduidadeBaixa.length,
          dados: atletasAssiduidadeBaixa,
          acao: 'Verificar situação',
          cor: 'orange',
        });
      }

      // 🟡 AVISOS
      if (quotasVencendoEmBreve.length > 0) {
        alertasAvisos.push({
          id: 'quotas-vencendo',
          tipo: 'quota',
          titulo: `${quotasVencendoEmBreve.length} ${quotasVencendoEmBreve.length === 1 ? 'quota vence em breve' : 'quotas vencem em breve'}`,
          descricao: 'Próximos 5 dias',
          contador: quotasVencendoEmBreve.length,
          dados: quotasVencendoEmBreve,
          acao: 'Enviar lembrete',
          cor: 'yellow',
        });
      }

      if (quotasLeves.length > 0) {
        alertasAvisos.push({
          id: 'quotas-leves',
          tipo: 'quota',
          titulo: `${quotasLeves.length} ${quotasLeves.length === 1 ? 'quota com atraso leve' : 'quotas com atraso leve'}`,
          descricao: '1-7 dias de atraso',
          contador: quotasLeves.length,
          dados: quotasLeves,
          acao: 'Monitorar',
          cor: 'yellow',
        });
      }

      const captacoesRecentes = captacoesPendentes.filter(c => {
        if (!c.dataRegisto) return false;
        const dataRegisto = new Date(c.dataRegisto);
        const diasEspera = Math.floor((hoje - dataRegisto) / (1000 * 60 * 60 * 24));
        return diasEspera < 10;
      });

      if (captacoesRecentes.length > 0) {
        alertasAvisos.push({
          id: 'captacoes-recentes',
          tipo: 'captacao',
          titulo: `${captacoesRecentes.length} ${captacoesRecentes.length === 1 ? 'captação pendente' : 'captações pendentes'}`,
          descricao: 'Aguardam aprovação',
          contador: captacoesRecentes.length,
          dados: captacoesRecentes,
          acao: 'Revisar',
          cor: 'yellow',
        });
      }

      // ℹ️ INFORMATIVOS
      const pagamentosHoje = quotasPagas.filter(q => {
        if (!q.updatedAt) return false;
        const pagamento = q.updatedAt.toDate();
        return pagamento.toISOString().slice(0, 10) === hojeISO;
      });

      if (pagamentosHoje.length > 0) {
        alertasInformativos.push({
          id: 'pagamentos-hoje',
          tipo: 'quota',
          titulo: `${pagamentosHoje.length} ${pagamentosHoje.length === 1 ? 'pagamento hoje' : 'pagamentos hoje'}`,
          descricao: 'Quotas pagas hoje',
          contador: pagamentosHoje.length,
          dados: pagamentosHoje,
          acao: '',
          cor: 'green',
        });
      }

      setAlertas({
        criticos: alertasCriticos,
        atencao: alertasAtencao,
        avisos: alertasAvisos,
        informativos: alertasInformativos,
      });

      // 10. Calcular estatísticas por escalão
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

      // 11. Carregar Treinadores
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

      // 12. Atividade Recente (simplificado)
      const atividadeMock = [
        { tipo: 'treino', texto: 'Treino realizado', data: hojeISO },
        { tipo: 'quota', texto: `${pagamentosHoje.length} quotas pagas hoje`, data: hojeISO },
        { tipo: 'captacao', texto: `${captacoesPendentes.length} captações pendentes`, data: hojeISO },
      ];
      setAtividadeRecente(atividadeMock);

      // 13. Set Stats
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
    alertas, // NOVO
    metricasCaptacao, // NOVO
    loading,
    recarregar: carregarDados,
  };
}
