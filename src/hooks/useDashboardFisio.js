// src/hooks/useDashboardFisio.js
import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../utils/firebase';

export function useDashboardFisio() {
  const [stats, setStats] = useState({
    totalLesoes: 0,
    lesoesAtivas: 0,
    lesoesRecuperadas: 0,
    atletasEmRecuperacao: 0,
    sessoesSemana: 0,
    tempoMedioRecuperacao: 0,
  });

  const [lesoesAtivas, setLesoesAtivas] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [historicoLesoes, setHistoricoLesoes] = useState([]);
  const [escaloes, setEscaloes] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);

      // 1. Carregar Lesões
      const lesoesSnap = await getDocs(collection(db, 'lesoes'));
      const todasLesoes = lesoesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const ativas = todasLesoes.filter(l => l.estado === 'ativa');
      const recuperadas = todasLesoes.filter(l => l.estado === 'recuperada');

      // 2. Carregar Atletas
      const atletasSnap = await getDocs(collection(db, 'atletas'));
      const todosAtletas = atletasSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Enriquecer lesões com nome do atleta
      const lesoesComAtleta = ativas.map(lesao => {
        const atleta = todosAtletas.find(a => a.id === lesao.atletaId);
        return {
          ...lesao,
          atletaNome: atleta?.nome || 'Desconhecido',
          atletaEquipa: atleta?.equipa || 'Sem equipa',
        };
      });

      setLesoesAtivas(lesoesComAtleta);

      // 3. Calcular tempo médio de recuperação
      const recuperadasComDatas = recuperadas.filter(l => l.dataInicio && l.dataFim);
      const tempoMedio = recuperadasComDatas.length > 0
        ? Math.round(
            recuperadasComDatas.reduce((acc, l) => {
              const inicio = new Date(l.dataInicio);
              const fim = new Date(l.dataFim);
              const dias = Math.round((fim - inicio) / (1000 * 60 * 60 * 24));
              return acc + dias;
            }, 0) / recuperadasComDatas.length
          )
        : 0;

      // 4. Carregar Sessões de Fisio (última semana)
      const hoje = new Date();
      const inicioSemana = new Date(hoje);
      inicioSemana.setDate(hoje.getDate() - 7);
      const inicioSemanaISO = inicioSemana.toISOString().slice(0, 10);
      const hojeISO = hoje.toISOString().slice(0, 10);

      const sessoesSnap = await getDocs(collection(db, 'sessoesFisio'));
      const todasSessoes = sessoesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const sessoesSemana = todasSessoes.filter(
        s => s.data >= inicioSemanaISO && s.data <= hojeISO
      );

      // 5. Agendamentos (próximos 7 dias)
      const fimSemana = new Date(hoje);
      fimSemana.setDate(hoje.getDate() + 7);
      const fimSemanaISO = fimSemana.toISOString().slice(0, 10);

      const agendamentosFuturos = todasSessoes
        .filter(s => s.data >= hojeISO && s.data <= fimSemanaISO)
        .map(sessao => {
          const atleta = todosAtletas.find(a => a.id === sessao.atletaId);
          return {
            ...sessao,
            atletaNome: atleta?.nome || 'Desconhecido',
            atletaEquipa: atleta?.equipa || 'Sem equipa',
          };
        })
        .sort((a, b) => a.data.localeCompare(b.data));

      setAgendamentos(agendamentosFuturos);

      // 6. Histórico de Lesões (últimas 10)
      const historicoOrdenado = todasLesoes
        .sort((a, b) => {
          const dataA = a.dataInicio || '2000-01-01';
          const dataB = b.dataInicio || '2000-01-01';
          return dataB.localeCompare(dataA);
        })
        .slice(0, 10)
        .map(lesao => {
          const atleta = todosAtletas.find(a => a.id === lesao.atletaId);
          return {
            ...lesao,
            atletaNome: atleta?.nome || 'Desconhecido',
            atletaEquipa: atleta?.equipa || 'Sem equipa',
          };
        });

      setHistoricoLesoes(historicoOrdenado);

      // 7. Estatísticas por Escalão
      const escaloesSnap = await getDocs(collection(db, 'escaloes'));
      const todosEscaloes = escaloesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const escaloesComStats = todosEscaloes.map(esc => {
        const atletasEscalao = todosAtletas.filter(a => a.equipa === esc.nome);
        const lesoesEscalao = todasLesoes.filter(l => {
          const atleta = todosAtletas.find(a => a.id === l.atletaId);
          return atleta?.equipa === esc.nome;
        });
        const lesoesAtivasEscalao = lesoesEscalao.filter(l => l.estado === 'ativa');

        return {
          ...esc,
          totalLesoes: lesoesEscalao.length,
          lesoesAtivas: lesoesAtivasEscalao.length,
          totalAtletas: atletasEscalao.length,
        };
      });

      setEscaloes(escaloesComStats);

      // 8. Alertas (atletas com lesões graves ou há muito tempo)
      const alertasMock = ativas
        .filter(l => {
          if (l.gravidade === 'grave') return true;
          if (!l.dataInicio) return false;
          const inicio = new Date(l.dataInicio);
          const diasLesao = Math.round((hoje - inicio) / (1000 * 60 * 60 * 24));
          return diasLesao > 30;
        })
        .slice(0, 5)
        .map(l => ({
          tipo: l.gravidade === 'grave' ? 'grave' : 'prolongada',
          texto: `${l.atletaNome} - ${l.tipo || 'Lesão'} ${
            l.gravidade === 'grave' ? '(GRAVE)' : '(>30 dias)'
          }`,
          data: l.dataInicio,
        }));

      setAlertas(alertasMock);

      // 9. Set Stats
      const atletasComLesaoAtiva = new Set(ativas.map(l => l.atletaId)).size;

      setStats({
        totalLesoes: todasLesoes.length,
        lesoesAtivas: ativas.length,
        lesoesRecuperadas: recuperadas.length,
        atletasEmRecuperacao: atletasComLesaoAtiva,
        sessoesSemana: sessoesSemana.length,
        tempoMedioRecuperacao: tempoMedio,
      });

    } catch (error) {
      console.error('Erro ao carregar dashboard fisio:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    lesoesAtivas,
    agendamentos,
    historicoLesoes,
    escaloes,
    alertas,
    loading,
    recarregar: carregarDados,
  };
}
